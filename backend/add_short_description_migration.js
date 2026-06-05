import { db } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const migrations = [
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT ''`
];

async function runMigration() {
  console.log('dYs? Running migration...\n');
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
          console.log(`  s,?  ${colName}: ${error.message}`);
          failed++;
        } else {
          console.log(`  o. ${colName}: added`);
          success++;
        }
      } else {
        console.log(`  o. ${colName}: added`);
        success++;
      }
    } catch (err) {
      console.log(`  s,?  ${colName}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\ndY"S Done! ${success} succeeded, ${failed} warnings.`);
  process.exit(0);
}

runMigration();
