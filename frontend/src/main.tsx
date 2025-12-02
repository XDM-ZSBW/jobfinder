import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// Don't initialize React Router for API routes
const pathname = window.location.pathname
if (pathname.startsWith('/api') || pathname.startsWith('/health')) {
  // For API routes, don't render React app at all
  // Let Vercel handle these routes
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <div style={{ display: 'none' }} />
  )
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
