import express from 'express';
import {
  getSellerPackages,
  createSellerPackage,
  updateSellerPackage,
  deleteSellerPackage,
} from '../controllers/sellerPackageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { db } from '../config/db.js';

const router = express.Router();

// Public route - fetch active packages for the Become a Seller page
router.get('/public', async (req, res) => {
  try {
    const { data, error } = await db.database
      .from('seller_packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });
    if (error) throw error;
    res.json((data || []).map(p => ({ ...p, _id: p.id })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.route('/')
  .get(protect, admin, getSellerPackages)
  .post(protect, admin, createSellerPackage);

router.route('/:id')
  .put(protect, admin, updateSellerPackage)
  .delete(protect, admin, deleteSellerPackage);

export default router;

