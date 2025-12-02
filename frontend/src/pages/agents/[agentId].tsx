import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AgentUIRenderer } from '@/components/agent/AgentUIRenderer'
import { AgentUISchema } from '@/schemas/ui-schema'

export default function AgentPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const [schema, setSchema] = useState<AgentUISchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  // Fetch initial UI schema
  useEffect(() => {
    async function fetchSchema() {
      try {
        const response = await fetch(`/api/agents/${agentId}/ui-schema`)
        if (!response.ok) {
          throw new Error(`Failed to fetch schema: ${response.statusText}`)
        }
        const data = await response.json()
        setSchema(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    if (agentId) {
      fetchSchema()
    }
  }, [agentId])

  // Subscribe to real-time state updates via SSE
  useEffect(() => {
    if (!agentId || !schema) return

    const eventSource = new EventSource(`/api/agents/${agentId}/state/stream`)

    eventSource.onopen = () => {
      setConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        setSchema(prev => {
          if (!prev) return null
          return {
            ...prev,
            state: {
              ...prev.state,
              ...update.state
            }
          }
        })
      } catch (err) {
        console.error('Error parsing SSE message:', err)
      }
    }

    eventSource.onerror = () => {
      setConnected(false)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [agentId, schema])

  const handleAction = async (actionId: string, payload?: any) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/action/${actionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      })

      if (!response.ok) {
        throw new Error(`Action failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Action result:', result)
    } catch (err) {
      console.error('Error executing action:', err)
      alert(`Failed to execute action: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent UI...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Agent</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!schema) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No UI schema available for this agent.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{schema.agentName}</h1>
            <p className="text-gray-600 text-sm mt-1">Agent ID: {schema.agentId}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <AgentUIRenderer schema={schema} onAction={handleAction} />
      </div>
    </div>
  )
}


