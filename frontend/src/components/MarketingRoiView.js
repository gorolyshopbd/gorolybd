import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, BarChart2, PlusCircle, Trash2 } from 'lucide-react';

export default function MarketingRoiView({ API_BASE_URL, token }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'Facebook',
    campaign_name: '',
    spend: '',
    revenue: '',
    clicks: '',
    conversions: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/marketing/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/marketing/campaigns`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          spend: Number(formData.spend),
          revenue: Number(formData.revenue),
          clicks: Number(formData.clicks),
          conversions: Number(formData.conversions)
        })
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ platform: 'Facebook', campaign_name: '', spend: '', revenue: '', clicks: '', conversions: '' });
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign record?')) return;
    try {
      await fetch(`${API_BASE_URL}/marketing/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotalRoi = () => {
    if (campaigns.length === 0) return 0;
    const totalSpend = campaigns.reduce((acc, c) => acc + Number(c.spend), 0);
    const totalRevenue = campaigns.reduce((acc, c) => acc + Number(c.revenue), 0);
    return totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(2) : 0;
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Marketing Data...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-2 opacity-80"><Target /> Total Campaigns</div>
          <div className="text-4xl font-bold">{campaigns.length}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-2 opacity-80"><TrendingUp /> Overall ROI</div>
          <div className="text-4xl font-bold">{calculateTotalRoi()}%</div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-2 opacity-80"><BarChart2 /> Total Ad Spend</div>
          <div className="text-4xl font-bold">৳{campaigns.reduce((acc, c) => acc + Number(c.spend), 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Campaign Performance</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <PlusCircle size={18} /> Add Campaign Data
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-500">Platform</label>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})}>
                <option>Facebook</option>
                <option>Google</option>
                <option>TikTok</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-500">Campaign Name</label>
              <input required type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" value={formData.campaign_name} onChange={e => setFormData({...formData, campaign_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-500">Ad Spend (৳)</label>
              <input required type="number" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" value={formData.spend} onChange={e => setFormData({...formData, spend: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-500">Revenue Generated (৳)</label>
              <input required type="number" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-500">Clicks</label>
              <input type="number" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" value={formData.clicks} onChange={e => setFormData({...formData, clicks: e.target.value})} />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors">Save Data</button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500">
                <th className="py-3 px-2 font-medium">Platform</th>
                <th className="py-3 px-2 font-medium">Campaign</th>
                <th className="py-3 px-2 font-medium">Spend</th>
                <th className="py-3 px-2 font-medium">Revenue</th>
                <th className="py-3 px-2 font-medium">ROI</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 px-2 font-medium">
                    <span className={`px-2 py-1 rounded text-xs ${c.platform === 'Facebook' ? 'bg-blue-100 text-blue-700' : c.platform === 'Google' ? 'bg-red-100 text-red-700' : c.platform === 'TikTok' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {c.platform}
                    </span>
                  </td>
                  <td className="py-3 px-2">{c.campaign_name}</td>
                  <td className="py-3 px-2 text-red-600 font-medium">৳{Number(c.spend).toLocaleString()}</td>
                  <td className="py-3 px-2 text-green-600 font-medium">৳{Number(c.revenue).toLocaleString()}</td>
                  <td className="py-3 px-2">
                    <span className={`font-bold ${c.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {c.roi > 0 ? '+' : ''}{c.roi}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No campaigns added yet. Add your first campaign to see ROI.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
