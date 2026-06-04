import { db } from '../config/db.js';

const run = async () => {
  try {
    const urlResult = db.storage.from('product').getPublicUrl('products/test.png');
    console.log('getPublicUrl result:', urlResult);
    console.log('type of getPublicUrl result:', typeof urlResult);
    if (urlResult && typeof urlResult === 'object') {
      console.log('keys of getPublicUrl result:', Object.keys(urlResult));
      console.log('data property:', urlResult.data);
    }
  } catch (err) {
    console.error(err);
  }
};

run();
