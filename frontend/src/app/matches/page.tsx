'use client';

import { useState, useEffect } from 'react';
import { Header, Card, Button, SwipeCards } from '@/components';
import type { JobCard } from '@/components/SwipeCards';

interface Match {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  requiredCapabilities: string[];
  description: string;
  isRemote: boolean;
}

// Mock data - will be replaced with API call
const mockMatches: Match[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    matchScore: 95,
    requiredCapabilities: ['Python', 'FastAPI', 'React', 'PostgreSQL'],
    description: 'Build scalable web applications with modern tech stack.',
    isRemote: true
  },
  {
    id: '2',
    title: 'AI/ML Engineer',
    company: 'DataAI Inc',
    location: 'Remote',
    matchScore: 88,
    requiredCapabilities: ['Python', 'AI/ML', 'Data Analysis', 'Problem Solving'],
    description: 'Design and implement machine learning models for production.',
    isRemote: true
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'DesignHub',
    location: 'New York, NY',
    matchScore: 82,
    requiredCapabilities: ['JavaScript', 'React', 'Next.js', 'UI/UX'],
    description: 'Create beautiful user interfaces with modern frameworks.',
    isRemote: false
  }
];

export default function MatchesPage() {
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>('list');
  const [savedMatches, setSavedMatches] = useState<string[]>([]);
  const [passedMatches, setPassedMatches] = useState<string[]>([]);

  useEffect(() => {
    // Generate or retrieve anonymous ID
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setAnonymousId(id);
  }, []);

  const filteredMatches = matches.filter(match => {
    if (remoteOnly && !match.isRemote) return false;
    if (match.matchScore < minScore) return false;
    // Filter out already swiped cards in swipe mode
    if (viewMode === 'swipe' && (savedMatches.includes(match.id) || passedMatches.includes(match.id))) {
      return false;
    }
    return true;
  });

  // Convert matches to job cards for swipe view
  const jobCards: JobCard[] = filteredMatches.map(match => ({
    id: match.id,
    title: match.title,
    company: match.company,
    description: match.description,
    skills: match.requiredCapabilities,
    matchScore: match.matchScore,
    location: match.location,
    remote: match.isRemote,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header anonymousId={anonymousId} />

      <main className="container mx-auto px-8 py-12 max-w-6xl">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Your Matches
          </h1>
          <p className="text-2xl text-gray-600">
            Opportunities that match your capabilities
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewMode('list')}
            className={`px-12 py-6 rounded-2xl text-2xl font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-xl'
                : 'bg-white text-gray-700 border-4 border-gray-300 hover:border-blue-400'
            }`}
          >
            📋 List View
          </button>
          <button
            onClick={() => setViewMode('swipe')}
            className={`px-12 py-6 rounded-2xl text-2xl font-bold transition-all ${
              viewMode === 'swipe'
                ? 'bg-blue-600 text-white shadow-xl'
                : 'bg-white text-gray-700 border-4 border-gray-300 hover:border-blue-400'
            }`}
          >
            👆 Swipe View
          </button>
        </div>

        {/* Filters */}
        <Card variant="info" className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Filters</h3>
          <div className="flex flex-wrap gap-6 items-center">
            <label className="flex items-center gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-8 h-8 cursor-pointer"
              />
              <span className="text-2xl font-semibold text-gray-700">Remote only</span>
            </label>

            <div className="flex items-center gap-4">
              <label className="text-2xl font-semibold text-gray-700">
                Min match score:
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-48"
              />
              <span className="text-2xl font-bold text-blue-600 min-w-[4rem]">
                {minScore}%
              </span>
            </div>
          </div>
          <p className="mt-4 text-lg text-gray-600">
            Showing {filteredMatches.length} of {matches.length} opportunities
          </p>
        </Card>

        {/* No results */}
        {filteredMatches.length === 0 && (
          <Card variant="warning">
            <div className="text-center">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                No matches found
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Try adjusting your filters or complete your assessment to get better matches.
              </p>
              <Button onClick={() => window.location.href = '/assess'}>
                Take assessment
              </Button>
            </div>
          </Card>
        )}

        {/* Swipe View */}
        {viewMode === 'swipe' && filteredMatches.length > 0 && (
          <SwipeCards
            cards={jobCards}
            onSwipeLeft={(card) => {
              setPassedMatches(prev => [...prev, card.id]);
              console.log('Passed:', card.title);
            }}
            onSwipeRight={(card) => {
              setSavedMatches(prev => [...prev, card.id]);
              console.log('Saved:', card.title);
            }}
            onCardTap={(card) => {
              console.log('View details:', card.title);
              // Could open a modal with full details
            }}
          />
        )}

        {/* List View - Matches Grid */}
        {viewMode === 'list' && (
          <div className="space-y-8">
            {filteredMatches.map(match => (
            <Card key={match.id}>
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-4xl font-bold text-gray-900 mb-2">
                        {match.title}
                      </h2>
                      <p className="text-2xl text-gray-600">
                        {match.company} • {match.location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-5xl font-bold ${
                        match.matchScore >= 90 ? 'text-green-600' :
                        match.matchScore >= 80 ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {match.matchScore}%
                      </div>
                      <div className="text-lg text-gray-500">match</div>
                    </div>
                  </div>

                  {match.isRemote && (
                    <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-lg font-semibold mb-4">
                      🌍 Remote
                    </div>
                  )}

                  <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                    {match.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      Required capabilities:
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {match.requiredCapabilities.map(cap => (
                        <span
                          key={cap}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-lg font-semibold"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button size="lg" variant="primary">
                    View details →
                  </Button>
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}

        {/* Empty state for new users */}
        {matches.length === 0 && (
          <Card variant="info">
            <div className="text-center">
              <div className="text-8xl mb-8">🎯</div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                No matches yet
              </h2>
              <p className="text-2xl text-gray-600 mb-12 leading-relaxed">
                Complete your capability assessment to start seeing opportunities
                <br />
                that match what you can do.
              </p>
              <Button size="xl" onClick={() => window.location.href = '/assess'}>
                Start assessment
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
