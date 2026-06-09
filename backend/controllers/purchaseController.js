import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'purchases.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2));
}

// Helper to read purchases
const readPurchases = () => {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading purchases file:', err);
    return [];
  }
};

// Helper to write purchases
const writePurchases = (purchases) => {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(purchases, null, 2));
  } catch (err) {
    console.error('Error writing purchases file:', err);
  }
};

// @desc    Get all product purchases
// @route   GET /api/purchases
// @access  Private/Admin
const getPurchases = async (req, res) => {
  try {
    const purchases = readPurchases();
    res.json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new product purchase record
// @route   POST /api/purchases
// @access  Private/Admin
const createPurchase = async (req, res) => {
  const { productId, productName, quantity, purchaseCost, supplier, purchaseDate } = req.body;

  if (!productId || !productName || !quantity || !purchaseCost || !supplier) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const newPurchase = {
      id: `PUR-${Date.now()}`,
      productId,
      productName,
      quantity: Number(quantity),
      purchaseCost: Number(purchaseCost),
      supplier,
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    // Save purchase record in local JSON file
    const purchases = readPurchases();
    purchases.unshift(newPurchase); // new purchases at the top
    writePurchases(purchases);

    // Try to update product stock and purchase price in DB
    try {
      const result = await db.database.from('products').select('*').eq('id', productId).single().execute();
      if (result && result.data) {
        const product = result.data;
        const currentStock = Number(product.count_in_stock || 0);
        const newStock = currentStock + Number(quantity);

        await db.database.from('products').update({
          count_in_stock: newStock,
          purchase_price: Number(purchaseCost)
        }).eq('id', productId).execute();
        
        console.log(`[createPurchase] Database updated for product ${productId}. Stock: ${newStock}, Purchase Price: ${purchaseCost}`);
      } else {
        console.warn(`[createPurchase] Product ${productId} not found in DB to update stock.`);
      }
    } catch (dbErr) {
      console.warn('[createPurchase] DB update failed (could be database offline):', dbErr.message);
    }

    res.status(201).json({ success: true, data: newPurchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getPurchases,
  createPurchase
};
