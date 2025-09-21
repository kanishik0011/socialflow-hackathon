'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Copy, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { useChatStore, useAuthStore } from '@/store';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
}

export default function AIChat({ className = '' }: { className?: string }) {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sessionId, messages, isLoading, setSessionId, addMessage, setLoading } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Sync with global chat state
    if (messages.length > 0) {
      const messagesWithIds = messages.map((msg, index) => ({
        ...msg,
        id: `msg-${index}`,
      }));
      setLocalMessages(messagesWithIds);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      id: `user-${Date.now()}`,
    };

    setLocalMessages(prev => [...prev, userMessage]);
    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      // Simulate API call to backend
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: input.trim(),
          sessionId: sessionId || undefined,
          context: {
            businessInfo: user?.businessInfo,
            socialAccounts: user?.socialAccounts,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        id: `assistant-${Date.now()}`,
      };

      setLocalMessages(prev => [...prev, assistantMessage]);
      addMessage(assistantMessage);
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback response for demo
      const fallbackMessage: ChatMessage = {
        role: 'assistant',
        content: `I'd be happy to help you create engaging social media content! Here are some ideas based on your request:

🚀 **For Twitter:**
"Just discovered an amazing productivity hack that saves me 2 hours daily! Here's what changed everything... [thread 1/5]"

📸 **For Instagram:**
"Behind the scenes of my morning routine ☀️ Starting the day with intention makes all the difference. What's your favorite morning ritual?"

💼 **For LinkedIn:**
"3 key lessons I learned this quarter that transformed my approach to [your industry]. Sharing insights that might help fellow professionals..."

✨ **Pro tip:** The best content comes from authentic experiences and genuine value. What specific topic or goal would you like me to help you develop content around?`,
        timestamp: new Date(),
        id: `assistant-${Date.now()}`,
      };

      setLocalMessages(prev => [...prev, fallbackMessage]);
      addMessage(fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const suggestions = [
    "Create a Twitter thread about productivity",
    "Write an engaging Instagram caption",
    "Generate LinkedIn post ideas",
    "Help me with hashtag suggestions",
    "Create content for my industry",
  ];

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Content Assistant</h3>
            <p className="text-sm text-gray-600">Get help creating engaging social media content</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
        {localMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to create amazing content?</h4>
            <p className="text-gray-600 mb-6">Ask me anything about social media content creation!</p>
            
            <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {localMessages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div className={`p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-900'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-500 hover:text-green-600 transition-colors"
                      title="Good response"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title="Poor response"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to create content, generate ideas, or help with your social media strategy..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • AI responses are generated based on your business context
        </p>
      </div>
    </div>
  );
}