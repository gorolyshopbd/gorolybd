'use client';

import React, { useState, useEffect, useContext } from 'react';
import { ShopContext, getImageUrl, formatPrice } from '@/context/ShopContext';
import { 
  User, ShoppingBag, Settings, LogOut, Mail, Calendar, 
  ShieldCheck, Truck, Clock, RefreshCw, KeyRound
} from 'lucide-react';

export default function UserDashboard() {
  const { user, logout, API_URL, changeUserPassword, currencySymbol } = useContext(ShopContext);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // profile, orders, settings
  const [ordersList, setOrdersList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile details states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrdersList(data);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateSuccess('');
    setUpdateError('');
    
    // Simulating profile update
    setTimeout(() => {
      if (name.trim().length === 0) {
        setUpdateError('Name cannot be empty.');
        return;
      }
      setUpdateSuccess('Profile updated successfully!');
      if (user) {
        user.name = name;
        user.email = email;
        localStorage.setItem('shop_user', JSON.stringify(user));
      }
    }, 500);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    const res = await changeUserPassword(currentPassword, newPassword);
    if (res.success) {
      setPwdSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwdError(res.error || 'Failed to update password.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Please log in to view your dashboard.
      </div>
    );
  }




  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        
        {/* Left Dashboard Navigation */}
        <aside className="w-full md:w-64 bg-[#0f62fe] text-white border-r border-blue-700 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">My Account</h2>
              <p className="text-xs text-blue-200">Manage orders and configurations.</p>
            </div>
            
            <nav className="flex flex-col gap-1.5 text-blue-100 font-bold text-xs sm:text-sm">
              {[
                { id: 'profile', label: 'My Profile', icon: User },
                { id: 'orders', label: 'Order History', icon: ShoppingBag, count: ordersList.length },
                { id: 'settings', label: 'Account Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSubTab(item.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${ activeSubTab === item.id ? 'bg-white/20 text-white shadow-inner font-bold' : 'hover:bg-white/10 hover:text-white' }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${ activeSubTab === item.id ? 'bg-white text-blue-600' : 'bg-blue-800 text-white' }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={logout}
            className="w-full mt-8 py-2.5 px-3 bg-white/10 hover:bg-rose-500 text-rose-200 hover:text-white font-bold rounded-lg text-xs sm:text-sm transition flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </aside>

        {/* Right Content Panels */}
        <main className="flex-1 p-6 sm:p-8">
          
          {/* PROFILE VIEW */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Account Overview</h3>
                <p className="text-xs text-slate-400 mt-1">Hello, {user.name}! Here is a summary of your profile details.</p>
              </div>

              {/* Metric widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</div>
                    <div className="text-lg font-black text-slate-800">{ordersList.length} Orders</div>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Security Tier</div>
                    <div className="text-lg font-black text-slate-800">Verified Client</div>
                  </div>
                </div>
              </div>

              {/* Profile details list */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-700 pb-2 border-b border-slate-50">Profile Details</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <User className="text-slate-400" size={16} />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Display Name</div>
                      <div className="font-semibold text-slate-700">{user.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-slate-400" size={16} />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Email Address</div>
                      <div className="font-semibold text-slate-700">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-slate-400" size={16} />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Member Since</div>
                      <div className="font-semibold text-slate-700 font-mono">May 2026</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-slate-400" size={16} />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Account Privilege</div>
                      <div className="font-semibold text-slate-700 capitalize">{user.isAdmin ? 'Store Admin' : 'Customer'}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ORDERS HISTORY VIEW */}
          {activeSubTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">My Orders</h3>
                  <p className="text-xs text-slate-400 mt-1">Review status updates and track courier shipping routes.</p>
                </div>
                <button 
                  onClick={fetchMyOrders}
                  className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition"
                  title="Reload Orders"
                >
                  <RefreshCw size={16} className={loadingOrders ? 'animate-spin' : ''} />
                </button>
              </div>

              {ordersList.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-semibold bg-slate-50 rounded-2xl border border-slate-100">
                  You haven't placed any orders yet. Start adding items to your cart!
                </div>
              ) : (
                <div className="space-y-4">
                  {ordersList.map((order) => {
                    const statusColors = {
                      Pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                      Processing: 'bg-blue-50 text-blue-700 border-blue-100',
                      Shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                      Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      Cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
                    };

                    return (
                      <div key={order._id} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 hover:shadow-lg transition">
                        
                        {/* Order Header Summary */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400">Order ID</span>
                            <div className="text-sm font-extrabold text-slate-800">#{order._id?.substring(0, 8)}</div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5 sm:text-right">Ordered On</span>
                            <span className="text-xs text-slate-600 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5 sm:text-right">Order Status</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="divide-y divide-slate-50">
                          {order.orderItems?.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                              <div className="flex gap-2.5 items-center">
                                <img src={getImageUrl(item.image)} className="w-8 h-8 rounded-md object-cover bg-slate-50 border border-slate-100" />
                                <div>
                                  <div className="font-bold text-slate-700 line-clamp-1">{item.name}</div>
                                  <div className="text-slate-400">Qty: {item.qty} | Price: {formatPrice(item.price, currencySymbol)}</div>
                                </div>
                              </div>
                              <span className="font-bold text-slate-800">{formatPrice(item.price * item.qty, currencySymbol)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Tracking */}
                        <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <CreditCardIcon size={12} /> Payment Mode: {order.paymentMethod}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              {order.isPaid ? (
                                <span className="text-emerald-600 flex items-center gap-0.5"><Clock size={11} /> Paid</span>
                              ) : (
                                <span className="text-slate-500 flex items-center gap-0.5"><Clock size={11} /> Cash Payment Pending</span>
                              )}
                            </div>
                          </div>

                          {order.shippingMethod?.name && (
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Truck size={12} /> Shipping: {order.shippingMethod.name} {order.shippingMethod.price > 0 ? `(${formatPrice(order.shippingMethod.price, currencySymbol)})` : '(FREE)'}
                            </div>
                          )}

                          {order.courierInfo?.provider && (
                            <div className="bg-white px-3 py-2 border border-slate-150 rounded-lg space-y-0.5 text-right self-stretch sm:self-auto">
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">Courier Tracking</span>
                              <div className="font-bold text-slate-700 flex items-center gap-1 justify-end">
                                <Truck size={12} className="text-blue-500" />
                                {order.courierInfo.provider}
                              </div>
                              <span className="font-mono text-[10px] text-slate-500 select-all font-bold block">{order.courierInfo.trackingCode}</span>
                            </div>
                          )}

                          <div className="text-right ml-auto">
                            <span className="text-[10px] text-slate-400 font-bold block">Total Amount</span>
                            <span className="text-sm font-extrabold text-blue-600">{formatPrice(order.totalPrice, currencySymbol)}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ACCOUNT SETTINGS & PASSWORD CHANGE */}
          {activeSubTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Account Settings</h3>
                <p className="text-xs text-slate-400 mt-1">Configure profile details and security configurations.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs sm:text-sm">
                
                {/* Profile form */}
                <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-700 border-b border-slate-150 pb-2 flex items-center gap-1.5">
                    <User size={16} className="text-blue-600" /> Profile Information
                  </h4>
                  
                  {updateSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-100">
                      {updateSuccess}
                    </div>
                  )}
                  {updateError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
                      {updateError}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                    >
                      Save Info
                    </button>
                  </form>
                </div>

                {/* Password Change Form */}
                <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-700 border-b border-slate-150 pb-2 flex items-center gap-1.5">
                    <KeyRound size={16} className="text-amber-600" /> Change Account Password
                  </h4>

                  {pwdSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-100">
                      {pwdSuccess}
                    </div>
                  )}
                  {pwdError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
                      {pwdError}
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
}

function CreditCardIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <rect width="20" height="14" rx="2" ry="2" x="2" y="5" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
