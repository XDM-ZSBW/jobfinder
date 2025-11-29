import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

interface JobDetails {
  id: string
  title: string
  company: string
  location: string
  isRemote: boolean
  description: string
  skills: string[]
  requirements: string[]
  salaryMin?: number
  salaryMax?: number
  employmentType: string
  postedDate: string
  matchScore?: number
}

export default function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const _navigate = useNavigate()
  const [job, setJob] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadJobDetails() {
      try {
        const response = await fetch('/data/simulated_opportunities.json')
        if (!response.ok) {
          throw new Error('Failed to load opportunities')
        }
        const opportunities = await response.json()
        const foundJob = opportunities.find((opp: any) => opp.id === jobId)
        
        if (foundJob) {
          // Format posted date
          const date = new Date(foundJob.postedDate)
          const now = new Date()
          const diffMs = now.getTime() - date.getTime()
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          
          let postedDate = 'Today'
          if (diffDays === 1) postedDate = '1 day ago'
          else if (diffDays < 7) postedDate = `${diffDays} days ago`
          else if (diffDays < 30) postedDate = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
          else if (diffDays < 365) postedDate = `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
          else postedDate = `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`
          
          setJob({
            ...foundJob,
            postedDate
          })
        } else {
          // Job not found
          setJob(null)
        }
      } catch (error) {
        console.error('Error loading job details:', error)
        setJob(null)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      loadJobDetails()
    } else {
      setLoading(false)
    }
  }, [jobId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/matches"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition"
          >
            Back to Matches
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/matches"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Matches
          </Link>
        </div>

        {/* Job Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {job.matchScore && (
                  <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                    job.matchScore >= 90 ? 'bg-green-100 text-green-800' :
                    job.matchScore >= 75 ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.matchScore}% Match
                  </div>
                )}
                {job.isRemote && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    Remote
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                  {job.employmentType}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>
              <p className="text-2xl text-gray-600 mb-2">
                {job.company}
              </p>
              <p className="text-lg text-gray-500">
                📍 {job.location}
              </p>
            </div>
          </div>

          {/* Salary & Date */}
          {(job.salaryMin && job.salaryMax) && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${Math.floor(job.salaryMin / 1000)}k - ${Math.floor(job.salaryMax / 1000)}k
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Posted</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {job.postedDate}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
            <button className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition">
              Apply Now
            </button>
            <button className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition">
              Save Job
            </button>
            <button className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

