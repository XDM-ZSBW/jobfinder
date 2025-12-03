import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// Don't initialize React Router for API routes
const pathname = window.location.pathname
const isApiRoute = pathname.startsWith('/api') || pathname.startsWith('/health')

if (isApiRoute) {
  // For API routes, don't render React app at all
  // Let Vercel handle these routes - return early to prevent any React Router initialization
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = '' // Clear any existing content
    // Don't initialize React Router at all for API routes
    // The API function should handle these routes, not React
  }
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
