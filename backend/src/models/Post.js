const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: { type: String, required: true },
    images: [String], // URLs to uploaded images
    video: String, // URL to uploaded video
    hashtags: [String]
  },
  platforms: {
    twitter: {
      enabled: { type: Boolean, default: false },
      posted: { type: Boolean, default: false },
      postId: String,
      postedAt: Date,
      error: String
    },
    linkedin: {
      enabled: { type: Boolean, default: false },
      posted: { type: Boolean, default: false },
      postId: String,
      postedAt: Date,
      error: String
    },
    instagram: {
      enabled: { type: Boolean, default: false },
      posted: { type: Boolean, default: false },
      postId: String,
      postedAt: Date,
      error: String
    }
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'posting', 'posted', 'failed', 'cancelled'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['dynamic', 'static'],
    default: 'static'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  prompt: String, // Original AI prompt if applicable
  analytics: {
    twitter: {
      likes: Number,
      retweets: Number,
      replies: Number,
      impressions: Number
    },
    linkedin: {
      likes: Number,
      comments: Number,
      shares: Number,
      views: Number
    },
    instagram: {
      likes: Number,
      comments: Number,
      shares: Number,
      reach: Number
    }
  },
  notes: String,
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval: Number,
    endDate: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
postSchema.index({ userId: 1, scheduledFor: 1 });
postSchema.index({ status: 1, scheduledFor: 1 });

module.exports = mongoose.model('Post', postSchema);