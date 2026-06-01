import { db } from './config/db.js';

async function test() {
  try {
    const { data: categories } = await db.database.from('categories').select('*');
    console.log('Categories:', categories);
    
    const { data: brands } = await db.database.from('brands').select('*');
    console.log('Brands:', brands);
  } catch (err) {
    console.error('Catch error:', err);
  }
}

test();
