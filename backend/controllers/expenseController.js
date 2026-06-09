import { db } from '../config/db.js';

const EXPENSE_CATEGORIES = [
  'Ads', 'Delivery', 'Packaging', 'Utilities', 'Rent',
  'Salaries', 'Marketing', 'Maintenance', 'Office Supplies',
  'Software', 'Travel', 'Food', 'Tax', 'Insurance', 'Other'
];

export const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let query = db.database.from('expenses').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
    if (category) query = query.eq('category', category);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    const { data, error } = await query.execute();
    if (error) throw error;
    const formatted = (data || []).map(e => ({ ...e, _id: e.id, amount: Number(e.amount) }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;
    if (!category || amount === undefined) {
      return res.status(400).json({ message: 'Category and amount are required' });
    }
    const { data: expense, error } = await db.database.from('expenses').insert({
      category,
      amount: Number(amount),
      description: description || '',
      date: date || new Date().toISOString().split('T')[0],
      created_by: req.user._id,
    }).select('*').single().execute();
    if (error) throw error;
    res.status(201).json({ ...expense, _id: expense.id, amount: Number(expense.amount) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;
    const updateData = {};
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    const { data: expense, error } = await db.database.from('expenses').update(updateData).eq('id', req.params.id).select('*').single().execute();
    if (error || !expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ ...expense, _id: expense.id, amount: Number(expense.amount) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { error } = await db.database.from('expenses').delete().eq('id', req.params.id).execute();
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    const dateFilter = [];
    const params = [];
    if (startDate) { dateFilter.push(`e.date >= $${params.length + 1}`); params.push(startDate); }
    if (endDate) { dateFilter.push(`e.date <= $${params.length + 1}`); params.push(endDate); }
    const whereClause = dateFilter.length > 0 ? `WHERE ${dateFilter.join(' AND ')}` : '';

    const { rows: totalResult } = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses e ${whereClause}
    `, params);
    const totalExpenses = Number(totalResult[0].total);

    const { rows: categoryResult } = await db.query(`
      SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
      FROM expenses e ${whereClause}
      GROUP BY category ORDER BY total DESC
    `, params);

    let dailySummary = [];
    let monthlySummary = [];
    const groupBy = period || 'monthly';
    if (groupBy === 'daily') {
      const { rows } = await db.query(`
        SELECT date, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
        FROM expenses e ${whereClause}
        GROUP BY date ORDER BY date DESC LIMIT 31
      `, params);
      dailySummary = rows.map(r => ({ ...r, total: Number(r.total), count: Number(r.count) }));
    } else {
      const { rows } = await db.query(`
        SELECT TO_CHAR(date, 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
        FROM expenses e ${whereClause}
        GROUP BY month ORDER BY month DESC LIMIT 12
      `, params);
      monthlySummary = rows.map(r => ({ ...r, total: Number(r.total), count: Number(r.count) }));
    }

    res.json({
      totalExpenses,
      categories: categoryResult.map(r => ({ category: r.category, total: Number(r.total), count: Number(r.count) })),
      dailySummary,
      monthlySummary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
