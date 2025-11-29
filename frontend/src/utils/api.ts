/**
 * Enhanced API utility with retry logic and error handling
 */

interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  retryableStatuses?: number[]
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504] // Timeout, rate limit, server errors
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Enhanced fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.maxRetries!; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      // If successful or non-retryable error, return immediately
      if (response.ok || !config.retryableStatuses!.includes(response.status)) {
        return response
      }

      // If last attempt, return the error response
      if (attempt === config.maxRetries) {
        return response
      }

      // Calculate exponential backoff delay
      const delay = config.retryDelay! * Math.pow(2, attempt)
      console.warn(`Request failed (attempt ${attempt + 1}/${config.maxRetries! + 1}), retrying in ${delay}ms...`)
      await sleep(delay)

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // If last attempt, throw the error
      if (attempt === config.maxRetries) {
        throw lastError
      }

      // Calculate exponential backoff delay
      const delay = config.retryDelay! * Math.pow(2, attempt)
      console.warn(`Request failed (attempt ${attempt + 1}/${config.maxRetries! + 1}), retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }

  throw lastError || new Error('Request failed after retries')
}

/**
 * API request wrapper with error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  _retryOptions?: RetryOptions
): Promise<T> {
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        // If response isn't JSON, use status text
      }

      throw new Error(errorMessage)
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T
    }

    return await response.json()
  } catch (error) {
    // Enhanced error logging
    console.error('API request failed:', {
      url,
      method: options.method || 'GET',
      error: error instanceof Error ? error.message : String(error),
    })

    throw error
  }
}

/**
 * Get API URL based on environment
 * Returns relative path in production, localhost in development
 */
export function getApiUrl(): string {
  // Prefer same-origin relative path so Next.js rewrites proxy to backend in dev
  if (typeof window !== 'undefined') {
    // If explicitly overridden, allow it (e.g., pointing to staging)
    if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'auto') {
      return process.env.NEXT_PUBLIC_API_URL!
    }
    return '/api'
  }

  // On the server (SSR/build), fall back to env or localhost
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'auto') {
    return process.env.NEXT_PUBLIC_API_URL
  }
  return 'http://localhost:8000/api'
}

/**
 * Check if API is available
 */
export async function checkApiHealth(baseUrl: string = 'http://localhost:8000'): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    return response.ok
  } catch {
    return false
  }
}
