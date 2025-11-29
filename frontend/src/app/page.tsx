'use client';

import { useState } from 'react';
import QuickAuth from '@/components/QuickAuth';

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);

  const handleAuthComplete = (account: string, method: 'email' | 'sms') => {
    // Account verified, Google login will be handled in QuickAuth component
    console.log('Account verified:', account, method);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">JobMatch</h1>
            <nav className="hidden md:flex items-center gap-6">
              <a 
                href="#how-it-works" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                How it works
              </a>
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-16 md:py-24">
        {!showAuth ? (
          <>
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Match Your AI Skills with{' '}
                <span className="text-blue-600">Opportunities</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                The first job matching platform for LLC owners who work with AI. 
                Find the longest-lasting matches first—capability-first matching that prioritizes quality over quantity.
              </p>
              
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>

              <p className="mt-6 text-sm text-gray-500">
                🔒 Quick 4-digit verification · No name required · Then sign in with Google
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto" id="how-it-works">
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Stay Anonymous</h3>
                <p className="text-gray-600">
                  We only capture your email or phone—never your name. Your skills speak for themselves.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Show What You Can Do</h3>
                <p className="text-gray-600">
                  Share your portfolio, code samples, or projects. We match you based on capability, not credentials.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Find Real Matches</h3>
                <p className="text-gray-600">
                  AI-powered matching finds opportunities where your skills shine. Human reviewers ensure quality.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="mt-20 max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
                How it works
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-6 items-start bg-gray-50 p-6 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2 text-gray-900">Quick Verification</h4>
                    <p className="text-gray-600">
                      Verify with a 4-digit code sent to your email or phone. No name required.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start bg-gray-50 p-6 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2 text-gray-900">Sign In with Google</h4>
                    <p className="text-gray-600">
                      After verification, sign in with your Google account. We only use your email address.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start bg-gray-50 p-6 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2 text-gray-900">Get Matched</h4>
                    <p className="text-gray-600">
                      Share your skills and preferences. Our AI finds opportunities that match your capabilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-md mx-auto">
            <QuickAuth onAuthComplete={handleAuthComplete} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© 2025 JobMatch · Built for capability-first matching</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">How we're different</a>
              <a href="#" className="hover:text-gray-900">Give feedback</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
