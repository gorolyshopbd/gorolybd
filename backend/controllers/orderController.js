import { db } from '../config/db.js';

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
    const { data: order, error: orderError } = await db.database
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

    const { error: itemsError } = await db.database.from('order_items').insert(formattedItems);
    if (itemsError) throw itemsError;

    // 3. Deduct Stock (Ideally should be done via an RPC or stored procedure to avoid race conditions, but simple update for now)
    for (const item of orderItems) {
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
    if (req.user.role === 'seller') {
      const { data: myProducts } = await db.database.from('products').select('id').eq('user_id', req.user._id);
      const myProductIds = myProducts ? myProducts.map(p => p.id) : [];
      if (myProductIds.length > 0) {
        const { data: myOrderItems } = await db.database.from('order_items').select('order_id').in('product_id', myProductIds);
        orderIds = myOrderItems ? myOrderItems.map(item => item.order_id) : [];
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
    let productsQuery = db.database.from('products').select('*', { count: 'exact', head: true });
    
    // Get seller products if applicable
    let myProductIds = [];
    if (req.user.role === 'seller') {
      productsQuery = productsQuery.eq('user_id', req.user._id);
      const { data: myProducts } = await db.database.from('products').select('id').eq('user_id', req.user._id);
      myProductIds = myProducts ? myProducts.map(p => p.id) : [];
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

    res.json({
      totalOrders,
      totalRevenue,
      totalCustomers: usersCount || 0,
      pendingOrders,
      totalProducts: productsCount || 0,
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

export {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  getAdminSummary,
};
