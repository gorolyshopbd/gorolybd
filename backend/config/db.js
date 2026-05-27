import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key. Cannot initialize Supabase client.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Mock flag to true so controllers bypass mock logic during migration
export let isMongoConnected = true;

const connectDB = async () => {
  if (supabaseUrl && supabaseKey) {
    console.log(`Supabase connected: ${supabaseUrl}`);
  }
};

export default connectDB;
