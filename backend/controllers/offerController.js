import { db } from '../config/db.js';

export const getActiveOffers = async (req, res) => {
  try {
    const { data: offers, error } = await db.database.from('offers').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (error) throw error;
    
    const formatted = offers.map(o => ({
      ...o,
      _id: o.id,
      discountPercent: o.discount_percent,
      isActive: o.is_active,
      image: o.image_url
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOffers = async (req, res) => {
  try {
    const { data: offers, error } = await db.database.from('offers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    const formatted = offers.map(o => ({
      ...o,
      _id: o.id,
      discountPercent: o.discount_percent,
      isActive: o.is_active,
      image: o.image_url
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOffer = async (req, res) => {
  try {
    const { title, description, discountPercent, image, link, isActive } = req.body;
    
    const { data: offer, error } = await db.database.from('offers').insert({
      title,
      description: description || '',
      discount_percent: discountPercent,
      image_url: image || '',
      link: link || '',
      is_active: isActive !== undefined ? isActive : true
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...offer, _id: offer.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const { title, description, discountPercent, image, link, isActive } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (discountPercent !== undefined) updateData.discount_percent = discountPercent;
    if (image !== undefined) updateData.image_url = image;
    if (link !== undefined) updateData.link = link;
    if (isActive !== undefined) updateData.is_active = isActive;
    
    const { data: offer, error } = await db.database.from('offers').update(updateData).eq('id', req.params.id).select().single();
    
    if (error || !offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ ...offer, _id: offer.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const { error } = await db.database.from('offers').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
