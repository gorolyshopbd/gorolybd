import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings, testFacebookPixel, getTrackingReport } from '../controllers/settingsController.js';

const router = express.Router();

router.route('/').get(getSettings).put(protect, admin, updateSettings);
router.route('/test-fb-pixel').post(protect, admin, testFacebookPixel);
router.route('/tracking-report').get(protect, admin, getTrackingReport);
router.route('/public').get(getSettings);

export default router;
