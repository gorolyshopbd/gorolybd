import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, Activity, Package, AlertCircle, TrendingUp, Cpu } from 'lucide-react';

export default function SmartDashboardView({ API_BASE_URL, token, user }) {
  const [metrics, setMetrics] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/summary`, {
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

  const runAiPrediction = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch(`${API_BASE_URL}/finance/ai-prediction`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAiPrediction(data.predictions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading AI Dashboard...</div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={`৳${metrics?.totalRevenue?.toLocaleString() || 0}`} icon={<DollarSign />} bg="bg-gradient-to-br from-emerald-500 to-green-600" />
        <MetricCard title="Total Orders" value={metrics?.totalOrders || 0} icon={<Package />} bg="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <MetricCard title="Risk Orders (Pending)" value={metrics?.pendingOrders || 0} icon={<AlertCircle />} bg="bg-gradient-to-br from-rose-500 to-red-600" />
        <MetricCard title="Customers" value={metrics?.totalCustomers || 0} icon={<Activity />} bg="bg-gradient-to-br from-violet-500 to-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Revenue vs Cost</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.revenueOverview || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="Cost" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Prediction Widget */}
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Cpu className="text-purple-400" /> AI Profit Engine</h3>
          <p className="text-purple-200 text-sm mb-6">Predict future revenue & profit trends based on your historical data.</p>
          
          {!aiPrediction ? (
            <button onClick={runAiPrediction} disabled={loadingAi} className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all">
              {loadingAi ? <Activity className="animate-spin" /> : <TrendingUp />}
              {loadingAi ? 'Analyzing Data...' : 'Generate Prediction'}
            </button>
          ) : (
            <div className="h-48 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aiPrediction}>
                    <XAxis dataKey="month" tick={{fill: '#d8b4fe', fontSize: 10}} tickLine={false} axisLine={false}/>
                    <RechartsTooltip contentStyle={{backgroundColor: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: '8px', color: '#fff'}} cursor={{fill: 'rgba(255,255,255,0.1)'}} />
                    <Bar dataKey="predicted_profit" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      
      {/* Top Products */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Product</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Price</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Units Sold</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(metrics?.topSellingProducts || []).map(p => (
                <tr key={p._id} className="border-b border-gray-100 dark:border-gray-750 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={p.image || '/placeholder.png'} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="py-3 px-4">৳{p.price}</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{p.soldCount}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">৳{p.totalSales.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, bg }) {
  return (
    <div className={`relative overflow-hidden ${bg} text-white p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform`}>
      <div className="absolute right-0 top-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/80 font-medium mb-1">{title}</p>
          <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
        </div>
        <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
