'use client';

import { useState } from 'react';
import { Card, Button } from '@/components';

type Tab = 'assessments' | 'matches';

interface Assessment {
  id: string;
  anonymous_id: string;
  skills: string[];
  portfolio_url?: string;
  work_preference: string;
  submitted_at: string;
  ai_analysis?: string;
  ai_confidence?: string;
}

interface Match {
  id: string;
  anonymous_id: string;
  job_id: string;
  title: string;
  company: string;
  match_score: number;
  ai_rationale?: string;
  created_at: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('assessments');
  
  // Mock data - will be replaced with API calls
  const [assessments] = useState<Assessment[]>([
    {
      id: 'assess_001',
      anonymous_id: 'a1b2c3d4e5f6',
      skills: ['Python', 'FastAPI', 'PostgreSQL'],
      portfolio_url: 'https://github.com/example',
      work_preference: 'Break it into smaller sub-problems',
      submitted_at: '2025-01-22T10:30:00Z',
      ai_analysis: 'Strong technical profile with good skill diversity.',
      ai_confidence: 'high'
    }
  ]);

  const [matches] = useState<Match[]>([
    {
      id: 'match_001',
      anonymous_id: 'a1b2c3d4e5f6',
      job_id: 'job_123',
      title: 'Senior Backend Engineer',
      company: 'TechCorp',
      match_score: 92,
      ai_rationale: '92% match based on strong Python and API skills.',
      created_at: '2025-01-22T11:00:00Z'
    }
  ]);

  const handleApproveAssessment = async (id: string) => {
    try {
      const response = await fetch(`/api/assessment/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewer_id: 'admin_001', // TODO: Get from auth context
          review_decision: 'approved',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve assessment');
      }

      const result = await response.json();
      console.log('Assessment approved:', result);
      
      // TODO: Update UI to remove approved assessment or show success message
      // For now, reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error approving assessment:', error);
      alert('Failed to approve assessment. Please try again.');
    }
  };

  const handleRejectAssessment = async (id: string) => {
    try {
      const response = await fetch(`/api/assessment/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewer_id: 'admin_001', // TODO: Get from auth context
          review_decision: 'rejected',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject assessment');
      }

      const result = await response.json();
      console.log('Assessment rejected:', result);
      
      // TODO: Update UI to remove rejected assessment or show success message
      // For now, reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting assessment:', error);
      alert('Failed to reject assessment. Please try again.');
    }
  };

  const handleApproveMatch = async (id: string) => {
    try {
      const response = await fetch(`/api/matching/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewer_id: 'admin_001', // TODO: Get from auth context
          decision: 'approved',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve match');
      }

      const result = await response.json();
      console.log('Match approved:', result);
      
      // TODO: Update UI to remove approved match or show success message
      // For now, reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error approving match:', error);
      alert('Failed to approve match. Please try again.');
    }
  };

  const handleRejectMatch = async (id: string) => {
    try {
      const response = await fetch(`/api/matching/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewer_id: 'admin_001', // TODO: Get from auth context
          decision: 'rejected',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject match');
      }

      const result = await response.json();
      console.log('Match rejected:', result);
      
      // TODO: Update UI to remove rejected match or show success message
      // For now, reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting match:', error);
      alert('Failed to reject match. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <header className="container mx-auto px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold">🛡️ Admin Dashboard</h1>
            <p className="text-xl text-gray-300 mt-2">Human-in-the-loop review system</p>
          </div>
          <div className="text-lg text-gray-400">
            Reviewer ID: admin_001
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-8 py-4 text-2xl font-bold rounded-xl transition ${
              activeTab === 'assessments'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📝 Assessments ({assessments.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-8 py-4 text-2xl font-bold rounded-xl transition ${
              activeTab === 'matches'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🎯 Matches ({matches.length})
          </button>
        </div>

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="bg-blue-900 border-2 border-blue-500 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-3">ℹ️ Review Guidelines</h3>
              <ul className="space-y-2 text-lg text-gray-300">
                <li>• Check skill diversity and authenticity</li>
                <li>• Verify portfolio URLs if provided</li>
                <li>• Look for spam or suspicious patterns</li>
                <li>• AI analysis is advisory only - trust your judgment</li>
              </ul>
            </div>

            {assessments.length === 0 ? (
              <Card className="bg-gray-800 border-2 border-gray-600">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-2xl text-gray-400">No assessments pending review</p>
                </div>
              </Card>
            ) : (
              assessments.map(assessment => (
                <div key={assessment.id} className="bg-gray-800 rounded-2xl p-8 border-2 border-gray-600">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">
                        ID: {assessment.id}
                      </div>
                      <div className="text-lg text-gray-400">
                        Anonymous: {assessment.anonymous_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        Submitted: {new Date(assessment.submitted_at).toLocaleString()}
                      </div>
                    </div>
                    {assessment.ai_confidence && (
                      <div className={`px-4 py-2 rounded-lg text-lg font-semibold ${
                        assessment.ai_confidence === 'high' ? 'bg-green-800 text-green-200' :
                        assessment.ai_confidence === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                        'bg-red-800 text-red-200'
                      }`}>
                        AI Confidence: {assessment.ai_confidence}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-xl font-bold mb-2">Skills ({assessment.skills.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.skills.map(skill => (
                          <span key={skill} className="px-4 py-2 bg-blue-900 text-blue-200 rounded-lg text-lg">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {assessment.portfolio_url && (
                      <div>
                        <h4 className="text-xl font-bold mb-2">Portfolio</h4>
                        <a 
                          href={assessment.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline text-lg"
                        >
                          {assessment.portfolio_url}
                        </a>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xl font-bold mb-2">Work Preference</h4>
                      <p className="text-lg text-gray-300">{assessment.work_preference}</p>
                    </div>

                    {assessment.ai_analysis && (
                      <div className="bg-gray-900 border-2 border-blue-800 rounded-xl p-4">
                        <h4 className="text-xl font-bold mb-2">🤖 AI Analysis</h4>
                        <p className="text-lg text-gray-300">{assessment.ai_analysis}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() => handleRejectAssessment(assessment.id)}
                      fullWidth
                    >
                      ❌ Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => handleApproveAssessment(assessment.id)}
                      fullWidth
                    >
                      ✅ Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="bg-purple-900 border-2 border-purple-500 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-3">ℹ️ Match Review Guidelines</h3>
              <ul className="space-y-2 text-lg text-gray-300">
                <li>• Verify match score makes sense given skills/requirements</li>
                <li>• Check for capability overlap, not credential matching</li>
                <li>• Ensure job requirements are realistic</li>
                <li>• AI rationale is advisory only</li>
              </ul>
            </div>

            {matches.length === 0 ? (
              <Card className="bg-gray-800 border-2 border-gray-600">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-2xl text-gray-400">No matches pending approval</p>
                </div>
              </Card>
            ) : (
              matches.map(match => (
                <div key={match.id} className="bg-gray-800 rounded-2xl p-8 border-2 border-gray-600">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{match.title}</h3>
                      <p className="text-xl text-gray-400">{match.company}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        Match ID: {match.id} | Created: {new Date(match.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className={`text-5xl font-bold ${
                      match.match_score >= 90 ? 'text-green-400' :
                      match.match_score >= 80 ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {match.match_score}%
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-lg text-gray-400">Anonymous User</h4>
                      <p className="text-xl font-mono">{match.anonymous_id}</p>
                    </div>

                    {match.ai_rationale && (
                      <div className="bg-gray-900 border-2 border-purple-800 rounded-xl p-4">
                        <h4 className="text-xl font-bold mb-2">🤖 AI Rationale</h4>
                        <p className="text-lg text-gray-300">{match.ai_rationale}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() => handleRejectMatch(match.id)}
                      fullWidth
                    >
                      ❌ Reject Match
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => handleApproveMatch(match.id)}
                      fullWidth
                    >
                      ✅ Approve Match
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
