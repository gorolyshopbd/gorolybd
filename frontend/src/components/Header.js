'use client';

import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag, Search, User, Heart, Menu, X, LogOut, LayoutDashboard, Sun, Moon, ChevronDown, Zap, MapPin, GitCompare, Truck, PhoneCall } from 'lucide-react';
import CompareModal from './CompareModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Header({ onCartClick, onAuthClick, onSearchChange, currentSearch, onTabChange, activeTab }) {
  const { user, logout, cartItems, compareList = [] } = useContext(ShopContext);
  const { lang, t, setLang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSettings, setHeaderSettings] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState([]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('shopio-dark-mode');
    const isDark = stored === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('shopio-dark-mode', next.toString());
    document.documentElement.classList.toggle('dark', next);
  };

  useEffect(() => {
    fetch(`${API_URL}/settings/public`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setHeaderSettings(d); })
      .catch(() => {});

    fetch(`${API_URL}/categories`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setCategories(d || []))
      .catch(() => {});

    fetch(`${API_URL}/pages/public/all`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPages(d || []))
      .catch(() => {});
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleNavClick = (tab, isBrands, isDeals) => {
    if (isBrands) {
      onSearchChange('');
      onTabChange('shop');
    } else if (isDeals) {
      onSearchChange('Sale');
      onTabChange('shop');
    } else {
      onTabChange(tab);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="w-full bg-blue-600 text-white text-center text-[11px] sm:text-xs font-semibold py-1.5 sm:py-2 px-2 tracking-wide leading-tight">
        {lang === 'bn' ? 'সারা বাংলাদেশে ফ্রি ডেলিভারি 🚚 | অর্ডার: ৮৮০১২৩৪৫৬৭৮৯০' : '🚚 Free Delivery Bangladesh | Call 8801234567890'}
      </div>

      {/* Top Utility Bar */}
      <div className="w-full bg-white border-b border-gray-200 text-[13px] text-gray-600 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 sm:gap-5 flex-wrap">

            {/* Language */}
            <div className="relative">
              <button onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1 cursor-pointer bg-transparent border-0 text-gray-500 hover:text-blue-600 transition"
              >
                <span>{lang === 'en' ? '🇬🇧' : '🇧🇩'}</span>
                <span className="font-medium">{lang === 'en' ? 'EN' : 'বাংলা'}</span>
                <ChevronDown size={12} />
              </button>
              {showLangDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)}></div>
                  <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-24 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <button onClick={() => { setLang('en'); setShowLangDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 bg-transparent border-0 cursor-pointer ${lang === 'en' ? 'text-blue-600' : 'text-gray-700'}`}
                    ><span>🇬🇧</span> English</button>
                    <button onClick={() => { setLang('bn'); setShowLangDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 bg-transparent border-0 cursor-pointer ${lang === 'bn' ? 'text-blue-600' : 'text-gray-700'}`}
                    ><span>🇧🇩</span> বাংলা</button>
                  </div>
                </>
              )}
            </div>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* Currency */}
            <div className="flex items-center gap-1 text-gray-500 font-medium cursor-pointer hover:text-blue-600 transition">
              <span>{headerSettings.currency || 'BDT'}</span>
              <ChevronDown size={12} />
            </div>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* Find Store */}
            <a href={headerSettings.topBarStoreLink || '#'}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition font-medium no-underline"
            >
              <MapPin size={13} /> <span>{t('findStore')}</span>
            </a>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* Compare */}
            <a href="#" onClick={(e) => { e.preventDefault(); setCompareOpen(true); }}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition font-medium no-underline"
            >
              <GitCompare size={13} /> <span>{t('compare')}</span>
              {compareList.length > 0 && (
                <span className="bg-blue-600 text-white text-[9px] font-black rounded-full px-1.5 py-0.5">{compareList.length}</span>
              )}
            </a>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* Track Order */}
            <button onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition font-medium bg-transparent border-0 cursor-pointer"
            >
              <Truck size={13} /> <span>{t('trackOrder')}</span>
            </button>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* Apps */}
            <div className="flex items-center gap-2">
              <a href={headerSettings.topBarPlayStoreLink || '#'}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition font-medium no-underline"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.25 3.03v17.94c0 .33.18.63.48.78.3.15.66.12.93-.09l9.36-7.49 3.06-2.45c.42-.34.42-.98 0-1.32l-3.06-2.45-9.36-7.49C6.39.72 6.03.69 5.73.84c-0.3.15-.48.45-.48.78z"/>
                </svg>
                <span>Play Store</span>
              </a>
              <span className="text-gray-200">/</span>
              <a href={headerSettings.topBarAppStoreLink || '#'}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition font-medium no-underline"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.99.08 2.16-.52 2.82-1.33z"/>
                </svg>
                <span>App Store</span>
              </a>
            </div>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* Helpline */}
            <a href={`tel:${headerSettings.topBarHelpline || '8801234567890'}`}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition font-semibold no-underline"
            >
              <PhoneCall size={13} />
              <span>{headerSettings.topBarHelpline || '8801234567890'}</span>
            </a>

          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b-2 border-[#FF6600] shadow-xs">
        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => onTabChange('home')} 
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-600 flex items-center gap-1.5"
            >
              {headerSettings.headerLogo ? (
                <img src={headerSettings.headerLogo} alt={headerSettings.siteTitle || 'Shopio'} className="h-8 sm:h-12 w-auto object-contain" />
              ) : (
                <>
                  <span className="bg-blue-600 text-white p-2 rounded-lg text-xl flex items-center justify-center font-bold">
                    S
                  </span>
                  Shopio<span className="text-amber-500">.</span>
                </>
              )}
            </button>
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex space-x-10 font-bold text-slate-800 text-lg lg:text-xl">
            {user && !user.isAdmin && user.role !== 'seller' && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`hover:text-blue-600 transition ${activeTab === 'dashboard' ? 'text-blue-600 font-black' : ''}`}
              >
                {t('dashboard')}
              </button>
            )}
          </nav>

          {/* Search bar */}
          <div className="hidden sm:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder={lang === 'bn' ? "অর্ডার, পণ্য, ক্যাটাগরি খুঁজুন..." : "Search for orders, products, categories..."}
              value={currentSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full text-base bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Search Icon (Mobile only) - opens drawer */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden p-3 text-slate-600 hover:bg-slate-100 rounded-full transition">
              <Search size={24} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
              className="p-3 text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            {/* User Dropdown / Auth trigger */}
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (user.isAdmin || user.role === 'seller') {
                      window.location.href = '/admin';
                    } else {
                      onTabChange('dashboard');
                    }
                  }}
                  className="hidden md:flex flex-col text-right hover:text-blue-600 transition cursor-pointer"
                >
                  <span className="text-base font-bold text-slate-800">{user.name}</span>
                  <span className="text-sm font-semibold text-slate-400 capitalize">{user.role === 'seller' ? (lang === 'bn' ? 'বিক্রেতা' : 'Seller') : (user.isAdmin ? (lang === 'bn' ? 'অ্যাডমিন' : 'Admin') : (lang === 'bn' ? 'গ্রাহক' : 'Customer'))}</span>
                </button>
                <button
                  onClick={logout}
                  title={lang === 'bn' ? "লগআউট" : "Logout"}
                  className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-50/50 rounded-full transition flex items-center gap-1.5"
                >
                  <LogOut size={24} />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="p-3 text-slate-600 hover:bg-slate-100 rounded-full transition flex items-center gap-2"
              >
                <User size={24} />
                <span className="hidden md:inline text-lg font-bold">{t('login')}</span>
              </button>
            )}

            {/* Wishlist */}
            <button onClick={() => onTabChange('wishlist')} className="p-3.5 text-slate-600 hover:bg-slate-100 rounded-full transition relative">
              <Heart size={28} />
            </button>

            {/* Cart Icon */}
            <button
              onClick={onCartClick}
              className="p-3.5 text-slate-600 hover:bg-slate-100 rounded-full transition relative flex items-center justify-center"
            >
              <ShoppingBag size={28} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[12px] font-black rounded-full w-6 h-6 flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
      </div>

      {/* Secondary Navbar (Desktop Only) */}
      <div className="hidden md:block bg-black text-white text-sm font-semibold select-none border-t border-zinc-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          
          {/* Left Side: All Nav Links */}
          <div className="flex items-center gap-0">
            
            {/* Shop By Categories Dropdown */}
            <div className="relative group/cat">
              <button className="flex items-center gap-2 text-white hover:text-amber-500 font-bold py-3 pr-8 transition cursor-pointer bg-transparent border-0 border-r border-zinc-700">
                <Menu size={18} />
                <span>{t('shopByCategories')}</span>
                <ChevronDown size={14} />
              </button>
              
              {/* Category Dropdown Content */}
              <div className="absolute left-0 top-full hidden group-hover/cat:block w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      onSearchChange(cat.name);
                      onTabChange('shop');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#FF6600] transition flex items-center gap-2 bg-transparent border-0 cursor-pointer"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Nav Links - Left aligned after categories */}
            <div className="flex items-center pl-8 gap-6 font-bold">
              <button onClick={() => { onSearchChange(''); onTabChange('shop'); }} className="hover:text-[#FF6600] transition cursor-pointer bg-transparent border-0 text-white font-semibold text-sm py-3">{t('products')}</button>
              <button onClick={() => { onSearchChange(''); onTabChange('shop'); }} className="hover:text-[#FF6600] transition cursor-pointer bg-transparent border-0 text-white font-semibold text-sm py-3">{t('store')}</button>
              <button onClick={() => { onSearchChange(''); onTabChange('shop'); }} className="hover:text-[#FF6600] transition cursor-pointer bg-transparent border-0 text-white font-semibold text-sm py-3">{t('brands')}</button>
              
              {/* Pages Dropdown */}
              <div className="relative group/pages">
                <button className="flex items-center gap-1 hover:text-[#FF6600] transition cursor-pointer font-semibold bg-transparent border-0 text-white text-sm py-3">
                  <span>{t('pages')}</span>
                  <ChevronDown size={13} />
                </button>
                
                {/* Pages Dropdown Content */}
                <div className="absolute left-0 top-full hidden group-hover/pages:block w-48 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  {pages.length === 0 ? (
                    <span className="block px-4 py-2 text-xs text-slate-400">{lang === 'bn' ? 'কোনো পেইজ নেই' : 'No pages'}</span>
                  ) : pages.map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => onTabChange(`page-${p.slug}`)}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#FF6600] transition bg-transparent border-0 cursor-pointer"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
          
          {/* Right: Daily Deals Button */}
          <div>
            <button 
              onClick={() => { onSearchChange('Sale'); onTabChange('shop'); }}
              className="flex items-center gap-1.5 bg-[#FF6600] text-white px-4 py-2 text-[12px] rounded-lg font-extrabold shadow hover:bg-amber-500 hover:text-white transition duration-300 cursor-pointer border-0"
            >
              <Zap size={14} className="text-white fill-white" />
              <span>{t('dailyDeals')}</span>
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Nav Links (visible below header) */}
      <div className="md:hidden border-t border-slate-100 bg-white px-2">
        <div className="flex overflow-x-auto gap-1 py-1.5 scrollbar-hide">
          {[
            { tab: 'brands', label: t('brands'), isBrands: true },
            { tab: 'deals', label: t('dailyDeals'), isDeals: true },
            ...(user && !user.isAdmin && user.role !== 'seller' ? [{ tab: 'dashboard', label: t('dashboard') }] : []),
          ].map((item) => {
            const isActive = activeTab === item.tab && !item.isBrands && !item.isDeals;
            return (
              <button
                key={item.tab}
                onClick={() => item.isAdminLink ? (window.location.href = '/admin') : handleNavClick(item.tab, item.isBrands, item.isDeals)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.isDeals && <Zap size={12} className="text-amber-500 fill-amber-500" />}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-inner">
          <input
            type="text"
            placeholder={lang === 'bn' ? "পণ্য খুঁজুন..." : "Search products..."}
            value={currentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-base bg-slate-50 focus:bg-white focus:outline-hidden"
          />
          <nav className="flex flex-col gap-2 font-bold text-lg text-slate-700">
            <button
              onClick={() => handleNavClick('shop', true, false)}
              className="text-left py-2.5 px-4 hover:bg-slate-50 rounded-lg transition text-slate-700"
            >
              {t('brands')}
            </button>
            <button
              onClick={() => handleNavClick('shop', false, true)}
              className="text-left py-2.5 px-4 hover:bg-slate-50 rounded-lg transition text-slate-700 flex items-center gap-1.5"
            >
              <Zap size={16} className="text-amber-500 fill-amber-500" />
              {t('dailyDeals')}
            </button>
            {user && !user.isAdmin && user.role !== 'seller' && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`text-left py-2.5 px-4 hover:bg-slate-50 rounded-lg transition ${
                  activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50/50' : ''
                }`}
              >
                {lang === 'bn' ? 'আমার ড্যাশবোর্ড' : 'My Dashboard'}
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Top Banner Alert - auto-slide marquee */}
      <div
        className="w-full overflow-hidden"
        style={{
          background: '#FF6600',
          padding: '10px 0',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <style>{`
          @keyframes bannerSlide {
            0%   { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .banner-track {
            display: flex;
            gap: 0;
            white-space: nowrap;
            animation: bannerSlide 22s linear infinite;
            will-change: transform;
          }
          .banner-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="banner-track">
          {[
            '🔥 Summer Sale — All Swim Suits OFF 50%!',
            '🚚 Free Express Delivery on orders over ৳999',
            '🎁 Buy 2 Get 1 Free on selected items',
            '⚡ Flash Deal: Extra 10% off with code SHOPIO10',
            '🌟 New Arrivals — Shop the latest trends now!',
          ].map((msg, i) => (
            <span key={i} style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.02em', padding: '0 56px' }}>
              {msg}
              <button
                onClick={() => onTabChange('shop')}
                style={{ marginLeft: '12px', color: '#1e1b4b', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 'inherit' }}
              >
                Shop Now →
              </button>
            </span>
          ))}
        </div>
      </div>
      <CompareModal isOpen={compareOpen} onClose={() => setCompareOpen(false)} />
    </header>
  </>
  );
}
