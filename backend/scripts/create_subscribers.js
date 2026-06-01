import { createAdminClient } from '@insforge/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const db = createAdminClient({
  baseUrl: process.env.API_BASE_URL,
  apiKey: process.env.API_KEY
});

async function run() {
  const { data, error } = await db.rpc('exec_sql', {
    query: 'CREATE TABLE IF NOT EXISTS subscribers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ DEFAULT NOW());'
  });
  console.log('Result:', data);
  if (error) console.error('Error:', error);
}

run();
