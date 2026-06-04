import { db } from '../config/db.js';

const run = async () => {
  try {
    const { data: products, error } = await db.database.from('products').select('name, image_url');
    if (error) throw error;
    console.log('Products image_urls:');
    products.forEach(p => {
      console.log(`- ${p.name}: "${p.image_url}"`);
    });
  } catch (err) {
    console.error(err);
  }
};

run();
