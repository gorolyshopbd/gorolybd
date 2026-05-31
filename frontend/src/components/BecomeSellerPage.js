'use client';

import React, { useState, useContext } from 'react';
import { ShopContext } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { Store, Lock, Mail, Phone, User, Globe, ChevronDown, ArrowLeft, ArrowRight, Eye, EyeOff, Users, ShoppingBag, Calendar, Package, MessageSquare, Banknote, ShieldCheck, Smartphone, LayoutGrid } from 'lucide-react';

import { DIVISION_DISTRICTS, DISTRICT_UPAZILAS } from './bdLocations';

const sT = {
  en: {
    // Header
    sellerCenter: 'Seller Center',
    sellerDashboard: 'Seller Dashboard',
    logOut: 'Log Out',
    logIn: 'Log In',
    signUp: 'Sign Up',
    
    // Landing Page
    landingTitle: 'Start your\nonline shop\non Goroly Shop in\nminutes',
    growWithUs: 'Grow with us, and unlock rewards along the way.',
    exclusiveBenefits: 'Exclusive Seller Benefits — Coming Soon',
    benefitsSub: "We're building programs to recognize and reward the sellers who grow with Goroly Shop.",
    benefit1: "Early sellers get first access to new features and benefits",
    benefit2: "Priority access to programs and early launches",
    benefit3: "Dedicated support to help you reach your first sale faster",
    benefit4: "A chance to co-create the future of seller rewards with us",
    helpSub: 'Goroly Shop helps you reach your first customer faster - and grow from there.',
    
    // Metrics
    community: 'Seller community',
    onlineBusiness: 'Online Business',
    payoutCycle: 'Weekly Payout Cycle',
    orders: 'Countrywide Orders',
    
    // Why
    whyTitle: 'Why do sellers love\nselling on Goroly Shop?',
    whySub: "From first sale to full-scale growth Goroly Shop gives you the tools, visibility, and support to succeed. 100k+ customers across Bangladesh trust Goroly Shop as their go-to online marketplace. It's no wonder over 5.6K sellers choose us to showcase and sell their products 24/7.",
    oppTitle: 'Opportunity (reach more customers)',
    oppSub: '100k+ customers & access to 500+ seasonal sales events, promotions, and campaigns to boost your visibility.',
    supTitle: 'Support (24/7 dedicated helper)',
    supSub: 'Direct access to our dedicated merchant support team and resources to help you solve store issues instantly.',
    
    // Success Stories
    successTitle: 'Seller Success Stories',
    successSub: '5.6K+ sellers already trust Goroly Shop to grow their online business.',
    stories: [
      { text: "Goroly Shop has opened a new door of opportunity for us. Through this platform, we can easily reach customers. We believe that in the future, this platform will take our business further." },
      { text: "Goroly Shop has added a new dimension to our business. We can present our products properly and connect with customers easily. Due to reliable service and modern management, it is a highly effective solution for sellers." },
      { text: "Wishing Goroly Shop continued success and growth ahead. It was a pleasure being part of the journey with you. Reliable system and extremely convenient support." },
      { text: "Onboarding was smooth and direct. Our order volumes went up significantly. The weekly payout cycle ensures we always have steady working capital to expand." }
    ],
    
    // Login
    welcomeBack: 'Welcome Back',
    loginSub: 'Login to your Goroly Shop Seller Center dashboard',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    loginButton: 'Login to Dashboard',
    authenticating: 'Authenticating...',
    noAccount: "Don't have a seller account?",
    createAccount: 'Create Account',
    accessDenied: 'Access denied. Only seller accounts can access the dashboard.',
    
    // Register
    shopRegistration: 'Shop Registration',
    registerSub: 'If you are willing to become a seller on Goroly Shop, register here',
    shopName: 'Shop Name',
    ownerName: 'Owner / Representative Name',
    email: 'Email Address',
    password: 'Password',
    phone: 'Owner / Representative Phone',
    facebook: 'Facebook',
    instagram: 'Instagram',
    socialMedia: 'Social Media Links',
    address: 'Address',
    division: 'Division',
    district: 'District',
    upazila: 'Police Station/Upazila',
    addressDetails: 'House / Road & Additional Instruction',
    submitInfo: 'Submit Information',
    submittingInfo: 'Submitting Information...',
    alreadyHaveAccount: 'Already have an account?',
    chooseDivision: '-- Please choose your division --',
    chooseDistrict: '-- Please choose your city/district --',
    chooseUpazila: '-- Enter your Police Station/Upazila --',
    enterShopName: 'Enter your shop name',
    enterFullName: 'Enter your full name',
    enterEmail: 'Enter your email address',
    enterPassword: 'Enter password',
    enterPhone: 'Enter your phone number',
    enterFacebook: 'Enter your Facebook page link',
    enterInstagram: 'Enter your Instagram page link',
    enterAddressDetails: 'Enter house / road & additional instruction',
    sendSms: 'Send SMS',
    callMe: 'Call Me',
    sending: 'Sending...',
    calling: 'Calling...',
    verifying: 'Verifying...',
    verified: 'Verified',
    verify: 'Verify',
    enterOtpLabel: 'Enter 6-digit OTP code',
    enterOtpPlaceholder: 'Enter OTP',
    phoneRequiredWarning: 'Please verify your phone number using OTP first.',
    otpSentSuccess: 'OTP sent to your phone!',
    otpCallSuccess: 'Calling your phone with OTP...',
    phoneVerifiedSuccess: 'Phone number verified successfully!',
    
    // Alerts
    validPhoneAlert: 'Please enter a valid phone number.',
    enterOtpAlert: 'Please enter the OTP code.',
  },
  bn: {
    // Header
    sellerCenter: 'সেলার সেন্টার',
    sellerDashboard: 'সেলার ড্যাশবোর্ড',
    logOut: 'লগ আউট',
    logIn: 'লগ ইন',
    signUp: 'সাইন আপ',
    
    // Landing Page
    landingTitle: 'কয়েক মিনিটে\nআপনার অনলাইন শপ\nশুরু করুন\nগোরোলি শপ-এ',
    growWithUs: 'আমাদের সাথে বৃদ্ধি পান এবং পথেই আকর্ষণীয় পুরস্কার আনলক করুন।',
    exclusiveBenefits: 'এক্সক্লুসিভ বিক্রেতা সুবিধা — শীঘ্রই আসছে',
    benefitsSub: 'যারা গোরোলি শপের সাথে ব্যবসা বৃদ্ধি করছেন, তাদের সম্মানিত ও পুরস্কৃত করার জন্য আমরা প্রোগ্রাম তৈরি করছি।',
    benefit1: 'প্রাথমিক বিক্রেতারা নতুন ফিচার ও সুবিধার প্রথম অ্যাক্সেস পাবেন',
    benefit2: 'বিশেষ ক্যাম্পেইন ও আগে লঞ্চ হওয়া প্রোগ্রামে অগ্রাধিকার',
    benefit3: 'আপনার প্রথম বিক্রি দ্রুত পেতে ডেডিকেটেড মার্চেন্ট সাপোর্ট',
    benefit4: 'আমাদের সাথে সেলার রিওয়ার্ডের ভবিষ্যৎ তৈরি করার সুযোগ',
    helpSub: 'গোরোলি শপ আপনাকে দ্রুত প্রথম কাস্টমার পেতে সাহায্য করে - এবং সেখান থেকে ব্যবসা বড় করতে সাহায্য করে।',
    
    // Metrics
    community: 'বিক্রেতা সম্প্রদায়',
    onlineBusiness: 'অনলাইন ব্যবসা',
    payoutCycle: 'সাপ্তাহিক পেমেন্ট চক্র',
    orders: 'দেশব্যাপী অর্ডার',
    
    // Why
    whyTitle: 'বিক্রেতারা কেন\nগোরোলি শপে বিক্রি করতে ভালোবাসেন?',
    whySub: 'প্রথম বিক্রি থেকে শুরু করে ব্যবসার পূর্ণ প্রসার পর্যন্ত গোরোলি শপ আপনাকে সফল হওয়ার সব টুলস, ভিজিবিলিটি এবং সাপোর্ট প্রদান করে। বাংলাদেশ জুড়ে ১ লাখের বেশি ক্রেতা গোরোলি শপকে তাদের পছন্দের অনলাইন মার্কেটপ্লেস হিসেবে বিশ্বাস করেন। তাই ৫.৬ হাজারের বেশি বিক্রেতা তাদের পণ্য ২৪/৭ বিক্রির জন্য আমাদের বেছে নিয়েছেন।',
    oppTitle: 'সুযোগ (অধিক ক্রেতার কাছে পৌঁছান)',
    oppSub: '১ লাখ+ ক্রেতা এবং ৫০০+ সিজনাল সেলস ইভেন্ট, প্রোমোশন ও ক্যাম্পেইনে অংশ নিয়ে আপনার বিক্রি বাড়িয়ে নেওয়ার সুযোগ।',
    supTitle: 'সাপোর্ট (২৪/৭ ডেডিকেটেড মার্চেন্ট হেল্পার)',
    supSub: 'যেকোনো সমস্যা তাৎক্ষণিকভাবে সমাধান করতে আমাদের ডেডিকেটেড মার্চেন্ট সাপোর্ট টিম ও রিসোর্সে সরাসরি যোগাযোগের সুযোগ।',
    
    // Success Stories
    successTitle: 'বিক্রেতাদের সাফল্যের গল্প',
    successSub: '৫.৬K+ বিক্রেতা ইতিমধ্যেই তাদের অনলাইন ব্যবসা বাড়াতে গোরোলি শপকে বিশ্বাস করেছেন।',
    stories: [
      { text: "Goroly Shop আমাদের জন্য নতুন এক সুযোগের দরজা খুলেছে। এই প্ল্যাটফর্মের মাধ্যমে আমরা সহজে গ্রাহকের কাছে পৌঁছাতে পারছি। আমরা বিশ্বাস করি, ভবিষ্যতে এই প্ল্যাটফর্ম আমাদের ব্যবসাকে আরও এগিয়ে নেবে।" },
      { text: "Goroly Shop আমাদের ব্যবসায় নতুন মাত্রা যোগ করেছে। এই প্ল্যাটফর্মে আমরা আমাদের পণ্য সঠিকভাবে উপস্থাপন করতে পারছি এবং গ্রাহকের সাথে সহজে যুক্ত হতে পারছি। নির্ভরযোগ্য সেবা ও আধুনিক ব্যবস্থাপনার কারণে Goroly Shop বিক্রেতাদের জন্য একটি কার্যকর সমাধান হয়ে উঠেছে।" },
      { text: "গোরোলি শপের অব্যাহত সাফল্য ও প্রবৃদ্ধি কামনা করছি। আপনাদের সাথে এই যাত্রার অংশ হতে পেরে অত্যন্ত আনন্দিত। নির্ভরযোগ্য সিস্টেম এবং অত্যন্ত সুবিধাজনক মার্চেন্ট সাপোর্ট।" },
      { text: "অনবোর্ডিং অত্যন্ত সহজ এবং সরাসরি ছিল। আমাদের অর্ডারের সংখ্যা উল্লেখযোগ্যভাবে বৃদ্ধি পেয়েছে। সাপ্তাহিক পেমেন্ট চক্র নিশ্চিত করে যে আমাদের কাছে ব্যবসার প্রসারের জন্য সবসময় প্রয়োজনীয় মূলধন থাকে।" }
    ],
    
    // Login
    welcomeBack: 'স্বাগতম',
    loginSub: 'আপনার গোরোলি শপ সেলার সেন্টার ড্যাশবোর্ডে লগইন করুন',
    emailLabel: 'ইমেইল অ্যাড্রেস',
    passwordLabel: 'পাসওয়ার্ড',
    loginButton: 'ড্যাশবোর্ডে লগইন করুন',
    authenticating: 'যাচাই করা হচ্ছে...',
    noAccount: 'কোনো সেলার অ্যাকাউন্ট নেই?',
    createAccount: 'অ্যাকাউন্ট তৈরি করুন',
    accessDenied: 'প্রবেশাধিকার নেই। শুধুমাত্র বিক্রেতা অ্যাকাউন্টগুলো ড্যাশবোর্ডে প্রবেশ করতে পারবে।',
    
    // Register
    shopRegistration: 'শপ রেজিস্ট্রেশন',
    registerSub: 'আপনি যদি গোরোলি শপ-এ একজন বিক্রেতা হতে চান, তবে এখানে নিবন্ধন করুন',
    shopName: 'দোকানের নাম (Shop Name)',
    ownerName: 'মালিক / প্রতিনিধির নাম',
    email: 'ইমেইল ঠিকানা',
    password: 'পাসওয়ার্ড',
    phone: 'মালিক / প্রতিনিধির ফোন নম্বর',
    facebook: 'ফেসবুক',
    instagram: 'ইনস্টাগ্রাম',
    socialMedia: 'সোশ্যাল মিডিয়া লিঙ্কসমূহ',
    address: 'ঠিকানা',
    division: 'বিভাগ',
    district: 'জেলা',
    upazila: 'থানা / উপজেলা',
    addressDetails: 'বাসা / রোড নম্বর এবং অতিরিক্ত নির্দেশনা',
    submitInfo: 'তথ্য জমা দিন',
    submittingInfo: 'তথ্য জমা দেওয়া হচ্ছে...',
    alreadyHaveAccount: 'ইতিমধ্যেই একটি অ্যাকাউন্ট আছে?',
    chooseDivision: '-- অনুগ্রহ করে আপনার বিভাগ নির্বাচন করুন --',
    chooseDistrict: '-- অনুগ্রহ করে আপনার জেলা নির্বাচন করুন --',
    chooseUpazila: '-- আপনার থানা / উপজেলা নির্বাচন করুন --',
    enterShopName: 'আপনার দোকানের নাম লিখুন',
    enterFullName: 'আপনার পূর্ণ নাম লিখুন',
    enterEmail: 'আপনার ইমেল ঠিকানা লিখুন',
    enterPassword: 'পাসওয়ার্ড লিখুন',
    enterPhone: 'আপনার ফোন নম্বর লিখুন',
    enterFacebook: 'আপনার ফেসবুক পেজের লিঙ্ক লিখুন',
    enterInstagram: 'আপনার ইনস্টাগ্রাম পেজের লিঙ্ক লিখুন',
    enterAddressDetails: 'বাসা / রোড নম্বর এবং অতিরিক্ত নির্দেশনা লিখুন',
    sendSms: 'SMS পাঠান',
    callMe: 'কল করুন',
    sending: 'পাঠানো হচ্ছে...',
    calling: 'কল করা হচ্ছে...',
    verifying: 'যাচাই করা হচ্ছে...',
    verified: 'যাচাইকৃত',
    verify: 'যাচাই করুন',
    enterOtpLabel: '৬ সংখ্যার ওটিপি (OTP) কোড লিখুন',
    enterOtpPlaceholder: 'OTP লিখুন',
    phoneRequiredWarning: 'অনুগ্রহ করে প্রথমে ওটিপি (OTP) দিয়ে আপনার ফোন নম্বর যাচাই করুন।',
    otpSentSuccess: 'আপনার ফোনে ওটিপি পাঠানো হয়েছে!',
    otpCallSuccess: 'ওটিপি সহ আপনার ফোনে কল করা হচ্ছে...',
    phoneVerifiedSuccess: 'ফোন নম্বর সফলভাবে যাচাই করা হয়েছে!',
    
    // Alerts
    validPhoneAlert: 'অনুগ্রহ করে একটি সঠিক ফোন নম্বর লিখুন।',
    enterOtpAlert: 'অনুগ্রহ করে ওটিপি (OTP) কোডটি লিখুন।',
  }
};

export default function BecomeSellerPage({ onBackToHome }) {
  const { user, logout, login, sendOtpCode } = useContext(ShopContext);
  const { lang, setLang } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [authMode, setAuthMode] = useState('landing'); // landing, login, register
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Form states
  const [name, setName] = useState(''); // Shop Name
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Owner Phone
  const [password, setPassword] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [addressDetails, setAddressDetails] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const t = (key) => {
    return sT[lang]?.[key] || sT['en']?.[key] || key;
  };
  const stories = sT[lang]?.stories || sT['en']?.stories || [];

  const handleSendOtp = async (method = 'sms') => {
    if (!phone || phone.trim().length < 10) {
      setOtpError(t('validPhoneAlert'));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    setPhoneVerified(false);

    try {
      const res = await sendOtpCode('phone', phone, method);
      setOtpLoading(false);
      if (res.success) {
        setOtpSent(true);
        setOtpSuccess(method === 'call' ? t('otpCallSuccess') : t('otpSentSuccess'));
      } else {
        setOtpError(res.error || 'Failed to send OTP');
      }
    } catch (error) {
      setOtpLoading(false);
      setOtpError(error.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError(t('enterOtpAlert'));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const res = await fetch(`${API_URL}/users/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'phone', target: phone, otp: otpCode, onlyVerify: true }),
      });
      const data = await res.json();
      setOtpLoading(false);
      if (res.ok) {
        setPhoneVerified(true);
        setOtpSuccess(t('phoneVerifiedSuccess'));
        setOtpError('');
      } else {
        setOtpError(data.message || 'Invalid OTP code');
      }
    } catch (error) {
      setOtpLoading(false);
      setOtpError(error.message || 'Verification failed');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phoneVerified) {
      setErrorMsg(t('phoneRequiredWarning'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          phone, 
          role: 'seller',
          owner_name: ownerName,
          facebook,
          instagram,
          division,
          district,
          upazila,
          address_details: addressDetails
        }),
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Login failed');
        return;
      }

      // Check if user is a seller or admin
      if (res.role === 'seller' || res.isAdmin) {
        window.location.href = '/admin';
      } else {
        setErrorMsg(t('accessDenied'));
      }
    } catch (error) {
      setLoading(false);
      setErrorMsg(error.message || 'Login failed');
    }
  };

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setErrorMsg('');
    setName('');
    setOwnerName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setFacebook('');
    setInstagram('');
    setDivision('');
    setDistrict('');
    setUpazila('');
    setAddressDetails('');
    setOtpSent(false);
    setOtpCode('');
    setPhoneVerified(false);
    setOtpLoading(false);
    setOtpError('');
    setOtpSuccess('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* ── HEADER ── */}
      <header className="flex justify-between items-center px-6 sm:px-12 py-4 border-b border-slate-100 bg-white sticky top-0 z-50">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => authMode === 'landing' ? onBackToHome() : handleModeChange('landing')} 
            className="cursor-pointer flex items-center gap-3"
          >
            {/* Shopping Bag Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#EC4899] to-[#D946EF] rounded-xl shadow-md">
              <div className="absolute top-1.5 w-4 h-4 border-2 border-white rounded-t-full opacity-90" style={{ borderBottom: 'none' }} />
              <svg className="w-5 h-5 text-white mt-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="leading-none text-left">
              <span className="text-2xl font-black text-[#00A8E8] tracking-tight">Goroly Shop</span>
              <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">{t('sellerCenter')}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Log in, Sign up, Country, Language */}
        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-sm font-extrabold text-slate-800">{user.name}</span>
                <span className="block text-[10px] font-bold text-slate-400 capitalize">{user.role}</span>
              </div>
              {user.role === 'seller' || user.isAdmin ? (
                <button 
                  onClick={() => window.location.href = '/admin'}
                  className="bg-[#FF6600] hover:bg-[#e05a00] text-white px-6 py-2 rounded-full font-bold text-sm transition shadow-md shadow-[#FF6600]/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <LayoutGrid size={13} /> {t('sellerDashboard')}
                </button>
              ) : (
                <button 
                  onClick={logout}
                  className="border-2 border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/5 px-5 py-1.5 rounded-full font-bold text-sm transition cursor-pointer"
                >
                  {t('logOut')}
                </button>
              )}
            </div>
          ) : (
            <>
              <button 
                onClick={() => handleModeChange('login')}
                className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full font-bold text-sm transition cursor-pointer ${
                  authMode === 'login' 
                    ? 'bg-[#FF6600]/10 border-2 border-[#FF6600] text-[#FF6600]' 
                    : 'border-2 border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/5'
                }`}
              >
                <Lock size={13} /> {t('logIn')}
              </button>
              
              <button 
                onClick={() => handleModeChange('register')}
                className="bg-[#FF6600] hover:bg-[#e05a00] text-white px-6 py-2 rounded-full font-bold text-sm transition shadow-md shadow-[#FF6600]/10 cursor-pointer"
              >
                {t('signUp')}
              </button>
            </>
          )}

          {/* Country flag selector */}
          <div className="hidden md:flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 transition">
            <span className="text-base" title="Bangladesh">🇧🇩</span>
            <span className="text-xs font-bold">Bangladesh</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition font-bold text-xs bg-transparent border-0 cursor-pointer"
            >
              <span>{lang === 'en' ? 'English' : 'বাংলা'}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {showLangDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                  <button 
                    onClick={() => { setLang('en'); setShowLangDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-[12px] font-semibold hover:bg-orange-50 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'en' ? 'text-[#FF6600]' : 'text-slate-600'}`}
                  >
                    <span>🇬🇧</span> English
                  </button>
                  <button 
                    onClick={() => { setLang('bn'); setShowLangDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-[12px] font-semibold hover:bg-orange-50 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'bn' ? 'text-[#FF6600]' : 'text-slate-600'}`}
                  >
                    <span>🇧🇩</span> বাংলা
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-grow flex flex-col justify-center bg-gradient-to-tr from-[#e5f8ff] via-[#f5fdff] to-white">
        
        {/* 1. LANDING MODE */}
        {authMode === 'landing' && (
          <div className="w-full flex flex-col items-center">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 md:py-16 grid md:grid-cols-12 gap-12 items-center w-full">
              {/* Left Info Column */}
              <div className="md:col-span-5 space-y-8 text-left">
                <h1 className="text-4xl sm:text-[50px] font-black text-[#0f2a4a] leading-[1.12] tracking-tight whitespace-pre-line">
                  {t('landingTitle')}
                </h1>
                
                <button 
                  onClick={() => handleModeChange('register')}
                  className="bg-[#FF6600] hover:bg-[#e05a00] text-white px-9 py-3.5 rounded-full font-bold text-base transition shadow-lg shadow-[#FF6600]/25 hover:-translate-y-0.5 cursor-pointer"
                >
                  {t('signUp')}
                </button>
              </div>

              {/* Right Mockup Column */}
              <div className="md:col-span-7 flex justify-center items-center">
                <div className="relative w-full max-w-[620px] transition duration-500 hover:scale-[1.01]">
                  <img 
                    src="/seller_mockup.png" 
                    alt={t('sellerCenter')} 
                    className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,168,232,0.15)]"
                  />
                </div>
              </div>
            </div>

            {/* Divider / Sub-header Section */}
            <div className="w-full bg-white py-12 border-t border-slate-100 flex justify-center items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-500 text-center max-w-2xl px-6">
                {t('helpSub')}
              </h2>
            </div>

            {/* Benefits Section */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 pb-20 pt-8 grid md:grid-cols-12 gap-12 items-center w-full bg-white">
              
              {/* Left Side: Entrepreneur Image */}
              <div className="md:col-span-5 flex justify-center items-center">
                <div className="relative w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl transition duration-500 hover:scale-[1.01]">
                  <img 
                    src="/seller_benefit.png" 
                    alt="Seller benefits illustration" 
                    className="w-full h-auto object-cover aspect-[4/5]"
                  />
                </div>
              </div>

              {/* Right Side: Benefits list */}
              <div className="md:col-span-7 space-y-6 text-left">
                {/* Pill badge */}
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFF5F0] text-[#FF6600] rounded-full text-xs sm:text-sm font-extrabold">
                  <span>🔥</span> {t('growWithUs')}
                </div>

                {/* Big Heading */}
                <h2 className="text-3xl sm:text-4xl font-black text-[#0f2a4a] leading-tight">
                  {t('exclusiveBenefits')}
                </h2>

                {/* Subtitle */}
                <p className="text-slate-500 text-sm font-semibold max-w-xl">
                  {t('benefitsSub')}
                </p>

                {/* Benefit points in a light-orange box */}
                <div className="bg-[#FFF5F0] rounded-3xl p-6 sm:p-8 space-y-4">
                  {[
                    t('benefit1'),
                    t('benefit2'),
                    t('benefit3'),
                    t('benefit4')
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0 text-[#FF6600] font-black">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700 text-xs sm:text-sm font-bold leading-normal">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Stats Grid Section */}
            <div className="w-full bg-slate-50 py-16 border-t border-slate-100 flex justify-center items-center">
              <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                {/* Metric 1 */}
                <div className="bg-[#F0F7FF] border border-blue-100/50 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 transition duration-300 hover:shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xs text-blue-600">
                    <Users size={24} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-blue-600">5.6K+</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500">{t('community')}</div>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#ECFDF5] border border-emerald-100/50 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 transition duration-300 hover:shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xs text-emerald-600">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#059669]">24×7</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500">{t('onlineBusiness')}</div>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#FFFBEB] border border-amber-100/50 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 transition duration-300 hover:shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xs text-amber-600">
                    <Calendar size={24} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#D97706]">7</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500">{t('payoutCycle')}</div>
                </div>

                {/* Metric 4 */}
                <div className="bg-[#FAF5FF] border border-purple-100/50 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 transition duration-300 hover:shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xs text-purple-600">
                    <Package size={24} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#7C3AED]">240037+</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500">{t('orders')}</div>
                </div>
              </div>
            </div>

            {/* Why Sellers Love Selling Section */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 py-20 grid md:grid-cols-12 gap-12 items-center w-full bg-white border-t border-slate-100">
              
              {/* Left Side: Text and benefits features */}
              <div className="md:col-span-7 space-y-6 text-left">
                {/* Big Heading */}
                <h2 className="text-3xl sm:text-4xl font-black text-[#0f2a4a] leading-tight whitespace-pre-line">
                  {t('whyTitle')}
                </h2>

                {/* Subtitle Paragraph */}
                <p className="text-slate-500 text-sm sm:text-base font-semibold leading-relaxed max-w-xl">
                  {t('whySub')}
                </p>

                {/* Features detail list */}
                <div className="space-y-5 pt-4">
                  {/* Feature 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FFF5F0] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#FF6600]">
                      <Banknote size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">
                        {t('oppTitle')}
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed">
                        {t('oppSub')}
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FFF5F0] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#FF6600]">
                      <MessageSquare size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">
                        {t('supTitle')}
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed">
                        {t('supSub')}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Side: Portrait image of male entrepreneur */}
              <div className="md:col-span-5 flex justify-center items-center">
                <div className="relative w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl transition duration-500 hover:scale-[1.01]">
                  <img 
                    src="/seller_man.png" 
                    alt="Successful Seller on Goroly Shop" 
                    className="w-full h-auto object-cover aspect-[4/5]"
                  />
                </div>
              </div>

            </div>

            {/* Seller Success Stories Section */}
            <div className="w-full bg-[#e5f8ff]/30 py-20 border-t border-slate-100 flex flex-col items-center overflow-hidden">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee-reverse {
                  0% { transform: translateX(-50%); }
                  100% { transform: translateX(0); }
                }
                .animate-marquee-reverse {
                  animation: marquee-reverse 35s linear infinite;
                }
                .animate-marquee-reverse:hover {
                  animation-play-state: paused;
                }
              `}} />

              <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center space-y-4 mb-12">
                <h2 className="text-3xl sm:text-4xl font-black text-[#0f2a4a]">{t('successTitle')}</h2>
                <p className="text-slate-500 text-sm sm:text-base font-semibold">{t('successSub')}</p>
              </div>

              {/* Slider Track */}
              <div className="w-full overflow-hidden relative py-4">
                {/* Fade edges */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#f5fdff] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#f5fdff] to-transparent z-10 pointer-events-none" />

                {/* Marquee Wrapper scrolling Left to Right */}
                <div className="flex gap-6 w-max animate-marquee-reverse">
                  {/* First list of cards */}
                  {stories.map((st, idx) => (
                    <div key={`c1-${idx}`} className="bg-white rounded-[32px] border border-slate-100 p-8 w-[360px] sm:w-[420px] flex-shrink-0 shadow-sm hover:shadow-md transition duration-300">
                      <div className="space-y-6 text-left">
                        {/* Blue Quote Icon */}
                        <span className="text-[52px] font-black text-[#FF6600]/20 leading-none block font-serif">“</span>
                        
                        {/* Review text */}
                        <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                          {st.text}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Second identical list of cards for infinite looping */}
                  {stories.map((st, idx) => (
                    <div key={`c2-${idx}`} className="bg-white rounded-[32px] border border-slate-100 p-8 w-[360px] sm:w-[420px] flex-shrink-0 shadow-sm hover:shadow-md transition duration-300">
                      <div className="space-y-6 text-left">
                        {/* Blue Quote Icon */}
                        <span className="text-[52px] font-black text-[#FF6600]/20 leading-none block font-serif">“</span>
                        
                        {/* Review text */}
                        <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                          {st.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. LOGIN MODE */}
        {authMode === 'login' && (
          <div className="max-w-md w-full mx-auto px-6 py-12">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-2xl shadow-[#FF6600]/5 space-y-6">
              
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-[#FF6600]/10 rounded-2xl flex items-center justify-center text-[#FF6600]">
                  <Store size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">{t('welcomeBack')}</h2>
                <p className="text-slate-400 text-xs font-semibold">{t('loginSub')}</p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl text-xs font-bold leading-relaxed">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">{t('emailLabel')}</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="seller@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-[#FF6600] rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300"
                      required
                    />
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">{t('passwordLabel')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-[#FF6600] rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300"
                      required
                    />
                    <Lock className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition border-0 bg-transparent cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-2xl shadow-lg shadow-[#FF6600]/10 transition flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('authenticating')}
                    </>
                  ) : (
                    <>
                      {t('loginButton')}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-xs text-slate-500">
                  {t('noAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('register')}
                    className="text-[#FF6600] font-extrabold hover:underline cursor-pointer border-0 bg-transparent"
                  >
                    {t('createAccount')}
                  </button>
                </p>
              </div>

            </div>
          </div>
        )}

        {/* 3. REGISTER MODE */}
        {authMode === 'register' && (
          <div className="max-w-4xl w-full mx-auto px-4 py-8">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-2xl shadow-[#FF6600]/5 space-y-6">
              
              <div className="text-center flex flex-col items-center">
                <div className="inline-flex flex-col items-center bg-[#FFF5F0] border-2 border-[#FF6600] rounded-3xl px-8 py-4 shadow-md transition duration-300 hover:scale-[1.02] cursor-default">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#FF6600] tracking-tight">{t('shopRegistration')}</h2>
                  <p className="text-[#FF6600]/80 text-xs sm:text-sm font-extrabold mt-1.5">{t('registerSub')}</p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl text-xs font-bold leading-relaxed">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x md:divide-slate-200">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1.5 ml-1">
                        {t('shopName')} <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={t('enterShopName')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1.5 ml-1">
                        {t('ownerName')} <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={t('enterFullName')}
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1.5 ml-1">
                        {t('email')} <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder={t('enterEmail')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1.5 ml-1">
                        {t('password')} <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={t('enterPassword')}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300"
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition border-0 bg-transparent cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1.5 ml-1 flex items-center gap-1">
                        <Smartphone size={16} className="text-[#FF6600]" />
                        {t('phone')} <span className="text-orange-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          placeholder={t('enterPhone')}
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setPhoneVerified(false);
                            setOtpSent(false);
                            setOtpCode('');
                            setOtpError('');
                            setOtpSuccess('');
                          }}
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300"
                          required
                          disabled={phoneVerified}
                        />
                        {!otpSent ? (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSendOtp('sms')}
                              disabled={otpLoading}
                              className="px-3.5 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white text-xs font-bold rounded-lg transition duration-300 cursor-pointer whitespace-nowrap border-0"
                            >
                              {otpLoading ? t('sending') : t('sendSms')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendOtp('call')}
                              disabled={otpLoading}
                              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition duration-300 cursor-pointer whitespace-nowrap border-0"
                            >
                              {otpLoading ? t('calling') : t('callMe')}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otpLoading || phoneVerified}
                            className={`px-4 py-2.5 text-white text-xs font-bold rounded-lg transition duration-300 whitespace-nowrap border-0 ${
                              phoneVerified ? 'bg-emerald-500 cursor-default' : 'bg-[#FF6600] hover:bg-[#e05a00] cursor-pointer'
                            }`}
                          >
                            {otpLoading ? t('verifying') : phoneVerified ? t('verified') : t('verify')}
                          </button>
                        )}
                      </div>
                      
                      {otpSent && !phoneVerified && (
                        <div className="mt-3 space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block ml-1">
                            {t('enterOtpLabel')} <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={t('enterOtpPlaceholder')}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300 font-mono tracking-widest text-center"
                            maxLength={6}
                          />
                        </div>
                      )}

                      {otpError && <p className="text-orange-600 text-[11px] font-bold mt-1.5 ml-1 flex items-center gap-1">⚠️ {otpError}</p>}
                      {otpSuccess && <p className="text-emerald-600 text-[11px] font-bold mt-1.5 ml-1 flex items-center gap-1">✅ {otpSuccess}</p>}
                    </div>

                    <div>
                      <h3 className="text-[#FF6600] font-bold text-base mt-6 mb-3 ml-1">{t('socialMedia')}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 block mb-1.5 ml-1">{t('facebook')}</label>
                          <input
                            type="url"
                            placeholder={t('enterFacebook')}
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700 block mb-1.5 ml-1">{t('instagram')}</label>
                          <input
                            type="url"
                            placeholder={t('enterInstagram')}
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Address Details) */}
                  <div className="md:pl-8 space-y-4">
                    <h3 className="text-[#FF6600] font-bold text-base mb-3">{t('address')}</h3>

                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1.5 ml-1">
                        {t('division')} <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={division}
                          onChange={(e) => {
                            setDivision(e.target.value);
                            setDistrict('');
                            setUpazila('');
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300 appearance-none cursor-pointer"
                          required
                        >
                          <option value="" disabled>{t('chooseDivision')}</option>
                          {Object.keys(DIVISION_DISTRICTS).map((div) => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1.5 ml-1">
                        {t('district')} <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={district}
                          onChange={(e) => {
                            setDistrict(e.target.value);
                            setUpazila('');
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300 appearance-none cursor-pointer"
                          required
                          disabled={!division}
                        >
                          <option value="" disabled>{t('chooseDistrict')}</option>
                          {division && DIVISION_DISTRICTS[division].map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1.5 ml-1">
                        {t('upazila')} <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={upazila}
                          onChange={(e) => setUpazila(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300 appearance-none cursor-pointer"
                          required
                          disabled={!district}
                        >
                          <option value="" disabled>{t('chooseUpazila')}</option>
                          {district && (DISTRICT_UPAZILAS[district] || [`${district} Sadar`]).map((upz) => (
                            <option key={upz} value={upz}>{upz}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 block mb-1.5 ml-1">
                        {t('addressDetails')} <span className="text-orange-500">*</span>
                      </label>
                      <textarea
                        rows="3"
                        placeholder={t('enterAddressDetails')}
                        value={addressDetails}
                        onChange={(e) => setAddressDetails(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-[#FF6600] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6600]/10 focus:border-[#FF6600] transition duration-300 resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button & redirection links */}
                <div className="flex flex-col items-center justify-center space-y-4 pt-6 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full max-w-lg py-3.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-full transition shadow-lg shadow-[#FF6600]/15 flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t('submittingInfo')}
                      </>
                    ) : (
                      <>
                        {t('submitInfo')}
                      </>
                    )}
                  </button>

                  <p className="text-sm text-slate-500 font-bold">
                    {t('alreadyHaveAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => handleModeChange('login')}
                      className="text-[#FF6600] font-extrabold hover:underline cursor-pointer border-0 bg-transparent"
                    >
                      {t('logIn')}
                    </button>
                  </p>
                </div>
              </form>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}