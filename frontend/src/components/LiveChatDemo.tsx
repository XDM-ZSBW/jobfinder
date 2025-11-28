'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DEMO_CONVERSATIONS = [
  {
    trigger: "remote developer jobs",
    responses: [
      {
        role: 'user' as const,
        content: "I'm looking for remote developer jobs",
        timestamp: new Date()
      },
      {
        role: 'assistant' as const,
        content: "Great! With your Python, FastAPI, React, and TypeScript skills, you're well-positioned for remote full-stack roles. Let me help you find the right opportunities.\n\nAre you interested in:\n- Startup environments (fast-paced, equity opportunities)\n- Established tech companies (stability, benefits)\n- Specific industries like fintech, healthcare, or AI/ML?\n\nWhat level are you targeting - mid-level, senior, or staff positions?",
        timestamp: new Date()
      }
    ]
  },
  {
    trigger: "junior frontend",
    responses: [
      {
        role: 'user' as const,
        content: "Looking for junior frontend positions",
        timestamp: new Date()
      },
      {
        role: 'assistant' as const,
        content: "Perfect! Junior frontend roles are in high demand. Based on your React and TypeScript experience, here's what I recommend:\n\n**Great Entry Points:**\n- Agencies (diverse projects, rapid learning)\n- Product companies (deeper specialization)\n- Startups (wear many hats, fast growth)\n\n**Your Skills Match:**\n- React + TypeScript: Core requirements\n- Modern tooling knowledge\n- Component-based thinking\n\nAre you open to remote, hybrid, or only in-office positions? Any location preferences?",
        timestamp: new Date()
      }
    ]
  },
  {
    trigger: "career switch",
    responses: [
      {
        role: 'user' as const,
        content: "I'm switching careers to tech, what opportunities fit?",
        timestamp: new Date()
      },
      {
        role: 'assistant' as const,
        content: "Welcome to tech! Career switchers often bring valuable unique perspectives. Let me help you find opportunities that value your transferable skills.\n\n**Career Switcher-Friendly Roles:**\n- Companies with apprenticeship programs\n- Teams that value diverse backgrounds\n- Roles emphasizing problem-solving over CS degrees\n\n**What to Highlight:**\n- Your previous industry expertise (domain knowledge is valuable!)\n- Self-taught projects or bootcamp work\n- Communication and collaboration skills\n\nWhat was your previous field? This can actually be a huge advantage in the right role!",
        timestamp: new Date()
      }
    ]
  }
];

export default function LiveChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI job matching assistant. I help you find opportunities based on what you can do, not just your resume.\n\nTry asking me about:\n• Remote developer positions\n• Junior frontend opportunities\n• Career switching advice\n\nThis is a live demo - real AI, real responses!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Rotate demo conversations every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % DEMO_CONVERSATIONS.length);
      // Reset to welcome message
      setMessages([{
        role: 'assistant',
        content: "👋 Hi! I'm your AI job matching assistant. I help you find opportunities based on what you can do, not just your resume.\n\nTry asking me about:\n• Remote developer positions\n• Junior frontend opportunities  \n• Career switching advice\n\nThis is a live demo - real AI, real responses!",
        timestamp: new Date()
      }]);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const simulateTyping = async (text: string, delay: number = 30) => {
    return new Promise<void>((resolve) => {
      let currentText = '';
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < text.length) {
          currentText += text[index];
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: currentText
            };
            return newMessages;
          });
          index++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Find matching demo conversation
    const inputLower = input.toLowerCase();
    let demoConvo = DEMO_CONVERSATIONS.find(demo => 
      inputLower.includes(demo.trigger)
    );

    // Default to current rotating demo if no match
    if (!demoConvo) {
      demoConvo = DEMO_CONVERSATIONS[currentDemo];
    }

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    // Add empty assistant message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }]);

    // Get the assistant response from demo
    const assistantResponse = demoConvo.responses.find(m => m.role === 'assistant');
    if (assistantResponse) {
      await simulateTyping(assistantResponse.content, 20);
    }

    setIsLoading(false);
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const examplePrompts = [
    "Show me remote developer jobs",
    "Looking for junior frontend positions",
    "I'm switching careers to tech"
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🤖
            </div>
            <div>
              <h3 className="text-2xl font-bold">AI Job Match Chat</h3>
              <p className="text-lg text-blue-100 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                Live Demo - Try It Now!
              </p>
            </div>
          </div>
          <div className="bg-white/20 px-6 py-3 rounded-full">
            <span className="text-xl font-bold">✨ Powered by AI</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[500px] overflow-y-auto p-8 bg-gray-50 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl p-6 text-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 rounded-bl-none shadow-lg border-2 border-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              <div
                className={`text-sm mt-3 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompts */}
      {messages.length <= 1 && (
        <div className="px-8 py-4 bg-gray-50 border-t-2 border-gray-200">
          <p className="text-lg text-gray-600 mb-3 font-semibold">💡 Try asking:</p>
          <div className="flex flex-wrap gap-3">
            {examplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(prompt)}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-base font-medium shadow-sm hover:shadow-md"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Typing Input */}
      {true && (
        <div className="p-6 bg-white border-t-2 border-gray-200">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about jobs, skills, or your career..."
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              disabled={isLoading}
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-10 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoading ? '⏳' : '📤'} Send
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            💡 This is a live interactive demo. In the full version, responses are personalized to your profile!
          </p>
        </div>
      )}
    </div>
  );
}
