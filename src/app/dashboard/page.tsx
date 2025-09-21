'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, 
  Calendar, 
  Share2, 
  Settings, 
  Plus, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Twitter,
  Linkedin,
  Instagram,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore, useChatStore, usePostsStore, useUIStore } from '@/store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { messages } = useChatStore();
  const { posts } = usePostsStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    engagementRate: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Calculate stats
    setStats({
      totalPosts: posts.length,
      scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
      publishedPosts: posts.filter(p => p.status === 'published').length,
      engagementRate: 12.5, // Mock data
    });
  }, [isAuthenticated, posts, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              SocialFlow
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            <NavItem icon={BarChart3} label="Dashboard" active href="/dashboard" />
            <NavItem icon={Bot} label="AI Chat" href="/chat" />
            <NavItem icon={Calendar} label="Content Calendar" href="/calendar" />
            <NavItem icon={Share2} label="Social Accounts" href="/social" />
            <NavItem icon={MessageSquare} label="Posts" href="/posts" />
            <NavItem icon={TrendingUp} label="Analytics" href="/analytics" />
            <NavItem icon={Settings} label="Settings" href="/settings" />
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-left text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );

  const NavItem = ({ icon: Icon, label, active = false, href }: any) => (
    <Link href={href || '#'} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
      active 
        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
        : 'text-gray-700 hover:bg-gray-50'
    }`}>
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2 shadow-md hover:shadow-lg">
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Posts"
              value={stats.totalPosts}
              icon={MessageSquare}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              change="+12% this month"
            />
            <StatCard
              title="Scheduled Posts"
              value={stats.scheduledPosts}
              icon={Clock}
              color="bg-gradient-to-r from-yellow-500 to-orange-500"
              change="+8% this week"
            />
            <StatCard
              title="Published Posts"
              value={stats.publishedPosts}
              icon={CheckCircle}
              color="bg-gradient-to-r from-green-500 to-emerald-600"
              change="+15% this month"
            />
            <StatCard
              title="Engagement Rate"
              value={`${stats.engagementRate}%`}
              icon={TrendingUp}
              color="bg-gradient-to-r from-purple-500 to-pink-500"
              change="+3.2% this week"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Assistant */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">AI Content Assistant</h3>
                      <p className="text-sm text-gray-600">Get help creating engaging content</p>
                    </div>
                  </div>
                  <Link 
                    href="/chat"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Open Chat
                  </Link>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Ready to create amazing content?</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Ask me to generate posts, captions, or ideas for your social media
                      </p>
                    </div>
                  </div>
                  
                  {messages.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                      Last activity: {messages.length} messages exchanged
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Social Accounts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>
                <div className="space-y-3">
                  <SocialAccountItem 
                    platform="Twitter" 
                    icon={Twitter} 
                    connected={user?.socialAccounts?.twitter?.connected || false}
                    username="@yourhandle"
                    color="bg-blue-500"
                  />
                  <SocialAccountItem 
                    platform="LinkedIn" 
                    icon={Linkedin} 
                    connected={user?.socialAccounts?.linkedin?.connected || false}
                    username="Your Profile"
                    color="bg-blue-700"
                  />
                  <SocialAccountItem 
                    platform="Instagram" 
                    icon={Instagram} 
                    connected={user?.socialAccounts?.instagram?.connected || false}
                    username="@yourprofile"
                    color="bg-gradient-to-r from-pink-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <ActivityItem
                    type="success"
                    message="Post published to Twitter"
                    time="2 minutes ago"
                  />
                  <ActivityItem
                    type="info"
                    message="Content generated with AI"
                    time="1 hour ago"
                  />
                  <ActivityItem
                    type="warning"
                    message="Post scheduled for LinkedIn"
                    time="3 hours ago"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message for Demo */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">🎉 Welcome to SocialFlow!</h3>
                <p className="text-gray-700 mt-2">
                  This is a demo version built for the Humanity Founders Hackathon. 
                  Explore AI content generation, social media scheduling, and automation features.
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <Link 
                    href="/chat"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try AI Chat
                  </Link>
                  <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                    Connect Social Accounts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const SocialAccountItem = ({ platform, icon: Icon, connected, username, color }: any) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{platform}</p>
        <p className="text-sm text-gray-600">{connected ? username : 'Not connected'}</p>
      </div>
    </div>
    <div className="flex items-center">
      {connected ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
          Connect
        </button>
      )}
    </div>
  </div>
);

const ActivityItem = ({ type, message, time }: any) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <div className={`p-1 rounded-full ${
      type === 'success' ? 'bg-green-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`}>
      <div className="w-2 h-2 bg-white rounded-full" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
);