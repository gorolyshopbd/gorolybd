import express from 'express';
import { insforgeAdmin } from '../config/db.js';

const router = express.Router();

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const { data, error } = await insforgeAdmin.database
      .from('subscribers')
      .insert([{ email }])
      .select();

    if (error) {
      if (error.code === '23505') { // unique violation
        return res.status(400).json({ message: 'Email already subscribed' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Subscribed successfully', subscriber: data[0] });
  } catch (error) {
    console.error('Subscribe Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
