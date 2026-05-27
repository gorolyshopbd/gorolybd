import { supabase } from '../config/db.js';

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
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  try {
    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user._id,
        shipping_name: req.user.name || '',
        shipping_address: shippingAddress?.address || '',
        shipping_city: shippingAddress?.city || '',
        shipping_postal_code: shippingAddress?.postalCode || '',
        shipping_phone: shippingAddress?.phone || '',
        payment_method: paymentMethod || 'Cash on Delivery',
        items_price: itemsPrice || 0,
        shipping_price: shippingPrice || 0,
        discount_price: discountPrice || 0,
        total_price: totalPrice || 0,
        advance_payment: advancePayment || false,
        advance_amount: advanceAmount || 0,
        shipping_method_id: shippingMethod?._id || '',
        shipping_method_name: shippingMethod?.name || '',
        shipping_method_price: shippingMethod?.price || 0,
        shipping_method_days: shippingMethod?.estimatedDays || '',
        is_paid: paymentMethod !== 'Cash on Delivery',
        paid_at: paymentMethod !== 'Cash on Delivery' ? new Date().toISOString() : null,
        status: 'Pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert Order Items
    const formattedItems = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product,
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(formattedItems);
    if (itemsError) throw itemsError;

    // 3. Deduct Stock (Ideally should be done via an RPC or stored procedure to avoid race conditions, but simple update for now)
    for (const item of orderItems) {
      if (item.product) {
        const { data: product } = await supabase.from('products').select('count_in_stock').eq('id', item.product).single();
        if (product) {
          await supabase.from('products').update({ count_in_stock: Math.max(0, product.count_in_stock - item.qty) }).eq('id', item.product);
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
    const { data: order, error } = await supabase
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

    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);

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
const updateOrderStatus = async (req, res) => {
  const { status, courierProvider } = req.body;
  
  try {
    let updateData = { status };
    if (courierProvider) {
      const trackingCode = `${courierProvider.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      updateData.courier_provider = courierProvider;
      updateData.courier_tracking_code = trackingCode;
      updateData.courier_status = 'Booked';
    }

    const { data: order, error } = await supabase
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
    const { data: order, error } = await supabase
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

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user._id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch items for each order
    const formattedOrders = await Promise.all(orders.map(async (o) => {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
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
    if (req.user.role === 'seller') {
      const { data: myProducts } = await supabase.from('products').select('id').eq('user_id', req.user._id);
      const myProductIds = myProducts ? myProducts.map(p => p.id) : [];
      if (myProductIds.length > 0) {
        const { data: myOrderItems } = await supabase.from('order_items').select('order_id').in('product_id', myProductIds);
        orderIds = myOrderItems ? myOrderItems.map(item => item.order_id) : [];
      } else {
        orderIds = [];
      }
    }

    let query = supabase.from('orders').select('*, users:user_id(id, name)').order('created_at', { ascending: false });
    if (orderIds !== null) {
      if (orderIds.length === 0) {
         return res.json([]);
      }
      query = query.in('id', orderIds);
    }

    const { data: orders, error } = await query;
    if (error) throw error;
    
    const formattedOrders = orders.map(o => ({
      ...o,
      _id: o.id,
      user: o.users ? { _id: o.users.id, name: o.users.name } : null,
      createdAt: o.created_at,
      totalPrice: o.total_price,
      isPaid: o.is_paid,
      status: o.status,
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
    let productsQuery = supabase.from('products').select('*', { count: 'exact', head: true });
    
    if (req.user.role === 'seller') {
      productsQuery = productsQuery.eq('user_id', req.user._id);
      
      const { data: myProducts } = await supabase.from('products').select('id').eq('user_id', req.user._id);
      const myProductIds = myProducts ? myProducts.map(p => p.id) : [];
      if (myProductIds.length > 0) {
        const { data: myOrderItems } = await supabase.from('order_items').select('order_id').in('product_id', myProductIds);
        orderIds = myOrderItems ? myOrderItems.map(item => item.order_id) : [];
      } else {
        orderIds = [];
      }
    }

    let ordersQuery = supabase.from('orders').select('*');
    if (orderIds !== null) {
      if (orderIds.length === 0) {
        const { count: productsCount } = await productsQuery;
        return res.json({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, pendingOrders: 0, totalProducts: productsCount || 0, orders: [] });
      }
      ordersQuery = ordersQuery.in('id', orderIds);
    }

    const { data: orders, error: ordersError } = await ordersQuery;
    if (ordersError) throw ordersError;

    const { count: productsCount, error: pError } = await productsQuery;
    if (pError) throw pError;

    const { count: usersCount, error: uError } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (uError) throw uError;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((acc, order) => acc + Number(order.total_price || 0), 0);
      
    const formattedOrders = orders.map(o => ({
      ...o,
      _id: o.id,
      createdAt: o.created_at,
      totalPrice: o.total_price,
      isPaid: o.is_paid,
      status: o.status,
    }));

    res.json({
      totalOrders,
      totalRevenue,
      totalCustomers: usersCount || 0,
      pendingOrders,
      totalProducts: productsCount || 0,
      orders: formattedOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  getAdminSummary,
};
