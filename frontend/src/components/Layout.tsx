import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  // Don't show header/footer on home page (it's part of the landing design)
  if (isHomePage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header for non-home pages */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JobMatch.zip
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/agents/demo" className="text-gray-600 hover:text-gray-900">Demo</Link>
              <Link to="/assessment" className="text-gray-600 hover:text-gray-900">Assessment</Link>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

