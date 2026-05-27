import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { supabase } from '../config/db.js';
import { getAIResponse } from '../services/aiChatService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data: messages, error } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    
    const formatted = messages.map(m => ({
      ...m,
      _id: m.id,
      isAdmin: m.is_admin,
      isRead: m.is_read,
      createdAt: m.created_at
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { username, message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });
  try {
    const { data: msg, error } = await supabase.from('chat_messages').insert({
      username: username || 'Guest',
      message,
      is_admin: false,
      is_read: false
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...msg, _id: msg.id, isAdmin: msg.is_admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin', protect, admin, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });
  try {
    const { data: msg, error } = await supabase.from('chat_messages').insert({
      username: 'Admin',
      message,
      is_admin: true,
      is_read: true
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...msg, _id: msg.id, isAdmin: msg.is_admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/close', protect, admin, async (req, res) => {
  try {
    const { data: msg, error } = await supabase.from('chat_messages').insert({
      username: 'System',
      message: 'Chat closed by support',
      is_admin: true,
      is_read: true
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...msg, _id: msg.id, isAdmin: msg.is_admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reopen', async (req, res) => {
  try {
    const { data: msg, error } = await supabase.from('chat_messages').insert({
      username: req.body.username || 'Guest',
      message: '--- Chat reopened ---',
      is_admin: false,
      is_read: false
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...msg, _id: msg.id, isAdmin: msg.is_admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/ai', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });
  try {
    const aiReply = getAIResponse(message);
    const { data: msg, error } = await supabase.from('chat_messages').insert({
      username: 'AI Assistant',
      message: aiReply,
      is_admin: true,
      is_read: true
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...msg, _id: msg.id, isAdmin: msg.is_admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/read', protect, admin, async (req, res) => {
  try {
    const { error } = await supabase.from('chat_messages').update({ is_read: true }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
