import { db } from '../config/db.js';
import { createSteadfastParcel } from '../services/steadfastService.js';
import { runOrderAutomation } from '../services/orderAutomationService.js';

const STEADFAST_BEARER_TOKEN = process.env.STEADFAST_BEARER_TOKEN || '';

const isSteadfastProvider = (provider = '') => provider.toLowerCase().replace(/[^a-z]/g, '') === 'steadfast';

const getSellerProductIds = async (sellerId) => {
  const { data: myProducts, error } = await db.database
    .from('products')
    .select('id')
    .eq('user_id', sellerId);
  if (error) throw error;
  return myProducts ? myProducts.map((p) => p.id) : [];
};

const getSellerOrderIds = async (sellerId) => {
  const myProductIds = await getSellerProductIds(sellerId);
  if (myProductIds.length === 0) return [];

  const { data: myOrderItems, error } = await db.database
    .from('order_items')
    .select('order_id')
    .in('product_id', myProductIds);
  if (error) throw error;

  return myOrderItems ? [...new Set(myOrderItems.map((item) => item.order_id))] : [];
};

const canSellerManageOrder = async (sellerId, orderId) => {
  const sellerOrderIds = await getSellerOrderIds(sellerId);
  return sellerOrderIds.includes(orderId);
};

const getOrderSellers = async (items = []) => {
  const productIds = [...new Set(items.map((item) => item.product_id).filter(Boolean))];
  if (productIds.length === 0) return [];

  const { data: products } = await db.database
    .from('products')
    .select('id, user_id')
    .in('id', productIds);
  const sellerIds = [...new Set((products || []).map((product) => product.user_id).filter(Boolean))];
  if (sellerIds.length === 0) return [];

  const { data: sellers } = await db.database
    .from('users')
    .select('id, steadfast_api_key, steadfast_secret_key, steadfast_enabled, order_automation_enabled, twilio_account_sid, twilio_auth_token, twilio_from_number, elevenlabs_api_key, elevenlabs_voice_id, openai_api_key, openai_model')
    .in('id', sellerIds);

  return sellers || [];
};

const bookSteadfastParcelForOrder = async (orderId, fallbackCredentials = {}) => {
  const { data: order, error: orderError } = await db.database
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (orderError || !order) {
    throw new Error('Order not found for SteadFast booking');
  }

  const { data: items, error: itemsError } = await db.database
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
  if (itemsError) throw itemsError;

  const sellers = await getOrderSellers(items || []);
  let sellerCredentials = {};
  const configuredSeller = sellers.find((seller) => (
    seller.steadfast_enabled &&
    seller.steadfast_api_key &&
    seller.steadfast_secret_key
  ));
  if (configuredSeller) {
    sellerCredentials = {
      apiKey: configuredSeller.steadfast_api_key,
      secretKey: configuredSeller.steadfast_secret_key,
    };
  }

  const credentials = sellerCredentials.apiKey ? sellerCredentials : fallbackCredentials;
  const result = await createSteadfastParcel({ order, items: items || [], credentials });
  if (result.skipped) return result;

  console.log('[SteadFast] Parcel created:', JSON.stringify({ orderId, trackingCode: result.trackingCode, status: result.status }));

  await db.database
    .from('orders')
    .update({
      courier_provider: 'SteadFast',
      courier_tracking_code: result.trackingCode || '',
      courier_status: result.status || 'Booked',
      status: 'Shipped',
    })
    .eq('id', orderId);

  return result;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    shippingMethod,
    advancePayment,
    advanceAmount,
    deviceFingerprint,
  } = req.body;
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  try {
    // 0. Verify all products exist and filter out invalid ones
    const productIds = orderItems.map(item => item.product).filter(Boolean);
    const uniqueProductIds = [...new Set(productIds)];
    
    let validOrderItems = [];
    
    if (uniqueProductIds.length > 0) {
      const { data: existingProducts, error: checkError } = await db.database
        .from('products')
        .select('id')
        .in('id', uniqueProductIds);
        
      if (checkError) throw checkError;
      
      const validProductIds = existingProducts ? existingProducts.map(p => p.id) : [];
      validOrderItems = orderItems.filter(item => item.product && validProductIds.includes(item.product));
      
      if (validOrderItems.length === 0) {
        return res.status(400).json({ message: 'One or more products in your cart no longer exist. Please clear your cart and try again.' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid product items in cart. Please clear your cart and try again.' });
    }

    // Recalculate totals based on valid items
    const recalculatedItemsPrice = validOrderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    // Use the recalculated items price if items were removed, otherwise use provided values
    const finalItemsPrice = validOrderItems.length < orderItems.length ? recalculatedItemsPrice : itemsPrice;
    const finalTotalPrice = validOrderItems.length < orderItems.length 
      ? (recalculatedItemsPrice + (shippingPrice || 0) - (discountPrice || 0))
      : totalPrice;

    // 1. Create the order
    const { data: order, error: orderError } = await db.database
      .from('orders')
      .insert({
        user_id: req.user._id,
        shipping_name: shippingAddress?.name || req.user.name || '',
        shipping_address: shippingAddress?.address || '',
        shipping_city: shippingAddress?.city || '',
        shipping_postal_code: shippingAddress?.postalCode || '',
        shipping_phone: shippingAddress?.phone || '',
        payment_method: paymentMethod || 'Cash on Delivery',
        items_price: finalItemsPrice || 0,
        shipping_price: shippingPrice || 0,
        discount_price: discountPrice || 0,
        total_price: finalTotalPrice || 0,
        advance_payment: advancePayment || false,
        advance_amount: advanceAmount || 0,
        shipping_method_id: shippingMethod?._id || '',
        shipping_method_name: shippingMethod?.name || '',
        shipping_method_price: shippingMethod?.price || 0,
        shipping_method_days: shippingMethod?.estimatedDays || '',
        ip_address: ipAddress,
        device_fingerprint: deviceFingerprint || '',
        is_paid: false,
        paid_at: null,
        status: 'Pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert Order Items
    const formattedItems = validOrderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product,
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
    }));

    const { error: itemsError } = await db.database.from('order_items').insert(formattedItems);
    if (itemsError) throw itemsError;

    // 3. AI/SMS/call confirmation automation + auto SteadFast booking
    let steadfastBooked = false;
    try {
      const sellers = await getOrderSellers(formattedItems);
      const automationSeller = sellers.find((seller) => seller.order_automation_enabled) || sellers[0] || null;
      const automation = await runOrderAutomation({
        order,
        items: formattedItems,
        seller: automationSeller,
      });

      // Auto-book SteadFast if any seller has credentials or global env is set
      const hasConfiguredSeller = sellers.some((s) => s.steadfast_enabled && s.steadfast_api_key && s.steadfast_secret_key);
      if (hasConfiguredSeller || (process.env.STEADFAST_API_KEY && process.env.STEADFAST_SECRET_KEY)) {
        try {
          const booking = await bookSteadfastParcelForOrder(order.id);
          if (!booking.skipped) {
            steadfastBooked = true;
          }
        } catch (bookingError) {
          console.error('[Auto SteadFast] Booking failed:', bookingError.message);
        }
      }

      if (!automation?.skipped || steadfastBooked) {
        const statusParts = [];
        if (!automation?.skipped) {
          statusParts.push(automation.errors?.length
            ? `Automation partial: ${automation.errors.join('; ')}`
            : 'Automation complete');
        }
        if (steadfastBooked) {
          statusParts.push('SteadFast parcel booked');
        }
        await db.database
          .from('orders')
          .update({
            courier_status: statusParts.join(' | ').slice(0, 250),
          })
          .eq('id', order.id);
      }
    } catch (automationError) {
      console.error('Order automation failed:', automationError.message);
      await db.database
        .from('orders')
        .update({
          courier_status: `Automation failed: ${automationError.message}`.slice(0, 250),
        })
        .eq('id', order.id);
    }

    // 4. Update stock for each product
    for (const item of validOrderItems) {
      if (item.product) {
        const { data: product } = await db.database.from('products').select('count_in_stock').eq('id', item.product).single();
        if (product) {
          await db.database.from('products').update({ count_in_stock: Math.max(0, product.count_in_stock - item.qty) }).eq('id', item.product);
        }
      }
    }

    res.status(201).json({ ...order, _id: order.id });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const { data: order, error } = await db.database
      .from('orders')
      .select(`
        *,
        users:user_id ( id, name, email )
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'seller') {
      const allowed = await canSellerManageOrder(req.user._id, order.id);
      if (!allowed) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else if (!req.user.isAdmin && order.user_id !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    const { data: items } = await db.database.from('order_items').select('*').eq('order_id', order.id);

    res.json({
      ...order,
      _id: order.id,
      user: order.users ? { _id: order.users.id, name: order.users.name, email: order.users.email } : null,
      orderItems: items || [],
      shippingAddress: {
        address: order.shipping_address,
        city: order.shipping_city,
        postalCode: order.shipping_postal_code,
        phone: order.shipping_phone,
      },
      paymentMethod: order.payment_method,
      itemsPrice: order.items_price,
      shippingPrice: order.shipping_price,
      totalPrice: order.total_price,
      isPaid: order.is_paid,
      paidAt: order.paid_at,
      status: order.status,
      courierInfo: {
        provider: order.courier_provider,
        trackingCode: order.courier_tracking_code,
        status: order.courier_status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status or track shipping
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const restoreStockOnCancel = async (orderId) => {
  try {
    const { data: orderItems } = await db.database
      .from('order_items').select('product_id, qty').eq('order_id', orderId).execute();
    if (!orderItems || orderItems.length === 0) return;
    for (const item of orderItems) {
      if (item.product_id) {
        const { data: product } = await db.database
          .from('products').select('count_in_stock').eq('id', item.product_id).single().execute();
        if (product) {
          await db.database
            .from('products').update({ count_in_stock: (product.count_in_stock || 0) + Number(item.qty) })
            .eq('id', item.product_id).execute();
        }
      }
    }
  } catch (err) {
    console.error('Error restoring stock on cancel:', err.message);
  }
};

const updateOrderStatus = async (req, res) => {
  const { status, courierProvider } = req.body;
  
  try {
    if (req.user.role === 'seller') {
      const allowed = await canSellerManageOrder(req.user._id, req.params.id);
      if (!allowed) {
        return res.status(403).json({ message: 'Not authorized to manage this order' });
      }
    }

    // Restore stock if cancelling
    if (status === 'Cancelled') {
      await restoreStockOnCancel(req.params.id);
    }

    let updateData = { status };
    if (courierProvider) {
      if (isSteadfastProvider(courierProvider)) {
        const userFallback = (req.user.steadfast_api_key && req.user.steadfast_secret_key)
          ? { apiKey: req.user.steadfast_api_key, secretKey: req.user.steadfast_secret_key }
          : {};
        const result = await bookSteadfastParcelForOrder(req.params.id, userFallback);
        if (result.skipped) {
          const hasSteadfast = req.user.steadfast_api_key && req.user.steadfast_secret_key;
          return res.json({
            skipped: true,
            message: hasSteadfast
              ? 'The seller for this order has not configured SteadFast.'
              : 'SteadFast API credentials are not configured. Go to SteadFast Integration to add your keys.',
            ...updateData,
          });
        }
        updateData.status = 'Shipped';
        updateData.courier_provider = 'SteadFast';
        updateData.courier_tracking_code = result.trackingCode || '';
        updateData.courier_status = result.status || 'Booked';
      } else {
        updateData.courier_provider = courierProvider;
        const trackingCode = `${courierProvider.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
        updateData.courier_tracking_code = trackingCode;
        updateData.courier_status = 'Booked';
      }
    }

    const { data: order, error } = await db.database
      .from('orders')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !order) return res.status(404).json({ message: 'Order not found' });
    
    res.json({ ...order, _id: order.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const { data: order, error } = await db.database
      .from('orders')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
        payment_result_id: req.body.id || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        payment_result_status: req.body.status || 'SUCCESS',
        payment_result_time: Date.now().toString(),
        payment_result_email: req.user.email,
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !order) return res.status(404).json({ message: 'Order not found' });
    
    res.json({ ...order, _id: order.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Twilio voice confirmation webhook
// @route   POST /api/orders/:id/voice-confirmation
// @access  Public/Twilio
const handleVoiceConfirmation = async (req, res) => {
  const digit = req.body?.Digits;

  res.set('Content-Type', 'text/xml');

  try {
    const { data: order, error } = await db.database
      .from('orders')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      return res.send('<Response><Say voice="alice">Sorry, we could not find this order.</Say></Response>');
    }

    if (digit === '1') {
      try {
        const booking = await bookSteadfastParcelForOrder(req.params.id);
        if (booking.skipped) {
          await db.database
            .from('orders')
            .update({ courier_status: booking.message })
            .eq('id', req.params.id);
          return res.send('<Response><Say voice="alice">Thank you. Your order is confirmed. Our team will process courier booking shortly.</Say></Response>');
        }

        return res.send('<Response><Say voice="alice">Thank you. Your order is confirmed and has been sent to SteadFast courier.</Say></Response>');
      } catch (bookingError) {
        await db.database
          .from('orders')
          .update({
            courier_provider: 'SteadFast',
            courier_status: `Confirmed but SteadFast failed: ${bookingError.message}`.slice(0, 250),
          })
          .eq('id', req.params.id);
        return res.send('<Response><Say voice="alice">Thank you. Your order is confirmed. Our team will process courier booking manually.</Say></Response>');
      }
    }

    if (digit === '2') {
      await restoreStockOnCancel(req.params.id);
      await db.database
        .from('orders')
        .update({
          status: 'Cancelled',
          courier_status: 'Customer cancelled from confirmation call',
        })
        .eq('id', req.params.id);
      return res.send('<Response><Say voice="alice">Your order has been cancelled. Thank you.</Say></Response>');
    }

    await db.database
      .from('orders')
      .update({ courier_status: 'Customer did not confirm from call' })
      .eq('id', req.params.id);
    return res.send('<Response><Say voice="alice">We did not receive a valid confirmation. Our support team may contact you again.</Say></Response>');
  } catch (webhookError) {
    return res.send('<Response><Say voice="alice">Sorry, something went wrong while confirming this order.</Say></Response>');
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    if (req.user.role === 'seller') {
      const allowed = await canSellerManageOrder(req.user._id, req.params.id);
      if (!allowed) {
        return res.status(403).json({ message: 'Not authorized to delete this order' });
      }
    }

    const { data: order, error: findError } = await db.database
      .from('orders')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (findError || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { error: itemsError } = await db.database
      .from('order_items')
      .delete()
      .eq('order_id', req.params.id);

    if (itemsError) throw itemsError;

    const { error } = await db.database
      .from('orders')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const { data: orders, error } = await db.database
      .from('orders')
      .select('*')
      .eq('user_id', req.user._id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch items for each order
    const formattedOrders = await Promise.all(orders.map(async (o) => {
      const { data: items } = await db.database.from('order_items').select('*').eq('order_id', o.id);
      return {
        ...o,
        _id: o.id,
        createdAt: o.created_at,
        totalPrice: o.total_price,
        paymentMethod: o.payment_method,
        isPaid: o.is_paid,
        status: o.status,
        courierInfo: {
          provider: o.courier_provider,
          trackingCode: o.courier_tracking_code,
          status: o.courier_status
        },
        orderItems: items || []
      };
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    let orderIds = null;
    let myProductIds = [];
    if (req.user.role === 'seller') {
      myProductIds = await getSellerProductIds(req.user._id);
      if (myProductIds.length > 0) {
        const { data: myOrderItems } = await db.database.from('order_items').select('order_id').in('product_id', myProductIds);
        orderIds = myOrderItems ? [...new Set(myOrderItems.map(item => item.order_id))] : [];
      } else {
        orderIds = [];
      }
    }

    let query = db.database.from('orders').select('*, users:user_id(id, name)').order('created_at', { ascending: false });
    if (orderIds !== null) {
      if (orderIds.length === 0) {
         return res.json([]);
      }
      query = query.in('id', orderIds);
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    let itemsByOrder = {};
    if (req.user.role === 'seller' && orders.length > 0) {
      const { data: sellerItems, error: sellerItemsError } = await db.database
        .from('order_items')
        .select('*')
        .in('order_id', orders.map((o) => o.id))
        .in('product_id', myProductIds);
      if (sellerItemsError) throw sellerItemsError;

      itemsByOrder = (sellerItems || []).reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      }, {});
    }
    
    const formattedOrders = orders.map(o => ({
      ...o,
      _id: o.id,
      user: o.users ? { _id: o.users.id, name: o.users.name } : null,
      createdAt: o.created_at,
      totalPrice: req.user.role === 'seller'
        ? (itemsByOrder[o.id] || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0)
        : o.total_price,
      orderItems: req.user.role === 'seller' ? (itemsByOrder[o.id] || []) : undefined,
      isPaid: o.is_paid,
      status: o.status,
      courierInfo: {
        provider: o.courier_provider,
        trackingCode: o.courier_tracking_code,
        status: o.courier_status
      }
    }));
    
    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics (Admin)
// @route   GET /api/orders/summary
// @access  Private/Admin
const getAdminSummary = async (req, res) => {
  try {
    let orderIds = null;
    let productsQuery = db.database.from('products').select('*', { count: 'exact', head: true });
    
    // Get seller products if applicable
    let myProductIds = [];
    if (req.user.role === 'seller') {
      productsQuery = productsQuery.eq('user_id', req.user._id);
      myProductIds = await getSellerProductIds(req.user._id);
      if (myProductIds.length > 0) {
        const { data: myOrderItems } = await db.database.from('order_items').select('order_id').in('product_id', myProductIds);
        orderIds = myOrderItems ? [...new Set(myOrderItems.map(item => item.order_id))] : [];
      } else {
        orderIds = [];
      }
    }

    let ordersQuery = db.database.from('orders').select('*').order('created_at', { ascending: false });
    if (orderIds !== null) {
      if (orderIds.length === 0) {
        const { count: productsCount } = await productsQuery;
        return res.json({ 
          totalOrders: 0, 
          totalRevenue: 0, 
          totalCustomers: 0, 
          pendingOrders: 0, 
          totalProducts: productsCount || 0, 
          totalPurchaseCost: 0,
          orders: [],
          revenueOverview: [],
          orderStatistics: [],
          salesByCategory: [],
          topSellingProducts: [],
          lowStockAlerts: []
        });
      }
      ordersQuery = ordersQuery.in('id', orderIds);
    }

    const { data: orders, error: ordersError } = await ordersQuery;
    if (ordersError) throw ordersError;

    const { count: productsCount, error: pError } = await productsQuery;
    if (pError) throw pError;

    const { count: usersCount, error: uError } = await db.database.from('users').select('*', { count: 'exact', head: true });
    if (uError) throw uError;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    let totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((acc, order) => acc + Number(order.total_price || 0), 0);
      
    let formattedOrders = orders.map(o => ({
      ...o,
      _id: o.id,
      createdAt: o.created_at,
      totalPrice: o.total_price,
      isPaid: o.is_paid,
      status: o.status,
      courierInfo: {
        provider: o.courier_provider,
        trackingCode: o.courier_tracking_code,
        status: o.courier_status
      },
    }));

    // Fetch order items & products for advanced analytics
    const { data: orderItems, error: itemsError } = await db.database.from('order_items').select('*');
    if (itemsError) throw itemsError;

    const { data: allProducts, error: allPError } = await db.database.from('products').select('*');
    if (allPError) throw allPError;

    const productMap = {};
    (allProducts || []).forEach(p => {
      productMap[p.id] = p;
    });

    // Filter items based on seller or loaded orders
    const targetOrderIds = new Set(orders.map(o => o.id));
    let filteredOrderItems = (orderItems || []).filter(item => targetOrderIds.has(item.order_id));
    if (req.user.role === 'seller') {
      filteredOrderItems = filteredOrderItems.filter(item => myProductIds.includes(item.product_id));
      const sellerTotalsByOrder = filteredOrderItems.reduce((acc, item) => {
        acc[item.order_id] = (acc[item.order_id] || 0) + Number(item.price || 0) * Number(item.qty || 1);
        return acc;
      }, {});
      totalRevenue = orders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, order) => sum + Number(sellerTotalsByOrder[order.id] || 0), 0);
      formattedOrders = formattedOrders.map((order) => ({
        ...order,
        totalPrice: sellerTotalsByOrder[order.id] || 0,
        orderItems: filteredOrderItems.filter((item) => item.order_id === order.id),
      }));
    }

    // 1. Revenue Overview (Daily aggregates for past 7 days)
    const salesMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesMap[dateStr] = { name: dateStr, Revenue: 0, Cost: 0 };
    }
    
    orders.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (salesMap[dateStr] && o.status !== 'Cancelled') {
        const revenue = Number(o.total_price || 0);
        salesMap[dateStr].Revenue += revenue;
        salesMap[dateStr].Cost += revenue * 0.6; // standard estimated Cost of Goods Sold (60%)
      }
    });
    const revenueOverview = Object.values(salesMap);

    // 2. Order Statistics (Delivered, Pending, Processing, Cancelled counts)
    const orderStatistics = [
      { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length },
      { name: 'Pending', value: orders.filter(o => o.status === 'Pending').length },
      { name: 'Processing', value: orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length },
      { name: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length },
    ];

    // 3. Sales by Category
    const categorySales = {};
    filteredOrderItems.forEach(item => {
      const prod = productMap[item.product_id];
      if (prod) {
        const cat = prod.category || 'Uncategorized';
        const sales = Number(item.price || 0) * Number(item.qty || 1);
        if (!categorySales[cat]) {
          categorySales[cat] = { category: cat, sales: 0 };
        }
        categorySales[cat].sales += sales;
      }
    });
    const salesByCategory = Object.values(categorySales);

    // 4. Top Selling Products
    const productSales = {};
    filteredOrderItems.forEach(item => {
      const prod = productMap[item.product_id];
      if (prod) {
        const salesVal = Number(item.price || 0) * Number(item.qty || 1);
        const qtyVal = Number(item.qty || 0);
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            _id: item.product_id,
            name: prod.name,
            image: prod.image_url || prod.image,
            price: prod.price,
            soldCount: 0,
            totalSales: 0
          };
        }
        productSales[item.product_id].soldCount += qtyVal;
        productSales[item.product_id].totalSales += salesVal;
      }
    });
    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5);

    // 5. Low Stock Alerts
    const lowStockAlerts = (allProducts || [])
      .filter(p => {
        if (req.user.role === 'seller') return p.user_id === req.user._id && p.count_in_stock <= 5 && !p.is_digital;
        return p.count_in_stock <= 5 && !p.is_digital;
      })
      .map(p => ({
        _id: p.id,
        name: p.name,
        image: p.image_url || p.image,
        countInStock: p.count_in_stock
      }));

    // Calculate Total Purchase Cost
    let totalPurchaseCost = 0;
    (allProducts || []).forEach(p => {
      if (req.user.role === 'seller' && p.user_id !== req.user._id) return;
      totalPurchaseCost += Number(p.purchase_price || 0) * Number(p.count_in_stock || 0);
    });

    res.json({
      totalOrders,
      totalRevenue,
      totalCustomers: usersCount || 0,
      pendingOrders,
      totalProducts: productsCount || 0,
      totalPurchaseCost,
      orders: formattedOrders,
      revenueOverview,
      orderStatistics,
      salesByCategory,
      topSellingProducts,
      lowStockAlerts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Courier delivery webhook (SteadFast / RedX / Pathao)
// @route   POST /api/orders/courier-webhook
// @access  Public (with Bearer token auth from env)
const handleCourierWebhook = async (req, res) => {
  const { notification_type, consignment_id, tracking_code, invoice, cod_amount, delivery_charge, status: deliveryStatus, tracking_message, updated_at } = req.body;

  if (STEADFAST_BEARER_TOKEN) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (token !== STEADFAST_BEARER_TOKEN) {
      console.warn('[Courier Webhook] Unauthorized attempt - invalid token');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  console.log('[Courier Webhook] Received:', JSON.stringify({ notification_type, consignment_id, invoice, status: deliveryStatus }));

  if (!notification_type) {
    return res.status(200).json({ received: true });
  }

  try {
    let order = null;

    if (invoice) {
      const { data } = await db.database
        .from('orders')
        .select('*')
        .eq('id', invoice)
        .maybeSingle();
      order = data;
    }

    if (!order && consignment_id) {
      const { data } = await db.database
        .from('orders')
        .select('*')
        .eq('courier_tracking_code', String(consignment_id))
        .maybeSingle();
      order = data;
    }

    if (!order && tracking_code) {
      const { data } = await db.database
        .from('orders')
        .select('*')
        .eq('courier_tracking_code', tracking_code)
        .maybeSingle();
      order = data;
    }

    if (!order) {
      console.log('[Courier Webhook] No matching order found for', { invoice, consignment_id, tracking_code });
      return res.status(200).json({ received: true });
    }

    const trackingCode = tracking_code || order.courier_tracking_code || String(consignment_id || '');

    if (notification_type === 'delivery_status' && deliveryStatus === 'Delivered') {
      const updateFields = {
        courier_status: 'Delivered',
        status: 'Delivered',
        courier_tracking_code: trackingCode,
      };

      if (cod_amount && Number(cod_amount) > 0 && !order.is_paid) {
        updateFields.is_paid = true;
        updateFields.paid_at = new Date().toISOString();
        updateFields.payment_result_status = 'COD_COLLECTED';
        updateFields.payment_result_time = Date.now().toString();
      }

      await db.database.from('orders').update(updateFields).eq('id', order.id);
      console.log(`[Courier Webhook] Order ${order.id} marked as Delivered${cod_amount > 0 ? ' (COD collected)' : ''}`);
    } else if (notification_type === 'tracking_update') {
      const statusMsg = tracking_message || 'In transit';
      await db.database
        .from('orders')
        .update({
          courier_status: `In Transit - ${statusMsg}`.slice(0, 250),
          courier_tracking_code: trackingCode,
        })
        .eq('id', order.id);
      console.log(`[Courier Webhook] Order ${order.id} tracking update: ${statusMsg}`);
    } else {
      await db.database
        .from('orders')
        .update({
          courier_status: `${deliveryStatus || notification_type} - ${tracking_message || ''}`.slice(0, 250),
          courier_tracking_code: trackingCode,
        })
        .eq('id', order.id);
      console.log(`[Courier Webhook] Order ${order.id} status: ${deliveryStatus || notification_type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Courier Webhook] Error:', error);
    return res.status(200).json({ received: true });
  }
};

export const bulkUpdateOrders = async (req, res) => {
  const { orderIds, status } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ message: 'No orders selected' });
  }
  
  try {
    if (req.user.role === 'seller') {
      return res.status(403).json({ message: 'Sellers cannot bulk update orders yet' });
    }

    if (status === 'Cancelled') {
      for (const id of orderIds) {
        await restoreStockOnCancel(id);
      }
    }

    const { error } = await db.database
      .from('orders')
      .update({ status })
      .in('id', orderIds);

    if (error) throw error;
    res.json({ message: 'Orders updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid,
  handleVoiceConfirmation,
  handleCourierWebhook,
  deleteOrder,
  getMyOrders,
  getOrders,
  getAdminSummary,
};
