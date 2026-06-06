import { db } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const migrations = [
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price NUMERIC DEFAULT 0;`
];

async function runMigration() {
  console.log('🚀 Running purchase_price migration...\n');
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
