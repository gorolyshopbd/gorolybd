/**
 * Run this script to fix the admin password hash in the database.
 * Usage: node fix_admin_password.js
 * 
 * This updates the admin user's password_hash to match 'admin123'.
 */

import { db } from './config/db.js';
import bcrypt from 'bcryptjs';

async function fixAdminPassword() {
  try {
    // First check if admin user exists
    const { data: user, error } = await db.database
      .from('users')
      .select('id, email, is_admin, role')
      .eq('email', 'admin@shopio.com')
      .single();

    if (error || !user) {
      console.log('Admin user not found. Creating it...');
      
      const hash = await bcrypt.hash('admin123', 10);
      const { data: newUser, error: createError } = await db.database
        .from('users')
        .insert([{
          name: 'Admin',
          email: 'admin@shopio.com',
          password_hash: hash,
          is_admin: true,
          role: 'superadmin',
          permissions: ['orders','products','categories','brands','coupons','shipping','pages','offers','banners','chat','settings','users']
        }])
        .select()
        .single();

      if (createError) {
        console.error('Failed to create admin user:', createError);
        return;
      }
      console.log('Admin user created successfully with password: admin123');
      return;
    }

    // Admin exists, update password hash
    const hash = await bcrypt.hash('admin123', 10);
    const { error: updateError } = await db.database
      .from('users')
      .update({ password_hash: hash })
      .eq('email', 'admin@shopio.com');

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return;
    }

    console.log('Admin password hash updated successfully!');
    console.log('You can now login with: admin@shopio.com / admin123');
    
    // Verify the new hash works
    const { data: updatedUser } = await db.database
      .from('users')
      .select('password_hash')
      .eq('email', 'admin@shopio.com')
      .single();
    
    const verified = await bcrypt.compare('admin123', updatedUser.password_hash);
    console.log('Password verification test:', verified ? 'PASSED' : 'FAILED');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  process.exit(0);
}

fixAdminPassword();
