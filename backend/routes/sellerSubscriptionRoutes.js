import express from 'express';
import {
  getOnlineSubscriptions,
  getOfflineSubscriptions,
} from '../controllers/sellerSubscriptionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/online', protect, admin, getOnlineSubscriptions);
router.get('/offline', protect, admin, getOfflineSubscriptions);

export default router;
