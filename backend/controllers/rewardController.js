import { db } from '../config/db.js';

// @desc    Get reward settings
// @route   GET /api/rewards/settings
// @access  Private/Admin
export const getRewardSettings = async (req, res) => {
  try {
    const { data, error } = await db.database.from('rewards_settings').select('*').limit(1).single();
    if (error && error.message && error.message.includes('does not exist')) {
      return res.json({ is_active: false, points_per_amount: 1, min_points_to_redeem: 100, redemption_value: 1 });
    }
    if (error) throw error;
    res.json(data || { is_active: false, points_per_amount: 1, min_points_to_redeem: 100, redemption_value: 1 });
  } catch (err) {
    res.json({ is_active: false, points_per_amount: 1, min_points_to_redeem: 100, redemption_value: 1 });
  }
};

// @desc    Update reward settings
// @route   PUT /api/rewards/settings
// @access  Private/Admin
export const updateRewardSettings = async (req, res) => {
  const { is_enabled, earn_rate, redeem_rate, min_redeem_points, is_active, points_per_amount, redemption_value } = req.body;
  try {
    const { data: current } = await db.database.from('rewards_settings').select('id').limit(1).single();

    let result;
    const updateData = {
      is_active: is_active !== undefined ? is_active : (is_enabled !== undefined ? is_enabled : false),
      points_per_amount: Number(points_per_amount || earn_rate || 1),
      redemption_value: Number(redemption_value || redeem_rate || 1),
      min_points_to_redeem: Number(min_redeem_points || 100),
    };

    if (current) {
      result = await db.database.from('rewards_settings').update(updateData).eq('id', current.id).select().single();
    } else {
      result = await db.database.from('rewards_settings').insert([updateData]).select().single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user points summary
// @route   GET /api/rewards/user-points
// @access  Private/Admin
export const getUserPointsSummary = async (req, res) => {
  try {
    const { data, error } = await db.database.from('rewards_user_points').select('*').order('updated_at', { ascending: false });
    if (error) throw error;

    const userIds = (data || []).filter(r => r.user_id).map(r => r.user_id);
    let usersMap = {};
    if (userIds.length > 0) {
      const { rows } = await db.query(`SELECT id, name, email FROM users WHERE id = ANY($1)`, [userIds]);
      if (rows) rows.forEach(u => usersMap[u.id] = u);
    }

    const formatted = (data || []).map(row => ({
      _id: row.id,
      user_id: row.user_id,
      name: usersMap[row.user_id]?.name || 'Customer',
      email: usersMap[row.user_id]?.email || '',
      total_points: row.total_earned || 0,
      redeemed_points: row.total_redeemed || 0,
      current_balance: row.points || 0,
      updated_at: row.updated_at,
      created_at: row.created_at
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get points transactions logs
// @route   GET /api/rewards/logs
// @access  Private/Admin
export const getPointLogs = async (req, res) => {
  try {
    const { data, error } = await db.database.from('rewards_logs').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    const userIds = (data || []).filter(r => r.user_id).map(r => r.user_id);
    let usersMap = {};
    if (userIds.length > 0) {
      const { rows } = await db.query(`SELECT id, name, email FROM users WHERE id = ANY($1)`, [userIds]);
      if (rows) rows.forEach(u => usersMap[u.id] = u);
    }

    const formatted = (data || []).map(row => ({
      _id: row.id,
      user_id: row.user_id,
      name: usersMap[row.user_id]?.name || 'Customer',
      email: usersMap[row.user_id]?.email || '',
      points: row.points,
      type: row.type,
      description: row.description,
      created_at: row.created_at
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin adjust user points manually
// @route   POST /api/rewards/adjust
// @access  Private/Admin
export const adjustUserPoints = async (req, res) => {
  const { user_id, points, description } = req.body;

  if (!user_id || points === undefined) {
    return res.status(400).json({ message: 'User ID and points adjustment value are required' });
  }

  try {
    const { data: current } = await db.database.from('rewards_user_points').select('*').eq('user_id', user_id).single();
    const diff = Number(points);
    let updatedPoints;

    if (current) {
      const newBalance = (current.points || 0) + diff;
      const newTotal = diff > 0 ? (current.total_earned || 0) + diff : current.total_earned || 0;
      const newRedeemed = diff < 0 ? (current.total_redeemed || 0) + Math.abs(diff) : current.total_redeemed || 0;

      const { data, error } = await db.database.from('rewards_user_points').update({
        total_earned: newTotal,
        total_redeemed: newRedeemed,
        points: Math.max(0, newBalance),
        updated_at: new Date()
      }).eq('id', current.id).select().single();

      if (error) throw error;
      updatedPoints = data;
    } else {
      const newBalance = diff > 0 ? diff : 0;
      const { data, error } = await db.database.from('rewards_user_points').insert([{
        user_id,
        total_earned: Math.max(0, diff),
        total_redeemed: 0,
        points: newBalance
      }]).select().single();

      if (error) throw error;
      updatedPoints = data;
    }

    // Add log entry
    await db.database.from('rewards_logs').insert([{
      user_id,
      points: diff,
      type: 'admin_adjustment',
      description: description || 'Admin manual point adjustment'
    }]);

    res.json({ message: 'User points adjusted successfully', data: updatedPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all products with reward points configured (> 0)
// @route   GET /api/rewards/products
// @access  Private/Admin
export const getRewardProducts = async (req, res) => {
  try {
    const { data, error } = await db.database.from('products').select('id, name, price, reward_points, user_id').order('name', { ascending: true });
    if (error) throw error;

    const formatted = (data || []).filter(p => p.reward_points > 0).map(p => ({
      _id: p.id,
      name: p.name,
      price: p.price,
      reward_points: p.reward_points,
      seller_name: 'Admin Product'
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Set reward points for all products in a category
// @route   POST /api/rewards/set-by-category
// @access  Private/Admin
export const setRewardByCategory = async (req, res) => {
  const { category, points } = req.body;
  if (!category || points === undefined) {
    return res.status(400).json({ message: 'Category and points are required' });
  }
  try {
    const { error } = await db.database.from('products').update({ reward_points: Number(points) }).ilike('category', category);
    if (error) throw error;
    res.json({ message: `Reward points set to ${points} for category ${category}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Set reward points for all products of a seller
// @route   POST /api/rewards/set-by-seller
// @access  Private/Admin
export const setRewardBySeller = async (req, res) => {
  const { seller_id, points } = req.body;
  if (!seller_id || points === undefined) {
    return res.status(400).json({ message: 'Seller ID and points are required' });
  }
  try {
    const { error } = await db.database.from('products').update({ reward_points: Number(points) }).eq('user_id', seller_id);
    if (error) throw error;
    res.json({ message: `Reward points set to ${points} for seller` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Set reward points for a single product
// @route   POST /api/rewards/set-by-product
// @access  Private/Admin
export const setRewardByProduct = async (req, res) => {
  const { product_id, points } = req.body;
  if (!product_id || points === undefined) {
    return res.status(400).json({ message: 'Product ID and points are required' });
  }
  try {
    const { error } = await db.database.from('products').update({ reward_points: Number(points) }).eq('id', product_id);
    if (error) throw error;
    res.json({ message: `Reward points set to ${points} for product` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
