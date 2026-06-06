import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getCoupons, getActiveCoupons, createCoupon, updateCoupon, deleteCoupon, applyCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.get('/active', getActiveCoupons);
router.post('/validate', protect, applyCoupon);
router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/:id').put(protect, admin, updateCoupon).delete(protect, admin, deleteCoupon);

export default router;
