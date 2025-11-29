'use client';

import { useState, useEffect } from 'react';
import { JobMatchChat } from '@/components';

export default function DashboardPage() {
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [userProfile] = useState({
    skills: ['Python', 'FastAPI', 'React', 'TypeScript'],
    preferences: 'Remote positions preferred',
    location: 'San Francisco, CA',
  });
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate or retrieve anonymous ID
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setAnonymousId(id);

    // Fetch subscription status from backend
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch(`/api/subscription/status/${id}`);
        if (response.ok) {
          const data = await response.json();
          // API returns has_active_subscription boolean or subscription.status
          setIsSubscribed(
            data.has_active_subscription === true || 
            data.subscription?.status === 'active' || 
            data.subscription?.status === 'trialing'
          );
        } else {
          // No subscription found or error
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();

    // TODO: Fetch user profile from backend
  }, []);

  const handleJobMatch = (jobId: string) => {
    console.log('Job matched:', jobId);
    // TODO: Navigate to job details or save to favorites
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isSubscribed === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-8">
          <div className="text-8xl mb-8">🔒</div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Subscription Required
          </h1>
          <p className="text-2xl text-gray-600 mb-12">
            Upgrade to access personalized AI job matching chat
          </p>
          <button
            onClick={() => window.location.href = '/subscribe'}
            className="px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-2xl font-bold hover:shadow-2xl transition-all"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b-2 border-gray-200 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600">
              jobmatch
            </a>
            <div className="flex gap-6 text-lg">
              <a href="/dashboard" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
                Chat
              </a>
              <a href="/matches" className="text-gray-600 hover:text-gray-900">
                Matches
              </a>
              <a href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">
              Session: {anonymousId.slice(0, 8)}...
            </span>
          </div>
        </div>
      </nav>

      {/* Chat Interface - Full Screen */}
      <div className="flex-1 overflow-hidden">
        <JobMatchChat
          anonymousId={anonymousId}
          userProfile={userProfile}
          onJobMatch={handleJobMatch}
          className="h-full"
        />
      </div>
    </div>
  );
}
