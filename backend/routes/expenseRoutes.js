import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary,
} from '../controllers/expenseController.js';

const router = express.Router();

router.route('/').get(protect, admin, getExpenses).post(protect, admin, createExpense);
router.route('/summary').get(protect, admin, getExpenseSummary);
router.route('/:id').put(protect, admin, updateExpense).delete(protect, admin, deleteExpense);

export default router;
