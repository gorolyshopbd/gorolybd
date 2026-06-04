import { createAdminClient } from '@insforge/sdk';
import dotenv from 'dotenv';
dotenv.config();

const db = createAdminClient({
  baseUrl: process.env.API_BASE_URL || '',
  apiKey: process.env.API_KEY || ''
});

async function checkColumn() {
  const { data, error } = await db.database.from('users').select('steadfast_api_key').limit(1);

  if (error) {
    console.error('Error querying steadfast_api_key:', error.message);
    process.exit(1);
  } else {
    console.log('Column steadfast_api_key exists! Data:', data);
    process.exit(0);
  }
}

checkColumn();
