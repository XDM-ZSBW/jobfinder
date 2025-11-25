'use client';

import { useState } from 'react';
import Link from 'next/link';
import InteractiveDemo from '@/components/InteractiveDemo';

type FeatureStatus = 'live' | 'beta' | 'coming' | 'planned';
type Feature = { label: string; status: FeatureStatus };

const FEATURES: Feature[] = [
  { label: 'AI-powered job matching with verified employers', status: 'live' },
  { label: 'Direct messaging with hiring managers', status: 'beta' },
  { label: 'Real-time application tracking', status: 'coming' },
  { label: 'Interview preparation & coaching', status: 'planned' },
  { label: 'Career insights & salary analytics', status: 'planned' }
];

function StatusIcon({ status }: { status: FeatureStatus }) {
  const base = 'w-6 h-6 mr-3 flex-shrink-0 mt-1';
  switch (status) {
    case 'live':
      return (
        <svg className={`${base} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Live">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'beta':
      return (
        <svg className={`${base} text-amber-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Beta">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428L12 22.857l-7.428-7.429A8.4 8.4 0 1119.428 4.57a8.4 8.4 0 010 10.857z" />
        </svg>
      );
    case 'coming':
      return (
        <svg className={`${base} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Coming soon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className={`${base} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Planned">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
        </svg>
      );
  }
}

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            JobMatch<span className="text-indigo-600">.zip</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            AI-Powered Job Matching That Actually Works
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Stop wasting time on traditional job boards. Get direct connections to verified hiring managers with our intelligent matching engine.
          </p>

          {/* Pricing Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md mx-auto mb-12">
            <div className="mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                $1<span className="text-xl font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">AI-Powered Job Matching</p>
              <p className="text-sm text-indigo-600 font-semibold mt-1">Get on the list • Cancel anytime</p>
            </div>

            <div className="space-y-4 text-left mb-6">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-start">
                  <StatusIcon status={f.status} />
                  <span className="text-gray-700">
                    <span className="sr-only">[{f.status}] </span>{f.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mb-8">
              Legend: <span className="text-green-600">✅ Live</span> · <span className="text-amber-500">🧪 Beta</span> · <span className="text-gray-500">🕒 Coming</span> · <span className="text-gray-500">◌ Planned</span>.{' '}
              <a className="text-indigo-600 hover:underline" href="https://github.com/Zeppelone/myl.zip/blob/main/ROADMAP.md" target="_blank" rel="noreferrer">See the roadmap</a>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500 space-y-1">
              <p>✓ 7-day free trial</p>
              <p>✓ 14-day money-back guarantee</p>
              <p>✓ Cancel anytime</p>
              <p>✓ Maximum 6 resubscriptions</p>
            </div>
          </div>

          {/* Simple Policy */}
          <div className="text-sm text-gray-600 max-w-2xl mx-auto mb-12">
            <p className="mb-2">
              <strong>Cancel Anytime:</strong> No contracts, no hassle. Just $1/month to stay on the list.
            </p>
            <p className="mb-2">
              <strong>Refund Policy:</strong> Full refund within 14 days if it's not working for you.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              <strong>Support:</strong> Questions? Text us at (626) 995-9974 (Twilio AI support line)
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why JobMatch.zip?
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Employers</h3>
              <p className="text-gray-600">
                No scams or fake job postings. Every employer is verified before posting.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Matching</h3>
              <p className="text-gray-600">
                Smart algorithms match you with jobs that fit your skills and career goals.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Communication</h3>
              <p className="text-gray-600">
                Message hiring managers directly. No black hole applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Ecosystem</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://futurelink.zip" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">FutureLink.zip</a></li>
                <li><a href="https://github.com/jobmatch-ai" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="https://docs.jobmatch.zip" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                <li><a href="https://api.jobmatch.zip" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">API</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 JobMatch.zip. All rights reserved.</p>
            <p className="mt-2 text-sm">Powered by AI • Secured by Stripe • Built for Job Seekers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
