'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AIChat from '@/components/chat/AIChat';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">AI Content Assistant</h1>
            <p className="text-gray-600">Create engaging social media content with AI</p>
          </div>
          
          <div className="w-32"></div> {/* Spacer for center alignment */}
        </div>

        {/* Chat Container */}
        <div className="h-[calc(100vh-8rem)]">
          <AIChat className="h-full" />
        </div>
      </div>
    </div>
  );
}