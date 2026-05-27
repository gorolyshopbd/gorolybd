import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

router.route('/').get(getSettings).put(protect, admin, updateSettings);
router.route('/public').get(getSettings);

export default router;
