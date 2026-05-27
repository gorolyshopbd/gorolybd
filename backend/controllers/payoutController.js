import { supabase } from '../config/db.js';

// @desc    Get all payouts (Admin gets all, Seller gets own)
// @route   GET /api/payouts
// @access  Private
export const getPayouts = async (req, res) => {
  try {
    let query = supabase.from('seller_payouts').select(`
      *,
      users:seller_id (name, store_name, email)
    `).order('created_at', { ascending: false });

    // If seller, only get their own payouts
    if (req.user.role === 'seller' && !req.user.isAdmin) {
      query = query.eq('seller_id', req.user._id);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch payouts' });
  }
};

// @desc    Request a new payout
// @route   POST /api/payouts/request
// @access  Private/Seller
export const requestPayout = async (req, res) => {
  const { amount, payment_method, account_details } = req.body;

  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can request payouts' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const { data, error } = await supabase
      .from('seller_payouts')
      .insert([
        {
          seller_id: req.user._id,
          amount,
          payment_method,
          account_details,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to request payout' });
  }
};

// @desc    Update payout status
// @route   PUT /api/payouts/:id
// @access  Private/Admin
export const updatePayoutStatus = async (req, res) => {
  const { status, transaction_id } = req.body;
  const { id } = req.params;

  try {
    if (!req.user.isAdmin && req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('seller_payouts')
      .update({ 
        status, 
        transaction_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update payout' });
  }
};
