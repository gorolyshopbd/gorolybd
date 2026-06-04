import { db } from './config/db.js';

const migrations = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS steadfast_api_key TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS steadfast_secret_key TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS steadfast_enabled BOOLEAN DEFAULT false`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS order_automation_enabled BOOLEAN DEFAULT false`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS twilio_from_number TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS elevenlabs_api_key TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS elevenlabs_voice_id TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS openai_api_key TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS openai_model TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "customDomain" TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_name TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS division TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS district TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS upazila TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS address_details TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS nid_number TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS nid_image_front TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS nid_image_back TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'None'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS extra_delivery_time INTEGER DEFAULT 0`,
];

async function runMigration() {
  console.log('🚀 Running migration...\n');
  let success = 0;
  let failed = 0;

  for (const sql of migrations) {
    const colMatch = sql.match(/ADD COLUMN IF NOT EXISTS "?(\w+)"?/i);
    const colName = colMatch ? colMatch[1] : sql;
    try {
      const { error } = await db.database.rpc('run_sql', { query: sql });
      if (error) {
        // Try direct query
        const res = await fetch(`${process.env.API_BASE_URL}/rest/v1/rpc/run_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.API_KEY,
            'Authorization': `Bearer ${process.env.API_KEY}`,
          },
          body: JSON.stringify({ query: sql })
        });
        if (!res.ok) {
          console.log(`  ⚠️  ${colName}: ${error.message}`);
          failed++;
        } else {
          console.log(`  ✅ ${colName}: added`);
          success++;
        }
      } else {
        console.log(`  ✅ ${colName}: added`);
        success++;
      }
    } catch (err) {
      console.log(`  ⚠️  ${colName}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Done! ${success} succeeded, ${failed} warnings (columns may already exist).`);
  process.exit(0);
}

runMigration();
