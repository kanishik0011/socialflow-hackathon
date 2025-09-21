const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const socialService = require('../services/socialService');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Get all posts for user
router.get('/', auth, async (req, res) => {
  try {
    const { status, startDate, endDate, platform } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    let query = { userId: req.userId };
    
    if (status) query.status = status;
    if (startDate || endDate) {
      query.scheduledFor = {};
      if (startDate) query.scheduledFor.$gte = new Date(startDate);
      if (endDate) query.scheduledFor.$lte = new Date(endDate);
    }
    
    const posts = await Post.find(query)
      .sort({ scheduledFor: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});

// Get single post
router.get('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      userId: req.userId
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
});

// Create new post
router.post('/', auth, [
  body('content.text').trim().isLength({ min: 1 }).withMessage('Post content cannot be empty'),
  body('scheduledFor').isISO8601().withMessage('Valid scheduled date is required'),
  body('platforms').isObject().withMessage('Platforms configuration is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, scheduledFor, platforms, type, notes, isRecurring, recurringPattern } = req.body;
    
    // Validate that at least one platform is enabled
    const enabledPlatforms = Object.keys(platforms).filter(platform => platforms[platform].enabled);
    if (enabledPlatforms.length === 0) {
      return res.status(400).json({ error: 'At least one platform must be enabled' });
    }

    const post = new Post({
      userId: req.userId,
      content,
      platforms,
      scheduledFor: new Date(scheduledFor),
      type: type || 'static',
      notes,
      isRecurring: isRecurring || false,
      recurringPattern,
      status: 'scheduled'
    });

    await post.save();
    
    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
router.put('/:postId', auth, [
  body('content.text').optional().trim().isLength({ min: 1 }).withMessage('Post content cannot be empty'),
  body('scheduledFor').optional().isISO8601().withMessage('Valid scheduled date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postId } = req.params;
    const updates = req.body;
    
    // Don't allow updating posted posts
    const existingPost = await Post.findOne({ _id: postId, userId: req.userId });
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (existingPost.status === 'posted') {
      return res.status(400).json({ error: 'Cannot update already posted content' });
    }

    const post = await Post.findOneAndUpdate(
      { _id: postId, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findOne({ _id: postId, userId: req.userId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.status === 'posting') {
      return res.status(400).json({ error: 'Cannot delete post that is currently being posted' });
    }

    await Post.findOneAndDelete({ _id: postId, userId: req.userId });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Post immediately
router.post('/:postId/post-now', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findOne({ _id: postId, userId: req.userId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.status !== 'scheduled' && post.status !== 'draft') {
      return res.status(400).json({ error: 'Post cannot be posted in current status' });
    }

    // Get user's social accounts
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update post status
    post.status = 'posting';
    await post.save();

    // Publish to enabled platforms
    const results = await socialService.publishPost(post, user.socialAccounts);
    
    // Update post with results
    post.platforms = { ...post.platforms, ...results };
    post.status = Object.values(results).some(r => r.posted) ? 'posted' : 'failed';
    await post.save();

    res.json({
      message: 'Post published successfully',
      post,
      results
    });
  } catch (error) {
    console.error('Post now error:', error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

// Get calendar view of posts
router.get('/calendar/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const posts = await Post.find({
      userId: req.userId,
      scheduledFor: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ scheduledFor: 1 })
    .select('content.text scheduledFor status platforms type');
    
    // Group posts by date
    const calendar = {};
    posts.forEach(post => {
      const dateKey = post.scheduledFor.toISOString().split('T')[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(post);
    });
    
    res.json({ calendar });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to retrieve calendar' });
  }
});

// Get analytics summary
router.get('/analytics/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const pipeline = [
      { $match: { userId: req.userId, status: 'posted', ...dateFilter } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          twitterPosts: { $sum: { $cond: ['$platforms.twitter.posted', 1, 0] } },
          linkedinPosts: { $sum: { $cond: ['$platforms.linkedin.posted', 1, 0] } },
          instagramPosts: { $sum: { $cond: ['$platforms.instagram.posted', 1, 0] } },
          totalLikes: {
            $sum: {
              $add: [
                { $ifNull: ['$analytics.twitter.likes', 0] },
                { $ifNull: ['$analytics.linkedin.likes', 0] },
                { $ifNull: ['$analytics.instagram.likes', 0] }
              ]
            }
          },
          totalComments: {
            $sum: {
              $add: [
                { $ifNull: ['$analytics.twitter.replies', 0] },
                { $ifNull: ['$analytics.linkedin.comments', 0] },
                { $ifNull: ['$analytics.instagram.comments', 0] }
              ]
            }
          },
          totalShares: {
            $sum: {
              $add: [
                { $ifNull: ['$analytics.twitter.retweets', 0] },
                { $ifNull: ['$analytics.linkedin.shares', 0] },
                { $ifNull: ['$analytics.instagram.shares', 0] }
              ]
            }
          }
        }
      }
    ];
    
    const result = await Post.aggregate(pipeline);
    const analytics = result[0] || {
      totalPosts: 0,
      twitterPosts: 0,
      linkedinPosts: 0,
      instagramPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0
    };
    
    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

module.exports = router;