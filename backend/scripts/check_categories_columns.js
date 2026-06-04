import { createAdminClient } from '@insforge/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const db = createAdminClient({
  baseUrl: process.env.API_BASE_URL,
  apiKey: process.env.API_KEY
});

async function run() {
  const { data, error } = await db.database.postgrest.rpc('exec_sql', {
    query: `SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'categories';`
  });
  console.log('Result:', data);
  if (error) console.error('Error:', error);
}

run();
