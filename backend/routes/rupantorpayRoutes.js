import express from 'express';
import { initiatePayment, initiateSellerPayment, verifyPayment, webhookHandler } from '../controllers/rupantorpayController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initiate a new payment session → redirects user to RupantorPay checkout
router.post('/initiate', protect, initiatePayment);
router.post('/initiate-seller', protect, initiateSellerPayment);

// Verify a completed payment by transaction ID
// Note: no 'protect' — called from success page after redirect (user may not be logged in)
router.post('/verify', verifyPayment);

// Webhook endpoint (no auth — called by RupantorPay)
router.post('/webhook', webhookHandler);

export default router;
