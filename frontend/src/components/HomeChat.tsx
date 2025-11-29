'use client'

import { useState, useRef, useEffect } from 'react'
import { getApiUrl } from '@/utils/api'
import { ChatPrompts, AUTH_PROVIDERS } from '@/config/chat-prompts'

interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  authProviders?: Array<{ id: string; name: string; icon: string }>
  waitingForEmail?: boolean
  waitingForPhone?: boolean
}

// API URL will be determined dynamically using getApiUrl()

interface HomeChatProps {
  anonymousId?: string | null
  authenticated?: boolean
}

export default function HomeChat({ anonymousId: propAnonymousId, authenticated: propAuthenticated }: HomeChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState<string | null>(null)
  
  // Check localStorage immediately for anonymous_id
  const initialAnonymousId = propAnonymousId || (typeof window !== 'undefined' ? localStorage.getItem('anonymous_id') : null)
  const [authenticated, setAuthenticated] = useState(propAuthenticated || !!initialAnonymousId)
  const [anonymousId, setAnonymousId] = useState<string | null>(initialAnonymousId)
  const [userInfo, setUserInfo] = useState<any>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [waitingForEmail, setWaitingForEmail] = useState(false)
  const [waitingForPhone, setWaitingForPhone] = useState(false)

  const scrollToBottom = () => {
    // Only scroll the messages container, not the entire page
    if (messagesContainerRef.current) {
      // Prevent this scroll from bubbling to page level
      const container = messagesContainerRef.current
      const wasScrolling = container.scrollHeight > container.clientHeight
      
      // Only scroll if container has overflow
      if (wasScrolling) {
        // Use scrollIntoView with block: 'end' and prevent page scroll
        const lastMessage = container.lastElementChild
        if (lastMessage) {
          lastMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end',
            inline: 'nearest'
          })
        } else {
          // Fallback to direct scrollTop
          container.scrollTop = container.scrollHeight
        }
      }
    }
  }

  useEffect(() => {
    // Don't scroll on initial load - only scroll when messages are added after user interaction
    if (!isInitialLoad && messages.length > 0) {
      // Use setTimeout to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        scrollToBottom()
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [messages.length, isInitialLoad]) // Only trigger on length change, not content

  // Sync waitingForEmail/Phone state from messages (for restoration from localStorage)
  useEffect(() => {
    if (messages.length > 0) {
      // Check if last message is waiting for email or phone
      const lastMessage = messages[messages.length - 1]
      const shouldWaitForEmail = lastMessage.waitingForEmail === true
      const shouldWaitForPhone = lastMessage.waitingForPhone === true
      
      // Update state to match message state
      if (shouldWaitForEmail && !waitingForEmail) {
        setWaitingForEmail(true)
      } else if (!shouldWaitForEmail && waitingForEmail) {
        setWaitingForEmail(false)
      }
      
      if (shouldWaitForPhone && !waitingForPhone) {
        setWaitingForPhone(true)
      } else if (!shouldWaitForPhone && waitingForPhone) {
        setWaitingForPhone(false)
      }
    }
  }, [messages])
  
  // Safety: Clear loading state when waiting for user input
  useEffect(() => {
    if (waitingForEmail || waitingForPhone) {
      setLoading(false)
    }
  }, [waitingForEmail, waitingForPhone])

  // Safety: Clear stuck loading state after timeout
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.warn('[HomeChat] Loading state stuck for >10s, clearing it')
        setLoading(false)
        setWaitingForEmail(false)
        setWaitingForPhone(false)
      }, 10000) // 10 second safety timeout
      
      return () => clearTimeout(timeoutId)
    }
  }, [loading])

  // Get anonymous ID from localStorage or URL params and restore conversation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const idFromUrl = urlParams.get('id')
      const idFromStorage = localStorage.getItem('anonymous_id')
      const wasJustAuthenticated = urlParams.get('authenticated') === 'true'
      
      const finalId = propAnonymousId || idFromUrl || idFromStorage
      if (finalId) {
        setAnonymousId(finalId)
        setAuthenticated(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('anonymous_id', finalId)
        }
        
        // If user just authenticated, restore conversation and acknowledge
        // Check localStorage for saved messages, not current state (which might already be restored)
        if (wasJustAuthenticated) {
          const savedMessages = localStorage.getItem('chat_messages')
          if (savedMessages) {
            try {
              const parsed = JSON.parse(savedMessages)
              const restored = parsed.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
                // Clear authProviders from restored messages - they should only show for fresh welcome
                authProviders: undefined
              }))
              
              // Add welcome back message only if not already added
              const hasWelcomeBack = restored.some((msg: Message) => msg.id.startsWith('bot-welcome-back'))
              if (!hasWelcomeBack) {
                const welcomeBackMessage: Message = {
                  id: `bot-welcome-back-${Date.now()}`,
                  type: 'bot',
                  content: `🎉 **Welcome back! You're now authenticated.**

Your anonymous ID: \`${finalId.substring(0, 8)}...\`

Perfect! Now I can help you find opportunities that match your AI capabilities. What would you like to explore?`,
                  timestamp: new Date()
                }
                const updated = [...restored, welcomeBackMessage]
                setMessages(updated)
                localStorage.setItem('chat_messages', JSON.stringify(updated))
              } else {
                // Just restore without adding duplicate message
                setMessages(restored)
              }
            } catch (e) {
              console.error('Failed to restore messages:', e)
            }
          }
          
          // Clear authenticated param from URL
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('authenticated')
          window.history.replaceState({}, '', newUrl.toString())
        }
      }
    }
  }, [propAnonymousId])

  // Load user info for personalized greeting
  useEffect(() => {
    if (anonymousId) {
      const apiUrl = getApiUrl()
      fetch(`${apiUrl}/auth/user?anonymous_id=${anonymousId}`)
        .then(res => res.json())
        .then(data => {
          setUserInfo(data)
        })
        .catch(err => console.error('Failed to load user info:', err))
    }
  }, [anonymousId])

  // Restore conversation from localStorage on mount (if not just authenticated)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const wasJustAuthenticated = urlParams.get('authenticated') === 'true'
      const justLoggedOut = urlParams.get('logout') === 'true'
      
      // If just logged out, clear everything and don't restore
      if (justLoggedOut) {
        localStorage.removeItem('chat_messages')
        localStorage.removeItem('anonymous_id')
        setMessages([])
        setAuthenticated(false)
        setAnonymousId(null)
        setIsInitialLoad(false)
        // Clear logout param from URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('logout')
        window.history.replaceState({}, '', newUrl.toString())
        return
      }
      
      // Don't restore if we just authenticated (handled by the effect above)
      // Also only restore if we don't have messages yet
      if (!wasJustAuthenticated && messages.length === 0) {
        const savedMessages = localStorage.getItem('chat_messages')
        if (savedMessages) {
          try {
            const parsed = JSON.parse(savedMessages)
            const restored = parsed.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
              // Clear authProviders from restored messages - they should only show for fresh welcome
              authProviders: undefined
            }))
            setMessages(restored)
            setIsInitialLoad(false)
            return
          } catch (e) {
            console.error('Failed to restore messages:', e)
          }
        }
      }
      
      // Set initial load to false after first check
      setIsInitialLoad(false)
    }
  }, [])
  
  // Initialize with personalized welcome message
  useEffect(() => {
    if (messages.length === 0 && !isInitialLoad) {
      if (authenticated && anonymousId) {
        // Personalized greeting for authenticated users
        const providerName = userInfo?.provider_display_name || 'Email'
        const personalizedMessage: Message = {
          id: 'welcome-authenticated',
          type: 'bot',
          content: ChatPrompts.welcomeAuthenticated(providerName),
          timestamp: new Date()
        }
        setMessages([personalizedMessage])
      } else {
        // Standard welcome for unauthenticated users - link to /auth instead of inline buttons
        const welcomeMessage: Message = {
          id: 'welcome',
          type: 'bot',
          content: ChatPrompts.welcomeUnauthenticated,
          timestamp: new Date()
          // No authProviders - users click the link in the message to go to /auth
        }
        setMessages([welcomeMessage])
      }
    }
  }, [messages.length, isInitialLoad, authenticated, anonymousId, userInfo])

  const handleAuthProviderClick = async (providerId: string) => {
    // CRITICAL: Clear loading state FIRST before anything else
    setLoading(false)
    setWaitingForEmail(false)
    setWaitingForPhone(false)
    
    // Add user message
    const provider = AUTH_PROVIDERS.find(p => p.id === providerId)
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: `I'd like to authenticate with ${provider?.name}`,
      timestamp: new Date()
    }

    // Handle email authentication with magic link
    if (providerId === 'email') {
      // Add user message and email prompt together atomically
      const emailPromptMessage: Message = {
        id: `bot-email-prompt-${Date.now()}`,
        type: 'bot',
        content: `📧 **Email Authentication**

Great choice! I'll send you a magic link - no password needed.

**Please enter your email address in the chat below:**`,
        timestamp: new Date(),
        waitingForEmail: true
      }
      // Set all states together - React 18 batches these automatically
      setWaitingForEmail(true)
      setLoading(false)
      setMessages(prev => [...prev, userMessage, emailPromptMessage])
      return
    }
    
    // For other providers, add user message
    setMessages(prev => [...prev, userMessage])
    
    // For other providers, set loading state
    setLoading(true)

    // Handle SMS authentication inline (similar to email)
    if (providerId === 'sms') {
      // Ask for phone number inline in chat - no loading state needed
      const phonePromptMessage: Message = {
        id: `bot-phone-prompt-${Date.now()}`,
        type: 'bot',
        content: `📱 **SMS/VoIP Authentication**

Great choice! I'll send you a verification code via SMS.

**Please enter your phone number in the chat below (e.g., +1234567890):**`,
        timestamp: new Date(),
        waitingForPhone: true
      }
      setMessages(prev => [...prev, phonePromptMessage])
      setWaitingForPhone(true)
      // Don't set loading state - user needs to type phone number
      return
    }
    
    // Only redirect social providers (LinkedIn, Google, etc.) to OAuth flow
    // Email and SMS are handled inline above
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: `Great choice! Let's get you authenticated with ${provider?.name}. Redirecting you to the authentication page...`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setLoading(false) // Clear loading state before redirect
      
      // Redirect to auth page after a moment (only for social providers)
      setTimeout(() => {
        window.location.href = `/auth?provider=${providerId}`
      }, 1500)
    }, 500)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return

    const trimmedInput = inputValue.trim()
    
    // Detect if user typed an email address (either waiting for email or just typed one)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isEmailAddress = emailRegex.test(trimmedInput)
    
    // If waiting for email OR user typed an email address, handle email authentication
    if (waitingForEmail || isEmailAddress) {
      // Validate email format (should already be validated, but double-check)
      if (!emailRegex.test(trimmedInput)) {
        const errorMessage: Message = {
          id: `bot-error-${Date.now()}`,
          type: 'bot',
          content: `❌ That doesn't look like a valid email address. Please enter your email in the format: yourname@example.com`,
          timestamp: new Date(),
          waitingForEmail: true
        }
        setMessages(prev => [...prev, errorMessage])
        setInputValue('')
        return
      }
      
      // Add user email message
      const userEmailMessage: Message = {
        id: `user-email-${Date.now()}`,
        type: 'user',
        content: trimmedInput,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userEmailMessage])
      
      // If user just typed email without clicking button, acknowledge it
      if (!waitingForEmail) {
        const acknowledgeMessage: Message = {
          id: `bot-acknowledge-${Date.now()}`,
          type: 'bot',
          content: `Got it! I'll send a magic link to **${trimmedInput}**.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, acknowledgeMessage])
      } else {
        // Remove waiting for email prompt
        setMessages(prev => prev.map(msg => 
          msg.waitingForEmail ? { ...msg, waitingForEmail: false } : msg
        ))
      }
      
      setInputValue('')
      setLoading(true)
      setWaitingForEmail(false)
      
      // Show sending message
      const sendingMessage: Message = {
        id: `bot-sending-${Date.now()}`,
        type: 'bot',
        content: `⏳ Sending magic link to **${trimmedInput}**...`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, sendingMessage])
      
      // Conversation will be saved after sending completes
      
      try {
        const baseUrl = typeof window !== 'undefined' 
          ? `${window.location.protocol}//${window.location.host}`
          : 'https://jobmatch.zip'
        
        console.log('[Email Auth] Sending magic link request:', { email: trimmedInput, baseUrl })
        
        const response = await fetch(`${getApiUrl()}/auth/social/email/magic-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: trimmedInput,
            base_url: baseUrl
          }),
          signal: AbortSignal.timeout(30000)
        })
        
        console.log('[Email Auth] Magic link response:', response.status, response.statusText)
        
        if (!response.ok) {
          let errorDetail = `HTTP ${response.status}: ${response.statusText}`
          try {
            const errorData = await response.json()
            errorDetail = errorData.detail || errorData.error || errorDetail
          } catch {}
          throw new Error(errorDetail)
        }
        
        const data = await response.json()
        console.log('[Email Auth] Magic link sent successfully')
        
        // Remove sending message and add success message
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== sendingMessage.id)
          const successMessage: Message = {
            id: `bot-success-${Date.now()}`,
            type: 'bot',
            content: `✅ **Magic link sent!**

📧 **Sent to:** ${trimmedInput}

📬 **Next steps:**
1. Check your inbox (and spam folder)
2. Click the magic link in the email
3. You'll be brought back here automatically
4. We'll continue our conversation!

⏰ Link expires in 24 hours

${data.magic_link ? `\n💻 **Dev Mode Link:**\n${data.magic_link}` : ''}`,
            timestamp: new Date()
          }
          const updated = [...filtered, successMessage]
          // Save updated conversation
          if (typeof window !== 'undefined') {
            localStorage.setItem('chat_messages', JSON.stringify(updated))
          }
          return updated
        })
        setLoading(false)
        return
      } catch (error) {
        console.error('[Email Auth] Failed:', error)
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== sendingMessage.id)
          const errorMessage: Message = {
            id: `bot-error-${Date.now()}`,
            type: 'bot',
            content: `❌ **Failed to send magic link**

**Error:** ${errorMsg}

Please try again or use a different authentication method.`,
            timestamp: new Date(),
            authProviders: AUTH_PROVIDERS
          }
          return [...filtered, errorMessage]
        })
        setLoading(false)
        setWaitingForEmail(false) // Clear waiting state on error - user can retry by clicking Email again
        return
      }
    }

    // Normal message handling
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: trimmedInput,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)
    
    // Save conversation state
    if (typeof window !== 'undefined') {
      const updatedMessages = [...messages, userMessage]
      localStorage.setItem('chat_messages', JSON.stringify(updatedMessages))
    }

    // Call OpenRouter API via backend
    try {
      // Build conversation history for context
      // Filter out welcome messages to avoid repeating greetings
      const conversationHistory = messages
        .filter(msg => !msg.id.includes('welcome') && !msg.id.includes('bot-email-prompt') && !msg.id.includes('bot-phone-prompt'))
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      
      // Add system message for context
      const systemMessage = {
        role: 'system',
        content: `You are a helpful job matching assistant for JobMatch.zip, a platform for LLC owners with AI capabilities.

Your role is to:
- Answer questions about the platform, AI job matching, and how it works
- Be friendly, conversational, and helpful
- Provide informative responses about features and capabilities
${!authenticated ? '\n- If users want to access personalized features, let them know authentication is available (LinkedIn, Microsoft, Facebook, Google, Apple, Email, SMS)' : '\n- Help users explore opportunities, take assessments, and find matches'}

IMPORTANT: Answer the user's questions directly. Don't push authentication unless they specifically ask about signing up or accessing personalized features.`
      }
      
      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: trimmedInput
      })
      
      const response = await fetch(`${getApiUrl()}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [systemMessage, ...conversationHistory],
          temperature: 0.7,
          max_tokens: 500,
          session_id: sessionId,
          user_id: anonymousId
        }),
        signal: AbortSignal.timeout(30000)
      })
      
      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: data.message,
        timestamp: new Date()
        // No inline auth buttons - users go to /auth page
      }
      
      setMessages(prev => {
        const updated = [...prev, botMessage]
        // Save conversation state
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_messages', JSON.stringify(updated))
        }
        return updated
      })
      setLoading(false)
    } catch (error) {
      console.error('Chat API error:', error)
      
      // Fallback to helpful error message
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        type: 'bot',
        content: `I apologize, but I'm having trouble connecting right now. ${!authenticated ? "To access personalized features, visit the [authentication page](/auth)." : "Please try again in a moment."}`,
        timestamp: new Date()
        // No inline auth buttons - users go to /auth page
      }
      
      setMessages(prev => {
        const updated = [...prev, errorMessage]
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_messages', JSON.stringify(updated))
        }
        return updated
      })
      setLoading(false)
    }
  }

  return (
    <div 
      role="region"
      aria-label="AI Learning Chat Assistant"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
        height: 'clamp(400px, 60vh, 800px)',
        maxWidth: '100%',
        width: '100%',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        // Prevent scroll chaining to parent
        overscrollBehavior: 'contain',
        // Isolate scrolling context
        isolation: 'isolate'
      }}
    >
      {/* Chat Header */}
      <header 
        role="banner"
        style={{
          padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
          backgroundColor: '#2196f3',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid #1976d2',
          flexShrink: 0
        }}
      >
        <div 
          role="img"
          aria-label="Chat icon"
          style={{
            width: 'clamp(32px, 5vw, 40px)',
            height: 'clamp(32px, 5vw, 40px)',
            minWidth: '32px',
            minHeight: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            flexShrink: 0
          }}
        >
          💬
        </div>
        <div>
          <h2 style={{ fontWeight: '600', fontSize: 'clamp(0.875rem, 2vw, 1rem)', margin: 0 }}>JobMatch Assistant</h2>
          <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)', opacity: 0.9, margin: 0 }}>Ready to help you learn AI and find opportunities</p>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
        tabIndex={-1}
        onWheel={(e) => {
          // Prevent wheel events from bubbling to page scroll when at container boundaries
          const container = e.currentTarget
          const isAtTop = container.scrollTop === 0
          const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1
          
          // If scrolling up at top or down at bottom, allow event to bubble
          // Otherwise, stop propagation to prevent page scroll
          if (!isAtTop && !isAtBottom) {
            e.stopPropagation()
          }
        }}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'clamp(1rem, 2vw, 1.5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(0.75rem, 1.5vw, 1rem)',
          backgroundColor: '#f5f5f5',
          scrollBehavior: 'smooth',
          minHeight: 0, // Allow flex shrinking
          // Prevent scroll from affecting parent
          overscrollBehavior: 'contain',
          // Isolate scrolling context
          isolation: 'isolate'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            role="article"
            aria-label={msg.type === 'user' ? 'Your message' : 'Assistant message'}
            style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: 'clamp(0.5rem, 1vw, 0.75rem)'
            }}
          >
            {msg.type === 'bot' && (
              <div 
                role="img"
                aria-label="AI assistant avatar"
                style={{
                  width: 'clamp(28px, 4vw, 36px)',
                  height: 'clamp(28px, 4vw, 36px)',
                  minWidth: '28px',
                  minHeight: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#2196f3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                  flexShrink: 0
                }}
              >
                🤖
              </div>
            )}
            <div 
              role={msg.type === 'user' ? 'textbox' : 'article'}
              style={{
                maxWidth: 'min(70%, calc(100% - 60px))',
                padding: 'clamp(0.625rem, 1.5vw, 0.75rem) clamp(0.875rem, 2vw, 1rem)',
                borderRadius: '12px',
                backgroundColor: msg.type === 'user' ? '#2196f3' : '#fff',
                color: msg.type === 'user' ? 'white' : '#333',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.6',
                fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)',
                minWidth: 'min-content'
              }}
            >
              {/* Render message content with clickable links */}
              {msg.content.split(/(\[CREATE_YOUR_ACCOUNT\])/g).map((part, idx) => 
                part === '[CREATE_YOUR_ACCOUNT]' ? (
                  <a 
                    key={idx}
                    href="/auth"
                    style={{
                      color: msg.type === 'user' ? 'white' : '#2196f3',
                      textDecoration: 'underline',
                      fontWeight: '600'
                    }}
                  >
                    create your account
                  </a>
                ) : (
                  <span key={idx}>{part}</span>
                )
              )}
            </div>
            {msg.type === 'user' && (
              <div 
                role="img"
                aria-label="Your avatar"
                style={{
                  width: 'clamp(28px, 4vw, 36px)',
                  height: 'clamp(28px, 4vw, 36px)',
                  minWidth: '28px',
                  minHeight: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                  flexShrink: 0
                }}
              >
                👤
              </div>
            )}
          </div>
        ))}

        {/* Auth Providers */}
        {messages.length > 0 && messages[messages.length - 1].authProviders && !waitingForEmail && !waitingForPhone && (
          <nav 
            role="navigation"
            aria-label="Authentication options"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(120px, 100%), 1fr))',
              gap: 'clamp(0.5rem, 1vw, 0.75rem)',
              marginTop: '0.5rem',
              padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}
          >
            {messages[messages.length - 1].authProviders?.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleAuthProviderClick(provider.id)}
                disabled={loading}
                aria-label={`Authenticate with ${provider.name}`}
                style={{
                  padding: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                  minHeight: '44px', // WCAG touch target size
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'clamp(0.375rem, 1vw, 0.5rem)',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1,
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#e3f2fd'
                    e.currentTarget.style.borderColor = '#2196f3'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#e3f2fd'
                    e.currentTarget.style.borderColor = '#2196f3'
                    e.currentTarget.style.outline = '2px solid #1976d2'
                    e.currentTarget.style.outlineOffset = '2px'
                  }
                }}
                onBlur={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.outline = 'none'
                  }
                }}
              >
                <span role="img" aria-hidden="true" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>{provider.icon}</span>
                <span>{provider.name}</span>
              </button>
            ))}
          </nav>
        )}

        {loading && !waitingForEmail && !waitingForPhone && (
          <div 
            role="status"
            aria-live="polite"
            aria-label="Assistant is thinking"
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 'clamp(0.5rem, 1vw, 0.75rem)'
            }}
          >
            <div 
              role="img"
              aria-hidden="true"
              style={{
                width: 'clamp(28px, 4vw, 36px)',
                height: 'clamp(28px, 4vw, 36px)',
                minWidth: '28px',
                minHeight: '28px',
                borderRadius: '50%',
                backgroundColor: '#2196f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                flexShrink: 0
              }}
            >
              🤖
            </div>
            <div style={{
              padding: 'clamp(0.625rem, 1.5vw, 0.75rem) clamp(0.875rem, 2vw, 1rem)',
              borderRadius: '12px',
              backgroundColor: '#fff',
              color: '#666',
              fontSize: 'clamp(0.8125rem, 1.5vw, 0.875rem)'
            }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#fff',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
          placeholder={
            waitingForEmail 
              ? "Enter your email address (e.g., yourname@example.com)..." 
              : waitingForPhone 
                ? "Enter your phone number (e.g., +1234567890)..." 
                : "Type your message or ask about authentication..."
          }
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#2196f3'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading || !inputValue.trim() ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '0.9375rem',
            transition: 'background-color 0.2s ease'
          }}
        >
          Send
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#fff9e6',
        borderTop: '1px solid #ffe066',
        fontSize: '0.75rem',
        color: '#666',
        lineHeight: '1.5',
        textAlign: 'center'
      }}>
        ⚠️ By using this chat, you agree to us using OpenRouter models for language resources. If this is not acceptable, please do not login or continue at this time. We will continue development and hope to have you back in the future.
      </div>
    </div>
  )
}

