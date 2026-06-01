import path from 'path';
import { db } from '../config/db.js';

const uploadToInsForge = async (file, folder = 'products') => {
  const ext = path.extname(file.originalname);
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const blob = new Blob([file.buffer], { type: file.mimetype });
  const { data, error } = await db.storage
    .from('product')
    .upload(key, blob);

  if (error) throw error;

  const storageKey = data.key || data.path || key;

  // Get the public URL — storage.upload() only returns path/id, not a URL
  const { data: publicUrlData } = db.storage
    .from('product')
    .getPublicUrl(storageKey);

  const publicUrl = publicUrlData?.publicUrl || publicUrlData?.url || '';

  const { error: imgError } = await db.database.from('images').insert({
    filename: storageKey,
    original_name: file.originalname,
    storage_path: storageKey,
    public_url: publicUrl,
    mime_type: file.mimetype,
    size_bytes: file.size,
    bucket: 'product',
  }).single();

  if (imgError) console.error('Failed to save image record:', imgError);

  return { url: publicUrl, key: storageKey };
};

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const result = await uploadToInsForge(req.file, 'products');
    res.json({
      message: 'Image uploaded successfully',
      image: result.url,
      filename: result.key,
      key: result.key,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadMultipleImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  try {
    const results = await Promise.all(
      req.files.map((file) => uploadToInsForge(file, 'products'))
    );
    res.json({
      message: `${results.length} image(s) uploaded successfully`,
      images: results.map((r) => ({
        image: r.url,
        filename: r.key,
        key: r.key,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { uploadImage, uploadMultipleImages };
