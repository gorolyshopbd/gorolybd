import { db } from './config/db.js';

async function test() {
  const { data: products } = await db.database.from('products').select('id').limit(1);
  if (products && products.length > 0) {
    const testId = products[0].id;
    console.log('Testing with product ID:', testId);
    
    const { data: existing, error } = await db.database.from('products').select('id').in('id', [testId]);
    console.log('Result of .in query:', existing, 'Error:', error);
  } else {
    console.log('No products found in DB to test.');
  }
}

test().then(() => process.exit(0));
