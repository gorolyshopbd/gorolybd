import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://bjvfoojopuuykgksjyeq.supabase.co';
const supabaseKey = 'sb_publishable_K45yDS77uVVzO93heFDaGQ_LyWo_b_6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding admin user...');
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('admin123', salt);

  const { data, error } = await supabase.from('users').insert({
    name: 'Asif Hossain',
    email: 'admin@shopio.com',
    password_hash,
    phone: '01700000000',
    is_admin: true,
    role: 'superadmin',
    permissions: ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat', 'settings', 'users']
  }).select();

  if (error) {
    console.error('Error seeding admin user:', error.message);
  } else {
    console.log('Admin user seeded successfully:', data);
  }
}

seed();
