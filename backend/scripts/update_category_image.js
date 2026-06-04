import { db } from '../config/db.js';

const run = async () => {
  try {
    const { data: category, error } = await db.database
      .from('categories')
      .update({ image_url: 'https://z6zhffa4.ap-southeast.insforge.app/api/storage/buckets/product/objects/products%2F1780495488051-bdlh6n.jpg?v=75375ce88523c2ddf1a28e3735ebbf7e' })
      .eq('name', 'Autism Care Shop')
      .select()
      .single();

    if (error) throw error;
    console.log('Updated category successfully:', category);
  } catch (err) {
    console.error(err);
  }
};

run();
