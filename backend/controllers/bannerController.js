import { db } from '../config/db.js';

export const getActiveBanners = async (req, res) => {
  try {
    const { data: banners, error } = await db.database.from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true });
    if (error) throw error;
    
    const formatted = banners.map(b => ({
      ...b,
      _id: b.id,
      order: b.sort_order,
      isActive: b.is_active,
      image: b.image_url
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBanners = async (req, res) => {
  try {
    const { data: banners, error } = await db.database.from('banners').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    
    const formatted = banners.map(b => ({
      ...b,
      _id: b.id,
      order: b.sort_order,
      isActive: b.is_active,
      image: b.image_url
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link, isActive, order } = req.body;
    
    const { data: banner, error } = await db.database.from('banners').insert({
      title,
      subtitle: subtitle || '',
      image_url: image || '',
      link: link || '',
      is_active: isActive !== undefined ? isActive : true,
      sort_order: order || 0
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...banner, _id: banner.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link, isActive, order } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (image !== undefined) updateData.image_url = image;
    if (link !== undefined) updateData.link = link;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (order !== undefined) updateData.sort_order = order;
    
    const { data: banner, error } = await db.database.from('banners').update(updateData).eq('id', req.params.id).select().single();
    
    if (error || !banner) return res.status(404).json({ message: 'Banner not found' });
    res.json({ ...banner, _id: banner.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { error } = await db.database.from('banners').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
