import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckSquare, Settings2, Trash2 } from 'lucide-react';

export default function DashboardOrders({ API_BASE_URL, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oId => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const selectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o._id));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus) return alert('Please select a status to apply.');
    if (selectedOrders.length === 0) return alert('Please select at least one order.');
    if (!window.confirm(`Update ${selectedOrders.length} orders to ${bulkStatus}?`)) return;

    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/bulk-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderIds: selectedOrders, status: bulkStatus })
      });
      
      if (res.ok) {
        alert('Orders updated successfully!');
        setSelectedOrders([]);
        setBulkStatus('');
        fetchOrders();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update orders.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Orders...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="text-blue-500" /> Order Management</h2>
          <p className="text-gray-500 dark:text-gray-400">View and bulk-process customer orders efficiently.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl border border-gray-200 dark:border-gray-600">
          <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">{selectedOrders.length} selected</span>
          <select 
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm outline-none"
          >
            <option value="">-- Change Status --</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button 
            onClick={handleBulkUpdate}
            disabled={updating || selectedOrders.length === 0 || !bulkStatus}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {updating ? 'Updating...' : <><Settings2 size={16} /> Apply to {selectedOrders.length}</>}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.length > 0 && selectedOrders.length === orders.length}
                    onChange={selectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">Order ID</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">Customer</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">Total</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">Paid</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-b border-gray-100 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleSelect(order._id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4 font-mono text-sm text-gray-500">#{order._id.slice(-6)}</td>
                  <td className="py-3 px-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{order.user?.name || order.shippingAddress?.address || 'Guest'}</td>
                  <td className="py-3 px-4 font-semibold text-blue-600">৳{Number(order.totalPrice).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {order.isPaid ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Paid</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Unpaid</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
