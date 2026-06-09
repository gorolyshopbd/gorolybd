import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { db } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data: videos, error } = await db.database.from('videos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Fetch products manually since QueryBuilder doesn't support PostgREST joins
    const productIds = videos.filter(v => v.product_id).map(v => v.product_id);
    let productsMap = {};
    if (productIds.length > 0) {
      const { data: products } = await db.query(`SELECT id, name, image_url FROM products WHERE id = ANY($1)`, [productIds]);
      if (products && products.rows) {
        products.rows.forEach(p => productsMap[p.id] = p);
      }
    }
    
    const formatted = videos.map(v => {
      const prod = v.product_id ? productsMap[v.product_id] : null;
      return {
        ...v,
        _id: v.id,
        videoUrl: v.video_url,
        product: prod ? { _id: prod.id, name: prod.name, image: prod.image_url } : null
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

router.post('/', protect, admin, async (req, res) => {
  const { title, description, videoUrl, product } = req.body;
  try {
    const { data: video, error } = await db.database.from('videos').insert({
      title,
      description,
      video_url: videoUrl,
      product_id: product || null
    }).select().single();
    if (error) throw error;
    
    res.status(201).json({ ...video, _id: video.id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating video' });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  const { title, description, videoUrl, product } = req.body;
  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (videoUrl !== undefined) updateData.video_url = videoUrl;
    if (product !== undefined) updateData.product_id = product || null;

    const { data: video, error } = await db.database.from('videos').update(updateData).eq('id', req.params.id).select().single();
    if (error || !video) return res.status(404).json({ message: 'Video not found' });
    
    res.json({ ...video, _id: video.id });
  } catch (error) {
    res.status(500).json({ message: 'Error updating video' });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { error } = await db.database.from('videos').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Video removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting video' });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const { data: video } = await db.database.from('videos').select('likes').eq('id', req.params.id).single();
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    const { data: updated, error } = await db.database.from('videos').update({ likes: video.likes + 1 }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error liking video' });
  }
});

router.post('/:id/comment', async (req, res) => {
  const { name, comment } = req.body;
  if (!comment) return res.status(400).json({ message: 'Comment is required' });
  try {
    const { data: video } = await db.database.from('videos').select('id').eq('id', req.params.id).single();
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    const { data: updated, error } = await db.database.from('video_comments').insert({
      video_id: req.params.id,
      name: name || 'Anonymous',
      comment
    }).select().single();
    
    if (error) throw error;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
});

router.post('/:id/share', async (req, res) => {
  try {
    const { data: video } = await db.database.from('videos').select('shares').eq('id', req.params.id).single();
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    const { data: updated, error } = await db.database.from('videos').update({ shares: video.shares + 1 }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error sharing video' });
  }
});

export default router;
