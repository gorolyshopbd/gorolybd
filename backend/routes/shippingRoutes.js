import express from 'express';
import {
  getActiveShippingMethods,
  getAllShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
} from '../controllers/shippingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getActiveShippingMethods)
  .post(protect, admin, createShippingMethod);

router.route('/all')
  .get(protect, admin, getAllShippingMethods);

router.route('/:id')
  .put(protect, admin, updateShippingMethod)
  .delete(protect, admin, deleteShippingMethod);

export default router;
