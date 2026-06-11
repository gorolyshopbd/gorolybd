import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gorolyshop';

if (!process.env.DATABASE_URL) {
  console.warn('Missing DATABASE_URL in .env file. Using default connection string.');
}

const pool = new Pool({
  connectionString,
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err.message);
});

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.action = 'select'; // select, insert, update, delete
    this.cols = '*';
    this.wheres = [];
    this.values = [];
    this.isSingle = false;
    this.limitCount = null;
    this.offsetCount = null;
    this.orderCol = null;
    this.isHead = false;
    this.orderAsc = true;
    this.insertData = null;
    this.updateData = null;
    this.returningCols = null;
    this.isCount = false;
  }

  select(cols = '*', options = {}) {
    if (this.action === 'insert' || this.action === 'update') {
      this.returningCols = cols;
    } else {
      this.action = 'select';
      this.cols = cols;
    }
    if (options.count) this.isCount = true;
    if (options.head) this.isHead = true;  // head:true = count only, no data
    return this;
  }

  insert(data) {
    this.action = 'insert';
    this.insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data) {
    this.action = 'update';
    this.updateData = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(col, val) {
    this.values.push(val);
    this.wheres.push(`${col} = $${this.values.length}`);
    return this;
  }

  neq(col, val) {
    this.values.push(val);
    this.wheres.push(`${col} != $${this.values.length}`);
    return this;
  }

  in(col, arr) {
    if (!arr || arr.length === 0) {
      this.wheres.push('1=0');
      return this;
    }
    const placeholders = arr.map((val) => {
      this.values.push(val);
      return `$${this.values.length}`;
    }).join(', ');
    this.wheres.push(`${col} IN (${placeholders})`);
    return this;
  }

  gte(col, val) {
    this.values.push(val);
    this.wheres.push(`${col} >= $${this.values.length}`);
    return this;
  }

  lte(col, val) {
    this.values.push(val);
    this.wheres.push(`${col} <= $${this.values.length}`);
    return this;
  }

  gt(col, val) {
    this.values.push(val);
    this.wheres.push(`${col} > $${this.values.length}`);
    return this;
  }

  lt(col, val) {
    this.values.push(val);
    this.wheres.push(`${col} < $${this.values.length}`);
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    this.limitCount = 1;
    return this;
  }
  
  ilike(col, val) {
    this.values.push(val);
    this.wheres.push(`${col} ILIKE $${this.values.length}`);
    return this;
  }

  or(queryStr) {
    // Parses string like "phone.eq.1234,email.eq.test@test.com"
    const parts = queryStr.split(',');
    const conditions = parts.map(part => {
      const [col, op, ...valParts] = part.split('.');
      const val = valParts.join('.');
      this.values.push(val);
      if (op === 'eq') return `${col} = $${this.values.length}`;
      if (op === 'ilike') return `${col} ILIKE $${this.values.length}`;
      return `${col} = $${this.values.length}`;
    });
    this.wheres.push(`(${conditions.join(' OR ')})`);
    return this;
  }

  single() {
    this.isSingle = true;
    this.limitCount = 1;
    return this;
  }

  limit(n) {
    this.limitCount = n;
    return this;
  }

  range(from, to) {
    this.limitCount = to - from + 1;
    this.offsetCount = from;
    return this;
  }

  order(col, opts = { ascending: false }) {
    this.orderCol = col;
    this.orderAsc = opts.ascending;
    return this;
  }

  async execute() {
    let sql = '';
    
    if (this.action === 'select') {
      if (this.isHead) {
        // head: true - only need total count, no data
        sql = `SELECT COUNT(*) AS _total_count FROM ${this.table}`;
        if (this.wheres.length > 0) {
          sql += ` WHERE ${this.wheres.join(' AND ')}`;
        }
      } else {
        // If isCount requested along with actual columns (count: 'exact' mode), use window function
        const colExpr = this.isCount ? `${this.cols}, COUNT(*) OVER() AS _total_count` : this.cols;
        sql = `SELECT ${colExpr} FROM ${this.table}`;
        if (this.wheres.length > 0) {
          sql += ` WHERE ${this.wheres.join(' AND ')}`;
        }
        if (this.orderCol) {
          sql += ` ORDER BY ${this.orderCol} ${this.orderAsc ? 'ASC' : 'DESC'}`;
        }
        if (this.limitCount) {
          sql += ` LIMIT ${this.limitCount}`;
        }
        if (this.offsetCount) {
          sql += ` OFFSET ${this.offsetCount}`;
        }
      }
    } else if (this.action === 'insert') {
      if (!this.insertData || this.insertData.length === 0) {
        return { data: null, error: new Error('No data to insert') };
      }
      const cols = Object.keys(this.insertData[0]);
      const colStr = cols.join(', ');
      
      const valStrings = [];
      for (const row of this.insertData) {
        const rowVals = [];
        for (const col of cols) {
          this.values.push(row[col]);
          rowVals.push(`$${this.values.length}`);
        }
        valStrings.push(`(${rowVals.join(', ')})`);
      }
      
      sql = `INSERT INTO ${this.table} (${colStr}) VALUES ${valStrings.join(', ')}`;
      if (this.returningCols) {
        sql += ` RETURNING ${this.returningCols}`;
      }
    } else if (this.action === 'update') {
      if (!this.updateData || Object.keys(this.updateData).length === 0) {
        return { data: null, error: new Error('No data to update') };
      }
      const setStrings = [];
      for (const [col, val] of Object.entries(this.updateData)) {
        this.values.push(val);
        setStrings.push(`${col} = $${this.values.length}`);
      }
      sql = `UPDATE ${this.table} SET ${setStrings.join(', ')}`;
      if (this.wheres.length > 0) {
        sql += ` WHERE ${this.wheres.join(' AND ')}`;
      }
      if (this.returningCols || this.isSingle) {
        sql += ` RETURNING ${this.returningCols || '*'}`;
      }
    } else if (this.action === 'delete') {
      sql = `DELETE FROM ${this.table}`;
      if (this.wheres.length > 0) {
        sql += ` WHERE ${this.wheres.join(' AND ')}`;
      }
    }

    try {
      const res = await pool.query(sql, this.values);
      if (this.isHead) {
        // head: true - count only, no data
        const total = res.rows.length > 0 ? parseInt(res.rows[0]._total_count || 0) : 0;
        return { data: null, count: total, error: null };
      }
      if (this.isCount) {
        // count: 'exact' mode - data rows have _total_count window column
        const total = res.rows.length > 0 ? parseInt(res.rows[0]._total_count || 0) : 0;
        const rows = res.rows.map(r => { const { _total_count, ...rest } = r; return rest; });
        if (this.isSingle) {
          return { data: rows[0] || null, count: total, error: null };
        }
        return { data: rows, count: total, error: null };
      }
      if (this.action === 'delete' || (this.action === 'update' && !this.returningCols && !this.isSingle)) {
        return { data: null, error: null };
      }
      if (this.isSingle) {
        return { data: res.rows[0] || null, error: null };
      }
      return { data: res.rows, error: null };
    } catch (err) {
      console.error('Adapter Query Error:', err.message, '\nSQL:', sql, '\nValues:', this.values);
      return { data: null, error: err };
    }
  }

  then(resolve, reject) {
    return this.execute().then(resolve).catch((err) => resolve({ data: null, error: err }));
  }
}

export const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  database: {
    from: (table) => new QueryBuilder(table),
  },
  auth: {
    // Stub out auth if any controllers use db.auth by accident (most use JWT)
    admin: {
      deleteUser: async (id) => { return { data: null, error: null }; }
    }
  }
};

export let isMongoConnected = true;

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`PostgreSQL connected to ${client.connectionParameters.database}`);
    
    // Enable uuid-ossp extension for UUID generation
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Auto-create chat_messages table if missing
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Auto-create roles table if missing
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        label VARCHAR(100) NOT NULL,
        permissions TEXT[] DEFAULT '{}',
        description TEXT DEFAULT '',
        is_system BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migration: add is_system column if it doesn't exist (old tables created before column was added)
    await client.query(`
      ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false
    `);
    
    // Seed default roles if table is empty
    const { rows: existing } = await client.query('SELECT count(*)::int as cnt FROM roles');
    if (existing[0].cnt === 0) {
      await client.query(`
        INSERT INTO roles (name, label, permissions, description, is_system) VALUES
        ('superadmin', 'Super Admin', ARRAY['orders','products','categories','brands','coupons','shipping','pages','offers','banners','chat','settings','users','expenses','finance'], 'Full system access with user management', true),
        ('admin', 'Admin', ARRAY['orders','products','categories','brands','coupons','shipping','pages','offers','banners','chat','settings','expenses','finance'], 'Admin access without user management', true),
        ('manager', 'Manager', ARRAY['orders','products','categories','brands','coupons','shipping','pages','offers','banners','chat'], 'Manager access without settings and users', true),
        ('moderator', 'Moderator', ARRAY['orders','chat','products'], 'Limited access to orders, chat and products', true),
        ('seller', 'Seller', ARRAY['products','orders','chat'], 'Seller access to their own products and orders', true),
        ('customer', 'Customer', ARRAY[]::TEXT[], 'Regular customer with no admin access', true)
      `);
    } else {
      // Ensure existing system roles are flagged (handles legacy rows where is_system was NULL)
      await client.query(`
        UPDATE roles SET is_system = true WHERE is_system IS NOT true AND name IN ('superadmin','admin','manager','moderator','seller','customer')
      `);
      // Migrate existing superadmin and admin roles to include new permissions
      await client.query(`
        UPDATE roles SET permissions = ARRAY(SELECT DISTINCT unnest(permissions || ARRAY['expenses','finance'])) WHERE name IN ('superadmin','admin')
      `);
    }
    
    // Remove CHECK constraint on users.role to allow custom roles
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
    `);
    
    // Remove CHECK constraint on settings.otp_gateway to allow 'Email' gateway
    await client.query(`
      ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_otp_gateway_check
    `);
    
    // Fraud Checker: add ip_address + device_fingerprint columns to orders
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address TEXT DEFAULT ''
    `);
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS device_fingerprint TEXT DEFAULT ''
    `);
    
    // Fraud Checker: blocked_phones table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocked_phones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone TEXT NOT NULL UNIQUE,
        reason TEXT DEFAULT '',
        blocked_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Fraud Checker: blocked_ips table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocked_ips (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ip_address TEXT NOT NULL UNIQUE,
        reason TEXT DEFAULT '',
        blocked_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Expense System table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        description TEXT DEFAULT '',
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Marketing Campaigns
    await client.query(`
      CREATE TABLE IF NOT EXISTS ad_campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      )
    `);

    // Suppliers
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        contact_email TEXT,
        contact_phone TEXT,
        lead_time_days INT DEFAULT 3,
        rating NUMERIC(3,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Inventory Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        type TEXT CHECK (type IN ('restock', 'sale', 'return', 'adjustment', 'damage')),
        quantity INT NOT NULL,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Product supplier link
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL
    `);

    // Add missing category columns for subcategories and root category
    await client.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS root_category TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS subcategories TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;
    `);

    // Fraud & Risk Tracking columns
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS risk_score INT DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_fraud BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS fraud_score INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
    `);
    
    client.release();
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
  }
};

export default connectDB;
