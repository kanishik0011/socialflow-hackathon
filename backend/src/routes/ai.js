const express = require('express');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const ChatSession = require('../models/ChatSession');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Start new chat session
router.post('/chat/start', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const chatSession = new ChatSession({
      userId: req.userId,
      sessionId,
      context: {
        businessInfo: user.businessInfo,
        contentPreferences: user.businessInfo?.contentPreferences
      }
    });

    await chatSession.save();

    // Initial greeting message
    const greeting = aiService.generateGreeting(user.name, user.businessInfo);
    chatSession.messages.push({
      role: 'assistant',
      content: greeting
    });

    await chatSession.save();

    res.json({
      sessionId,
      message: greeting
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// Send message to AI
router.post('/chat/:sessionId/message', auth, [
  body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { message } = req.body;

    const chatSession = await ChatSession.findOne({
      sessionId,
      userId: req.userId,
      isActive: true
    });

    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message
    });

    // Generate AI response
    const response = await aiService.generateResponse(message, chatSession.context, chatSession.messages);

    // Add AI response
    chatSession.messages.push({
      role: 'assistant',
      content: response.message
    });

    chatSession.lastActivity = new Date();
    await chatSession.save();

    res.json({
      message: response.message,
      suggestions: response.suggestions,
      contentGenerated: response.contentGenerated
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Generate content
router.post('/generate-content', auth, [
  body('prompt').trim().isLength({ min: 1 }).withMessage('Prompt cannot be empty'),
  body('type').optional().isIn(['text', 'image', 'video']).withMessage('Invalid content type'),
  body('platforms').optional().isArray().withMessage('Platforms must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prompt, type = 'text', platforms = ['twitter', 'linkedin', 'instagram'] } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const content = await aiService.generateContent({
      prompt,
      type,
      platforms,
      businessInfo: user.businessInfo,
      contentPreferences: user.businessInfo?.contentPreferences
    });

    res.json(content);
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Get chat history
router.get('/chat/:sessionId/history', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const chatSession = await ChatSession.findOne({
      sessionId,
      userId: req.userId
    });

    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({
      messages: chatSession.messages,
      context: chatSession.context
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Get active chat sessions
router.get('/chat/sessions', auth, async (req, res) => {
  try {
    const sessions = await ChatSession.find({
      userId: req.userId,
      isActive: true
    })
    .sort({ lastActivity: -1 })
    .select('sessionId lastActivity messages')
    .limit(10);

    const formattedSessions = sessions.map(session => ({
      sessionId: session.sessionId,
      lastActivity: session.lastActivity,
      lastMessage: session.messages[session.messages.length - 1]?.content || '',
      messageCount: session.messages.length
    }));

    res.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat sessions' });
  }
});

module.exports = router;