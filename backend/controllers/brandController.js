import { db } from '../config/db.js';

export const getBrands = async (req, res) => {
  try {
    const { data: brands, error } = await db.database.from('brands').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    
    const formatted = brands.map(b => ({
      ...b,
      _id: b.id,
      order: b.sort_order,
      image: b.image_url
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, image, order } = req.body;
    
    const { data: existing } = await db.database.from('brands').select('id').eq('name', name).single();
    if (existing) return res.status(400).json({ message: 'Brand already exists' });
    
    const { data: brand, error } = await db.database.from('brands').insert({
      name,
      image_url: image || '',
      sort_order: order || 0
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...brand, _id: brand.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { name, image, order } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (image !== undefined) updateData.image_url = image;
    if (order !== undefined) updateData.sort_order = order;
    
    const { data: brand, error } = await db.database.from('brands').update(updateData).eq('id', req.params.id).select().single();
    
    if (error || !brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ ...brand, _id: brand.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { error } = await db.database.from('brands').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
