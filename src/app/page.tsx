'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Calendar, Share2, Zap, ArrowRight, Twitter, Linkedin, Instagram, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                SocialFlow
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              🏆 Built for Humanity Founders Hackathon
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                AI-Powered Social Media
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Automation Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Create engaging content with AI, schedule posts across platforms, and grow your social media presence 
              effortlessly with our intelligent automation platform. Built for businesses that want to dominate social media.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
              >
                Watch Demo
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Multi-Platform Publishing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>AI Content Generation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Smart Scheduling</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Integration */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Connect All Your Social Platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seamlessly integrate with the platforms your audience loves. Publish everywhere with one click.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center group hover:shadow-lg transition-all">
              <div className="bg-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Twitter className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Twitter</h3>
              <p className="text-gray-600">Engage with your audience through tweets, threads, and real-time conversations.</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl text-center group hover:shadow-lg transition-all">
              <div className="bg-blue-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Linkedin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">LinkedIn</h3>
              <p className="text-gray-600">Build professional relationships and share industry insights with your network.</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-purple-100 p-8 rounded-2xl text-center group hover:shadow-lg transition-all">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instagram</h3>
              <p className="text-gray-600">Share visual stories and connect with your audience through stunning content.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Dominate Social Media
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful AI-driven features designed to save time, boost engagement, and grow your online presence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Content Creation</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate engaging, platform-specific content with our advanced AI that learns your brand voice and audience preferences.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Plan and schedule posts with our intuitive calendar interface. AI suggests optimal timing for maximum reach.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Platform Publishing</h3>
              <p className="text-gray-600 leading-relaxed">
                Publish simultaneously across Twitter, LinkedIn, and Instagram with platform-optimized content variations.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Full Automation</h3>
              <p className="text-gray-600 leading-relaxed">
                Set it and forget it. Our platform handles content creation, posting, and performance monitoring automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Social Media Strategy?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of creators and businesses using SocialFlow to automate their social media and grow their online presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center px-10 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center px-10 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">SocialFlow</h3>
            </div>
            <p className="text-gray-400 mb-4 text-lg">
              Built for the Humanity Founders Hackathon
            </p>
            <p className="text-gray-500 text-sm">
              AI-Powered Social Media Management • Winner: Internship → Full-time Role
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
