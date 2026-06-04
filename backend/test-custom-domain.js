import { db } from './config/db.js';

async function testColumn() {
  const { data, error } = await db.database.from('users').select('customDomain').limit(1);
  console.log('Result:', data, 'Error:', error);
}

testColumn().then(() => process.exit(0));
