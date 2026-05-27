import { supabase } from '../config/db.js';

export const getCoupons = async (req, res) => {
  try {
    const { data: coupons, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    const formatted = coupons.map(c => ({
      ...c,
      _id: c.id,
      expiryDate: c.expiry_date,
      isActive: c.is_active
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discount, expiryDate, isActive } = req.body;
    
    const { data: existing } = await supabase.from('coupons').select('id').eq('code', code).single();
    if (existing) return res.status(400).json({ message: 'Coupon already exists' });
    
    const { data: coupon, error } = await supabase.from('coupons').insert({
      code,
      discount,
      expiry_date: expiryDate,
      is_active: isActive !== undefined ? isActive : true
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...coupon, _id: coupon.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { code, discount, expiryDate, isActive } = req.body;
    
    const updateData = {};
    if (code) updateData.code = code;
    if (discount !== undefined) updateData.discount = discount;
    if (expiryDate !== undefined) updateData.expiry_date = expiryDate;
    if (isActive !== undefined) updateData.is_active = isActive;
    
    const { data: coupon, error } = await supabase.from('coupons').update(updateData).eq('id', req.params.id).select().single();
    
    if (error || !coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ ...coupon, _id: coupon.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const { data: coupon, error } = await supabase.from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();
      
    if (error || !coupon) return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    
    if (new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ message: 'Coupon code has expired' });
    }
    
    res.json({ discount: coupon.discount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
