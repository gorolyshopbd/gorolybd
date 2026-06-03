'use client';

import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShopContext, getImageUrl } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag, Search, User, Heart, Menu, X, LogOut, Sun, Moon, ChevronDown, ChevronRight, Zap, MapPin, GitCompare, Truck, PhoneCall, Sparkles, Store, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import CompareModal from './CompareModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [desktopCategoryMenuOpen, setDesktopCategoryMenuOpen] = useState(false);
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  const desktopCategoryMenuRef = useRef(null);
  const desktopCategoryButtonRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('goroly-dark-mode');
    const isDark = stored === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!desktopCategoryMenuOpen) return;
      if (
        desktopCategoryMenuRef.current &&
        desktopCategoryButtonRef.current &&
        !desktopCategoryMenuRef.current.contains(event.target) &&
        !desktopCategoryButtonRef.current.contains(event.target)
      ) {
        setDesktopCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [desktopCategoryMenuOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = categoryPanelOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [categoryPanelOpen]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('goroly-dark-mode', next.toString());
    document.documentElement.classList.toggle('dark', next);
  };

  useEffect(() => {
    const fetchHeaderSettings = () => {
      fetch(`${API_URL}/settings/public`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d) setHeaderSettings(d); })
        .catch(() => {});
    };
    const handleSettingsUpdated = (event) => {
      if (event.detail) setHeaderSettings((prev) => ({ ...prev, ...event.detail }));
    };

    fetchHeaderSettings();
    window.addEventListener('goroly-settings-updated', handleSettingsUpdated);

    const handleOpenCategories = () => {
      setDesktopCategoryMenuOpen(false);
      setCategoryPanelOpen(true);
    };
    window.addEventListener('goroly-open-categories', handleOpenCategories);

    fetch(`${API_URL}/categories`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { if (d) setCategories(d); })
      .catch(() => {});

    fetch(`${API_URL}/pages/public/all`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { if (d) setPages(d); })
      .catch(() => {});

    return () => {
      window.removeEventListener('goroly-settings-updated', handleSettingsUpdated);
      window.removeEventListener('goroly-open-categories', handleOpenCategories);
    };
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const uniqueCategories = useMemo(() => {
    const seen = new Set();
    return categories.filter((cat) => {
      const key = String(cat.name || '').trim().toLowerCase() || cat._id || JSON.stringify(cat);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories]);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    scrollToTop();
  };

  const headerBgColor = headerSettings.headerBgColor || '#F97316';
  const headerTextColor = headerSettings.headerTextColor || '#FFFFFF';
  const headerAccentColor = headerSettings.headerAccentColor || '#FF6600';

  return (<div className="rounded-2xl overflow-visible shadow-lg border border-slate-200 bg-white/95 backdrop-blur-lg transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/95">
    
      <style>{`
        @keyframes bannerSlide {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .banner-track {
          display: flex;
          gap: 0;
          white-space: nowrap;
          animation: bannerSlide 28s linear infinite;
          will-change: transform;
        }
        .banner-track:hover { animation-play-state: paused; }
        .nav-link-underline {
          position: relative;
          color: ${headerTextColor};
          transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link-underline:hover {
          color: ${headerTextColor};
        }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: ${headerTextColor};
          border-radius: 2px;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link-underline:hover::after { width: 100%; }
        .nav-link-underline.active::after { width: 100%; }
        .dropdown-menu {
          opacity: 0;
          transform: translateY(8px) scale(0.95);
          pointer-events: none;
          transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dropdown-parent:hover .dropdown-menu {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
      `}</style>

      {/* ── TOP UTILITY BAR ── */}
      <div className="w-full bg-white border-b border-slate-100 text-[11.5px] text-slate-500 select-none hidden sm:block transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9">

            {/* Left */}
            <div className="flex items-center gap-2">

              {/* Language Button */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="group flex items-center gap-1.5 px-3.5 py-1 bg-slate-50 hover:bg-[#FF6600]/10 border border-slate-200 hover:border-[#FF6600]/30 rounded-full transition-all duration-300 text-slate-700 hover:text-[#FF6600] cursor-pointer shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#FF6600]/40 dark:hover:bg-[#FF6600]/10"
                >
                  <span className="text-[14px] leading-none">{lang === 'en' ? '🌐' : '🇧🇩'}</span>
                  <span className="text-[12.5px] font-extrabold tracking-tight">{lang === 'en' ? 'English' : 'বাংলা'}</span>
                  <ChevronDown size={11} className="text-slate-400 group-hover:text-[#FF6600] transition-colors" />
                </button>
                {showLangDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                    <div className="absolute left-0 mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 dark:border-slate-800 dark:bg-slate-900">
                      <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Language</div>
                      <button onClick={() => { setLang('en'); setShowLangDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-[12px] font-semibold hover:bg-orange-50 dark:hover:bg-slate-800 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'en' ? 'text-[#FF6600]' : 'text-slate-600 dark:text-slate-200'}`}
                      ><span>🇬🇧</span> English</button>
                      <button onClick={() => { setLang('bn'); setShowLangDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-[12px] font-semibold hover:bg-orange-50 dark:hover:bg-slate-800 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'bn' ? 'text-[#FF6600]' : 'text-slate-600 dark:text-slate-200'}`}
                      ><span>🇧🇩</span> বাংলা</button>
                    </div>
                  </>
                )}
              </div>

              {/* Currency / BDT Button */}
              <button className="group flex items-center gap-1.5 px-3.5 py-1 bg-slate-50 hover:bg-[#FF6600]/10 border border-slate-200 hover:border-[#FF6600]/30 rounded-full transition-all duration-300 text-slate-700 hover:text-[#FF6600] cursor-pointer shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#FF6600]/40 dark:hover:bg-[#FF6600]/10">
                <span className="text-[14px] leading-none">💰</span>
                <span className="text-[12.5px] font-extrabold tracking-tight">{headerSettings.currency || 'BDT'}</span>
                <ChevronDown size={11} className="text-slate-400 group-hover:text-[#FF6600] transition-colors" />
              </button>

              {/* Find Store Button */}
              <a
                href={headerSettings.topBarStoreLink || '#'}
                className="group flex items-center gap-1.5 px-3.5 py-1 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 rounded-full transition-all duration-300 text-slate-700 hover:text-violet-600 cursor-pointer shadow-xs no-underline dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-violet-950/40"
              >
                <Store size={14} className="text-violet-400 group-hover:text-violet-500 transition-colors flex-shrink-0" />
                <span className="text-[12.5px] font-extrabold tracking-tight">Find Store</span>
              </a>

              {/* App Store Badges */}
              <div className="hidden lg:flex items-center gap-2 pl-1">
                {/* Google Play Badge */}
                <a href={headerSettings.topBarPlayStoreLink || '#'} title="Get it on Google Play"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 hover:border-[#FF6600] hover:text-[#FF6600] transition text-slate-500 no-underline shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-[#01875f]">
                    <path d="M3.18 23.76c.37.2.8.2 1.18-.02l13.64-7.86-2.9-2.9-11.92 10.78zM.5 1.4C.19 1.77 0 2.28 0 2.93v18.14c0 .65.19 1.16.5 1.53l.08.08 10.16-10.16v-.24L.58 1.32.5 1.4zM20.33 10.27l-2.9-1.67-3.23 3.23 3.23 3.22 2.91-1.68c.83-.48.83-1.62-.01-2.1zM4.36.26L17.99 8.1l-2.9 2.9L3.18.22C3.56.01 4 .01 4.36.26z"/>
                  </svg>
                  <div className="leading-none">
                    <div className="text-[7px] font-medium">GET IT ON</div>
                    <div className="text-[10px] font-black tracking-tight">Google Play</div>
                  </div>
                </a>
                {/* App Store Badge */}
                <a href={headerSettings.topBarAppStoreLink || '#'} title="Download on the App Store"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 hover:border-[#FF6600] hover:text-[#FF6600] transition text-slate-500 no-underline shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.99.08 2.16-.52 2.82-1.33z"/>
                  </svg>
                  <div className="leading-none">
                    <div className="text-[7px] font-medium">DOWNLOAD ON THE</div>
                    <div className="text-[10px] font-black tracking-tight">App Store</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Compare */}
              <button
                onClick={() => setCompareOpen(true)}
                className="group flex items-center gap-1.5 px-3.5 py-1 bg-slate-50 hover:bg-[#FF6600]/10 border border-slate-200 hover:border-[#FF6600]/30 rounded-full transition-all duration-300 text-slate-700 hover:text-[#FF6600] cursor-pointer shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#FF6600]/40 dark:hover:bg-[#FF6600]/10"
              >
                <GitCompare size={14} className="text-slate-400 group-hover:text-[#FF6600] transition-colors flex-shrink-0" />
                <span className="text-[12.5px] font-extrabold tracking-tight">Compare</span>
                {compareList.length > 0 && (
                  <span className="bg-[#FF6600] text-white text-[8px] font-black rounded-full px-1.5 py-0.5 leading-none">{compareList.length}</span>
                )}
              </button>

              {/* Track Order */}
              <button
                onClick={() => onTabChange('dashboard')}
                className="group flex items-center gap-1.5 px-3.5 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-full transition-all duration-300 text-slate-700 hover:text-blue-600 cursor-pointer shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-blue-950/40"
              >
                <Truck size={14} className="text-blue-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                <span className="text-[12.5px] font-extrabold tracking-tight">Track Order</span>
              </button>

              {/* Helpline */}
              <a
                href={`tel:${headerSettings.topBarHelpline || '8801234567890'}`}
                className="group flex items-center gap-1.5 px-3.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-full transition-all duration-300 text-slate-700 hover:text-emerald-600 cursor-pointer shadow-xs no-underline dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-emerald-950/40"
              >
                <PhoneCall size={14} className="text-emerald-500 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                <span className="text-[12.5px] font-extrabold tracking-tight">Helpline: {headerSettings.topBarHelpline || '8801234567890'}</span>
              </a>
            </div>

          </div>
        </div>
      </div>



      {/* ── MAIN STICKY HEADER ── */}
      <header className="sticky top-0 z-40 w-full">

        {/* Main Navbar */}
        <div className="bg-white/95 backdrop-blur-lg border-b border-slate-100 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">

              {/* Logo */}
              <button
                onClick={() => onTabChange('home')}
                className="flex items-center gap-2 flex-shrink-0 group"
              >
                <img src={getImageUrl(headerSettings.headerLogo) || '/logo.png'} alt={headerSettings.siteTitle || 'Goroly Shop'} className="h-14 w-auto object-contain" />
              </button>

              {/* Search Bar */}
              <div className="hidden sm:flex flex-1 max-w-xl relative mx-4">
                <div className="w-full flex items-center gap-2 pl-3.5 pr-1.5 py-1 rounded-xl border-2 border-slate-100 hover:border-slate-200 focus-within:border-[#FF6600] bg-slate-50/60 focus-within:bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700 dark:focus-within:bg-slate-900">
                  <Search size={15} className="flex-shrink-0 text-slate-400 focus-within:text-[#FF6600] transition-colors" />
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'পণ্য, ক্যাটাগরি খুঁজুন...' : 'Search products, categories...'}
                    value={currentSearch}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-xs font-semibold text-slate-700 placeholder-slate-400 py-1.5 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                  {currentSearch && (
                    <button 
                      onClick={() => onSearchChange('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition mr-1 cursor-pointer border-0 bg-transparent dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <button
                    className="bg-[#FF6600] hover:bg-[#e05a00] text-white px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer border-0"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-1 ml-auto sm:ml-0">

                {/* Dark Mode */}
                <button
                  onClick={toggleDarkMode}
                  title={darkMode ? 'Light Mode' : 'Dark Mode'}
                  className="relative h-9 w-16 rounded-full border border-slate-200 bg-slate-100 p-1 text-slate-600 transition-all duration-300 hover:border-[#FF6600]/40 hover:bg-orange-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span
                    className={`absolute top-1 grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm transition-all duration-300 dark:bg-slate-700 ${
                      darkMode ? 'left-8 text-amber-300' : 'left-1 text-slate-700'
                    }`}
                  >
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </span>
                </button>

                {/* User */}
                {user ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (user.isAdmin || user.role === 'seller') {
                          window.location.href = '/admin';
                        } else {
                          onTabChange('dashboard');
                        }
                      }}
                      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer group dark:hover:bg-slate-900"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF6600] to-[#e05a00] flex items-center justify-center text-white text-xs font-black shadow-sm">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="text-left leading-tight">
                        <span className="block text-xs font-bold text-slate-800 group-hover:text-[#FF6600] transition dark:text-slate-100">{user.name?.split(' ')[0]}</span>
                        <span className="block text-[10px] font-semibold text-slate-400 capitalize">
                          {user.role === 'seller' ? 'Seller' : user.isAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={logout}
                      title="Logout"
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition dark:hover:bg-red-950/40"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onAuthClick}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600] hover:text-white rounded-xl text-xs font-bold transition"
                  >
                    <User size={14} />
                    {t('login')}
                  </button>
                )}

                {/* Mobile Search */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <Search size={17} />
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => onTabChange('wishlist')}
                  className="p-2 text-slate-500 hover:text-[#FF6600] hover:bg-orange-50 rounded-xl transition relative dark:text-slate-300 dark:hover:bg-orange-950/30"
                >
                  <Heart size={17} />
                </button>

                {/* Cart */}
                <button
                  onClick={onCartClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6600] hover:bg-[#e05a00] text-white rounded-xl transition shadow-md shadow-[#FF6600]/25 hover:shadow-[#FF6600]/40 relative"
                >
                  <ShoppingBag size={16} />
                  {cartCount > 0 ? (
                    <span className="text-xs font-black">{cartCount}</span>
                  ) : (
                    <span className="hidden sm:inline text-xs font-bold">Cart</span>
                  )}
                </button>

                {/* Mobile Hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* ── SECONDARY NAV BAR (Desktop) ── */}
        <div
          className="hidden md:block select-none border-b border-white/20 rounded-b-xl shadow-lg relative z-50"
          style={{
            background: `linear-gradient(135deg, ${headerBgColor}, ${headerAccentColor})`,
            color: headerTextColor,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">

            {/* Left: Category dropdown + nav links */}
            <div className="flex items-center h-full">

              {/* Shop By Categories */}
              <div className="relative h-full flex items-center mr-4">
                <button
                  ref={desktopCategoryButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDesktopCategoryMenuOpen((open) => !open);
                  }}
                  className="flex items-center gap-2 font-bold text-xs transition-all duration-200 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl border border-white/15 cursor-pointer shadow-sm backdrop-blur"
                  style={{ color: headerTextColor }}
                >
                  <Menu size={13} style={{ color: headerTextColor, opacity: 0.85 }} />
                  <span>{t('shopByCategories')}</span>
                  <ChevronDown size={11} className={`transition-transform duration-200 ${desktopCategoryMenuOpen ? 'rotate-180' : ''}`} style={{ color: headerTextColor, opacity: 0.75 }} />
                </button>

                <div
                  ref={desktopCategoryMenuRef}
                  className={`absolute left-0 top-full mt-3 w-[32rem] rounded-[32px] border border-slate-100 bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 dark:border-slate-800/80 dark:bg-slate-900/95 z-[99999] ${
                    desktopCategoryMenuOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">All Categories</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Explore our best-selling departments</div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-[#FFFBF5] px-3 py-2 text-[11px] font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <LayoutGrid size={15} className="text-[#FF6600]" />
                      {uniqueCategories.length} items
                    </div>
                  </div>
                  <div className="grid gap-2 max-h-[24rem] overflow-y-auto pr-1 scrollbar-thin">
                    {uniqueCategories.map((cat) => (
                      <button
                        key={cat._id || cat.name}
                        onClick={() => { onSearchChange(cat.name); onTabChange('shop'); setDesktopCategoryMenuOpen(false); }}
                        className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 transition duration-200 hover:border-[#FF6600] hover:bg-[#FFF4E6] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[#FF6600]/50 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm overflow-hidden dark:bg-slate-900">
                            {cat.image ? (
                              <img src={getImageUrl(cat.image)} alt={cat.name} className="h-full w-full object-cover" />
                            ) : (
                              <LayoutGrid size={22} className="text-slate-500 dark:text-slate-400" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cat.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{cat.description || (lang === 'bn' ? 'ব্রাউজ করুন' : 'Browse products')}</div>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 transition group-hover:text-[#FF6600]" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

               {/* Nav Links */}
              <div className="flex items-center gap-6 h-full ml-4">
                {[
                  { label: t('home'), action: () => { onSearchChange(''); onTabChange('home'); scrollToTop(); } },
                  { label: t('products'), action: () => { onSearchChange(''); onTabChange('shop'); scrollToTop(); } },
                  { label: t('store'), action: () => { onSearchChange(''); onTabChange('shop'); scrollToTop(); } },
                  { label: t('brands'), action: () => { onSearchChange(''); onTabChange('shop'); scrollToTop(); } },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="nav-link-underline text-white hover:text-white font-semibold text-xs transition bg-transparent border-0 cursor-pointer py-1"
                  >
                    {item.label}
                  </button>
                ))}

                {/* Pages Dropdown */}
                <div className="dropdown-parent relative h-full flex items-center">
                  <button className="nav-link-underline flex items-center gap-1 text-white hover:text-white font-semibold text-xs transition bg-transparent border-0 cursor-pointer py-1">
                    {t('pages')} <ChevronDown size={11} className="text-white/60" />
                  </button>
                  <div className="dropdown-menu absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-800/80 p-2 z-50">
                    <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800/50 mb-1">Quick Links</div>
                    <div className="space-y-0.5">
                      {pages.length === 0 ? (
                        <span className="block px-3 py-2.5 text-xs text-slate-400 dark:text-slate-500 font-medium">No pages</span>
                      ) : pages.map((p) => (
                        <button
                          key={p.slug}
                          onClick={() => { onTabChange(`page-${p.slug}`); scrollToTop(); }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-orange-50/70 dark:hover:bg-slate-800 hover:text-[#FF6600] dark:hover:text-[#FF6600] rounded-xl transition-all duration-200 flex items-center gap-2.5 bg-transparent border-0 cursor-pointer group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700 group-hover:bg-[#FF6600] group-hover:scale-125 transition-all duration-200 flex-shrink-0" />
                          <span className="group-hover:translate-x-1 transition-transform duration-200">{p.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Deals Button */}
            <button
              onClick={() => { onSearchChange('Sale'); onTabChange('shop'); }}
              className="flex items-center gap-1.5 bg-white text-[#FF6600] px-4 py-2 rounded-xl text-xs font-black shadow-md hover:bg-orange-50 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer border-0"
            >
              <Zap size={13} className="fill-[#FF6600] text-[#FF6600] animate-pulse" />
              <span>{t('dailyDeals')}</span>
            </button>

          </div>
        </div>

        {/* ── PROMO BANNER (Marquee) ── */}
        {headerSettings.noticeBarEnabled !== false && (
          <div
            className="w-full overflow-hidden"
            style={{
              minHeight: '34px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: headerSettings.noticeBarBgColor || '#6F1BE4',
            }}
          >
            <div className="banner-track">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    color: headerSettings.noticeBarTextColor || '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    letterSpacing: '0.02em',
                    padding: '0 48px',
                  }}
                >
                  {headerSettings.noticeBarText || 'Summer Sale - All Swim Suits OFF 50%! Free delivery on orders over ৳999.'}
                  <button
                    onClick={() => onTabChange('shop')}
                    style={{
                      marginLeft: '10px',
                      color: headerSettings.noticeBarTextColor || '#FFFFFF',
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 900,
                      fontSize: 'inherit',
                      opacity: 0.9,
                    }}
                  >
                    Shop Now
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="w-full overflow-hidden" style={{ minHeight: '34px', display: 'none', alignItems: 'center', backgroundColor: headerSettings.noticeBarBgColor || '#6F1BE4' }}>
          <div className="banner-track">
            {[
              '🔥 Summer Sale — All Swim Suits OFF 50%!',
              '🚚 Free Express Delivery on orders over ৳999',
              '🎁 Buy 2 Get 1 Free on selected items',
              '⚡ Flash Deal: Extra 10% off with code GOROLY10',
              '🌟 New Arrivals — Shop the latest trends now!',
            ].map((msg, i) => (
              <span key={i} style={{ color: '#fff', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.02em', padding: '0 48px' }}>
                {msg}
                <button
                  onClick={() => onTabChange('shop')}
                  style={{ marginLeft: '10px', color: '#fff', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 'inherit', opacity: 0.85 }}
                >
                  Shop Now →
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Nav Tags */}
        <div className="md:hidden bg-white border-b border-slate-100 px-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex overflow-x-auto gap-1.5 py-1.5 scrollbar-hide">
            {[
              { tab: 'home', label: t('home'), action: () => { onSearchChange(''); onTabChange('home'); } },
              { tab: 'categories', label: t('categories') || 'Categories', action: () => setCategoryPanelOpen(true) },
              { tab: 'shop', label: t('products'), action: () => { onSearchChange(''); onTabChange('shop'); } },
              { tab: 'deals', label: '⚡ ' + t('dailyDeals'), action: () => { onSearchChange('Sale'); onTabChange('shop'); } },
              ...(user && !user.isAdmin && user.role !== 'seller' ? [{ tab: 'dashboard', label: t('dashboard'), action: () => onTabChange('dashboard') }] : []),
            ].map((item) => (
              <button
                key={item.tab}
                onClick={item.action}
                className={`flex-shrink-0 px-3 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === item.tab ? 'bg-[#FF6600] text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-lg transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
            <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg transition duration-300 pr-2 py-2">
              <Search size={16} className="absolute left-4 text-slate-300" />
              <input
                type="text"
                placeholder="Search products..."
                value={currentSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-12 bg-transparent text-sm font-medium text-slate-200 placeholder-gray-400 focus:outline-none"
              />
              {currentSearch && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-4 p-1 text-slate-300 hover:text-white rounded-full hover:bg-white/20 transition cursor-pointer border-0"
                >
                  <X size={14} />
                </button>
              )}
              <button
                className="ml-2 bg-[#FF6600] hover:bg-[#e05a00] text-white px-4 py-1.5 rounded-lg text-sm font-bold border-0 shadow-md hover:shadow-lg transition-all"
              >
                Go
              </button>
            </div>
            <nav className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-200">
              {!user && (
                <button
                  onClick={() => { onAuthClick(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 py-2.5 px-3 bg-[#FF6600] text-white rounded-xl font-bold"
                >
                  <User size={15} /> Sign In / Register
                </button>
              )}
              <button onClick={() => handleNavClick('shop', true, false)} className="text-left py-2.5 px-3 hover:bg-slate-50 rounded-xl transition font-semibold">{t('brands')}</button>
              <button onClick={() => handleNavClick('shop', false, true)} className="text-left py-2.5 px-3 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5 font-semibold">
                <Zap size={13} className="text-amber-500 fill-amber-500" /> {t('dailyDeals')}
              </button>
              {user && !user.isAdmin && user.role !== 'seller' && (
                <button onClick={() => handleNavClick('dashboard')} className={`text-left py-2.5 px-3 rounded-xl transition font-semibold ${activeTab === 'dashboard' ? 'text-[#FF6600] bg-orange-50' : 'hover:bg-slate-50'}`}>
                  {lang === 'bn' ? 'আমার ড্যাশবোর্ড' : 'My Dashboard'}
                </button>
              )}
            </nav>
          </div>
        )}

      </header>

      {categoryPanelOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100000] overflow-hidden">
          <button
            type="button"
            aria-label="Close categories"
            onClick={() => setCategoryPanelOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-slate-950/20 backdrop-blur-sm"
          />
          <div className="absolute left-3 right-3 top-6 mx-auto max-w-3xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_32px_120px_rgba(15,23,42,0.25)] dark:border-slate-800/80 dark:bg-slate-950 sm:left-6 sm:right-auto sm:top-8 lg:top-10 sm:w-[92%] xl:w-[78%]">
            <div className="flex h-14 items-center justify-between bg-[#FF005C] px-4 text-white">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={17} />
                <span className="text-base font-bold">All Categories</span>
              </div>
              <button
                type="button"
                onClick={() => setCategoryPanelOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X size={15} />
              </button>
            </div>
            <div className="grid max-h-[64vh] grid-cols-2 gap-2 overflow-y-auto bg-white dark:bg-slate-900 p-3">
              {categories.length === 0 ? (
                <div className="px-3 py-8 text-center text-xs font-bold text-slate-400 dark:bg-slate-800/70">
                  No categories found
                </div>
              ) : (() => {
                const seen = new Set();
                return categories.filter((c) => {
                  const key = c._id || c.name || JSON.stringify(c);
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                }).map((cat) => (
                <button
                  key={cat._id || cat.name}
                  onClick={() => {
                    onSearchChange(cat.name);
                    onTabChange('shop');
                    setCategoryPanelOpen(false);
                    setMobileMenuOpen(false);
                    scrollToTop();
                  }}
                  className="group flex flex-col items-start gap-2 border-0 bg-white p-3 rounded-xl hover:shadow-md transition dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <div className="grid h-20 w-full grid-cols-6 gap-3 items-center">
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                        {cat.image ? (
                          <img src={getImageUrl(cat.image)} alt={cat.name} className="h-full w-full object-cover" />
                        ) : (
                          <LayoutGrid size={28} className="text-slate-500 p-2" />
                        )}
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cat.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cat.description || ''}</div>
                    </div>
                  </div>
                </button>
                ));
              })()}
            </div>
          </div>
        </div>, document.body
      )}

      <CompareModal isOpen={compareOpen} onClose={() => setCompareOpen(false)} />
    </div>
  );
}
