import { db } from '../config/db.js';

const runMigration = async () => {
  try {
    console.log('Checking current categories table schema...');
    
    // Fetch one category to see what columns are available
    const { data: categories, error } = await db.database.from('categories').select('*').limit(1);
    
    if (error) {
      console.error('Error fetching categories:', error);
      console.log('This might indicate the migration needs to be applied.');
    } else {
      console.log('✓ Current categories schema:');
      if (categories && categories.length > 0) {
        console.log('Available columns:', Object.keys(categories[0]));
        if (categories[0].banner_url !== undefined) {
          console.log('✓ banner_url column already exists!');
        } else {
          console.log('⚠ banner_url column is missing');
        }
      } else {
        console.log('No categories found, but table exists');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

runMigration();
