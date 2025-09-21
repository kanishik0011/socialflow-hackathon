const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  businessInfo: {
    businessName: String,
    industry: String,
    targetAudience: String,
    brandVoice: String,
    description: String,
    goals: [String],
    contentPreferences: {
      topics: [String],
      tone: String,
      postFrequency: String
    }
  },
  socialAccounts: {
    twitter: {
      connected: { type: Boolean, default: false },
      username: String,
      accessToken: String,
      refreshToken: String,
      userId: String
    },
    linkedin: {
      connected: { type: Boolean, default: false },
      profileId: String,
      accessToken: String,
      refreshToken: String
    },
    instagram: {
      connected: { type: Boolean, default: false },
      userId: String,
      accessToken: String,
      businessAccountId: String
    }
  },
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
    expiresAt: Date
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.socialAccounts.twitter.accessToken;
  delete userObject.socialAccounts.twitter.refreshToken;
  delete userObject.socialAccounts.linkedin.accessToken;
  delete userObject.socialAccounts.linkedin.refreshToken;
  delete userObject.socialAccounts.instagram.accessToken;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);