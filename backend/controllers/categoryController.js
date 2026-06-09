import { db } from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await db.database.from('categories').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    
    const formatted = categories.map(c => ({
      ...c,
      _id: c.id,
      order: c.sort_order,
      image: c.image_url,
      banner: c.banner_url || '',
      subcategories: c.subcategories || [],
      rootCategory: c.root_category || '',
      featured: c.featured || false,
      status: c.status !== undefined ? c.status : true,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, image, banner, order, subcategories, rootCategory, featured, status } = req.body;
    
    const { data: existing } = await db.database.from('categories').select('id').eq('name', name).single();
    if (existing) return res.status(400).json({ message: 'Category already exists' });
    
    const insertData = {
      name,
      image_url: image || '',
      banner_url: banner || '',
      sort_order: order || 0
    };
    
    if (banner !== undefined) {
      insertData.banner_url = banner;
    }
    
    let result = await db.database.from('categories').insert(insertData).select().single();
    let { data: category, error } = result;
    
    if (error && error.message && error.message.includes('banner_url')) {
      delete insertData.banner_url;
      result = await db.database.from('categories').insert(insertData).select().single();
      category = result.data;
      error = result.error;
    }
    
    if (error) throw error;
    res.status(201).json({ ...category, _id: category.id, banner: category.banner_url || '', subcategories: category.subcategories || [], rootCategory: category.root_category || '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, image, banner, order, subcategories, rootCategory, featured, status } = req.body;
    
    if (name) {
      const { data: existing } = await db.database.from('categories').select('id').eq('name', name).neq('id', req.params.id).single();
      if (existing) return res.status(400).json({ message: 'Category name already exists' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (image !== undefined) updateData.image_url = image;
    if (banner !== undefined) updateData.banner_url = banner;
    if (order !== undefined) updateData.sort_order = order;
    
    let result = await db.database.from('categories').update(updateData).eq('id', req.params.id).select().single();
    let { data: category, error } = result;
    
    if (error && error.message && error.message.includes('banner_url')) {
      delete updateData.banner_url;
      result = await db.database.from('categories').update(updateData).eq('id', req.params.id).select().single();
      category = result.data;
      error = result.error;
    }
    
    if (error || !category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated successfully', ...category, _id: category.id, rootCategory: category.root_category || '', featured: category.featured || false, status: category.status !== undefined ? category.status : true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { error } = await db.database.from('categories').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Category deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
