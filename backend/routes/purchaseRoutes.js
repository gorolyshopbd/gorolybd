import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getPurchases, createPurchase } from '../controllers/purchaseController.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getPurchases)
  .post(protect, admin, createPurchase);

export default router;
