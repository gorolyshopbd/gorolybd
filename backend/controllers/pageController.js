import { db } from '../config/db.js';

export const getPages = async (req, res) => {
  try {
    const { data: pages, error } = await db.database.from('pages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    const formatted = pages.map(p => ({
      ...p,
      _id: p.id,
      isPublished: p.is_published
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPageBySlug = async (req, res) => {
  try {
    const { data: page, error } = await db.database.from('pages').select('*').eq('slug', req.params.slug).eq('is_published', true).single();
    if (error || !page) return res.status(404).json({ message: 'Page not found' });
    
    res.json({ ...page, _id: page.id, isPublished: page.is_published });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPage = async (req, res) => {
  try {
    const { title, slug, content, isPublished } = req.body;
    
    const { data: existing } = await db.database.from('pages').select('id').eq('slug', slug).single();
    if (existing) return res.status(400).json({ message: 'Slug already exists' });
    
    const { data: page, error } = await db.database.from('pages').insert({
      title,
      slug,
      content,
      is_published: isPublished !== undefined ? isPublished : false
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ ...page, _id: page.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePage = async (req, res) => {
  try {
    const { title, slug, content, isPublished } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) updateData.is_published = isPublished;
    
    const { data: page, error } = await db.database.from('pages').update(updateData).eq('id', req.params.id).select().single();
    
    if (error || !page) return res.status(404).json({ message: 'Page not found' });
    res.json({ ...page, _id: page.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePage = async (req, res) => {
  try {
    const { error } = await db.database.from('pages').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicPages = async (req, res) => {
  try {
    const { data: pages, error } = await db.database.from('pages').select('*').eq('is_published', true).order('created_at', { ascending: false });
    if (error) throw error;
    
    const formatted = pages.map(p => ({
      ...p,
      _id: p.id,
      isPublished: p.is_published
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
