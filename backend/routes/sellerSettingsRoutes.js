import express from 'express';
import {
  getSellerSettings,
  updateSellerSettings
} from '../controllers/sellerSettingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSellerSettings)
  .put(protect, admin, updateSellerSettings);

export default router;
