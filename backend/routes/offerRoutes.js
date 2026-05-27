import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getOffers, createOffer, updateOffer, deleteOffer } from '../controllers/offerController.js';

const router = express.Router();

router.route('/').get(getOffers).post(protect, admin, createOffer);
router.route('/:id').put(protect, admin, updateOffer).delete(protect, admin, deleteOffer);

export default router;
