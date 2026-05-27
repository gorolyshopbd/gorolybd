import { supabase } from './config/db.js';

async function test() {
  console.log("Testing insert...");
  const { data: product, error } = await supabase.from('products').insert({
    name: 'Sample Name',
    price: 0,
    image_url: '/images/sample.jpg',
    brand: 'Sample Brand',
    category: 'Sample Category',
    count_in_stock: 0,
    description: 'Sample Description',
    discount_percent: 0,
    is_flash_sale: false,
    is_digital: false,
    digital_file_url: '',
    meta_title: '',
    meta_description: '',
    tags: [],
    youtube_url: '',
  }).select().single();
  
  if (error) {
    console.error("DB Error:", error);
  } else {
    console.log("Success:", product.id);
  }
}
test();
