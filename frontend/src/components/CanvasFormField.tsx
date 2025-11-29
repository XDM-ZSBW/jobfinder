'use client'

import { useEffect, useRef, useState } from 'react'

interface InteractiveElement {
  id: string
  type: 'text' | 'button' | 'drag-drop' | 'click-target' | 'drawing-area'
  x: number
  y: number
  width: number
  height: number
  content?: string
  options?: string[]
  correctAnswer?: string | string[]
  onComplete?: (value: any) => void
}

interface CanvasFormFieldProps {
  label?: string
  value?: any
  onChange?: (value: any) => void
  placeholder?: string
  interactiveMode?: 'chat' | 'canvas' | 'hybrid'
  interactiveElements?: InteractiveElement[]
  aiTrainingEnabled?: boolean
  onAITraining?: (interaction: any) => void
  height?: number
  width?: number
  className?: string
}

export default function CanvasFormField({
  label,
  value,
  onChange,
  placeholder = "Draw, type, or interact to provide your answer...",
  interactiveMode = 'hybrid',
  interactiveElements = [],
  aiTrainingEnabled = true,
  onAITraining,
  height = 300,
  width = 600,
  className = ''
}: CanvasFormFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'text' | 'interactive'>('interactive')
  const [color, setColor] = useState('#2196f3')
  const [lineWidth, setLineWidth] = useState(2)
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'ai', content: string, timestamp: Date}>>([])
  const [chatInput, setChatInput] = useState('')
  const [showChat, setShowChat] = useState(interactiveMode === 'chat' || interactiveMode === 'hybrid')
  const [showCanvas, setShowCanvas] = useState(interactiveMode === 'canvas' || interactiveMode === 'hybrid')
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [interactions, setInteractions] = useState<any[]>([])
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Draw interactive elements
    drawInteractiveElements(ctx)
  }, [interactiveElements, width, height])

  const drawInteractiveElements = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    // Draw background
    ctx.fillStyle = '#f9f9f9'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw interactive elements
    interactiveElements.forEach((element) => {
      ctx.strokeStyle = '#2196f3'
      ctx.lineWidth = 2
      ctx.strokeRect(element.x, element.y, element.width, element.height)
      
      if (element.type === 'text') {
        ctx.fillStyle = '#fff'
        ctx.fillRect(element.x, element.y, element.width, element.height)
        ctx.fillStyle = '#333'
        ctx.font = '14px sans-serif'
        ctx.fillText(element.content || '', element.x + 5, element.y + 20)
      } else if (element.type === 'button') {
        ctx.fillStyle = '#e3f2fd'
        ctx.fillRect(element.x, element.y, element.width, element.height)
        ctx.fillStyle = '#2196f3'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(element.content || '', element.x + element.width / 2, element.y + 20)
        ctx.textAlign = 'left'
      } else if (element.type === 'drag-drop') {
        ctx.fillStyle = '#fff3cd'
        ctx.fillRect(element.x, element.y, element.width, element.height)
        ctx.fillStyle = '#856404'
        ctx.font = '12px sans-serif'
        ctx.fillText('Drag me', element.x + 5, element.y + 15)
      }
    })
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on interactive element
    const clickedElement = interactiveElements.find(el => 
      x >= el.x && x <= el.x + el.width &&
      y >= el.y && y <= el.y + el.height
    )

    if (clickedElement) {
      handleElementInteraction(clickedElement, { x, y, type: 'click' })
    } else if (tool === 'pen') {
      startDrawing(e)
    }
  }

  const handleElementInteraction = (element: InteractiveElement, interaction: any) => {
    const interactionData = {
      elementId: element.id,
      elementType: element.type,
      interaction,
      timestamp: new Date(),
      value: interaction.value || element.content
    }

    setInteractions(prev => [...prev, interactionData])

    // Track for AI training
    if (aiTrainingEnabled && onAITraining) {
      onAITraining(interactionData)
    }

    // Handle completion
    if (element.onComplete) {
      element.onComplete(interaction.value || element.content)
    }

    // Update form value
    if (onChange) {
      onChange({
        ...value,
        [element.id]: interaction.value || element.content,
        interactions: [...interactions, interactionData]
      })
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setLastPos({ x, y })
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pen') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.stroke()

    setLastPos({ x, y })

    // Save drawing to value
    if (onChange) {
      const dataURL = canvas.toDataURL()
      onChange({
        ...value,
        canvasData: dataURL,
        lastUpdated: new Date().toISOString()
      })
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleChatSubmit = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    const userMessage = {
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')

    // Track interaction for AI training
    if (aiTrainingEnabled && onAITraining) {
      onAITraining({
        type: 'chat',
        message,
        timestamp: new Date()
      })
    }

    // Update form value
    if (onChange) {
      onChange({
        ...value,
        chatMessages: [...chatMessages, userMessage],
        lastInput: message
      })
    }

    // Call backend chat API (OpenRouter via backend). Fallback to local response on failure.
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful assistant for the Universal Canvas. Respond briefly.' },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      })

      if (!res.ok) throw new Error(`Chat API error: ${res.status}`)
      const data = await res.json()

      const aiResponse = {
        type: 'ai' as const,
        content: data?.message || 'Sorry, I could not generate a response right now.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiResponse])
    } catch (err) {
      const aiResponse = {
        type: 'ai' as const,
        content: `I understand: "${message}". (Backend unavailable — showing fallback response)`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiResponse])
    }
  }

  const handleDragStart = (elementId: string) => {
    setDraggedElement(elementId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetElement: InteractiveElement) => {
    e.preventDefault()
    if (draggedElement && targetElement.type === 'drag-drop') {
      handleElementInteraction(targetElement, {
        draggedFrom: draggedElement,
        droppedTo: targetElement.id,
        type: 'drag-drop'
      })
    }
    setDraggedElement(null)
  }

  return (
    <div className={className} style={{ width: '100%' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '500',
          fontSize: '0.9rem'
        }}>
          {label}
        </label>
      )}

      {/* Mode Toggle */}
      {interactiveMode === 'hybrid' && (
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '0.75rem',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => {
              setShowChat(true)
              setShowCanvas(true)
            }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              backgroundColor: (showChat && showCanvas) ? '#2196f3' : '#f0f0f0',
              color: (showChat && showCanvas) ? '#fff' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Both
          </button>
          <button
            onClick={() => {
              setShowChat(true)
              setShowCanvas(false)
            }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              backgroundColor: (showChat && !showCanvas) ? '#2196f3' : '#f0f0f0',
              color: (showChat && !showCanvas) ? '#fff' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Chat
          </button>
          <button
            onClick={() => {
              setShowChat(false)
              setShowCanvas(true)
            }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              backgroundColor: (!showChat && showCanvas) ? '#2196f3' : '#f0f0f0',
              color: (!showChat && showCanvas) ? '#fff' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Canvas
          </button>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        flexDirection: showChat && showCanvas ? 'row' : 'column',
        width: '100%'
      }}>
        {/* Chat Interface */}
        {showChat && (
          <div 
            ref={chatContainerRef}
            style={{
              flex: showChat && showCanvas ? 1 : 'none',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fff',
              height: `${height}px`,
              minHeight: '200px'
            }}
          >
            {/* Chat Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {chatMessages.length === 0 && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  color: '#1976d2',
                  fontSize: '0.875rem'
                }}>
                  💬 Start a conversation to fill out this form interactively!
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: msg.type === 'user' ? '#2196f3' : '#f0f0f0',
                    color: msg.type === 'user' ? '#fff' : '#333',
                    fontSize: '0.875rem',
                    lineHeight: '1.4'
                  }}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div style={{
              borderTop: '1px solid #e0e0e0',
              padding: '0.75rem',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    handleChatSubmit(chatInput)
                  }
                }}
                placeholder="Type your answer..."
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  outline: 'none',
                  fontSize: '0.875rem'
                }}
              />
              <button
                onClick={() => handleChatSubmit(chatInput)}
                disabled={!chatInput.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: chatInput.trim() ? '#2196f3' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Canvas Interface */}
        {showCanvas && (
          <div style={{
            flex: showChat && showCanvas ? 1 : 'none',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fff',
            padding: '0.75rem'
          }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #e0e0e0',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setTool('interactive')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.75rem',
                  backgroundColor: tool === 'interactive' ? '#2196f3' : '#f0f0f0',
                  color: tool === 'interactive' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✨ Interactive
              </button>
              <button
                onClick={() => setTool('pen')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.75rem',
                  backgroundColor: tool === 'pen' ? '#2196f3' : '#f0f0f0',
                  color: tool === 'pen' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✏️ Draw
              </button>
              <button
                onClick={() => setTool('text')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.75rem',
                  backgroundColor: tool === 'text' ? '#2196f3' : '#f0f0f0',
                  color: tool === 'text' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📝 Text
              </button>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '40px', height: '32px', cursor: 'pointer' }}
              />
              <input
                type="range"
                min="1"
                max="10"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                style={{ width: '80px' }}
              />
            </div>

            {/* Canvas */}
            <div style={{
              position: 'relative',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              overflow: 'visible',
              backgroundColor: '#f9f9f9',
              minHeight: `${height}px`
            }}>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  cursor: tool === 'pen' ? 'crosshair' : 'pointer',
                  display: 'block',
                  width: '100%',
                  maxWidth: `${width}px`,
                  height: 'auto',
                  position: 'relative',
                  zIndex: 1
                }}
              />
              
              {/* Interactive Elements Overlay (for drag-drop) */}
              {interactiveElements.filter(el => el.type === 'drag-drop').map((element) => (
                <div
                  key={element.id}
                  draggable
                  onDragStart={() => handleDragStart(element.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, element)}
                  style={{
                    position: 'absolute',
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    backgroundColor: '#fff3cd',
                    border: '2px dashed #856404',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    cursor: 'grab',
                    fontSize: '0.75rem',
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {element.content || 'Drag me'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Placeholder hint */}
      {(!showChat && !showCanvas) && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          color: '#666',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          {placeholder}
        </div>
      )}
    </div>
  )
}

