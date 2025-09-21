const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const socialService = require('../services/socialService');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Get connected accounts
router.get('/accounts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('socialAccounts');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return connection status without sensitive tokens
    const accounts = {
      twitter: {
        connected: user.socialAccounts.twitter.connected,
        username: user.socialAccounts.twitter.username
      },
      linkedin: {
        connected: user.socialAccounts.linkedin.connected,
        profileId: user.socialAccounts.linkedin.profileId
      },
      instagram: {
        connected: user.socialAccounts.instagram.connected,
        userId: user.socialAccounts.instagram.userId
      }
    };

    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to retrieve social accounts' });
  }
});

// Twitter OAuth - Start
router.get('/twitter/auth', auth, async (req, res) => {
  try {
    const authUrl = await socialService.getTwitterAuthUrl(req.userId);
    res.json({ authUrl });
  } catch (error) {
    console.error('Twitter auth error:', error);
    res.status(500).json({ error: 'Failed to initialize Twitter authentication' });
  }
});

// Twitter OAuth - Callback
router.post('/twitter/callback', auth, [
  body('code').exists().withMessage('Authorization code is required'),
  body('state').exists().withMessage('State parameter is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, state } = req.body;
    
    const result = await socialService.handleTwitterCallback(req.userId, code, state);
    
    if (result.success) {
      res.json({ 
        message: 'Twitter account connected successfully',
        username: result.username
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Twitter callback error:', error);
    res.status(500).json({ error: 'Failed to connect Twitter account' });
  }
});

// LinkedIn OAuth - Start
router.get('/linkedin/auth', auth, async (req, res) => {
  try {
    const authUrl = await socialService.getLinkedInAuthUrl(req.userId);
    res.json({ authUrl });
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    res.status(500).json({ error: 'Failed to initialize LinkedIn authentication' });
  }
});

// LinkedIn OAuth - Callback
router.post('/linkedin/callback', auth, [
  body('code').exists().withMessage('Authorization code is required'),
  body('state').exists().withMessage('State parameter is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, state } = req.body;
    
    const result = await socialService.handleLinkedInCallback(req.userId, code, state);
    
    if (result.success) {
      res.json({ 
        message: 'LinkedIn account connected successfully',
        profileId: result.profileId
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.status(500).json({ error: 'Failed to connect LinkedIn account' });
  }
});

// Instagram OAuth - Start
router.get('/instagram/auth', auth, async (req, res) => {
  try {
    const authUrl = await socialService.getInstagramAuthUrl(req.userId);
    res.json({ authUrl });
  } catch (error) {
    console.error('Instagram auth error:', error);
    res.status(500).json({ error: 'Failed to initialize Instagram authentication' });
  }
});

// Instagram OAuth - Callback
router.post('/instagram/callback', auth, [
  body('code').exists().withMessage('Authorization code is required'),
  body('state').exists().withMessage('State parameter is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, state } = req.body;
    
    const result = await socialService.handleInstagramCallback(req.userId, code, state);
    
    if (result.success) {
      res.json({ 
        message: 'Instagram account connected successfully',
        userId: result.userId
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Instagram callback error:', error);
    res.status(500).json({ error: 'Failed to connect Instagram account' });
  }
});

// Disconnect account
router.delete('/:platform/disconnect', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    
    if (!['twitter', 'linkedin', 'instagram'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const updateQuery = {};
    updateQuery[`socialAccounts.${platform}`] = {
      connected: false,
      username: '',
      accessToken: '',
      refreshToken: '',
      userId: '',
      profileId: '',
      businessAccountId: ''
    };

    await User.findByIdAndUpdate(req.userId, { $set: updateQuery });

    res.json({ message: `${platform} account disconnected successfully` });
  } catch (error) {
    console.error('Disconnect account error:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

// Test post to platform
router.post('/:platform/test', auth, [
  body('message').trim().isLength({ min: 1 }).withMessage('Test message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { platform } = req.params;
    const { message } = req.body;

    if (!['twitter', 'linkedin', 'instagram'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.socialAccounts[platform].connected) {
      return res.status(400).json({ error: `${platform} account not connected` });
    }

    const result = await socialService.testPost(platform, message, user.socialAccounts[platform]);
    
    if (result.success) {
      res.json({ 
        message: 'Test post successful',
        postId: result.postId
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Test post error:', error);
    res.status(500).json({ error: 'Failed to test post' });
  }
});

// Get platform limits and info
router.get('/info', (req, res) => {
  res.json({
    platforms: {
      twitter: {
        characterLimit: 280,
        maxImages: 4,
        maxVideoDuration: 140, // seconds
        videoFormats: ['mp4', 'mov'],
        imageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      },
      linkedin: {
        characterLimit: 3000,
        maxImages: 9,
        maxVideoDuration: 600, // seconds
        videoFormats: ['mp4', 'mov', 'avi'],
        imageFormats: ['jpg', 'jpeg', 'png']
      },
      instagram: {
        characterLimit: 2200,
        maxImages: 10,
        maxVideoDuration: 60, // seconds for regular posts
        videoFormats: ['mp4', 'mov'],
        imageFormats: ['jpg', 'jpeg', 'png'],
        aspectRatios: ['1:1', '4:5', '16:9']
      }
    }
  });
});

module.exports = router;