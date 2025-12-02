import React from 'react'
import { useParams } from 'react-router-dom'

export default function WorkflowPage() {
  const { workflowId } = useParams<{ workflowId: string }>()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Workflow: {workflowId}</h1>
        <p className="text-gray-600">Workflow page coming soon...</p>
      </div>
    </div>
  )
}


