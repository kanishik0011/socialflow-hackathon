const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  context: {
    businessInfo: Object,
    contentPreferences: Object,
    previousPosts: [String],
    currentGoals: [String]
  },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Clean up old inactive sessions
chatSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // 7 days

module.exports = mongoose.model('ChatSession', chatSessionSchema);