import { db } from '../config/db.js';

// @desc    Get all online subscriptions
// @route   GET /api/seller-subscriptions/online
// @access  Protected (Admin)
export const getOnlineSubscriptions = async (req, res) => {
  try {
    const { data, error } = await db
      .from('seller_subscriptions')
      .select(`
        *,
        users:user_id (name, email),
        seller_packages:package_id (name, price)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const offlineMethods = ['offline', 'cash', 'cash on delivery', 'cod'];
    const formatted = (data || [])
      .filter(s => !offlineMethods.includes((s.payment_method || '').toLowerCase()))
      .map(s => ({
        _id: s.id,
        shop_name: s.users?.name || 'Shop',
        shop_email: s.users?.email || '',
        package_name: s.seller_packages?.name || 'Basic Package',
        package_price: s.seller_packages?.price || 0,
        payment_method: s.payment_method,
        status: s.status,
        purchase_date: s.created_at || s.start_date
      }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all offline subscriptions
// @route   GET /api/seller-subscriptions/offline
// @access  Protected (Admin)
export const getOfflineSubscriptions = async (req, res) => {
  try {
    const { data, error } = await db
      .from('seller_subscriptions')
      .select(`
        *,
        users:user_id (name, email),
        seller_packages:package_id (name, price)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const offlineMethods = ['offline', 'cash', 'cash on delivery', 'cod'];
    const formatted = (data || [])
      .filter(s => offlineMethods.includes((s.payment_method || '').toLowerCase()))
      .map(s => ({
        _id: s.id,
        shop_name: s.users?.name || 'Shop',
        shop_email: s.users?.email || '',
        package_name: s.seller_packages?.name || 'Basic Package',
        package_price: s.seller_packages?.price || 0,
        payment_method: s.payment_method,
        status: s.status,
        purchase_date: s.created_at || s.start_date
      }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
