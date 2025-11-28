'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface JobMatchChatProps {
  userId?: string;
  anonymousId?: string;
  userProfile?: {
    skills?: string[];
    preferences?: string;
    location?: string;
  };
  onJobMatch?: (jobId: string) => void;
  className?: string;
}

export default function JobMatchChat({
  userId,
  anonymousId,
  userProfile,
  onJobMatch,
  className = '',
}: JobMatchChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your personal job matching assistant. I'm here to help you find opportunities that match your skills and goals. Tell me about what kind of role you're looking for, and I'll help you discover the perfect match.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend API for OpenRouter chat
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Build context from user profile
      const context = {
        userId: userId || anonymousId,
        skills: userProfile?.skills || [],
        preferences: userProfile?.preferences || '',
        location: userProfile?.location || '',
      };

      const response = await fetch(`${API_BASE}/api/chat/job-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          context,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || "I'm here to help with your job search. Could you tell me more about what you're looking for?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If AI suggested specific jobs, trigger callback
      if (data.suggestedJobs && data.suggestedJobs.length > 0 && onJobMatch) {
        data.suggestedJobs.forEach((jobId: string) => onJobMatch(jobId));
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment, or feel free to browse jobs manually.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Example prompts to guide users
  const examplePrompts = [
    "I'm looking for remote software engineering roles",
    "Show me entry-level positions in data analysis",
    "What senior developer roles are available?",
    "I want to work in AI/ML in the Bay Area",
  ];

  return (
    <div className={`${className} flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-purple-50`}>
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Job Match Assistant</h2>
            <p className="text-lg text-gray-600 mt-1">
              Personalized job search powered by AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold">
              ✨ Subscriber
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              🟢 Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 shadow-md border border-gray-100'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🤖</span>
                    <span className="font-semibold text-sm text-gray-600">
                      Job Match AI
                    </span>
                  </div>
                )}
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-6 py-4 bg-white shadow-md border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-500 text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Example Prompts (show when few messages) */}
      {messages.length <= 2 && (
        <div className="px-8 pb-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-3 font-semibold">Try asking:</p>
            <div className="flex flex-wrap gap-3">
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t-2 border-gray-200 px-8 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 focus-within:border-blue-400 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about job opportunities, specific roles, or what you're looking for..."
              className="w-full px-6 py-4 bg-transparent text-lg resize-none outline-none"
              rows={3}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between px-6 pb-4">
              <p className="text-sm text-gray-500">
                Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Enter</kbd> to send, 
                <kbd className="px-2 py-1 bg-gray-200 rounded text-xs ml-1">Shift+Enter</kbd> for new line
              </p>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Sending...' : 'Send 💬'}
              </button>
            </div>
          </div>

          {/* Info notice */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              💡 <strong>Focus:</strong> Job matching only • No interview prep or resume writing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
