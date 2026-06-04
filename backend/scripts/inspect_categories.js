import { db } from '../config/db.js';

const run = async () => {
  try {
    const { data: categories, error } = await db.database.from('categories').select('*');
    if (error) throw error;
    console.log('Categories details:', JSON.stringify(categories, null, 2));
  } catch (err) {
    console.error(err);
  }
};

run();
