const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Upload media files
router.post('/upload', auth, upload.array('media', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      size: file.size
    }));

    res.json({
      message: 'Files uploaded successfully',
      files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../../uploads', filename);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(path.resolve(filepath));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Delete uploaded file
router.delete('/uploads/:filename', auth, (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../../uploads', filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get content templates
router.get('/templates', auth, (req, res) => {
  const templates = {
    motivational: [
      "Monday motivation: {topic}",
      "Success tip: {tip}",
      "Remember: {message}"
    ],
    educational: [
      "Did you know? {fact}",
      "Quick tip: {tip}",
      "Learn something new: {topic}"
    ],
    promotional: [
      "Exciting news: {announcement}",
      "Check out our latest: {product}",
      "Special offer: {offer}"
    ],
    engagement: [
      "What's your take on {topic}?",
      "Share your thoughts: {question}",
      "Tell us about {prompt}"
    ]
  };

  res.json({ templates });
});

// Get hashtag suggestions
router.get('/hashtags/:category', (req, res) => {
  const { category } = req.params;
  
  const hashtags = {
    business: ['#business', '#entrepreneur', '#startup', '#success', '#leadership', '#innovation'],
    marketing: ['#marketing', '#digitalmarketing', '#socialmedia', '#branding', '#content', '#strategy'],
    tech: ['#technology', '#tech', '#innovation', '#AI', '#software', '#development'],
    lifestyle: ['#lifestyle', '#motivation', '#inspiration', '#wellness', '#productivity', '#goals'],
    general: ['#monday', '#motivation', '#tip', '#advice', '#growth', '#success']
  };

  res.json({ hashtags: hashtags[category] || hashtags.general });
});

module.exports = router;