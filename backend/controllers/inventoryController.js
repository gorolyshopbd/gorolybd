import { db } from '../config/db.js';
import fetch from 'node-fetch';

export const getSuppliers = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSupplier = async (req, res) => {
  const { name, contact_email, contact_phone, lead_time_days, rating } = req.body;
  try {
    const { rows } = await db.query(`
      INSERT INTO suppliers (name, contact_email, contact_phone, lead_time_days, rating)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [name, contact_email, contact_phone, lead_time_days || 3, rating || 0]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, contact_email, contact_phone, lead_time_days, rating } = req.body;
  try {
    const { rows } = await db.query(`
      UPDATE suppliers SET name=$1, contact_email=$2, contact_phone=$3, lead_time_days=$4, rating=$5, updated_at=NOW()
      WHERE id=$6 RETURNING *
    `, [name, contact_email, contact_phone, lead_time_days, rating, id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM suppliers WHERE id=$1', [id]);
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryLogs = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT l.*, p.name as product_name
      FROM inventory_logs l
      LEFT JOIN products p ON p.id = l.product_id
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInventoryLog = async (req, res) => {
  const { product_id, type, quantity, reason } = req.body;
  try {
    const { rows } = await db.query(`
      INSERT INTO inventory_logs (product_id, type, quantity, reason)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [product_id, type, quantity, reason]);
    
    // Update product stock based on type
    if (type === 'restock' || type === 'return') {
      await db.query('UPDATE products SET count_in_stock = count_in_stock + $1 WHERE id=$2', [quantity, product_id]);
    } else if (type === 'sale' || type === 'damage') {
      await db.query('UPDATE products SET count_in_stock = count_in_stock - $1 WHERE id=$2', [quantity, product_id]);
    }
    // adjustment means replace
    else if (type === 'adjustment') {
      await db.query('UPDATE products SET count_in_stock = $1 WHERE id=$2', [quantity, product_id]);
    }

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLowStockAlerts = async (req, res) => {
  try {
    // Products where count_in_stock <= 10
    const { rows } = await db.query(`
      SELECT p.*, s.name as supplier_name, s.lead_time_days
      FROM products p
      LEFT JOIN suppliers s ON s.id = p.supplier_id
      WHERE p.count_in_stock <= 10
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAiRestockSuggestion = async (req, res) => {
  const { product_id } = req.params;
  try {
    const { rows: productRows } = await db.query('SELECT * FROM products WHERE id=$1', [product_id]);
    if (productRows.length === 0) return res.status(404).json({ message: 'Product not found' });
    const product = productRows[0];

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return res.json({ suggestion: Math.max(20, product.min_order_qty * 5), reasoning: 'Simulated suggestion (No API key)' });
    }

    const payload = [
      {
        type: 'text',
        text: `You are an AI Inventory Manager.
Product: ${product.name}
Current Stock: ${product.count_in_stock}
Min Order Qty: ${product.min_order_qty}

Based on this, what is your suggested restock quantity? Return ONLY a JSON object with two keys: "suggestion" (a number) and "reasoning" (a short sentence).`
      }
    ];

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages: [{ role: 'user', content: payload }], max_tokens: 200 }),
    });

    if (!aiRes.ok) throw new Error('AI API Error');
    const aiData = await aiRes.json();
    let resultStr = aiData.choices?.[0]?.message?.content?.trim() || '{}';
    const jsonMatch = resultStr.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) resultStr = jsonMatch[0];
    const parsed = JSON.parse(resultStr);

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
