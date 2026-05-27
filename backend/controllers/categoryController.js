import { supabase } from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    
    const formatted = categories.map(c => ({
      ...c,
      _id: c.id,
      order: c.sort_order,
      image: c.image_url
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, image, order } = req.body;
    
    const { data: existing } = await supabase.from('categories').select('id').eq('name', name).single();
    if (existing) return res.status(400).json({ message: 'Category already exists' });
    
    const { data: category, error } = await supabase.from('categories').insert({
      name,
      image_url: image || '',
      sort_order: order || 0
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...category, _id: category.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, image, order } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (image !== undefined) updateData.image_url = image;
    if (order !== undefined) updateData.sort_order = order;
    
    const { data: category, error } = await supabase.from('categories').update(updateData).eq('id', req.params.id).select().single();
    
    if (error || !category) return res.status(404).json({ message: 'Category not found' });
    res.json({ ...category, _id: category.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
