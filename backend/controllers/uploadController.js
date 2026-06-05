import path from 'path';
import { db } from '../config/db.js';

import fs from 'fs';

const uploadToInsForge = async (file, folder = 'products') => {
  const ext = path.extname(file.originalname);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const key = `${folder}/${filename}`;

  // Make sure local uploads folder exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Save the file locally instead of InsForge (which is timing out)
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, file.buffer);

  // Use the backend server's URL, fallback to localhost:5000
  // Since the frontend runs on localhost:3000 and hits localhost:5000 for local dev
  const publicUrl = `http://localhost:5000/uploads/${filename}`;
  const storageKey = key;

  return { url: publicUrl, key: storageKey };
};

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Default folder for generic product images
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
// Category image upload (thumbnail or banner)
const uploadCategoryImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    // Use 'categories' folder for category images
    const result = await uploadToInsForge(req.file, 'categories');
    res.json({
      message: 'Category image uploaded successfully',
      image: result.url,
      filename: result.key,
      key: result.key,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { uploadImage, uploadMultipleImages, uploadCategoryImage };
