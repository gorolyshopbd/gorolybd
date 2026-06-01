'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Loader2,
  AlertCircle, CheckCircle2, TriangleAlert,
  Keyboard, Sparkles, Info, Copy, CopyCheck
} from 'lucide-react';

const DEMO_EMAIL = 'admin@gorolyshop.com';
const DEMO_PASS = 'admin123';

export default function AdminLoginPage() {
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
    const token = localStorage.getItem('shop_admin_token');
    if (token) router.push('/admin');
    const saved = localStorage.getItem('shop_admin_remember');
    if (saved) {
      const { email: savedEmail } = JSON.parse(saved);
      if (savedEmail) { setEmail(savedEmail); setRemember(true); }
    }
    setTimeout(() => emailRef.current?.focus(), 400);
  }, [router]);

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
        window.location.href = '/admin';
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    }
    setLoading(false);
  }, [email, password, remember]);

  const handleKeyDown = useCallback((e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) setCapsLock(true);
  }, []);

  const handleKeyUp = useCallback((e) => {
    if (e.getModifierState && !e.getModifierState('CapsLock')) setCapsLock(false);
  }, []);



  if (!mounted) return null;

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 font-sans selection:bg-indigo-200/60">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] bg-gradient-to-br from-indigo-300/25 via-purple-300/15 to-transparent rounded-full blur-[130px] animate-[floatSlow_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[55%] h-[55%] bg-gradient-to-br from-violet-300/25 via-indigo-300/15 to-transparent rounded-full blur-[130px] animate-[floatSlow_8s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[20%] right-[25%] w-[25%] h-[25%] bg-cyan-300/10 rounded-full blur-[100px] animate-[floatSlow_10s_ease-in-out_infinite_4s]" />
        <div className="absolute bottom-[30%] left-[20%] w-[20%] h-[20%] bg-orange-300/10 rounded-full blur-[90px] animate-[floatSlow_10s_ease-in-out_infinite_1s]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] px-5 animate-fade-in">
        <div
          className={[
            'w-full p-8 sm:p-10',
            'bg-white/75 backdrop-blur-2xl',
            'border border-white/60',
            'rounded-[2.25rem]',
            'shadow-[0_25px_70px_-20px_rgba(0,0,0,0.12)]',
            'transition-all duration-500',
          ].join(' ')}
        >
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-8">
            <div className={[
              'w-16 h-16 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600',
              'rounded-2xl flex items-center justify-center',
              'shadow-xl shadow-indigo-500/25',
              'ring-4 ring-indigo-100/50',
              'mb-4',
              'transition-transform duration-500 hover:scale-105 hover:-rotate-2',
            ].join(' ')}>
              <ShieldCheck size={30} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-[1.65rem] font-extrabold text-slate-800 tracking-tight leading-tight">
              Goroly Shop Workspace
            </h1>
            <p className="text-[0.65rem] font-bold text-slate-400 mt-1.5 uppercase tracking-[0.2em]">
              Admin Control Panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[0.625rem] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                  <Mail size={17} />
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
                  placeholder="admin@gorolyshop.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-400/70 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/12 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[0.625rem] font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[0.6rem] font-bold text-indigo-500 hover:text-indigo-700 transition-colors tracking-wide"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                  <Lock size={17} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-400/70 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/12 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {/* Caps Lock warning */}
              {capsLock && (
                <div className="flex items-center gap-1.5 pl-1 pt-0.5 text-[0.6rem] font-bold text-amber-600 animate-fade-in">
                  <TriangleAlert size={12} />
                  Caps Lock is on
                </div>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 ml-0.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember(!remember)}
                className={[
                  'w-4 h-4 rounded-[5px] border-2 flex items-center justify-center',
                  'transition-all duration-200 flex-shrink-0',
                  remember
                    ? 'bg-indigo-500 border-indigo-500 shadow-sm shadow-indigo-300/40'
                    : 'border-slate-300 bg-white hover:border-slate-400',
                ].join(' ')}
              >
                {remember && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
              </button>
              <span className="text-[0.7rem] font-semibold text-slate-500 select-none cursor-pointer" onClick={() => setRemember(!remember)}>
                Remember this device
              </span>
            </div>

            {/* Error / Success Message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-orange-50/90 border border-orange-200/70 rounded-xl text-orange-600 text-xs font-semibold shadow-sm animate-fade-in">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-orange-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={[
                'relative w-full py-3.5 mt-1',
                'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600',
                'hover:from-indigo-600 hover:via-indigo-700 hover:to-violet-700',
                'text-white font-bold rounded-2xl',
                'shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/25',
                'transform hover:-translate-y-0.5 active:translate-y-0',
                'transition-all duration-250',
                'flex justify-center items-center gap-2',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg',
                'overflow-hidden',
              ].join(' ')}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Secure Login</span>
                </>
              )}
              {/* Shimmer on hover */}
              <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)] bg-[length:200%_100%] hover:animate-[shimmer_1.5s_ease-in-out]" />
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-7 p-4 bg-indigo-50/70 border border-indigo-100/60 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[0.6rem] font-bold text-indigo-500 uppercase tracking-wider">
                <Info size={11} />
                Demo Credentials
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${DEMO_EMAIL}\nPassword: ${DEMO_PASS}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-[0.55rem] font-bold text-slate-400 hover:text-indigo-500 transition-colors"
              >
                {copied ? <CopyCheck size={11} /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASS); }}
                className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-indigo-100 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-xs group"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="text-[0.7rem] font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{DEMO_EMAIL}</span>
                </div>
                <div className="w-px h-6 bg-indigo-100 mx-1" />
                <div className="flex flex-col items-start">
                  <span className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-wider">Password</span>
                  <span className="text-[0.7rem] font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{DEMO_PASS}</span>
                </div>
                <div className="ml-auto text-indigo-400 group-hover:text-indigo-600 transition-colors">
                  <ArrowLeft size={12} className="rotate-180" />
                </div>
              </button>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold text-slate-400 hover:text-indigo-600 transition-colors group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Return to Storefront
              <Keyboard size={11} className="text-slate-300 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -20px) scale(1.05); }
          66% { transform: translate(-10px, 15px) scale(0.95); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
