import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid,
  handleVoiceConfirmation,
  deleteOrder,
  getMyOrders,
  getOrders,
  getAdminSummary,
} from '../controllers/orderController.js';
import { protect, admin, adminOrSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, adminOrSeller, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/summary').get(protect, adminOrSeller, getAdminSummary);
router.route('/:id/voice-confirmation').post(handleVoiceConfirmation);
router.route('/:id').get(protect, getOrderById).delete(protect, adminOrSeller, deleteOrder);
router.route('/:id/status').put(protect, adminOrSeller, updateOrderStatus);
router.route('/:id/pay').put(protect, updateOrderToPaid);

export default router;
