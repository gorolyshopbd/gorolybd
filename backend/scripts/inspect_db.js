import { createAdminClient } from '@insforge/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const db = createAdminClient({
  baseUrl: process.env.API_BASE_URL,
  apiKey: process.env.API_KEY
});

console.log('Keys of db.database.postgrest:', Object.keys(db.database.postgrest));
if (db.database.postgrest.rpc) {
  console.log('rpc is a function on postgrest!');
}
