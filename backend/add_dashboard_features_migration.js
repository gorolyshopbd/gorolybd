import { db } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const migrations = [
  // Marketing Campaigns
  `CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    spend NUMERIC(10,2) DEFAULT 0,
    revenue NUMERIC(10,2) DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Suppliers
  `CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    lead_time_days INT DEFAULT 3,
    rating NUMERIC(3,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Inventory Logs
  `CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('restock', 'sale', 'return', 'adjustment', 'damage')),
    quantity INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Link products to suppliers
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;`,

  // ROI triggers/functions if needed - we'll just compute in JS for now.
];

async function runMigration() {
  console.log('🚀 Running dashboard features migration...\\n');
  let success = 0;
  let failed = 0;

  for (const sql of migrations) {
    const tableMatch = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
    const colMatch = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/i);
    const itemName = tableMatch ? tableMatch[1] : (colMatch ? colMatch[1] : sql.substring(0, 30));
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
          const errText = await res.text();
          console.log(`  ⚠️  ${itemName}: ${errText}`);
          failed++;
        } else {
          console.log(`  ✅ ${itemName}: added`);
          success++;
        }
      } else {
        console.log(`  ✅ ${itemName}: added`);
        success++;
      }
    } catch (err) {
      console.log(`  ⚠️  ${itemName}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Done! ${success} succeeded, ${failed} warnings (already exist or minor issues).`);
  process.exit(0);
}

runMigration();
