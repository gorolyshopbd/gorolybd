import express from 'express';
import {
  getSuspiciousOrders,
  checkOrderFraud,
  blockPhone,
  unblockPhone,
  blockIp,
  unblockIp,
  getBlockedPhones,
  getBlockedIps,
} from '../controllers/fraudController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/suspicious').get(protect, admin, getSuspiciousOrders);
router.route('/check/:id').get(protect, admin, checkOrderFraud);
router.route('/blocked-phones').get(protect, admin, getBlockedPhones);
router.route('/blocked-ips').get(protect, admin, getBlockedIps);
router.route('/block-phone').post(protect, admin, blockPhone);
router.route('/block-phone/:phone').delete(protect, admin, unblockPhone);
router.route('/block-ip').post(protect, admin, blockIp);
router.route('/block-ip/:ip_address').delete(protect, admin, unblockIp);

export default router;
