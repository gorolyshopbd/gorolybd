import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getBanners, createBanner, updateBanner, deleteBanner, getActiveBanners } from '../controllers/bannerController.js';

const router = express.Router();

router.route('/active').get(getActiveBanners);
router.route('/').get(getBanners).post(protect, admin, createBanner);
router.route('/:id').put(protect, admin, updateBanner).delete(protect, admin, deleteBanner);

export default router;
