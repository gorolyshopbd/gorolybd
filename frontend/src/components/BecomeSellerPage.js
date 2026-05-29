'use client';

import React, { useState } from 'react';
import { Store, Users, Shield, TrendingUp, BarChart3, Package, DollarSign, ArrowRight, X, Lock, Mail, User as UserIcon, Phone } from 'lucide-react';

export default function BecomeSellerPage({ onBackToHome, onAuthClick }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [accountType] = useState('seller');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role: 'seller' }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.message || 'Registration failed');
        return;
      }

      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('shop_user', JSON.stringify(data));
        localStorage.setItem('shop_admin_token', data.token);
        localStorage.setItem('shop_admin_user', JSON.stringify(data));
      }
      
      window.location.href = '/admin';
    } catch (error) {
      setLoading(false);
      setErrorMsg(error.message || 'Registration failed');
    }
  };

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setErrorMsg('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBackToHome}
        className="mb-6 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 hover:text-slate-900 transition inline-flex items-center gap-1.5 shadow-xs"
      >
        ← Back to Home
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">
            <Store size={16} />
            Seller Program
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Become a Seller on Goroly Shop
          </h1>
          
          <p className="text-slate-600 font-medium leading-relaxed">
            Join thousands of successful sellers and grow your business with our platform. 
            Get access to powerful tools and reach customers nationwide.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Users size={20} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Unlimited Products</h3>
              <p className="text-slate-500 text-xs mt-1">Add as many products as you want</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Shield size={20} className="text-green-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Secure Payments</h3>
              <p className="text-slate-500 text-xs mt-1">Safe payment processing</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Growth Analytics</h3>
              <p className="text-slate-500 text-xs mt-1">Track your sales performance</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                <DollarSign size={20} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Fast Payouts</h3>
              <p className="text-slate-500 text-xs mt-1">Withdraw earnings easily</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Store size={24} className="text-orange-500" />
            <h2 className="text-xl font-bold text-slate-800">Start Selling Today</h2>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold text-center mb-4">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`py-2 rounded-lg transition ${
                authMode === 'login' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`py-2 rounded-lg transition ${
                authMode === 'register' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register as Seller
            </button>
          </div>

          {authMode === 'register' && (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Name</label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    placeholder="e.g. My Store Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                  <Store className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative mt-1.5">
                  <input
                    type="email"
                    placeholder="seller@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <div className="relative mt-1.5">
                  <input
                    type="tel"
                    placeholder="+880 17XX-XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                  <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative mt-1.5">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
              >
                {loading ? 'Creating Account...' : 'Register as Seller'}
              </button>

              <p className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Login
                </button>
              </p>
            </form>
          )}

          {authMode === 'login' && (
            <div className="space-y-4">
              <p className="text-center text-sm text-slate-600">
                Login to access your seller dashboard
              </p>
              <button
                onClick={() => {
                  onAuthClick();
                  if (typeof window !== 'undefined') {
                    const authModalEl = document.querySelector('[data-auth-saleder-trigger]');
                    if (authModalEl) authModalEl.click();
                  }
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
              >
                Login to Seller Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}