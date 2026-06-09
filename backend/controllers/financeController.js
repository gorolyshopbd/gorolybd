import { db } from '../config/db.js';
import fetch from 'node-fetch';

export const getFinanceSummary = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;

    let dateFilter = '';
    const params = [];
    if (startDate) { dateFilter += ` AND o.created_at >= $${params.length + 1}`; params.push(startDate); }
    if (endDate) { dateFilter += ` AND o.created_at <= $${params.length + 1}`; params.push(endDate); }

    // Total Revenue from orders (exclude cancelled)
    const { rows: revenueRows } = await db.query(`
      SELECT COALESCE(SUM(o.total_price), 0) as total,
             COUNT(*) as order_count
      FROM orders o
      WHERE o.status != 'Cancelled'${dateFilter}
    `, params);
    const totalRevenue = Number(revenueRows[0].total);
    const orderCount = Number(revenueRows[0].order_count);

    // Total Product Cost (sum of purchase_price * qty for delivered/shipped order items)
    const { rows: costRows } = await db.query(`
      SELECT COALESCE(SUM(oi.qty * p.purchase_price), 0) as total
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status != 'Cancelled'${dateFilter}
    `, params);
    const totalProductCost = Number(costRows[0].total);

    // Total Expenses
    let expenseDateFilter = '';
    const expenseParams = [];
    if (startDate) { expenseDateFilter += ` AND e.date >= $${expenseParams.length + 1}`; expenseParams.push(startDate); }
    if (endDate) { expenseDateFilter += ` AND e.date <= $${expenseParams.length + 1}`; expenseParams.push(endDate); }

    const { rows: expenseRows } = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses e
      WHERE 1=1${expenseDateFilter}
    `, expenseParams);
    const totalExpenses = Number(expenseRows[0].total);

    // Profit calculation
    const grossProfit = totalRevenue - totalProductCost;
    const netProfit = grossProfit - totalExpenses;

    // Revenue by period for chart
    let revenueByPeriod = [];
    if (period === 'daily') {
      const { rows } = await db.query(`
        SELECT o.created_at::date as date,
               COALESCE(SUM(o.total_price), 0) as revenue,
               COALESCE(SUM(oi.qty * p.purchase_price), 0) as cost,
               COUNT(*) as orders
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.status != 'Cancelled'${dateFilter}
        GROUP BY o.created_at::date
        ORDER BY date DESC LIMIT 31
      `, params);
      revenueByPeriod = rows.map(r => ({
        date: r.date,
        revenue: Number(r.revenue),
        cost: Number(r.cost),
        orders: Number(r.orders),
      }));
    } else {
      const { rows } = await db.query(`
        SELECT TO_CHAR(o.created_at, 'YYYY-MM') as month,
               COALESCE(SUM(o.total_price), 0) as revenue,
               COALESCE(SUM(oi.qty * p.purchase_price), 0) as cost,
               COUNT(*) as orders
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.status != 'Cancelled'${dateFilter}
        GROUP BY month
        ORDER BY month DESC LIMIT 12
      `, params);
      revenueByPeriod = rows.map(r => ({
        month: r.month,
        revenue: Number(r.revenue),
        cost: Number(r.cost),
        orders: Number(r.orders),
      }));
    }

    // Expense by period for chart
    let expenseByPeriod = [];
    if (period === 'daily') {
      const { rows } = await db.query(`
        SELECT date, COALESCE(SUM(amount), 0) as total
        FROM expenses e WHERE 1=1${expenseDateFilter}
        GROUP BY date ORDER BY date DESC LIMIT 31
      `, expenseParams);
      expenseByPeriod = rows.map(r => ({ date: r.date, total: Number(r.total) }));
    } else {
      const { rows } = await db.query(`
        SELECT TO_CHAR(date, 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as total
        FROM expenses e WHERE 1=1${expenseDateFilter}
        GROUP BY month ORDER BY month DESC LIMIT 12
      `, expenseParams);
      expenseByPeriod = rows.map(r => ({ month: r.month, total: Number(r.total) }));
    }

    res.json({
      totalRevenue,
      totalProductCost,
      totalExpenses,
      grossProfit,
      netProfit,
      orderCount,
      revenueByPeriod,
      expenseByPeriod,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAiProfitPrediction = async (req, res) => {
  try {
    // 1. Gather historical data for the AI model
    // We'll get monthly revenue, expenses, and ad spend (from ad_campaigns)
    const { rows: financeRows } = await db.query(`
      SELECT TO_CHAR(o.created_at, 'YYYY-MM') as month,
             COALESCE(SUM(o.total_price), 0) as revenue
      FROM orders o
      WHERE o.status != 'Cancelled'
      GROUP BY month ORDER BY month DESC LIMIT 12
    `);

    const { rows: expenseRows } = await db.query(`
      SELECT TO_CHAR(date, 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as expenses
      FROM expenses
      GROUP BY month ORDER BY month DESC LIMIT 12
    `);

    let adSpendRows = [];
    try {
      const { rows } = await db.query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COALESCE(SUM(spend), 0) as ad_spend
        FROM ad_campaigns
        GROUP BY month ORDER BY month DESC LIMIT 12
      `);
      adSpendRows = rows;
    } catch (e) {
      // Table might not exist yet if migration failed, ignore
    }

    // Aggregate into a single dataset
    const monthlyData = {};
    financeRows.forEach(r => { monthlyData[r.month] = { ...monthlyData[r.month], revenue: Number(r.revenue) }; });
    expenseRows.forEach(r => { monthlyData[r.month] = { ...monthlyData[r.month], expenses: Number(r.expenses) }; });
    adSpendRows.forEach(r => { monthlyData[r.month] = { ...monthlyData[r.month], ad_spend: Number(r.ad_spend) }; });

    const dataArray = Object.keys(monthlyData).sort().map(month => ({
      month,
      revenue: monthlyData[month].revenue || 0,
      expenses: monthlyData[month].expenses || 0,
      ad_spend: monthlyData[month].ad_spend || 0,
      profit: (monthlyData[month].revenue || 0) - (monthlyData[month].expenses || 0)
    }));

    // 2. Call OpenRouter AI
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      // Return a simulated prediction if no API key is provided
      const simulatedPrediction = [];
      let lastProfit = dataArray.length > 0 ? dataArray[dataArray.length - 1].profit : 1000;
      for (let i = 1; i <= 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() + i);
        lastProfit = lastProfit * (1 + (Math.random() * 0.1 - 0.02)); // Random -2% to +8% growth
        simulatedPrediction.push({
          month: d.toISOString().substring(0, 7),
          predicted_profit: Math.round(lastProfit),
          predicted_revenue: Math.round(lastProfit * 1.5)
        });
      }
      return res.json({ predictions: simulatedPrediction, note: 'Simulated (Missing OPENROUTER_API_KEY)' });
    }

    const payload = [
      {
        type: 'text',
        text: `Analyze the following historical e-commerce monthly data:
${JSON.stringify(dataArray, null, 2)}

Based on sales trends, seasonality, and expenses, predict the "predicted_revenue" and "predicted_profit" for the NEXT 6 months.
Return the output strictly as a JSON object containing an array called "predictions". Each object in the array MUST have exactly three keys: "month" (YYYY-MM format), "predicted_revenue" (number), and "predicted_profit" (number). Do NOT include markdown blocks, just the raw JSON.`
      }
    ];

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages: [{ role: 'user', content: payload }], max_tokens: 500 }),
    });

    if (!aiRes.ok) {
      throw new Error('AI API Error');
    }
    
    const aiData = await aiRes.json();
    let resultStr = aiData.choices?.[0]?.message?.content?.trim() || '{}';
    
    // Clean markdown if present
    const jsonMatch = resultStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) resultStr = jsonMatch[0];

    const parsed = JSON.parse(resultStr);
    res.json({ predictions: parsed.predictions || [], historical: dataArray });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
