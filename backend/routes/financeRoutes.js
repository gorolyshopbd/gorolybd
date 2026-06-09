import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getFinanceSummary, getAiProfitPrediction } from '../controllers/financeController.js';

const router = express.Router();

router.route('/summary').get(protect, admin, getFinanceSummary);
router.route('/ai-prediction').get(protect, admin, getAiProfitPrediction);

export default router;
