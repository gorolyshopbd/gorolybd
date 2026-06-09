import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getInventoryLogs,
  createInventoryLog,
  getLowStockAlerts,
  getAiRestockSuggestion
} from '../controllers/inventoryController.js';

const router = express.Router();

router.route('/suppliers')
  .get(protect, admin, getSuppliers)
  .post(protect, admin, createSupplier);

router.route('/suppliers/:id')
  .put(protect, admin, updateSupplier)
  .delete(protect, admin, deleteSupplier);

router.route('/logs')
  .get(protect, admin, getInventoryLogs)
  .post(protect, admin, createInventoryLog);

router.route('/low-stock')
  .get(protect, admin, getLowStockAlerts);

router.route('/ai-restock/:product_id')
  .get(protect, admin, getAiRestockSuggestion);

export default router;
