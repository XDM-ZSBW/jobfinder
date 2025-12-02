/**
 * Agent UI Demo Page
 * 
 * Demo page to verify the agent UI interface works.
 * Uses mock data so it works without backend.
 */

import React from 'react'
import { AgentUIRenderer } from '@/components/agent/AgentUIRenderer'
import { AgentUISchema } from '@/schemas/ui-schema'

// Mock agent schema for demo
const mockJobAnalyzerSchema: AgentUISchema = {
  agentId: 'demo-job-analyzer',
  agentName: 'Job Description Analyzer (Demo)',
  version: '1.0.0',
  components: [
    {
      id: 'header',
      type: 'text',
      props: { content: 'Job Description Analyzer', fontSize: '24px', fontWeight: 'bold' }
    },
    {
      id: 'status-badge',
      type: 'badge',
      props: { label: 'READY', color: 'success' }
    },
    {
      id: 'count',
      type: 'text',
      props: { content: 'Analyses performed: 5', fontSize: '14px', color: '#666' }
    },
    {
      id: 'job-title',
      type: 'text',
      props: { content: 'Title: Senior Software Engineer', fontSize: '18px', fontWeight: '600' }
    },
    {
      id: 'skills',
      type: 'card',
      props: { title: 'Required Skills' },
      children: [
        {
          id: 'skills-list',
          type: 'text',
          props: { content: 'Python, JavaScript, React, FastAPI, AWS, Docker', fontSize: '14px' }
        }
      ]
    },
    {
      id: 'experience',
      type: 'badge',
      props: { label: 'Level: senior', color: 'primary' }
    }
  ],
  layout: { type: 'stack', gap: 16 },
  actions: [
    {
      id: 'analyze',
      label: 'Analyze Job Description',
      type: 'button',
      endpoint: '/api/agents/demo-job-analyzer/analyze',
      method: 'POST'
    }
  ],
  state: {
    analysis_count: 5,
    last_analysis: {
      title: 'Senior Software Engineer',
      required_skills: ['Python', 'JavaScript', 'React', 'FastAPI', 'AWS', 'Docker'],
      experience_level: 'senior'
    }
  }
}

const mockMatchingSchema: AgentUISchema = {
  agentId: 'demo-matching',
  agentName: 'Matching Agent (Demo)',
  version: '1.0.0',
  components: [
    {
      id: 'header',
      type: 'text',
      props: { content: 'Job Matching Agent', fontSize: '24px', fontWeight: 'bold' }
    },
    {
      id: 'stats',
      type: 'card',
      children: [
        {
          id: 'match-count',
          type: 'text',
          props: { content: 'Total Matches: 12', fontSize: '14px' }
        },
        {
          id: 'avg-score',
          type: 'text',
          props: { content: 'Average Score: 78.5%', fontSize: '14px' }
        }
      ]
    },
    {
      id: 'match-score',
      type: 'card',
      children: [
        {
          id: 'score-label',
          type: 'text',
          props: { content: 'Match Score', fontSize: '16px', fontWeight: '600' }
        },
        {
          id: 'score-progress',
          type: 'progress',
          props: { value: 85, max: 100, label: '85%', showPercentage: true, color: 'success' }
        }
      ]
    },
    {
      id: 'recommendation',
      type: 'badge',
      props: { label: 'PROCEED', color: 'success' }
    },
    {
      id: 'strengths',
      type: 'card',
      props: { title: 'Strengths' },
      children: [
        {
          id: 'strengths-list',
          type: 'text',
          props: { content: '• Strong Python experience\n• AWS cloud expertise\n• React frontend skills\n• API design experience', fontSize: '14px' }
        }
      ]
    }
  ],
  layout: { type: 'stack', gap: 16 },
  actions: [
    {
      id: 'match',
      label: 'Run Matching',
      type: 'button',
      endpoint: '/api/agents/demo-matching/match',
      method: 'POST'
    }
  ],
  state: {
    match_count: 12,
    average_match_score: 0.785,
    last_match: {
      match_score: 0.85,
      recommendation: 'proceed',
      strengths: [
        'Strong Python experience',
        'AWS cloud expertise',
        'React frontend skills',
        'API design experience'
      ]
    }
  }
}

const mockBiasSchema: AgentUISchema = {
  agentId: 'demo-bias',
  agentName: 'Bias Detection Agent (Demo)',
  version: '1.0.0',
  components: [
    {
      id: 'header',
      type: 'text',
      props: { content: 'Bias Detection Agent', fontSize: '24px', fontWeight: 'bold' }
    },
    {
      id: 'stats',
      type: 'card',
      children: [
        {
          id: 'detection-count',
          type: 'text',
          props: { content: 'Analyses: 8', fontSize: '14px' }
        },
        {
          id: 'high-severity',
          type: 'text',
          props: { content: 'High Severity: 1', fontSize: '14px', color: '#d32f2f' }
        }
      ]
    },
    {
      id: 'severity',
      type: 'badge',
      props: { label: 'Severity: MEDIUM', color: 'warning' }
    },
    {
      id: 'biases',
      type: 'card',
      props: { title: 'Potential Biases (2)' },
      children: [
        {
          id: 'bias-0',
          type: 'alert',
          props: {
            severity: 'warning',
            message: '[AGE] Requirement for "recent graduate" may exclude experienced candidates'
          }
        },
        {
          id: 'bias-1',
          type: 'alert',
          props: {
            severity: 'warning',
            message: '[GENDER] Use of "salesman" instead of "salesperson"'
          }
        }
      ]
    },
    {
      id: 'mitigations',
      type: 'card',
      props: { title: 'Mitigation Strategies' },
      children: [
        {
          id: 'mitigations-list',
          type: 'text',
          props: {
            content: '• Focus on skills rather than graduation date\n• Use gender-neutral language\n• Consider equivalent experience',
            fontSize: '14px',
            color: '#2e7d32'
          }
        }
      ]
    }
  ],
  layout: { type: 'stack', gap: 16 },
  actions: [
    {
      id: 'detect-bias',
      label: 'Detect Bias',
      type: 'button',
      endpoint: '/api/agents/demo-bias/detect',
      method: 'POST'
    }
  ],
  state: {
    bias_detection_count: 8,
    high_severity_count: 1,
    last_bias_analysis: {
      severity_level: 'medium',
      potential_biases: [
        {
          type: 'age',
          description: 'Requirement for "recent graduate" may exclude experienced candidates'
        },
        {
          type: 'gender',
          description: 'Use of "salesman" instead of "salesperson"'
        }
      ],
      mitigation_strategies: [
        'Focus on skills rather than graduation date',
        'Use gender-neutral language',
        'Consider equivalent experience'
      ]
    }
  }
}

export default function AgentsDemoPage() {
  const handleAction = async (actionId: string, payload?: any) => {
    console.log('Action clicked:', actionId, payload)
    alert(`Demo: Action "${actionId}" would be executed here.\n\nIn production, this would call: /api/agents/{agentId}/action/${actionId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Agent UI Demo</h1>
          <p className="text-gray-600">
            This page demonstrates the agent-driven UI system with mock data.
            No backend required - perfect for verifying the interface works!
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These are demo agents with mock data. 
              To use real agents, navigate to <code className="bg-blue-100 px-2 py-1 rounded">/agents/{'{agentId}'}</code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Job Analyzer Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <AgentUIRenderer 
              schema={mockJobAnalyzerSchema} 
              onAction={handleAction}
            />
          </div>

          {/* Matching Agent Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <AgentUIRenderer 
              schema={mockMatchingSchema} 
              onAction={handleAction}
            />
          </div>

          {/* Bias Detection Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <AgentUIRenderer 
              schema={mockBiasSchema} 
              onAction={handleAction}
            />
          </div>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">URLs to Test</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>Demo Page (No Backend):</strong>
              <br />
              <code className="text-blue-600">http://localhost:3000/agents/demo</code>
            </div>
            <div className="mt-4">
              <strong>Real Agent (Requires Backend):</strong>
              <br />
              <code className="text-blue-600">http://localhost:3000/agents/{'{agentId}'}</code>
              <br />
              <span className="text-gray-500 text-xs">
                Replace {'{agentId}'} with actual agent ID from your backend
              </span>
            </div>
            <div className="mt-4">
              <strong>Workflow (Requires Backend):</strong>
              <br />
              <code className="text-blue-600">http://localhost:3000/workflow/{'{workflowId}'}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


