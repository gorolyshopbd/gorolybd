'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Loader2,
  AlertCircle, CheckCircle2, TriangleAlert,
  Keyboard, Sparkles, Info, Copy, CopyCheck, ArrowRight,
  TrendingUp, MonitorCheck, ShieldAlert
} from 'lucide-react';

const DEMO_EMAIL = 'admin@shopio.com';
const DEMO_PASS = 'admin123';

export default function AdminLoginForm({ onSuccess }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [remember, setRemember] = useState(false);
  const [copied, setCopied] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('shop_admin_remember');
    if (saved) {
      const { email: savedEmail } = JSON.parse(saved);
      if (savedEmail) { 
        setEmail(savedEmail); 
        setRemember(true); 
      }
    }
    setTimeout(() => emailRef.current?.focus(), 400);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json();
      if (data.success) {
        const userObj = { ...data.user, token: data.token };
        localStorage.setItem('shop_admin_token', data.token);
        localStorage.setItem('shop_admin_user', JSON.stringify(userObj));
        localStorage.setItem('shop_user', JSON.stringify(userObj));
        if (remember) localStorage.setItem('shop_admin_remember', JSON.stringify({ email }));
        else localStorage.removeItem('shop_admin_remember');
        if (onSuccess) onSuccess();
        else window.location.href = '/admin';
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    }
    setLoading(false);
  }, [email, password, remember, onSuccess]);

  const handleKeyDown = useCallback((e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) setCapsLock(true);
  }, []);

  const handleKeyUp = useCallback((e) => {
    if (e.getModifierState && !e.getModifierState('CapsLock')) setCapsLock(false);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans select-none overflow-hidden">
      
      {/* LEFT PANEL: Brand Promo (Deep Luxury Dark) */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#070D19] via-[#0B1329] to-[#132247] text-white p-8 sm:p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
        
        {/* Glow meshes background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[140px] animate-[pulse_10s_infinite]" />
          <div className="absolute -bottom-[20%] right-[10%] w-[55%] h-[55%] bg-amber-500/10 rounded-full blur-[120px] animate-[pulse_8s_infinite_2s]" />
          <div className="absolute top-[30%] -right-[15%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6600] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            <ShieldCheck size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-2xl font-black tracking-tight" style={{ fontWeight: 900 }}>
            Goroly<span className="text-[#FF6600]">Shop</span>
          </div>
          <span className="bg-slate-800 text-[10px] text-slate-350 font-bold px-2 py-0.5 rounded-full border border-slate-700/50 uppercase tracking-wider">
            Workspace
          </span>
        </div>

        {/* Center Marketing Copy */}
        <div className="relative z-10 my-auto py-12 md:py-0 space-y-8 max-w-lg">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight" style={{ fontWeight: 900 }}>
              Control center for <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">your business</span>.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Manage inventory, coordinate orders, build marketing automations, and track seller performance from one unified, secure workspace.
            </p>
          </div>

          {/* Features Highlights */}
          <div className="space-y-5 pt-4">
            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/30 flex items-center justify-center text-orange-400 group-hover:text-orange-300 group-hover:bg-slate-800/90 transition-all duration-300">
                <MonitorCheck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-200">Real-time Performance Metrics</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Track live orders, store visits, subscription sales, and marketing campaign outcomes instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/30 flex items-center justify-center text-amber-400 group-hover:text-amber-300 group-hover:bg-slate-800/90 transition-all duration-300">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-200">Inventory &amp; Supplier Tracking</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Record product purchases, update current stocks, manage prices, and organize product catalogs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Panel Footer */}
        <div className="relative z-10 text-slate-500 text-[10px] font-semibold tracking-wider uppercase">
          Goroly Shop Administrator Gateway © 2026. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL: Form Container (Spacious and Interactive) */}
      <div className="w-full md:w-1/2 bg-white p-8 sm:p-12 md:p-16 flex flex-col justify-between relative">
        
        {/* Return to storefront link */}
        <div className="flex justify-end">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-750 transition-colors duration-200 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Return to Storefront
          </button>
        </div>

        {/* Central Card Form */}
        <div className="my-auto max-w-[380px] w-full mx-auto py-8 md:py-0 space-y-7">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Sign In to Workspace
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Enter your credentials below to access the administrative dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-0.5">
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-250">
                  <Mail size={16} />
                </span>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  placeholder="admin@shopio.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/12 focus:border-[#FF6600] focus:bg-white hover:bg-slate-100/40 hover:border-slate-300 transition-all duration-250 shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-0.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[10px] font-bold text-[#FF6600] hover:text-[#e05a00] transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-250">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/12 focus:border-[#FF6600] focus:bg-white hover:bg-slate-100/40 hover:border-slate-300 transition-all duration-250 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-slate-400 hover:text-slate-650 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {capsLock && (
                <div className="flex items-center gap-1.5 pl-1 pt-0.5 text-[10px] font-semibold text-amber-600 animate-pulse">
                  <TriangleAlert size={12} />
                  Caps Lock is active
                </div>
              )}
            </div>

            {/* Remember me Option */}
            <div className="flex items-center gap-2 ml-0.5 pt-1">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember(!remember)}
                className={[
                  'w-4 h-4 rounded-md border flex items-center justify-center',
                  'transition-all duration-200 flex-shrink-0 cursor-pointer',
                  remember
                    ? 'bg-[#FF6600] border-[#FF6600] shadow-sm shadow-orange-300/45'
                    : 'border-slate-300 bg-white hover:border-slate-400',
                ].join(' ')}
              >
                {remember && <CheckCircle2 size={11} className="text-white" strokeWidth={3.5} />}
              </button>
              <span 
                className="text-xs font-semibold text-slate-500 select-none cursor-pointer hover:text-slate-700 transition-colors duration-200"
                onClick={() => setRemember(!remember)}
              >
                Remember this device
              </span>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200/60 rounded-xl text-red-600 text-xs font-bold shadow-xs animate-shake">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={[
                'relative w-full py-3 mt-2',
                'bg-gradient-to-r from-orange-500 via-[#FF6600] to-amber-600',
                'hover:from-orange-600 hover:via-orange-700 hover:to-amber-700',
                'text-white font-bold rounded-xl text-xs uppercase tracking-wider',
                'shadow-md shadow-orange-500/15 hover:shadow-lg hover:shadow-orange-500/25',
                'transform hover:-translate-y-0.5 active:translate-y-0',
                'transition-all duration-200 cursor-pointer',
                'flex justify-center items-center gap-2',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md',
              ].join(' ')}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Secure Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Custom Autofill Demo credentials container */}
          <div className="p-4 bg-orange-50/50 border border-orange-100/60 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-orange-500 uppercase tracking-wider">
                <Info size={11} />
                Auto-fill workspace credentials
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${DEMO_EMAIL}\nPassword: ${DEMO_PASS}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
              >
                {copied ? <CopyCheck size={11} className="text-emerald-500" /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => { 
                setEmail(DEMO_EMAIL); 
                setPassword(DEMO_PASS); 
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-orange-100 rounded-lg hover:border-orange-300 hover:shadow-xs group transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-[#FF6600] transition-colors">{DEMO_EMAIL}</span>
                </div>
                <div className="w-px h-6 bg-orange-100" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Password</span>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-[#FF6600] transition-colors">{DEMO_PASS}</span>
                </div>
              </div>
              <ArrowRight size={13} className="text-slate-400 group-hover:text-[#FF6600] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Footer info right panel */}
        <div className="text-slate-400 text-[9px] font-semibold text-center tracking-wide mt-8">
          Secured with SHA-256 and SSL encryption. System activity is logged.
        </div>
      </div>
    </div>
  );
}
