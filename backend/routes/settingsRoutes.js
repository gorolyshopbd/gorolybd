import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings, testFacebookPixel, getTrackingReport, getHeroSettings, updateHeroSettings, testSmsGateway } from '../controllers/settingsController.js';

const router = express.Router();

router.route('/').get(getSettings).put(protect, admin, updateSettings);
router.route('/hero').get(getHeroSettings).put(protect, admin, updateHeroSettings);
router.route('/test-fb-pixel').post(protect, admin, testFacebookPixel);
router.route('/tracking-report').get(protect, admin, getTrackingReport);
router.route('/public').get(getSettings);
router.route('/test-sms').post(protect, admin, testSmsGateway);

export default router;
