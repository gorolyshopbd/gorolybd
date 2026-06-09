import React, { useState, useEffect } from 'react';
import { PackageSearch, Truck, AlertTriangle, Cpu } from 'lucide-react';

export default function InventoryManagementView({ API_BASE_URL, token }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [loadingAi, setLoadingAi] = useState({});

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/low-stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSuggestion = async (productId) => {
    setLoadingAi(prev => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/ai-restock/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAiSuggestions(prev => ({ ...prev, [productId]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Inventory...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-2xl border border-red-100 dark:border-red-800">
        <AlertTriangle size={32} />
        <div>
          <h2 className="text-xl font-bold">Low Stock Alerts</h2>
          <p>The following items need immediate restocking to prevent stockouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <img src={item.image_url || item.image || '/placeholder.png'} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{item.name}</h3>
                <span className="text-sm text-red-600 font-bold">{item.count_in_stock} in stock</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
              <Truck size={16} /> Supplier: {item.supplier_name || 'Unknown'} ({item.lead_time_days || 3} days)
            </div>

            {aiSuggestions[item.id] ? (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-sm border border-purple-100 dark:border-purple-800">
                <div className="font-bold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1"><Cpu size={14}/> AI Suggestion</div>
                <p className="text-gray-700 dark:text-gray-300">Order: <span className="font-bold text-lg">{aiSuggestions[item.id].suggestion} units</span></p>
                <p className="text-purple-600/80 dark:text-purple-400/80 text-xs mt-1">{aiSuggestions[item.id].reasoning}</p>
              </div>
            ) : (
              <button 
                onClick={() => fetchAiSuggestion(item.id)} 
                disabled={loadingAi[item.id]}
                className="w-full flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                {loadingAi[item.id] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Cpu size={16} />}
                Ask AI for Restock Qty
              </button>
            )}
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <PackageSearch size={48} className="mx-auto mb-4 opacity-20" />
            <p>All stock levels are healthy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
