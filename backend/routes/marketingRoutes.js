import express from 'express';
import { analyzeMarketingMedia, generateProductSeoData } from '../services/aiMarketingService.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Analyze media for marketing insights
// @route   POST /api/marketing/analyze
// @access  Private/Admin
router.post('/analyze', protect, admin, async (req, res) => {
  const { mediaUrl, type } = req.body; // type = 'image' or 'video'
  
  if (!mediaUrl) {
    return res.status(400).json({ message: 'mediaUrl is required' });
  }

  try {
    const analysis = await analyzeMarketingMedia(mediaUrl, type || 'image');
    res.json(analysis);
  } catch (error) {
    console.error('Marketing Analyze Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to analyze media.' });
  }
});

// @desc    Generate product SEO data (Title, Meta, Keywords, ALT)
// @route   POST /api/marketing/generate-seo
// @access  Private/Admin
router.post('/generate-seo', protect, admin, async (req, res) => {
  const { name, description, category, brand } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Product name is required for SEO generation.' });
  }

  try {
    const seoData = await generateProductSeoData({ name, description, category, brand });
    res.json(seoData);
  } catch (error) {
    console.error('SEO Generate Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to generate SEO data.' });
  }
});

export default router;
