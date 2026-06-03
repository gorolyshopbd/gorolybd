'use client';

import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '@/context/ShopContext';
import {
  X, Lock, Mail, User, ShieldAlert, Phone, KeyRound,
  Key, Smartphone
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const {
    login, register, sendOtpCode, verifyOtpCode,
    forgotPasswordRequest, resetPasswordSubmit, resetPasswordWithOtp, socialOauthLogin, loading, API_URL
  } = useContext(ShopContext);

  const [authMode, setAuthMode] = useState('login'); // login, register, otp, forgot
  const [otpType, setOtpType] = useState('phone'); // email, phone
  const [otpSent, setOtpSent] = useState(false);

  // Form fields
  const [accountType, setAccountType] = useState('customer'); // customer, seller
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneVal, setPhoneVal] = useState('');
  const [password, setPassword] = useState('');
  const [otpVal, setOtpVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password Recovery Fields
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [newRecoveryPassword, setNewRecoveryPassword] = useState('');
  const [recoveryStage, setRecoveryStage] = useState(1);

  // Social OAuth Simulation states
  const [socialSimOpen, setSocialSimOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState('');
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');

  // Signup OTP states
  const [checkoutOtpEnabled, setCheckoutOtpEnabled] = useState(true);
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtpCode, setSignupOtpCode] = useState('');
  const [signupPhoneVerified, setSignupPhoneVerified] = useState(false);
  const [signupOtpLoading, setSignupOtpLoading] = useState(false);
  const [signupOtpError, setSignupOtpError] = useState('');
  const [signupOtpSuccess, setSignupOtpSuccess] = useState('');

  useEffect(() => {
    if (isOpen && API_URL) {
      fetch(`${API_URL}/settings/public`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (d) {
            setCheckoutOtpEnabled(d.checkoutOtpEnabled !== false);
          }
        })
        .catch(() => { });
    }
  }, [isOpen, API_URL]);

  if (!isOpen) return null;

  const resetForm = () => {
    setAccountType('customer');
    setName('');
    setEmail('');
    setPhoneVal('');
    setPassword('');
    setOtpVal('');
    setOtpSent(false);
    setErrorMsg('');
    setRecoveryEmail('');
    setRecoveryToken('');
    setNewRecoveryPassword('');
    setRecoveryStage(1);
    setSocialSimOpen(false);
    setSignupOtpSent(false);
    setSignupOtpCode('');
    setSignupPhoneVerified(false);
    setSignupOtpLoading(false);
    setSignupOtpError('');
    setSignupOtpSuccess('');
    setOtpType('phone');
  };

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    resetForm();
  };

  const handleSendOTP = async (e, method = 'sms') => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const target = otpType === 'email' ? email : phoneVal;
    if (!target) {
      setErrorMsg(`Please enter a valid ${otpType}`);
      return;
    }

    const res = await sendOtpCode(otpType, target, method);
    if (res.success) {
      setOtpSent(true);
    } else {
      setErrorMsg(res.error || 'Failed to send OTP code');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const target = otpType === 'email' ? email : phoneVal;
    if (!otpVal) {
      setErrorMsg('Please enter the 6-digit code');
      return;
    }

    const res = await verifyOtpCode(otpType, target, otpVal);
    if (res.success) {
      onClose();
      resetForm();
    } else {
      setErrorMsg(res.error || 'OTP verification failed');
    }
  };

  const handleForgotRequest = async (e, method = 'sms') => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (otpType === 'email') {
      if (!recoveryEmail) {
        setErrorMsg('Email address is required');
        return;
      }
      const res = await forgotPasswordRequest(recoveryEmail);
      if (res.success) {
        setRecoveryStage(2);
      } else {
        setErrorMsg(res.error || 'Failed to request reset token');
      }
    } else {
      if (!phoneVal) {
        setErrorMsg('Phone number is required');
        return;
      }
      const res = await sendOtpCode('phone', phoneVal, method);
      if (res.success) {
        setOtpSent(true);
        setRecoveryStage(2);
      } else {
        setErrorMsg(res.error || 'Failed to send OTP code');
      }
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newRecoveryPassword) {
      setErrorMsg('New password is required');
      return;
    }

    if (otpType === 'email') {
      if (!recoveryToken) {
        setErrorMsg('Verification token is required');
        return;
      }
      const res = await resetPasswordSubmit(recoveryEmail, recoveryToken, newRecoveryPassword);
      if (res.success) {
        alert('Password updated successfully! You can now log in.');
        handleModeChange('login');
      } else {
        setErrorMsg(res.error || 'Reset failed. Verify your token.');
      }
    } else {
      if (!otpVal) {
        setErrorMsg('OTP code is required');
        return;
      }
      const res = await resetPasswordWithOtp(phoneVal, otpVal, newRecoveryPassword);
      if (res.success) {
        alert('Password updated successfully! You can now log in.');
        handleModeChange('login');
      } else {
        setErrorMsg(res.error || 'Reset failed. Verify your OTP.');
      }
    }
  };

  const handleTriggerSocial = (provider) => {
    setSocialProvider(provider);
    setSocialSimOpen(true);
    setErrorMsg('');
  };

  const handleConfirmSocialLogin = async (e) => {
    if (e) e.preventDefault();
    if (!simEmail || !simName) {
      setErrorMsg('Social Name and Email are required.');
      return;
    }

    const res = await socialOauthLogin(socialProvider, simEmail, simName);
    if (res.success) {
      onClose();
      resetForm();
    } else {
      setErrorMsg('Social Login failed.');
    }
  };

  const handleSendSignupOtp = async (method = 'sms') => {
    if (!phoneVal || phoneVal.trim().length < 10) {
      setSignupOtpError('Please enter a valid phone number');
      return;
    }
    setSignupOtpLoading(true);
    setSignupOtpError('');
    setSignupOtpSuccess('');
    setSignupPhoneVerified(false);

    const res = await sendOtpCode('phone', phoneVal, method);
    setSignupOtpLoading(false);
    if (res.success) {
      setSignupOtpSent(true);
      setSignupOtpSuccess(method === 'call' ? 'Calling your phone with OTP...' : 'OTP sent successfully!');
      if (res.otp) {
        setSignupOtpCode(res.otp);
      }
    } else {
      setSignupOtpError(res.error || 'Failed to send OTP');
    }
  };

  const handleVerifySignupOtp = async () => {
    if (!signupOtpCode || signupOtpCode.length < 4) {
      setSignupOtpError('Please enter a valid OTP code');
      return;
    }
    setSignupOtpLoading(true);
    setSignupOtpError('');

    const res = await verifyOtpCode('phone', phoneVal, signupOtpCode, true);
    setSignupOtpLoading(false);
    if (res.success) {
      setSignupPhoneVerified(true);
      setSignupOtpSuccess('Phone number verified successfully!');
      setSignupOtpError('');
    } else {
      setSignupOtpError(res.error || 'Invalid OTP code');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'login') {
      const res = await login(email, password, accountType);
      if (res.success) {
        onClose();
        resetForm();
        if (res.role !== 'customer' || res.isAdmin) {
          window.location.href = '/admin';
        } else {
          // Add a reload to ensure storefront picks up the new user state immediately
          window.location.reload();
        }
      } else {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    } else {
      if (!name) return setErrorMsg('Name is required');
      if (checkoutOtpEnabled) {
        if (!phoneVal) {
          return setErrorMsg('Phone number is required and must be verified via OTP');
        }
        if (!signupPhoneVerified) {
          return setErrorMsg('Please verify your phone number via OTP');
        }
      }
      const res = await register(name, email, password, phoneVal, accountType);
      if (res.success) {
        onClose();
        resetForm();
        // Since register returns a user object and token in some setups, we check accountType
        if (accountType === 'seller') {
          window.location.href = '/admin';
        } else {
          window.location.reload();
        }
      } else {
        setErrorMsg(res.error || 'Failed to register');
      }
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[calc(100vh-2rem)] shadow-[0_30px_90px_rgba(15,23,42,0.28)] relative overflow-hidden z-10 flex flex-col md:flex-row animate-fade-in border border-white/80">

        {/* Left Side - Promo Area */}
        <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-8 overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.26),transparent_30%),linear-gradient(135deg,#FF6600_0%,#f97316_44%,#111827_100%)]">
          <div className="absolute inset-0 opacity-25 mix-blend-screen bg-[url('https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute -right-14 bottom-12 h-56 w-56 rounded-full bg-orange-200/25 blur-3xl"></div>
          <div className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-slate-950/45 to-transparent"></div>
          <div className="relative z-10 text-white space-y-6 max-w-sm">
            <h2 className="text-4xl font-black leading-tight">Welcome to Goroly Shop!</h2>
            <p className="text-sm text-orange-50 font-medium leading-6">Discover top brands, exclusive offers, and a seamless shopping experience.</p>
            <div className="pt-6 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-white/80 object-cover shadow-md" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="user" />
                <img className="w-10 h-10 rounded-full border-2 border-white/80 object-cover shadow-md" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="user" />
                <img className="w-10 h-10 rounded-full border-2 border-white/80 object-cover shadow-md" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="user" />
              </div>
              <span className="text-xs font-bold text-orange-50">Join 10k+ shoppers</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form Area */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 relative bg-linear-to-br from-white via-white to-orange-50/55 overflow-y-auto">
          {/* Close Button */}
          <button onClick={onClose} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-[#FF6600] rounded-lg hover:bg-orange-50 transition z-20">
            <X size={18} />
          </button>

          <div className="max-w-sm mx-auto h-full flex flex-col justify-center py-4">
            {/* STANDARD LOGIN PANELS */}
            <>
              {/* Title */}
              <div className="text-center space-y-1 mb-6">
                <span className="md:hidden inline-flex items-center rounded-full bg-[#FF6600]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#FF6600] mb-2">
                  Goroly Shop
                </span>
                <h2 className="text-xl font-bold text-[#FF6600]">
                  {authMode === 'login' && 'Welcome Back!'}
                  {authMode === 'register' && 'Create Account'}
                  {authMode === 'otp' && 'OTP Verification'}
                  {authMode === 'forgot' && 'Reset Password'}
                </h2>
                <p className="text-xs text-slate-400">
                  {authMode === 'login' && 'Sign in to access your dashboard and cart.'}
                  {authMode === 'register' && 'Register to start shopping and tracking orders.'}
                  {authMode === 'otp' && 'Secure authentication via temporary 6-digit code.'}
                  {authMode === 'forgot' && 'Reset your password to regain access.'}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100">
                  <ShieldAlert size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* LOGIN AND REGISTER FORMS */}
              {['login', 'register'].includes(authMode) && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {['login', 'register'].includes(authMode) && (
                    <>
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold text-center mb-2">
                        <button
                          type="button"
                          onClick={() => setAccountType('customer')}
                          className={`py-2 rounded-lg transition ${accountType === 'customer' ? 'bg-white text-[#FF6600] shadow-xs ring-1 ring-orange-100' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                          Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccountType('seller')}
                          className={`py-2 rounded-lg transition ${accountType === 'seller' ? 'bg-white text-[#FF6600] shadow-xs ring-1 ring-orange-100' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                          Seller
                        </button>
                      </div>
                    </>
                  )}
                  {authMode === 'register' && (
                    <>
                      <div className="relative rounded-2xl border border-violet-100 bg-violet-50/45 p-3 shadow-sm">
                        <label className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Full Name</label>
                        <div className="relative mt-1.5 group">
                          <input
                            type="text"
                            placeholder={accountType === 'seller' ? "e.g. My Store Name" : "e.g. John Doe"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-violet-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-violet-500/15 focus:border-violet-500 transition-all duration-300 shadow-sm hover:border-violet-200"
                            required
                          />
                          <User className="absolute left-3.5 top-3.5 text-violet-400 group-focus-within:text-violet-600 transition-colors duration-300" size={16} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className={`relative ${authMode === 'register' ? 'rounded-2xl border border-sky-100 bg-sky-50/50 p-3 shadow-sm' : ''}`}>
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${authMode === 'register' ? 'text-sky-600' : 'text-slate-400'}`}>Email Address</label>
                    <div className="relative mt-1.5 group">
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden transition-all duration-300 ${authMode === 'register'
                            ? 'bg-white border border-sky-100 focus:ring-4 focus:ring-sky-500/15 focus:border-sky-500 shadow-sm hover:border-sky-200'
                            : 'bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:bg-orange-50/40 focus:hover:bg-white'
                          }`}
                        required
                      />
                      <Mail className={`absolute left-3.5 top-3.5 transition-colors duration-300 ${authMode === 'register' ? 'text-sky-400 group-focus-within:text-sky-600' : 'text-slate-400 group-focus-within:text-[#FF6600]'}`} size={16} />
                    </div>
                  </div>
                  {authMode === 'register' && (
                    <div className="space-y-3">
                      {checkoutOtpEnabled ? (
                        <div className="p-4 bg-emerald-50/55 rounded-2xl border border-emerald-100 space-y-3 shadow-sm">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                            <Smartphone size={14} className="text-emerald-600" />
                            Phone Verification
                          </div>

                          <div className="flex gap-2">
                            <div className="relative flex-1 group">
                              <input
                                type="tel"
                                value={phoneVal}
                                onChange={(e) => {
                                  setPhoneVal(e.target.value);
                                  setSignupPhoneVerified(false);
                                  setSignupOtpSent(false);
                                  setSignupOtpCode('');
                                  setSignupOtpError('');
                                  setSignupOtpSuccess('');
                                }}
                                className="w-full pl-11 pr-4 py-2.5 border border-emerald-100 rounded-xl text-sm focus:outline-hidden focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 bg-white text-slate-800 placeholder-slate-400 focus:bg-white transition-all duration-300 shadow-sm"
                                placeholder="e.g. 01712345678"
                                required
                              />
                              <Phone className="absolute left-3.5 top-3.5 text-emerald-400 group-focus-within:text-emerald-600 transition-colors duration-300" size={16} />
                            </div>
                            {!signupOtpSent ? (
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSendSignupOtp('sms')}
                                  disabled={signupOtpLoading}
                                  className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition duration-300 shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 whitespace-nowrap border-0 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                  {signupOtpLoading ? 'Sending...' : 'SMS'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendSignupOtp('call')}
                                  disabled={signupOtpLoading}
                                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition duration-300 shadow-md shadow-slate-900/25 hover:-translate-y-0.5 whitespace-nowrap border-0 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                  {signupOtpLoading ? 'Calling...' : 'Call Me'}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleVerifySignupOtp}
                                disabled={signupOtpLoading || signupPhoneVerified}
                                className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl transition duration-300 whitespace-nowrap border-0 ${signupPhoneVerified ? 'bg-emerald-500 cursor-default' : 'bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/25 hover:-translate-y-0.5'
                                  }`}
                              >
                                {signupOtpLoading ? 'Verifying...' : signupPhoneVerified ? 'Verified' : 'Verify'}
                              </button>
                            )}
                          </div>
                          {signupOtpSent && !signupPhoneVerified && (
                            <div className="flex gap-2 mt-2 animate-fade-in relative group">
                              <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                value={signupOtpCode}
                                onChange={(e) => setSignupOtpCode(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 border border-emerald-100 rounded-xl text-sm focus:outline-hidden focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 bg-white font-mono tracking-widest text-center text-slate-800 shadow-sm"
                              />
                              <KeyRound className="absolute left-3.5 top-3 text-emerald-400" size={16} />
                            </div>
                          )}
                          {signupOtpError && <p className="text-red-500 text-[10px] font-bold mt-1">{signupOtpError}</p>}
                          {signupOtpSuccess && <p className="text-emerald-600 text-[10px] font-bold mt-1 flex items-center gap-1">✓ {signupOtpSuccess}</p>}
                        </div>
                      ) : (
                        <div className="relative rounded-2xl border border-emerald-100 bg-emerald-50/55 p-3 shadow-sm">
                          <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Phone Number</label>
                          <div className="relative mt-1.5 group">
                            <input
                              type="tel"
                              placeholder="+880 17XX-XXXXXX"
                              value={phoneVal}
                              onChange={(e) => setPhoneVal(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-white border border-emerald-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:border-emerald-200"
                            />
                            <Phone className="absolute left-3.5 top-3.5 text-emerald-400 group-focus-within:text-emerald-600 transition-colors duration-300" size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`relative ${authMode === 'register' ? 'rounded-2xl border border-amber-100 bg-amber-50/55 p-3 shadow-sm' : ''}`}>
                    <div className="flex justify-between items-center">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${authMode === 'register' ? 'text-amber-700' : 'text-slate-400'}`}>Password</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => handleModeChange('forgot')}
                          className="text-[10px] text-[#FF6600] hover:text-[#d95400] hover:underline font-bold"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative mt-1.5 group">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden transition-all duration-300 ${authMode === 'register'
                            ? 'bg-white border border-amber-100 focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 shadow-sm hover:border-amber-200'
                            : 'bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:bg-orange-50/40 focus:hover:bg-white'
                          }`}
                        required
                      />
                      <Lock className={`absolute left-3.5 top-3.5 transition-colors duration-300 ${authMode === 'register' ? 'text-amber-500 group-focus-within:text-amber-600' : 'text-slate-400 group-focus-within:text-[#FF6600]'}`} size={16} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 mt-2 text-white font-bold rounded-xl shadow-lg transition duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 ${authMode === 'register'
                        ? 'bg-linear-to-r from-violet-600 via-sky-500 to-emerald-500 hover:brightness-105 shadow-sky-500/20'
                        : 'bg-[#FF6600] hover:bg-[#e05a00] shadow-[#FF6600]/25'
                      }`}
                  >
                    {loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                </form>
              )}

              {/* OTP LOGIN FORM */}
              {authMode === 'otp' && (
                <div className="space-y-4 rounded-2xl border border-orange-100 bg-white/75 p-3.5 shadow-[0_18px_50px_rgba(255,102,0,0.10)]">
                  {!otpSent && (
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1.5 text-xs font-bold text-center ring-1 ring-slate-200">
                      <button
                        type="button"
                        onClick={() => setOtpType('email')}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition duration-300 ${otpType === 'email'
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-1 ring-sky-400'
                            : 'bg-white text-sky-600 ring-1 ring-sky-100 hover:bg-sky-50 hover:text-sky-700'
                          }`}
                      >
                        <Mail size={14} />
                        Email Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpType('phone')}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition duration-300 ${otpType === 'phone'
                            ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/25 ring-1 ring-orange-400'
                            : 'bg-white text-[#FF6600] ring-1 ring-orange-100 hover:bg-orange-50 hover:text-[#d95400]'
                          }`}
                      >
                        <Phone size={14} />
                        Phone Number
                      </button>
                    </div>
                  )}

                  {!otpSent ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div className="rounded-2xl bg-linear-to-br from-orange-50 to-white p-3 text-center ring-1 ring-orange-100/80">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/25">
                          <KeyRound size={18} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-700">Secure OTP Login</p>
                        <p className="mt-0.5 text-[10px] font-medium text-slate-400">Get a one-time code by {otpType === 'email' ? 'email' : 'SMS or voice call'}.</p>
                      </div>
                      {otpType === 'email' ? (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gmail Address</label>
                          <div className="relative mt-1.5 group">
                            <input
                              type="email"
                              placeholder="yourname@gmail.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:bg-orange-50/40 focus:hover:bg-white"
                              required
                            />
                            <Mail className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-300" size={16} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                          <div className="relative mt-1.5 group">
                            <input
                              type="tel"
                              placeholder="e.g. 01712345678"
                              value={phoneVal}
                              onChange={(e) => setPhoneVal(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:bg-orange-50/40 focus:hover:bg-white"
                              required
                            />
                            <Phone className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-300" size={16} />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-3 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl shadow-lg shadow-[#FF6600]/25 transition duration-300 hover:-translate-y-0.5 text-xs cursor-pointer border-0 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                          {loading ? 'Sending...' : otpType === 'email' ? 'Send Email OTP' : 'Send SMS OTP'}
                        </button>
                        {otpType === 'phone' && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={(e) => handleSendOTP(e, 'call')}
                            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition duration-300 hover:-translate-y-0.5 text-xs cursor-pointer border-0 disabled:opacity-70 disabled:hover:translate-y-0"
                          >
                            {loading ? 'Calling...' : 'Voice Call OTP'}
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div className="rounded-2xl bg-linear-to-br from-orange-50 to-white p-3.5 ring-1 ring-orange-100/80">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/25">
                          <KeyRound size={20} />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enter OTP Code</span>
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#FF6600] shadow-sm ring-1 ring-orange-100 transition hover:bg-orange-50 hover:text-[#d95400]"
                          >
                            Change Address
                          </button>
                        </div>

                        <div className="relative mt-1.5 group">
                          <input
                            type="text"
                            placeholder="e.g. 123456"
                            maxLength="6"
                            value={otpVal}
                            onChange={(e) => setOtpVal(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-orange-100 rounded-2xl text-slate-800 placeholder-slate-300 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] transition-all duration-300 shadow-sm hover:border-orange-200 text-center tracking-[0.35em] font-mono text-xl font-black"
                            required
                          />
                          <KeyRound className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-300" size={16} />
                        </div>
                        <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">Use the 6-digit code sent to your {otpType === 'email' ? 'email address' : 'phone number'}.</p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-2xl shadow-lg shadow-[#FF6600]/25 transition duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {loading ? 'Verifying...' : 'Verify & Log In'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* PASSWORD RECOVERY FORM */}
              {authMode === 'forgot' && (
                <div className="space-y-4">
                  {recoveryStage === 1 && !otpSent && (
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold text-center">
                      <button
                        onClick={() => setOtpType('email')}
                        className={`py-2 rounded-lg transition ${otpType === 'email' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        Email Address
                      </button>
                      <button
                        onClick={() => setOtpType('phone')}
                        className={`py-2 rounded-lg transition ${otpType === 'phone' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        Phone Number
                      </button>
                    </div>
                  )}

                  {recoveryStage === 1 ? (
                    <form onSubmit={handleForgotRequest} className="space-y-4">
                      {otpType === 'email' ? (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                          <div className="relative mt-1.5 group">
                            <input
                              type="email"
                              placeholder="Enter registered email"
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:bg-orange-50/40 focus:hover:bg-white"
                              required
                            />
                            <Mail className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-300" size={16} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                          <div className="relative mt-1.5 group">
                            <input
                              type="tel"
                              placeholder="e.g. 01712345678"
                              value={phoneVal}
                              onChange={(e) => setPhoneVal(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:bg-orange-50/40 focus:hover:bg-white"
                              required
                            />
                            <Phone className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-300" size={16} />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-3 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl shadow-lg shadow-[#FF6600]/25 transition duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                          {loading ? 'Requesting...' : otpType === 'email' ? 'Request Reset Token' : 'Send SMS'}
                        </button>
                        {otpType === 'phone' && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={(e) => handleForgotRequest(e, 'call')}
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition"
                          >
                            {loading ? 'Calling...' : 'Call Me'}
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleResetSubmit} className="space-y-4">
                      {otpType === 'email' ? (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Token</label>
                          <div className="relative mt-1.5 group">
                            <input
                              type="text"
                              placeholder="RESET-XXXXXX"
                              value={recoveryToken}
                              onChange={(e) => setRecoveryToken(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:bg-orange-50/40 focus:hover:bg-white tracking-wider font-mono font-bold"
                              required
                            />
                            <Key className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-300" size={16} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enter OTP Code</label>
                          <div className="relative mt-1.5 group">
                            <input
                              type="text"
                              placeholder="e.g. 123456"
                              maxLength="6"
                              value={otpVal}
                              onChange={(e) => setOtpVal(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:bg-orange-50/40 focus:hover:bg-white tracking-widest font-mono text-center font-bold"
                              required
                            />
                            <KeyRound className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-300" size={16} />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                        <div className="relative mt-1.5 group">
                          <input
                            type="password"
                            placeholder="Enter new password"
                            value={newRecoveryPassword}
                            onChange={(e) => setNewRecoveryPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#FF6600]/15 focus:border-[#FF6600] transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:bg-orange-50/40 focus:hover:bg-white"
                            required
                          />
                          <Lock className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#FF6600] transition-colors duration-300" size={16} />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl shadow-lg shadow-[#FF6600]/25 transition duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {loading ? 'Resetting...' : 'Update Password'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* SOCIAL OAUTH LOGIN BUTTONS */}
              {['login', 'register'].includes(authMode) && (
                <div className="space-y-3.5 pt-2">
                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-slate-150"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or Continue With</span>
                    <div className="flex-grow border-t border-slate-150"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Google */}
                    <button
                      type="button"
                      onClick={() => handleTriggerSocial('google')}
                      className="py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center transition hover:-translate-y-0.5 text-red-500"
                      title="Google Login"
                    >
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.472-3.84-8.472-8.514 0-4.675 3.792-8.515 8.472-8.515 2.186 0 4.148.815 5.666 2.378l3.195-3.195C18.17 1.054 15.422 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.04 0 12.24-4.945 12.24-12.24 0-.825-.098-1.44-.22-1.955H12.24z" />
                      </svg>
                    </button>
                    {/* Facebook */}
                    <button
                      type="button"
                      onClick={() => handleTriggerSocial('facebook')}
                      className="py-2.5 border border-slate-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 flex items-center justify-center transition hover:-translate-y-0.5 text-[#1877F2] shadow-sm"
                      title="Facebook Login"
                    >
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                      </svg>
                    </button>
                    {/* LinkedIn */}
                    <button
                      type="button"
                      onClick={() => handleTriggerSocial('linkedin')}
                      className="py-2.5 border border-slate-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 flex items-center justify-center transition hover:-translate-y-0.5 text-slate-800 shadow-sm"
                      title="LinkedIn Login"
                    >
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation toggles */}
              <div className="text-center mt-5 text-xs text-slate-400 flex flex-wrap justify-center gap-x-2 gap-y-1">
                {authMode !== 'login' && (
                  <button onClick={() => handleModeChange('login')} className="text-[#FF6600] hover:text-[#d95400] hover:underline font-bold">
                    Login with Password
                  </button>
                )}
                {authMode !== 'register' && (
                  <>
                    {authMode !== 'login' && <span>•</span>}
                    <button onClick={() => handleModeChange('register')} className="text-[#FF6600] hover:text-[#d95400] hover:underline font-bold">
                      Create Account
                    </button>
                  </>
                )}
                {authMode !== 'otp' && (
                  <>
                    <span>•</span>
                    <button onClick={() => handleModeChange('otp')} className="text-[#FF6600] hover:text-[#d95400] hover:underline font-bold">
                      Login with OTP
                    </button>
                  </>
                )}
              </div>


            </>

          </div>
        </div>
      </div>
    </div>
  );
}
