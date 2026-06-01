import { db } from '../config/db.js';

const RUPANTORPAY_API_URL = 'https://payment.rupantorpay.com/api/payment';
const RUPANTORPAY_API_KEY = process.env.RUPANTORPAY_API_KEY;

// @desc    Initiate a RupantorPay payment
// @route   POST /api/rupantorpay/initiate
// @access  Private
const initiatePayment = async (req, res) => {
  const { orderId, amount, successUrl, cancelUrl } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ message: 'orderId and amount are required' });
  }

  if (!RUPANTORPAY_API_KEY) {
    return res.status(500).json({ message: 'RupantorPay API key not configured on server' });
  }

  try {
    // Build redirect URLs — fallback to a sensible default if env not set
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const webhookUrl = `${backendUrl}/api/rupantorpay/webhook`;

    const payload = new URLSearchParams({
      api_key: RUPANTORPAY_API_KEY,
      full_name: req.user?.name || 'Customer',
      email: req.user?.email || 'customer@example.com',
      amount: String(amount),
      success_url: successUrl || `${frontendUrl}/payment/success?orderId=${orderId}`,
      cancel_url:  cancelUrl  || `${frontendUrl}/payment/cancel?orderId=${orderId}`,
      webhook_url: webhookUrl, // if supported
      opt_a: orderId,
      opt_b: req.user?._id || '',
    });

    const response = await fetch(`${RUPANTORPAY_API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const data = await response.json();

    if (!response.ok || data.status === 0 || data.status === false) {
      console.error('RupantorPay initiate error:', data);
      return res.status(400).json({ message: data.message || 'Failed to initiate payment' });
    }

    // Save the transaction reference against the order so we can verify later
    if (data.payment_url) {
      // payment_url might contain a token or ID at the end, but usually we just redirect.
      await db.database
        .from('orders')
        .update({
          payment_result_status: 'PENDING',
          payment_method: 'RupantorPay',
        })
        .eq('id', orderId);

      return res.json({ 
        url: data.payment_url,
        payment_url: data.payment_url
      });
    }
  } catch (error) {
    console.error('RupantorPay initiate error:', error);
    return res.status(500).json({ message: error.message });
  }
};
// @desc    Initiate a RupantorPay payment for Seller Package
// @route   POST /api/rupantorpay/initiate-seller
// @access  Private
const initiateSellerPayment = async (req, res) => {
  const { subscriptionId, amount, successUrl, cancelUrl } = req.body;

  if (!subscriptionId || !amount) {
    return res.status(400).json({ message: 'subscriptionId and amount are required' });
  }

  if (!RUPANTORPAY_API_KEY) {
    return res.status(500).json({ message: 'RupantorPay API key not configured on server' });
  }

  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const webhookUrl = `${backendUrl}/api/rupantorpay/webhook`;

    const payload = new URLSearchParams({
      api_key: RUPANTORPAY_API_KEY,
      full_name: req.user?.name || 'Seller',
      email: req.user?.email || 'seller@example.com',
      amount: String(amount),
      success_url: successUrl || `${frontendUrl}/admin`,
      cancel_url:  cancelUrl  || `${frontendUrl}/admin`,
      webhook_url: webhookUrl,
      opt_a: subscriptionId,
      opt_b: 'seller_subscription',
    });

    const response = await fetch(`${RUPANTORPAY_API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const data = await response.json();

    if (!response.ok || data.status === 0 || data.status === false) {
      console.error('RupantorPay initiate seller error:', data);
      return res.status(400).json({ message: data.message || 'Failed to initiate seller payment' });
    }

    if (data.payment_url) {
      await db.database
        .from('seller_subscriptions')
        .update({
          payment_method: 'RupantorPay',
          status: 'pending',
          transaction_id: 'pending',
        })
        .eq('id', subscriptionId);

      return res.json({ 
        url: data.payment_url,
        payment_url: data.payment_url
      });
    }
  } catch (error) {
    console.error('RupantorPay initiate seller error:', error);
    return res.status(500).json({ message: error.message });
  }
};


// @desc    Verify a RupantorPay payment
// @route   POST /api/rupantorpay/verify
// @access  Private
const verifyPayment = async (req, res) => {
  const { transactionId, orderId } = req.body;

  if (!transactionId) {
    return res.status(400).json({ message: 'transactionId is required' });
  }

  if (!RUPANTORPAY_API_KEY) {
    return res.status(500).json({ message: 'RupantorPay API key not configured on server' });
  }

  try {
    const response = await fetch(`${RUPANTORPAY_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': RUPANTORPAY_API_KEY,
      },
      body: JSON.stringify({ transaction_id: transactionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('RupantorPay verify error:', data);
      return res.status(response.status).json({ message: data.message || 'Payment verification failed' });
    }

    const isPaid = data.status === 'success' || data.status === 'completed' || data.status === 'COMPLETED';

    // If payment confirmed, mark order as paid in the database
    if (isPaid && orderId) {
      const { error } = await db.database
        .from('orders')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
          status: 'Processing',
          payment_result_id: transactionId,
          payment_result_status: 'SUCCESS',
          payment_result_time: Date.now().toString(),
          payment_method: 'RupantorPay',
        })
        .eq('id', orderId);

      if (error) {
        console.error('DB update error after payment verify:', error);
      }
    }

    return res.json({
      success: isPaid,
      status: data.status,
      data,
    });
  } catch (error) {
    console.error('RupantorPay verify error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Handle RupantorPay webhook callback
// @route   POST /api/rupantorpay/webhook
// @access  Public (called by RupantorPay servers)
const webhookHandler = async (req, res) => {
  try {
    const { transaction_id, status, metadata } = req.body;

    console.log('RupantorPay Webhook received:', { transaction_id, status, metadata });

    const isPaid = status === 'success' || status === 'completed' || status === 'COMPLETED';
    const orderId = metadata?.order_id || metadata?.opt_a;
    const type = metadata?.opt_b;

    if (isPaid && orderId) {
      if (type === 'seller_subscription') {
        await db.database
          .from('seller_subscriptions')
          .update({
            status: 'active',
            transaction_id: transaction_id,
          })
          .eq('id', orderId);

        console.log(`Seller Subscription ${orderId} activated via RupantorPay webhook.`);
      } else {
        await db.database
          .from('orders')
          .update({
            is_paid: true,
            paid_at: new Date().toISOString(),
            status: 'Processing',
            payment_result_id: transaction_id,
            payment_result_status: 'SUCCESS',
            payment_result_time: Date.now().toString(),
            payment_method: 'RupantorPay',
          })
          .eq('id', orderId);

        console.log(`Order ${orderId} marked as paid via RupantorPay webhook.`);
      }
    }

    // Always respond 200 to acknowledge receipt
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('RupantorPay webhook error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export { initiatePayment, initiateSellerPayment, verifyPayment, webhookHandler };
