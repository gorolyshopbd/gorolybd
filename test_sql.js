import { db } from './backend/config/db.js';

async function test() {
  try {
    await db.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS root_category TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS subcategories TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;
    `);
    console.log('Query OK');
  } catch (err) {
    console.error('Query Error:', err);
  }
  process.exit(0);
}

test();
