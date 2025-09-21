'use client';

import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Clock, Share2, Twitter, Linkedin, Instagram, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime: Date;
  status: 'scheduled' | 'published' | 'failed';
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock scheduled posts
  const scheduledPosts: ScheduledPost[] = [
    {
      id: '1',
      content: 'Excited to share our latest product update! 🚀 #innovation #tech',
      platforms: ['twitter', 'linkedin'],
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'scheduled'
    },
    {
      id: '2',
      content: 'Behind the scenes of our team collaboration process ✨',
      platforms: ['instagram', 'linkedin'],
      scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      status: 'scheduled'
    }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];
    return scheduledPosts.filter(post => 
      post.scheduledTime.toDateString() === date.toDateString()
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4 text-blue-500" />;
      case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
      default: return <Share2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const days = getDaysInMonth(selectedDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
              <p className="text-gray-600">Schedule and manage your social media posts</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Schedule Post</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
                
                <button 
                  onClick={() => setSelectedDate(new Date())}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Today
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-4 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, index) => {
                  const posts = getPostsForDate(day);
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border border-gray-100 ${
                        day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                      } ${isToday ? 'bg-blue-50 border-blue-200' : ''} transition-colors`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-2 ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {day.getDate()}
                          </div>
                          
                          {/* Posts for this day */}
                          <div className="space-y-1">
                            {posts.slice(0, 2).map(post => (
                              <div
                                key={post.id}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs truncate"
                              >
                                {formatTime(post.scheduledTime)} - {post.content.substring(0, 15)}...
                              </div>
                            ))}
                            {posts.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{posts.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Today's Schedule
              </h3>
              
              <div className="space-y-3">
                {getPostsForDate(new Date()).length > 0 ? (
                  getPostsForDate(new Date()).map(post => (
                    <div key={post.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(post.scheduledTime)}
                        </span>
                        <div className="flex space-x-1">
                          {post.platforms.map(platform => (
                            <div key={platform}>
                              {getPlatformIcon(platform)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {post.status}
                        </span>
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No posts scheduled for today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scheduled Posts</span>
                  <span className="font-semibold text-gray-900">{scheduledPosts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-semibold text-gray-900">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-gray-900">18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Post</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="What would you like to share?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                    <div className="flex space-x-4">
                      {['Twitter', 'LinkedIn', 'Instagram'].map(platform => (
                        <label key={platform} className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}