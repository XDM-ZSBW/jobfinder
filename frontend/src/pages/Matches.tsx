import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface Match {
  id: string
  title: string
  company: string
  location: string
  isRemote: boolean
  matchScore: number
  description: string
  skills: string[]
  salaryRange?: string
  postedDate: string
}

export default function MatchesPage() {
  const navigate = useNavigate()
  const [anonymousId] = useState<string>('')
  const [matches, setMatches] = useState<Match[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>('list')
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [filters, setFilters] = useState({
    minScore: 0,
    remoteOnly: false,
    searchTerm: ''
  })
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [savedMatches, setSavedMatches] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load saved matches from localStorage
    const saved = localStorage.getItem('savedMatches')
    if (saved) {
      try {
        const savedArray = JSON.parse(saved)
        setSavedMatches(new Set(savedArray))
      } catch (e) {
        console.error('Error loading saved matches:', e)
      }
    }
  }, [])

  const handleSaveMatch = (matchId: string) => {
    const newSaved = new Set(savedMatches)
    if (newSaved.has(matchId)) {
      newSaved.delete(matchId)
    } else {
      newSaved.add(matchId)
    }
    setSavedMatches(newSaved)
    localStorage.setItem('savedMatches', JSON.stringify(Array.from(newSaved)))
    
    // TODO: Also save to backend API when endpoint is available
    // For now, using localStorage for persistence
  }

  const isMatchSaved = (matchId: string) => {
    return savedMatches.has(matchId)
  }

  useEffect(() => {
    // Check if this is a demo visit (no assessment completed)
    const hasCompletedAssessment = localStorage.getItem('assessmentCompleted') === 'true'
    setIsDemoMode(!hasCompletedAssessment)
    
    // Generate or retrieve anonymous ID
    const id = localStorage.getItem('anonymousId') || 
      Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    
    if (!localStorage.getItem('anonymousId')) {
      localStorage.setItem('anonymousId', id)
    }
    
    setAnonymousId(id)

    // Load simulated opportunities
    async function loadMatches() {
      try {
        const response = await fetch('/data/simulated_opportunities.json')
        if (!response.ok) {
          throw new Error('Failed to load opportunities')
        }
        const opportunities = await response.json()
        
        // Convert opportunities to matches with calculated scores
        // For demo, we'll use random scores (in production, calculate based on user profile)
        const matchesWithScores: Match[] = opportunities.slice(0, 1000).map((opp: any) => ({
          id: opp.id,
          title: opp.title,
          company: opp.company,
          location: opp.location,
          isRemote: opp.isRemote,
          matchScore: Math.floor(Math.random() * 30) + 70, // 70-100 for demo
          description: opp.description,
          skills: opp.skills,
          salaryRange: opp.salaryMin && opp.salaryMax 
            ? `$${Math.floor(opp.salaryMin / 1000)}k - $${Math.floor(opp.salaryMax / 1000)}k`
            : undefined,
          postedDate: formatPostedDate(opp.postedDate)
        }))
        
        // Sort by match score (highest first)
        matchesWithScores.sort((a, b) => b.matchScore - a.matchScore)
        
        setMatches(matchesWithScores)
        setFilteredMatches(matchesWithScores)
      } catch (error) {
        console.error('Error loading matches:', error)
        // Fallback to empty array
        setMatches([])
        setFilteredMatches([])
      }
    }
    
    loadMatches()
  }, [])
  
  function formatPostedDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`
  }

  useEffect(() => {
    let filtered = matches.filter(match => {
      const scoreMatch = match.matchScore >= filters.minScore
      const remoteMatch = !filters.remoteOnly || match.isRemote
      const searchMatch = !filters.searchTerm || 
        match.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        match.company.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        match.skills.some(skill => skill.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      
      return scoreMatch && remoteMatch && searchMatch
    })
    
    setFilteredMatches(filtered)
  }, [matches, filters])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">🎯 Demo Mode - Simulated Experience</h3>
                <p className="text-blue-100">
                  You're viewing 1000 simulated job opportunities. Complete the assessment to get personalized matches!
                </p>
              </div>
              <Link
                to="/assessment"
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition"
              >
                Start Assessment →
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                {isDemoMode ? 'Demo: Browse Opportunities' : 'Your Matches'}
              </h1>
              <p className="text-xl text-gray-600">
                {isDemoMode 
                  ? 'Explore 1000 simulated job opportunities'
                  : 'Opportunities tailored to your capabilities'
                }
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setViewMode('list')}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('swipe')}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  viewMode === 'swipe'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300'
                }`}
              >
                Swipe View
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Match Score: {filters.minScore}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.remoteOnly}
                    onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-semibold text-gray-700">Remote only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-lg text-gray-600">
            Found <span className="font-bold text-gray-900">{filteredMatches.length}</span> matches
          </p>
        </div>

        {/* No Results */}
        {filteredMatches.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-md">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No matches found
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Try adjusting your filters or complete your assessment to get better matches.
            </p>
            <Link
              to="/assessment"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition"
            >
              Take Assessment
            </Link>
          </div>
        )}

        {/* Matches Grid */}
        {viewMode === 'list' && filteredMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300"
              >
                {/* Match Score Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                    match.matchScore >= 90 ? 'bg-green-100 text-green-800' :
                    match.matchScore >= 75 ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {match.matchScore}% Match
                  </div>
                  {match.isRemote && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      Remote
                    </span>
                  )}
                </div>

                {/* Job Title & Company */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {match.title}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  {match.company} • {match.location}
                </p>

                {/* Description Preview */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {match.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {match.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {match.skills.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      +{match.skills.length - 4} more
                    </span>
                  )}
                </div>

                {/* Salary & Date */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  {match.salaryRange && (
                    <span className="font-semibold text-gray-900">
                      {match.salaryRange}
                    </span>
                  )}
                  <span>{match.postedDate}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/${match.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveMatch(match.id)
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    {isMatchSaved(match.id) ? 'Saved ✓' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Swipe View Placeholder */}
        {viewMode === 'swipe' && filteredMatches.length > 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-md">
            <div className="text-6xl mb-6">👆</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Swipe View
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Swipe view coming soon! Use list view for now.
            </p>
            <button
              onClick={() => setViewMode('list')}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition"
            >
              Switch to List View
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

