import { db } from './config/db.js';
import path from 'path';

const uploadToInsForge = async (file, folder = 'products') => {
  const ext = path.extname(file.originalname);
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  console.log('Uploading with key:', key);
  try {
    const { data, error } = await db.storage
      .from('product')
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Upload Error:', error);
      throw error;
    }

    console.log('Upload Data:', data);
    const storageKey = data.key || key;

    const { data: publicUrlData } = db.storage.from('product').getPublicUrl(storageKey);
    const publicUrl = publicUrlData?.publicUrl || data?.url || '';

    console.log('Public URL:', publicUrl);
  } catch (e) {
    console.error('Exception:', e);
  }
};

const run = async () => {
  const file = {
    originalname: 'test.jpg',
    buffer: Buffer.from('dummy image data'),
    mimetype: 'image/jpeg',
    size: 1024
  };
  await uploadToInsForge(file);
};

run();
