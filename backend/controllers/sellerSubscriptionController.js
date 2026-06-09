import { db } from '../config/db.js';

const getSubscriptionsWithJoins = async () => {
  const { data, error } = await db.database.from('seller_subscriptions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  
  const subs = data || [];
  
  // Fetch users
  const userIds = subs.filter(s => s.seller_id || s.user_id).map(s => s.seller_id || s.user_id);
  let usersMap = {};
  if (userIds.length > 0) {
    const { rows } = await db.query(`SELECT id, name, email FROM users WHERE id = ANY($1)`, [userIds]);
    if (rows) rows.forEach(u => usersMap[u.id] = u);
  }

  // Fetch packages
  const pkgIds = subs.filter(s => s.package_id).map(s => s.package_id);
  let pkgsMap = {};
  if (pkgIds.length > 0) {
    const { rows } = await db.query(`SELECT id, name, price FROM seller_packages WHERE id = ANY($1)`, [pkgIds]);
    if (rows) rows.forEach(p => pkgsMap[p.id] = p);
  }

  return subs.map(s => {
    const userId = s.seller_id || s.user_id;
    const user = usersMap[userId];
    const pkg = pkgsMap[s.package_id];
    return {
      ...s,
      users: user || null,
      seller_packages: pkg || null
    };
  });
};

// @desc    Get all online subscriptions
// @route   GET /api/seller-subscriptions/online
// @access  Protected (Admin)
export const getOnlineSubscriptions = async (req, res) => {
  try {
    const subs = await getSubscriptionsWithJoins();
    const offlineMethods = ['offline', 'cash', 'cash on delivery', 'cod'];
    const formatted = subs
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
    const subs = await getSubscriptionsWithJoins();
    const offlineMethods = ['offline', 'cash', 'cash on delivery', 'cod'];
    const formatted = subs
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
