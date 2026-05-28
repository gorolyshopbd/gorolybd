import express from 'express';
import {
  getRewardSettings,
  updateRewardSettings,
  getUserPointsSummary,
  getPointLogs,
  adjustUserPoints,
  getRewardProducts,
  setRewardByCategory,
  setRewardBySeller,
  setRewardByProduct,
} from '../controllers/rewardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/settings')
  .get(protect, admin, getRewardSettings)
  .put(protect, admin, updateRewardSettings);

router.get('/user-points', protect, admin, getUserPointsSummary);
router.get('/logs', protect, admin, getPointLogs);
router.post('/adjust', protect, admin, adjustUserPoints);

// Product reward points setup routes
router.get('/products', protect, admin, getRewardProducts);
router.post('/set-by-category', protect, admin, setRewardByCategory);
router.post('/set-by-seller', protect, admin, setRewardBySeller);
router.post('/set-by-product', protect, admin, setRewardByProduct);

export default router;
