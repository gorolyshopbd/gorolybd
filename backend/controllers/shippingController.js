import { supabase } from '../config/db.js';

export const getAllShippingMethods = async (req, res) => {
  try {
    const { data: methods, error } = await supabase.from('shipping_methods').select('*').order('price', { ascending: true });
    if (error) throw error;
    
    const formatted = methods.map(m => ({
      ...m,
      _id: m.id,
      estimatedDays: m.estimated_days,
      isActive: m.is_active
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveShippingMethods = async (req, res) => {
  try {
    const { data: methods, error } = await supabase.from('shipping_methods').select('*').eq('is_active', true).order('price', { ascending: true });
    if (error) throw error;
    
    const formatted = methods.map(m => ({
      ...m,
      _id: m.id,
      estimatedDays: m.estimated_days,
      isActive: m.is_active
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShippingMethod = async (req, res) => {
  try {
    const { name, price, estimatedDays, description } = req.body;
    
    const { data: method, error } = await supabase.from('shipping_methods').insert({
      name,
      price: price || 0,
      estimated_days: estimatedDays || '',
      description: description || '',
      is_active: true
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...method, _id: method.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShippingMethod = async (req, res) => {
  try {
    const { name, price, estimatedDays, description, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (estimatedDays !== undefined) updateData.estimated_days = estimatedDays;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.is_active = isActive;
    
    const { data: method, error } = await supabase.from('shipping_methods').update(updateData).eq('id', req.params.id).select().single();
    
    if (error || !method) return res.status(404).json({ message: 'Shipping method not found' });
    res.json({ ...method, _id: method.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteShippingMethod = async (req, res) => {
  try {
    const { error } = await supabase.from('shipping_methods').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
