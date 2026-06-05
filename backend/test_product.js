import { db } from './config/db.js';

async function test() {
  try {
    const insertData = {
      user_id: 'some-dummy-id', // Wait, foreign key constraint might fail.
      name: 'Sample Name Test',
      price: 0,
      image_url: '/images/sample.jpg',
      brand: 'Sample Brand',
      category: 'Sample Category',
      count_in_stock: 0,
      description: 'Sample Description',
      discount_percent: 0,
      discount_type: 'percent',
      is_flash_sale: false,
      is_digital: false,
      digital_file_url: '',
      meta_title: '',
      meta_description: '',
      youtube_url: '',
      unit: 'pc',
      min_order_qty: 1,
      barcode: 'sample-code-' + Date.now(),
      slug: 'sample-' + Date.now(),
      shipping_days: 2,
      cash_on_delivery: true,
      is_published: true,
      is_catalog: true,
      is_todays_deal: false,
      is_featured: false,
      tags: ['SHORT_DESC:Sample Short Description'],
    };

    console.log('Inserting data...');
    let result = await db.database.from('products').insert([insertData]).select().single();
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
