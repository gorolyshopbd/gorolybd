import express from 'express';
import {
  getPayouts,
  requestPayout,
  updatePayoutStatus
} from '../controllers/payoutController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPayouts);

router.route('/request')
  .post(protect, requestPayout);

router.route('/:id')
  .put(protect, updatePayoutStatus);

export default router;
