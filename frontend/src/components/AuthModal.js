'use client';

import React, { useState, useContext } from 'react';
import { ShopContext } from '@/context/ShopContext';
import { 
  X, Lock, Mail, User, ShieldAlert, Phone, KeyRound, 
  Key 
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { 
    login, register, sendOtpCode, verifyOtpCode, 
    forgotPasswordRequest, resetPasswordSubmit, socialOauthLogin, loading 
  } = useContext(ShopContext);
  
  const [authMode, setAuthMode] = useState('login'); // login, register, otp, forgot
  const [otpType, setOtpType] = useState('email'); // email, phone
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

  if (!isOpen) return null;

  const resetForm = () => {
    setAccountType('customer');
    setName('');
    setEmail('');
    setPhoneVal('');
    setPassword('');
    setOtpVal('');
    setOtpSent(false);
    setOtpSent(false);
    setErrorMsg('');
    setRecoveryEmail('');
    setRecoveryToken('');
    setNewRecoveryPassword('');
    setRecoveryStage(1);
    setSocialSimOpen(false);
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

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorMsg('');

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
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recoveryToken || !newRecoveryPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    const res = await resetPasswordSubmit(recoveryEmail, recoveryToken, newRecoveryPassword);
    if (res.success) {
      alert('Password updated successfully! You can now log in.');
      handleModeChange('login');
    } else {
      setErrorMsg(res.error || 'Reset failed. Verify your token.');
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        onClose();
        resetForm();
        if (res.role === 'seller' || res.isAdmin) {
          window.location.href = '/admin';
        }
      } else {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    } else {
      if (!name) return setErrorMsg('Name is required');
      const res = await register(name, email, password, phoneVal, accountType);
      if (res.success) {
        onClose();
        resetForm();
        // Since register returns a user object and token in some setups, we check accountType
        if (accountType === 'seller') {
          window.location.href = '/admin';
        }
      } else {
        setErrorMsg(res.error || 'Failed to register');
      }
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden z-10 flex flex-col md:flex-row animate-fade-in border border-slate-100">
        
        {/* Left Side - Promo Area */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 relative items-center justify-center p-8 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="relative z-10 text-white space-y-6 max-w-sm">
            <h2 className="text-4xl font-black leading-tight">Welcome to Goroly Shop!</h2>
            <p className="text-sm text-blue-100 font-medium">Discover top brands, exclusive offers, and a seamless shopping experience.</p>
            <div className="pt-6 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-blue-600 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="user" />
                <img className="w-10 h-10 rounded-full border-2 border-blue-600 object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="user" />
                <img className="w-10 h-10 rounded-full border-2 border-blue-600 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="user" />
              </div>
              <span className="text-xs font-bold">Join 10k+ shoppers</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form Area */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 relative">
          {/* Close Button */}
          <button onClick={onClose} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition z-20">
            <X size={18} />
          </button>
          
          <div className="max-w-sm mx-auto h-full flex flex-col justify-center py-4">
            {/* STANDARD LOGIN PANELS */}
            <>
            {/* Title */}
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-bold text-slate-800">
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
                {authMode === 'register' && (
                  <>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold text-center mb-2">
                      <button
                        type="button"
                        onClick={() => setAccountType('customer')}
                        className={`py-2 rounded-lg transition ${
                          accountType === 'customer' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType('seller')}
                        className={`py-2 rounded-lg transition ${
                          accountType === 'seller' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Seller
                      </button>
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                      <div className="relative mt-1.5 group">
                        <input
                          type="text"
                          placeholder={accountType === 'seller' ? "e.g. My Store Name" : "e.g. John Doe"}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white"
                          required
                        />
                        <User className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
                      </div>
                    </div>
                  </>
                )}

                <div className="relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative mt-1.5 group">
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white"
                      required
                    />
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
                  </div>
                </div>
                {authMode === 'register' && (
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <div className="relative mt-1.5 group">
                      <input
                        type="tel"
                        placeholder="+880 17XX-XXXXXX"
                        value={phoneVal}
                        onChange={(e) => setPhoneVal(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white"
                      />
                      <Phone className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
                    </div>
                  </div>
                )}
                <div className="relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    {authMode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => handleModeChange('forgot')} 
                        className="text-[10px] text-blue-600 hover:underline font-bold"
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
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white"
                      required
                    />
                    <Lock className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
                >
                  {loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>
            )}

            {/* OTP LOGIN FORM */}
            {authMode === 'otp' && (
              <div className="space-y-4">
                {!otpSent && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold text-center">
                    <button
                      onClick={() => setOtpType('email')}
                      className={`py-2 rounded-lg transition ${
                        otpType === 'email' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Email Address
                    </button>
                    <button
                      onClick={() => setOtpType('phone')}
                      className={`py-2 rounded-lg transition ${
                        otpType === 'phone' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Phone Number
                    </button>
                  </div>
                )}

                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    {otpType === 'email' ? (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gmail Address</label>
                        <div className="relative mt-1.5 group">
                          <input
                            type="email"
                            placeholder="yourname@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white"
                            required
                          />
                          <Mail className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
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
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white"
                            required
                          />
                          <Phone className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl shadow-lg transition text-xs cursor-pointer border-0"
                      >
                        {loading ? 'Sending...' : 'Send SMS'}
                      </button>
                      {otpType === 'phone' && (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={(e) => handleSendOTP(e, 'call')}
                          className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition text-xs cursor-pointer border-0"
                        >
                          {loading ? 'Calling...' : 'Call Me'}
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enter OTP Code</span>
                        <button 
                          onClick={() => setOtpSent(false)} 
                          className="text-blue-600 hover:underline text-[10px] font-bold"
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
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white text-center tracking-widest font-mono text-lg font-bold"
                          required
                        />
                        <KeyRound className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
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
                {recoveryStage === 1 ? (
                  <form onSubmit={handleForgotRequest} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                      <div className="relative mt-1.5 group">
                        <input
                          type="email"
                          placeholder="Enter registered email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white"
                          required
                        />
                        <Mail className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
                    >
                      {loading ? 'Requesting...' : 'Request Reset Token'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Token</label>
                      <div className="relative mt-1.5 group">
                        <input
                          type="text"
                          placeholder="RESET-XXXXXX"
                          value={recoveryToken}
                          onChange={(e) => setRecoveryToken(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white tracking-wider font-mono font-bold"
                          required
                        />
                        <Key className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                      <div className="relative mt-1.5 group">
                        <input
                          type="password"
                          placeholder="Enter new password"
                          value={newRecoveryPassword}
                          onChange={(e) => setNewRecoveryPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:bg-slate-100 focus:hover:bg-white"
                          required
                        />
                        <Lock className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" size={16} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
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
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.472-3.84-8.472-8.514 0-4.675 3.792-8.515 8.472-8.515 2.186 0 4.148.815 5.666 2.378l3.195-3.195C18.17 1.054 15.422 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.04 0 12.24-4.945 12.24-12.24 0-.825-.098-1.44-.22-1.955H12.24z"/>
                    </svg>
                  </button>
                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={() => handleTriggerSocial('facebook')}
                    className="py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center transition hover:-translate-y-0.5 text-blue-600"
                    title="Facebook Login"
                  >
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                    </svg>
                  </button>
                  {/* LinkedIn */}
                  <button
                    type="button"
                    onClick={() => handleTriggerSocial('linkedin')}
                    className="py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center transition hover:-translate-y-0.5 text-blue-750"
                    title="LinkedIn Login"
                  >
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation toggles */}
            <div className="text-center mt-5 text-xs text-slate-400 flex flex-wrap justify-center gap-x-2 gap-y-1">
              {authMode !== 'login' && (
                <button onClick={() => handleModeChange('login')} className="text-blue-600 hover:underline font-bold">
                  Login with Password
                </button>
              )}
              {authMode !== 'register' && (
                <>
                  {authMode !== 'login' && <span>•</span>}
                  <button onClick={() => handleModeChange('register')} className="text-blue-600 hover:underline font-bold">
                    Create Account
                  </button>
                </>
              )}
              {authMode !== 'otp' && (
                <>
                  <span>•</span>
                  <button onClick={() => handleModeChange('otp')} className="text-blue-600 hover:underline font-bold">
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
