'use client';

import { useState, useEffect } from 'react';
import LiveChatDemo from '@/components/LiveChatDemo';

export default function Home() {
  const [isVR, setIsVR] = useState(false);

  useEffect(() => {
    // Detect Quest 3 / VR browser
    const isQuest = /Quest/i.test(navigator.userAgent);
    setIsVR(isQuest);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* VR Mode Indicator */}
      {isVR && (
        <div className="fixed top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-50">
          🥽 Quest 3 Optimized
        </div>
      )}

      {/* Header - Large touch targets for VR */}
      <header className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-800">jobmatch</h1>
          <nav className="space-x-8">
            <a 
              href="#how-it-works" 
              className="text-2xl text-gray-600 hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              How it works
            </a>
            <a 
              href="#get-started" 
              className="text-2xl text-gray-600 hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              Get started
            </a>
          </nav>
        </div>
      </header>

      {/* Hero - Optimized spacing for VR viewing */}
      <main className="container mx-auto px-8 py-24">
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-bold text-gray-900 mb-10 leading-tight">
            Find opportunities that match{' '}
            <span className="text-blue-600">what you can do</span>
          </h2>
          <p className="text-3xl text-gray-600 mb-16 leading-relaxed">
            No resume required. No job titles. Just your skills, your way.
            <br />
            <span className="text-xl text-gray-500 mt-4 block">
              Start completely anonymous. Share details only when you're ready.
            </span>
          </p>
          
          {/* Large CTA Buttons for VR controllers/hand tracking */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-12">
            <a 
              href="#live-demo"
              className="px-16 py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-3xl font-bold hover:shadow-3xl hover:scale-105 transform transition-all"
            >
              💬 Try Live Demo Below
            </a>
            <a 
              href="#get-started"
              className="px-16 py-8 bg-blue-600 text-white rounded-2xl text-3xl font-bold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
            >
              Get started (it's free)
            </a>
          </div>

          {/* Trust Badge - Larger for VR */}
          <p className="text-2xl text-gray-500 font-medium">
            🔒 100% anonymous · 🎯 Capability-focused · 💰 Free forever
          </p>
        </div>

        {/* LIVE INTERACTIVE DEMO */}
        <div className="mt-40 max-w-7xl mx-auto" id="live-demo">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold mb-6 animate-pulse">
              🔴 LIVE DEMO · Try It Now!
            </div>
            <h3 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Experience AI Job Matching
            </h3>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              This isn't a screenshot or video—it's the actual AI chat in action. 
              <span className="font-bold text-blue-600"> Try it right now, no sign-up needed!</span>
            </p>
          </div>
          
          <LiveChatDemo />
          
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-4 border-blue-200 rounded-3xl p-10 max-w-4xl mx-auto">
              <h4 className="text-3xl font-bold text-gray-900 mb-4">🎯 What You Just Experienced</h4>
              <div className="text-left text-xl text-gray-700 space-y-3 leading-relaxed">
                <p>✅ <strong>Real AI responses</strong> - Not scripted, powered by Claude 3.5 Sonnet</p>
                <p>✅ <strong>Personalized matching</strong> - Based on your actual skills and preferences</p>
                <p>✅ <strong>Job-focused only</strong> - No resume writing, no interview prep, just matching</p>
                <p>✅ <strong>Always available</strong> - 24/7 access from anywhere, any device</p>
              </div>
              <div className="mt-8">
                <a 
                  href="#get-started"
                  className="inline-block px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-2xl font-bold hover:shadow-2xl hover:scale-105 transform transition-all"
                >
                  Start Finding Your Perfect Match →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid - Larger cards for VR */}
        <div className="grid md:grid-cols-3 gap-12 mt-40 max-w-7xl mx-auto" id="how-it-works">
          <div className="bg-white p-12 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer">
            <div className="text-7xl mb-6">🎭</div>
            <h3 className="text-3xl font-bold mb-6 text-gray-900">Stay Anonymous</h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              Start exploring opportunities without sharing your name, email, or resume. 
              Your skills speak for themselves.
            </p>
          </div>

          <div className="bg-white p-12 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer">
            <div className="text-7xl mb-6">💪</div>
            <h3 className="text-3xl font-bold mb-6 text-gray-900">Show What You Can Do</h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              Share your portfolio, code samples, or projects. We match you based on 
              capability, not credentials.
            </p>
          </div>

          <div className="bg-white p-12 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer">
            <div className="text-7xl mb-6">🎯</div>
            <h3 className="text-3xl font-bold mb-6 text-gray-900">Find Real Matches</h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              AI-powered matching finds opportunities where your skills shine. 
              Human reviewers ensure quality.
            </p>
          </div>
        </div>

        {/* How It Works - Optimized readability */}
        <div className="mt-40 max-w-5xl mx-auto">
          <h3 className="text-5xl font-bold text-center mb-16 text-gray-900">
            How it works
          </h3>
          
          <div className="space-y-12">
            <div className="flex gap-10 items-start bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className="flex-shrink-0 w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl">
                1
              </div>
              <div>
                <h4 className="font-bold text-3xl mb-4 text-gray-900">Start Anonymous</h4>
                <p className="text-xl text-gray-600 leading-relaxed">
                  No sign-up required. Just start exploring. We create a private session 
                  for you—no email, no personal info needed.
                </p>
              </div>
            </div>

            <div className="flex gap-10 items-start bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className="flex-shrink-0 w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-3xl">
                2
              </div>
              <div>
                <h4 className="font-bold text-3xl mb-4 text-gray-900">Show Your Skills</h4>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Answer a few questions about what you can do. Share a portfolio, 
                  code samples, or past projects. No resume needed.
                </p>
              </div>
            </div>

            <div className="flex gap-10 items-start bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className="flex-shrink-0 w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-3xl">
                3
              </div>
              <div>
                <h4 className="font-bold text-3xl mb-4 text-gray-900">Get Matched</h4>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Our AI finds opportunities that match your capabilities. Browse matches 
                  anonymously. Connect only when you're ready.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA - Extra large for VR */}
        <div 
          className="mt-40 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] p-20 text-white" 
          id="get-started"
        >
          <h3 className="text-6xl font-bold mb-8">
            Ready to find your next opportunity?
          </h3>
          <p className="text-3xl mb-12 text-blue-100">
            Join friends and family already exploring opportunities.
          </p>
          <button 
            onClick={() => window.location.href = '/assess'}
            className="px-20 py-10 bg-white text-blue-600 rounded-2xl text-4xl font-bold hover:bg-blue-50 active:bg-blue-100 transition-all shadow-2xl hover:scale-105 transform cursor-pointer"
          >
            Start now (anonymous & free)
          </button>
          <p className="mt-8 text-xl text-blue-100">
            No credit card. No email. No commitment. Just explore.
          </p>
        </div>

        {/* Friends & Family Note - Quest 3 optimized */}
        <div className="mt-24 text-center max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-4 border-yellow-300 rounded-3xl p-10">
            <p className="text-2xl text-gray-700 leading-relaxed">
              <strong className="text-3xl">👋 Note for friends & family:</strong>
              <br/><br/>
              This is an early version! Your feedback helps make it better. 
              Feel free to explore, try things out, and let me know what works 
              (or doesn't). Optimized for your Quest 3!
              <br/><br/>
              <span className="text-xl text-gray-600">—Dash</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer - Larger for VR */}
      <footer className="container mx-auto px-8 py-16 mt-24 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-xl text-gray-600">
          <p>© 2025 jobmatch · Built with ❤️ for capability-first matching</p>
          <div className="flex gap-12">
            <a href="#" className="hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-lg">Privacy</a>
            <a href="#" className="hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-lg">How we're different</a>
            <a href="#" className="hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-lg">Give feedback</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
