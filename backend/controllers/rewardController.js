import { db } from '../config/db.js';

// @desc    Get reward settings
// @route   GET /api/rewards/settings
// @access  Private/Admin
export const getRewardSettings = async (req, res) => {
  try {
    const { data, error } = await db
      .from('reward_settings')
      .select('*')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update reward settings
// @route   PUT /api/rewards/settings
// @access  Private/Admin
export const updateRewardSettings = async (req, res) => {
  const { is_enabled, earn_rate, redeem_rate, min_redeem_points } = req.body;
  try {
    const { data: current } = await db
      .from('reward_settings')
      .select('id')
      .single();

    let result;
    if (current) {
      result = await db
        .from('reward_settings')
        .update({
          is_enabled,
          earn_rate: Number(earn_rate),
          redeem_rate: Number(redeem_rate),
          min_redeem_points: Number(min_redeem_points),
          updated_at: new Date()
        })
        .eq('id', current.id)
        .select()
        .single();
    } else {
      result = await db
        .from('reward_settings')
        .insert({
          is_enabled,
          earn_rate: Number(earn_rate),
          redeem_rate: Number(redeem_rate),
          min_redeem_points: Number(min_redeem_points)
        })
        .select()
        .single();
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
    const { data, error } = await db
      .from('user_points')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map(row => ({
      _id: row.id,
      user_id: row.user_id,
      name: row.users?.name || 'Customer',
      email: row.users?.email || '',
      total_points: row.total_points,
      redeemed_points: row.redeemed_points,
      current_balance: row.current_balance,
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
    const { data, error } = await db
      .from('point_logs')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map(row => ({
      _id: row.id,
      user_id: row.user_id,
      name: row.users?.name || 'Customer',
      email: row.users?.email || '',
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
    // 1. Fetch current points row or create if it doesn't exist
    const { data: current, error: fetchErr } = await db
      .from('user_points')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    let updatedPoints;
    const diff = Number(points);

    if (current) {
      const newBalance = current.current_balance + diff;
      const newTotal = diff > 0 ? current.total_points + diff : current.total_points;
      const newRedeemed = diff < 0 ? current.redeemed_points + Math.abs(diff) : current.redeemed_points;

      const { data, error } = await db
        .from('user_points')
        .update({
          total_points: newTotal,
          redeemed_points: newRedeemed,
          current_balance: newBalance,
          updated_at: new Date()
        })
        .eq('id', current.id)
        .select()
        .single();

      if (error) throw error;
      updatedPoints = data;
    } else {
      const newBalance = diff > 0 ? diff : 0;
      const newTotal = diff > 0 ? diff : 0;
      const newRedeemed = diff < 0 ? Math.abs(diff) : 0;

      const { data, error } = await db
        .from('user_points')
        .insert({
          user_id,
          total_points: newTotal,
          redeemed_points: newRedeemed,
          current_balance: newBalance
        })
        .select()
        .single();

      if (error) throw error;
      updatedPoints = data;
    }

    // 2. Add log entry
    await db.database.from('point_logs').insert({
      user_id,
      points: diff,
      type: 'admin_adjustment',
      description: description || 'Admin manual point adjustment'
    });

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
    const { data, error } = await db
      .from('products')
      .select(`
        *,
        users:user_id (name)
      `)
      .gt('reward_points', 0)
      .order('name', { ascending: true });

    if (error) throw error;

    const formatted = (data || []).map(p => ({
      _id: p.id,
      name: p.name,
      price: p.price,
      reward_points: p.reward_points,
      seller_name: p.users?.name || 'Admin Product'
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
    const { error } = await db
      .from('products')
      .update({ reward_points: Number(points) })
      .ilike('category', category);

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
    const { error } = await db
      .from('products')
      .update({ reward_points: Number(points) })
      .eq('user_id', seller_id);

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
    const { error } = await db
      .from('products')
      .update({ reward_points: Number(points) })
      .eq('id', product_id);

    if (error) throw error;
    res.json({ message: `Reward points set to ${points} for product` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
