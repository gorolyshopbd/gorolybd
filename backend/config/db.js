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

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.action = 'select'; // select, insert, update, delete
    this.cols = '*';
    this.wheres = [];
    this.values = [];
    this.isSingle = false;
    this.limitCount = null;
    this.orderCol = null;
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

  order(col, opts = { ascending: false }) {
    this.orderCol = col;
    this.orderAsc = opts.ascending;
    return this;
  }

  async execute() {
    let sql = '';
    
    if (this.action === 'select') {
      sql = `SELECT ${this.isCount ? 'count(*)' : this.cols} FROM ${this.table}`;
      if (this.wheres.length > 0) {
        sql += ` WHERE ${this.wheres.join(' AND ')}`;
      }
      if (this.orderCol) {
        sql += ` ORDER BY ${this.orderCol} ${this.orderAsc ? 'ASC' : 'DESC'}`;
      }
      if (this.limitCount) {
        sql += ` LIMIT ${this.limitCount}`;
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
      if (this.isCount) {
        return { data: null, count: parseInt(res.rows[0].count), error: null };
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
    
    // Seed default roles if table is empty
    const { rows: existing } = await client.query('SELECT count(*)::int as cnt FROM roles');
    if (existing[0].cnt === 0) {
      await client.query(`
        INSERT INTO roles (name, label, permissions, description, is_system) VALUES
        ('superadmin', 'Super Admin', ARRAY['orders','products','categories','brands','coupons','shipping','pages','offers','banners','chat','settings','users'], 'Full system access with user management', true),
        ('admin', 'Admin', ARRAY['orders','products','categories','brands','coupons','shipping','pages','offers','banners','chat','settings'], 'Admin access without user management', true),
        ('manager', 'Manager', ARRAY['orders','products','categories','brands','coupons','shipping','pages','offers','banners','chat'], 'Manager access without settings and users', true),
        ('moderator', 'Moderator', ARRAY['orders','chat','products'], 'Limited access to orders, chat and products', true),
        ('seller', 'Seller', ARRAY['products','orders','chat'], 'Seller access to their own products and orders', true),
        ('customer', 'Customer', ARRAY[]::TEXT[], 'Regular customer with no admin access', true)
      `);
    }
    
    // Remove CHECK constraint on users.role to allow custom roles
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
    `);
    
    client.release();
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
  }
};

export default connectDB;
