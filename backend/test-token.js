import { supabase } from './config/db.js';
import generateToken from './utils/generateToken.js';

async function generateAdminToken() {
  const { data: user, error } = await supabase.from('users').select('*').limit(1).single();
  if (user) {
    console.log("Found user:", user.email);
    const token = generateToken(user.id);
    console.log("Generated token:", token);
    
    // Test the API directly
    const fetch = (await import('node-fetch')).default || globalThis.fetch;
    const res = await fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Profile API response:", data);
  } else {
    console.log("No user found", error);
  }
}
generateAdminToken();
