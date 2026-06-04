import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createAdminClient } from '@insforge/sdk';

dotenv.config({ path: './.env' });

const apiUrl = process.env.API_BASE_URL;
const apiKey = process.env.API_KEY;

if (!apiUrl || !apiKey) {
  console.error('Missing InsForge URL or Key');
  process.exit(1);
}

const db = createAdminClient({ baseUrl: apiUrl, apiKey });

async function createOrUpdateAdmin() {
  const email = 'admin@gorolyshop.com';
  const password = 'password';

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data: user } = await db.database.from('users').select('*').eq('email', email).single();

    if (user) {
      console.log('User found, updating password to "password" and setting admin...');
      const { error } = await db.database.from('users').update({
        password_hash,
        is_admin: true,
        role: 'superadmin'
      }).eq('email', email);
      
      if (error) throw error;
      console.log('Successfully updated admin user.');
    } else {
      console.log('User not found, creating new admin...');
      const { error } = await db.database.from('users').insert({
        name: 'Admin',
        email,
        password_hash,
        phone: '1234567890',
        is_admin: true,
        role: 'superadmin',
        permissions: ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat', 'settings', 'users']
      });
      
      if (error) throw error;
      console.log('Successfully created admin user.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

createOrUpdateAdmin();
