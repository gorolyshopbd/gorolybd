import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Download, Calculator } from 'lucide-react';

export default function FinanceSystemView({ API_BASE_URL, token }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = () => {
    if (!metrics) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', metrics.totalRevenue],
      ['Total Expenses', metrics.totalExpenses],
      ['Total Ad Spend', metrics.totalAdSpend],
      ['Net Profit', metrics.netProfit],
      ['Estimated Tax (15%)', metrics.estimatedTax],
      ['Final Profit', metrics.finalProfit],
    ];
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "finance_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Finance System...</div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">Finance & Accounting</h2>
          <p className="text-gray-500 dark:text-gray-400">Track your profit, expenses, and taxes automatically.</p>
        </div>
        <button onClick={exportToCsv} className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatBox title="Total Revenue" amount={metrics?.totalRevenue || 0} color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" />
        <StatBox title="Product Cost" amount={metrics?.totalCost || 0} color="text-red-600" bg="bg-red-50 dark:bg-red-900/20" />
        <StatBox title="Ad Spend" amount={metrics?.totalAdSpend || 0} color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" />
        <StatBox title="Other Expenses" amount={metrics?.totalExpenses || 0} color="text-yellow-600" bg="bg-yellow-50 dark:bg-yellow-900/20" />
        <StatBox title="Estimated Tax (15%)" amount={metrics?.estimatedTax || 0} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" />
        <StatBox title="Net Profit" amount={metrics?.finalProfit || 0} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" isHighlight />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Calculator className="text-blue-500"/> Profit Formula</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl font-mono text-sm overflow-x-auto text-gray-700 dark:text-gray-300">
          <span className="text-green-600 font-bold">Revenue</span> - (<span className="text-red-600">Product Cost</span> + <span className="text-orange-600">Ad Spend</span> + <span className="text-yellow-600">Expenses</span>) - <span className="text-purple-600">Tax</span> = <span className="text-blue-600 font-bold">Net Profit</span>
        </div>
      </div>
    </div>
  );
}

function StatBox({ title, amount, color, bg, isHighlight }) {
  return (
    <div className={`${bg} p-6 rounded-2xl ${isHighlight ? 'border-2 border-blue-200 dark:border-blue-800 shadow-md transform scale-105' : 'border border-transparent'}`}>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
      <h3 className={`text-3xl font-bold ${color}`}>৳{Number(amount).toLocaleString()}</h3>
    </div>
  );
}
