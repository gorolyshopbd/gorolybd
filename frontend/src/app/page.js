'use client';

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ShopContext, getImageUrl, formatPrice, calculateFinalPrice, formatDiscountLabel } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRealtime } from '@/hooks/useRealtime';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeatureStrip from '@/components/FeatureStrip';
import CategorySection from '@/components/CategorySection';
// CategoryBannerCarousel removed from homepage per request
import FlashSale from '@/components/FlashSale';
import FeaturedProducts from '@/components/FeaturedProducts';
import CartDrawer from '@/components/CartDrawer';
import FloatingCartButton from '@/components/FloatingCartButton';
import AuthModal from '@/components/AuthModal';
import ProductDetailModal from '@/components/ProductDetailModal';
import OfferPopup from '@/components/OfferPopup';
import Footer from '@/components/Footer';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';
import ChatWidget from '@/components/ChatWidget';
import CustomPageView from '@/components/CustomPageView';
import VideoReelsView from '@/components/VideoReelsView';
import BecomeSellerPage from '@/components/BecomeSellerPage';
import SellerPolicyPage from '@/components/SellerPolicyPage';
import AboutUsPage from '@/components/AboutUsPage';
import TermsPage from '@/components/TermsPage';
import PrivacyPage from '@/components/PrivacyPage';
import ReturnRefundPage from '@/components/ReturnRefundPage';
import { ShoppingCart, Star, Heart, ArrowRight, Eye, LayoutGrid, List, ChevronDown, ChevronUp, SlidersHorizontal, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';



export default function Storefront() {
  const router = useRouter();
  const { user, fetchProducts, products, addToCart, currencySymbol } = useContext(ShopContext);
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('home'); // home, shop, categories, wishlist, admin, dashboard
  const frontendPageReadyRef = React.useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Endless Pagination States
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  
  // Drawer & modal states
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Wishlist
  const [wishlist, setWishlist] = useState([]);

  // Shop sidebar filter states
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortOrder, setSortOrder] = useState('newest');
  const [openFilters, setOpenFilters] = useState({ categories: true, brand: true, price: true, rating: false });
  const [shopBrands, setShopBrands] = useState([]);
  const [shopCategories, setShopCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);

  // Branding from settings
  const [branding, setBranding] = useState({});

  const normalizeCategoryName = (name) => String(name || '').trim().toLowerCase();

  const dedupeCategoriesByName = (categories = []) => {
    const seen = new Set();
    return categories.filter((cat) => {
      const nameKey = normalizeCategoryName(cat.name);
      if (!nameKey || seen.has(nameKey)) return false;
      seen.add(nameKey);
      return true;
    });
  };

  // Reusable category loader for the shop sidebar / category banner
  const loadShopCategories = useCallback(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setShopCategories(Array.isArray(d) ? dedupeCategoriesByName(d) : []))
      .catch(() => {});
  }, []);

  // Realtime: keep the shop filters/banner in sync with admin category changes
  useRealtime('dashboard', { category_updated: loadShopCategories });

  // Load products, branding, brands and categories on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedPage = params.get('page') || localStorage.getItem('goroly_frontend_active_page');
    if (savedPage) setActiveTab(savedPage);
    frontendPageReadyRef.current = true;

    fetchProducts({ all: 'true' });
    const fetchBranding = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/public`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d) setBranding(d); })
        .catch(() => {});
    };
    const handleSettingsUpdated = (event) => {
      if (event.detail) setBranding((prev) => ({ ...prev, ...event.detail }));
    };

    fetchBranding();
    window.addEventListener('goroly-settings-updated', handleSettingsUpdated);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setShopBrands(d || []))
      .catch(() => {});
    loadShopCategories();
    return () => {
      window.removeEventListener('goroly-settings-updated', handleSettingsUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!frontendPageReadyRef.current) return;
    localStorage.setItem('goroly_frontend_active_page', activeTab);
    const url = new URL(window.location.href);
    if (activeTab === 'home') {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', activeTab);
    }
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

  // Update document title and favicon from branding settings
  useEffect(() => {
    if (branding.siteTitle) document.title = branding.siteTitle;
    if (branding.faviconUrl) {
      let link = document.querySelector('link[rel*="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = getImageUrl(branding.faviconUrl);
    }
  }, [branding.siteTitle, branding.faviconUrl]);

  // Scroll to top on activeTab change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setActiveTab('shop');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.find((x) => x._id === product._id)) {
        return prev.filter((x) => x._id !== product._id); // Toggle off
      } else {
        return [...prev, product];
      }
    });
  };

  const handleBuyNow = (product, qty) => {
    addToCart(product, qty);
    setCartOpen(true);
    setSelectedProduct(null);
  };

  // Determine active products list
  const activeProducts = products;

  // Filter based on search, category, brand, price, rating
  const filteredProducts = activeProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory ? (() => {
      const normSelected = selectedCategory.toLowerCase();
      if (p.category.toLowerCase() === normSelected) return true;
      
      const parentCat = shopCategories.find(c => c.name.toLowerCase() === normSelected);
      if (parentCat && parentCat.subcategories) {
        const subs = Array.isArray(parentCat.subcategories) 
          ? parentCat.subcategories 
          : (typeof parentCat.subcategories === 'string' 
            ? parentCat.subcategories.split(',').map(s => s.trim()).filter(Boolean) 
            : []);
        return subs.map(s => s.toLowerCase()).includes(p.category.toLowerCase());
      }
      return false;
    })() : true;
    const matchesBrand = selectedBrand ? (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase()) : true;
    const finalPrice = calculateFinalPrice(p);
    const matchesPrice = finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    const matchesRating = minRating > 0 ? (p.rating || 5) >= minRating : true;
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === 'price_asc') return calculateFinalPrice(a) - calculateFinalPrice(b);
    if (sortOrder === 'price_desc') return calculateFinalPrice(b) - calculateFinalPrice(a);
    return 0;
  });

  const toggleFilter = (key) => setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }));
  const resetShopFilters = () => { setSelectedCategory(''); setSelectedBrand(''); setPriceRange([0, 100000]); setMinRating(0); setSearchQuery(''); };

  // Endless pagination sync
  useEffect(() => {
    setVisibleProducts(sortedProducts.slice(0, 12));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, minRating, sortOrder, products]);

  const handleLoadMore = () => {
    setLoadMoreLoading(true);
    setTimeout(() => {
      const currentLength = visibleProducts.length;
      const nextBatch = sortedProducts.slice(currentLength, currentLength + 12);
      if (nextBatch.length > 0) {
        setVisibleProducts((prev) => [...prev, ...nextBatch]);
      }
      setLoadMoreLoading(false);
    }, 600);
  };

  // If Admin Panel is selected, swap layouts
  if (activeTab === 'admin' && user?.isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <AdminDashboard onTabChange={setActiveTab} />
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onAuthTrigger={() => setAuthOpen(true)} />
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="storefront-shell flex flex-col min-h-screen bg-white justify-between">
      {/* Header */}
      {activeTab !== 'videos' &&
        activeTab !== 'page-become-a-seller' &&
        activeTab !== 'page-seller-policy' &&
        activeTab !== 'page-product-policy' &&
        activeTab !== 'page-pickup-delivery-policy' &&
        activeTab !== 'page-seller-exchange-return-policy' &&
        activeTab !== 'page-about-us' &&
        activeTab !== 'page-terms-conditions' &&
        activeTab !== 'page-terms-&-conditions' &&
        activeTab !== 'page-privacy-policy' &&
        activeTab !== 'page-return-refund-policy' &&
        activeTab !== 'page-return-&-refund-policy' && (
        <Header 
          onCartClick={() => setCartOpen(true)}
          onAuthClick={() => setAuthOpen(true)}
          onSearchChange={setSearchQuery}
          currentSearch={searchQuery}
          onTabChange={setActiveTab}
          activeTab={activeTab}
          onCategoryClick={handleCategoryClick}
        />
      )}

      {/* Main Pages Content */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div className="flex flex-col gap-1">
            <Hero onShopClick={() => setActiveTab('shop')} />
            <CategorySection onCategoryClick={handleCategoryClick} />
            <FeatureStrip />
            <div className="flex flex-col gap-4 mt-4">
              <FlashSale 
                products={activeProducts} 
                branding={branding}
                onProductClick={setSelectedProduct} 
                onAddToWishlist={handleAddToWishlist}
              />
              <FeaturedProducts 
                products={activeProducts} 
                onProductClick={setSelectedProduct} 
                onAddToWishlist={handleAddToWishlist}
              />
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm mb-5">
              <button onClick={() => setActiveTab('home')} className="text-[#FF6600] hover:underline font-semibold">{t('home')}</button>
              <span className="text-slate-400">›</span>
              <span className="text-slate-600 font-medium">{selectedCategory || t('allProducts')}</span>
            </div>

            <div className="flex gap-6 items-start">

              {/* ── LEFT SIDEBAR ── */}
              <aside className="hidden md:flex flex-col gap-3 w-60 flex-shrink-0">

                {/* Filter header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-extrabold text-slate-800 text-sm">
                    <SlidersHorizontal size={15} className="text-[#FF6600]" />
                    {t('filters')}
                  </div>
                  <button onClick={resetShopFilters} className="text-xs text-[#FF6600] font-bold hover:underline">{t('reset')}</button>
                </div>

                {/* Categories filter */}
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
                  <button
                    onClick={() => toggleFilter('categories')}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>{t('categories')}</span>
                    {openFilters.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openFilters.categories && (
                    <div className="px-3 pb-3 flex flex-col gap-1">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`text-left text-sm px-3 py-2 rounded-lg transition font-semibold ${!selectedCategory ? 'bg-[#FF6600] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {t('allCategories')}
                      </button>
                      {shopCategories.filter(c => !c.rootCategory || c.rootCategory === '--' || !shopCategories.some(p => p.name === c.rootCategory)).map((cat) => {
                        const subs = cat.subcategories
                          ? (Array.isArray(cat.subcategories) ? cat.subcategories : (typeof cat.subcategories === 'string' ? cat.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []))
                          : [];
                        
                        // Check if this parent is active (either directly selected or one of its subcategories is selected)
                        const isParentActive = selectedCategory === cat.name || subs.includes(selectedCategory);
                        
                        return (
                          <div key={cat._id} className="flex flex-col">
                            <button
                              onClick={() => setSelectedCategory(cat.name)}
                              className={`text-left text-sm px-3 py-2 rounded-lg transition font-semibold flex items-center justify-between ${isParentActive ? 'bg-[#FF6600] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                              <span>{cat.name}</span>
                              {subs.length > 0 && (
                                <ChevronDown size={12} className={`transition-transform duration-200 ${isParentActive ? 'rotate-180' : ''}`} />
                              )}
                            </button>
                            
                            {/* Subcategories dropdown list */}
                            {isParentActive && subs.length > 0 && (
                              <div className="pl-4 pr-1 py-1 flex flex-col gap-1 border-l border-slate-200 ml-3.5 mt-1 mb-1.5 space-y-0.5">
                                {subs.map((sub, sIdx) => {
                                  const isSubSelected = selectedCategory === sub;
                                  return (
                                    <button
                                      key={sIdx}
                                      onClick={() => setSelectedCategory(sub)}
                                      className={`text-left text-xs px-2.5 py-1.5 rounded-md transition font-bold ${isSubSelected ? 'text-[#FF6600] bg-orange-50/75' : 'text-slate-500 hover:text-[#FF6600] hover:bg-slate-50'}`}
                                    >
                                      {sub}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Brand filter */}
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
                  <button
                    onClick={() => toggleFilter('brand')}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>{t('brand')}</span>
                    {openFilters.brand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openFilters.brand && (
                    <div className="px-3 pb-3 flex flex-col gap-1 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => setSelectedBrand('')}
                        className={`text-left text-sm px-3 py-2 rounded-lg transition font-semibold ${!selectedBrand ? 'bg-[#FF6600] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {t('allBrands')}
                      </button>
                      {shopBrands.map((b) => (
                        <button
                          key={b._id}
                          onClick={() => setSelectedBrand(b.name)}
                          className={`text-left text-sm px-3 py-2 rounded-lg transition font-semibold ${selectedBrand === b.name ? 'bg-[#FF6600] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price filter */}
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
                  <button
                    onClick={() => toggleFilter('price')}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>{t('price')}</span>
                    {openFilters.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openFilters.price && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>{formatPrice(priceRange[0], currencySymbol)}</span>
                        <span>{formatPrice(priceRange[1], currencySymbol)}</span>
                      </div>
                      <input type="range" min={0} max={100000} step={500}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full accent-[#FF6600]"
                      />
                      <div className="flex gap-2">
                        <input type="number" placeholder={lang === 'bn' ? 'সর্বনিম্ন' : 'Min'} value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF6600]"
                        />
                        <input type="number" placeholder={lang === 'bn' ? 'সর্বোচ্চ' : 'Max'} value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF6600]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating filter */}
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
                  <button
                    onClick={() => toggleFilter('rating')}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>{t('rating')}</span>
                    {openFilters.rating ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openFilters.rating && (
                    <div className="px-3 pb-3 flex flex-col gap-1">
                      {[0, 4, 3, 2, 1].map((r) => (
                        <button
                          key={r}
                          onClick={() => setMinRating(r)}
                          className={`text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${minRating === r ? 'bg-[#FF6600] text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          {r === 0 ? (
                            <span className="text-sm font-semibold">{t('allRatings')}</span>
                          ) : (
                            <>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={11} fill={i < r ? 'currentColor' : 'none'} className={minRating === r ? 'text-white' : 'text-amber-400'} />
                                ))}
                              </div>
                              <span className="text-xs font-semibold">{t('above')}</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </aside>

              {/* ── RIGHT CONTENT ── */}
              <div className="flex-1 min-w-0">

                {/* Category Banner - consistent height for ALL categories */}
                {(() => {
                  const activeCat = shopCategories.find(c => {
                    const isDirectMatch = String(c.name || '').trim().toLowerCase() === String(selectedCategory || '').trim().toLowerCase();
                    if (isDirectMatch) return true;
                    const subs = c.subcategories
                      ? (Array.isArray(c.subcategories) ? c.subcategories : (typeof c.subcategories === 'string' ? c.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []))
                      : [];
                    return subs.map(s => String(s).trim().toLowerCase()).includes(String(selectedCategory || '').trim().toLowerCase());
                  });
                  const displayImage = selectedCategory ? (activeCat?.banner || activeCat?.image) : branding?.allProductsBannerImage;
                  const displayName = selectedCategory || t('allProducts');
                  return (
                    <div className="w-full rounded-2xl overflow-hidden mb-4 relative" style={{ height: '200px' }}>
                      {displayImage ? (
                        <>
                          <img src={getImageUrl(displayImage)} alt={activeCat?.name || displayName} className="w-full h-full object-cover" />
                          {/* Optional text overlay for images, if they don't have text burned in */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent flex items-center px-8">
                            <div>
                              <div className="text-white/50 text-xs font-black uppercase tracking-[0.18em] mb-1">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</div>
                              <div className="text-white text-2xl font-black drop-shadow-lg leading-tight">{displayName}</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)' }}>
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 15% 50%, #FF6600 0%, transparent 55%), radial-gradient(circle at 85% 30%, #f59e0b 0%, transparent 45%)' }} />
                          <div className="relative z-10">
                            <div className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-1">{lang === 'bn' ? 'ব্রাউজ করুন' : 'Browse'}</div>
                            <div className="text-white text-3xl font-black leading-tight">{displayName}</div>
                            <div className="mt-2 w-12 h-1 rounded-full bg-[#FF6600]" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Sort bar + count + view toggle */}
                <div className="flex flex-col gap-3 mb-4 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <span className="font-extrabold text-slate-800 text-sm">{t('allProducts')}</span>
                    <span className="block text-xs font-semibold text-[#FF6600] sm:ml-2 sm:inline">{t('showing')} {sortedProducts.length} {t('results')}</span>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="h-10 flex-1 text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF6600] bg-white sm:flex-none"
                    >
                      <option value="newest">{t('newest')}</option>
                      <option value="oldest">{t('oldest')}</option>
                      <option value="price_asc">{t('priceLowHigh')}</option>
                      <option value="price_desc">{t('priceHighLow')}</option>
                    </select>
                    <div className="flex h-10 shrink-0 items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button onClick={() => setViewMode('grid')} className={`grid h-10 w-10 place-items-center transition ${viewMode === 'grid' ? 'bg-[#FF6600] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <LayoutGrid size={15} />
                      </button>
                      <button onClick={() => setViewMode('list')} className={`grid h-10 w-10 place-items-center transition ${viewMode === 'list' ? 'bg-[#FF6600] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <List size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Products */}
                {visibleProducts.length === 0 ? (
                  <div className="text-center py-16 space-y-4 bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-medium">{t('noProducts')}</p>
                    <button onClick={resetShopFilters} className="px-4 py-2 bg-[#FF6600] text-white font-bold rounded-lg text-sm">{t('resetFilters')}</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 w-full">
                        {visibleProducts.map((product) => {
                          const finalPrice = calculateFinalPrice(product);
                          const isWish = wishlist.some((x) => x._id === product._id);
                          return (
                            <div key={product._id} onClick={() => router.push(`/product/${product._id}`)} className="bg-white rounded-xl border border-slate-100 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer relative p-2">
                              <div className="relative aspect-[4/5] bg-[#f3f4f6] flex flex-col items-center justify-between overflow-hidden rounded-lg">
                                {/* Scale Icon */}
                                <div className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110">
                                  <Scale size={14} className="text-slate-700" />
                                </div>
                                <div className="flex-1 flex items-center justify-center w-full p-4 pb-0">
                                  <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500" />
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                                  className="w-full bg-[#ff0000] py-2.5 text-center text-[15px] font-bold text-white transition hover:bg-[#cc0000] z-10 mt-3"
                                  title={t('addToCart')}
                                >
                                  Add to cart
                                </button>
                              </div>
                              <div className="flex flex-1 flex-col pt-3 px-1 pb-1">
                                <div className="flex items-center justify-end text-[12px] font-medium">
                                  <span className="text-emerald-700">Sold {product.soldCount || Math.floor(Math.random() * 50) + 10}</span>
                                </div>
                                <div className="my-2.5 h-[1px] w-full bg-slate-100"></div>
                                <h3 className="line-clamp-2 min-h-[40px] text-left text-[14px] font-bold leading-snug text-slate-700 transition group-hover:text-[#FF6600]">{product.name}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[14px] font-bold text-amber-400 hover:text-amber-500 transition">
                                    Quick View
                                  </span>
                                  <span className="text-[14px] font-black text-slate-900">{formatPrice(finalPrice, currencySymbol)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* List view */
                      <div className="flex flex-col gap-3 w-full">
                        {visibleProducts.map((product) => {
                          const finalPrice = calculateFinalPrice(product);
                          const isWish = wishlist.some((x) => x._id === product._id);
                          return (
                            <div key={product._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group shadow-sm hover:shadow-md transition duration-300 flex flex-col gap-4 p-3 sm:flex-row sm:items-center">
                              <div className="w-full sm:w-24 aspect-square bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition duration-300 rounded-xl">
                                {product.discountPercent > 0 && (
                                  <span className="absolute top-1 left-1 bg-red-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded z-10">{formatDiscountLabel(product, currencySymbol)}</span>
                                )}
                                <img src={getImageUrl(product.image)} alt={product.name} onClick={() => router.push(`/product/${product._id}`)} className="w-full h-full object-contain p-3 cursor-pointer group-hover:scale-105 transition duration-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{product.category}</span>
                                {product.brand && <span className="ml-2 text-[9px] font-semibold text-slate-400">• {product.brand}</span>}
                                <h3 onClick={() => router.push(`/product/${product._id}`)} className="font-bold text-slate-800 text-sm hover:text-[#FF6600] cursor-pointer transition line-clamp-1 mt-0.5">{product.name}</h3>
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="flex text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'} />)}</div>
                                  <span className="text-slate-400 text-[10px]">({product.numReviews || 12})</span>
                                </div>
                                <button onClick={() => setSelectedProduct(product)} className="mt-1.5 text-xs font-bold text-[#FF6600] border border-[#FF6600] px-3 py-1 rounded-lg hover:bg-[#FF6600] hover:text-white transition">{t('quickView')}</button>
                              </div>
                              <div className="flex w-full flex-row items-center justify-between gap-2 flex-shrink-0 sm:w-auto sm:flex-col sm:items-end">
                                <div className="text-left sm:text-right">
                                  <div className="text-lg font-extrabold text-slate-900">{formatPrice(finalPrice, currencySymbol)}</div>
                                  {product.discountPercent > 0 && <div className="text-xs text-slate-400 line-through">{formatPrice(product.price, currencySymbol)}</div>}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }} className="h-8 px-3 bg-[#FF6600] hover:bg-orange-600 text-white text-[10px] font-extrabold rounded-lg transition shadow-md shadow-orange-500/20">{t('addToCart')}</button>
                                <button onClick={() => handleAddToWishlist(product)} className={`hidden text-xs font-semibold items-center gap-1 sm:flex ${isWish ? 'text-red-500' : 'text-slate-400 hover:text-red-500'} transition`}>
                                  <Heart size={12} fill={isWish ? 'currentColor' : 'none'} /> {t('wishlist')}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Load More */}
                    {visibleProducts.length < sortedProducts.length && (
                      <button onClick={handleLoadMore} disabled={loadMoreLoading}
                        className="px-8 py-3 bg-[#FF6600] hover:bg-orange-600 text-white font-extrabold rounded-xl transition shadow-md flex items-center gap-2 text-sm"
                      >
                        {loadMoreLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>{t('loading')}</> : t('loadMore')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {activeTab === 'categories' && (
          <div className="space-y-4">
            <CategorySection onCategoryClick={handleCategoryClick} />
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <h1 className="text-2xl font-extrabold text-slate-850">{t('yourWishlist')}</h1>
            {wishlist.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100">
                {t('wishlistEmpty')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map((product) => {
                  const finalPrice = calculateFinalPrice(product);
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden group shadow-sm hover:shadow-xl hover:border-slate-200 transition duration-300 flex flex-col justify-between"
                    >
                      <div className="relative pt-[80%] bg-slate-50 overflow-hidden">
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-full shadow-xs backdrop-blur-xs transition z-10"
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition duration-500 cursor-pointer"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{product.category}</span>
                          <h3
                            onClick={() => router.push(`/product/${product._id}`)}
                            className="font-bold text-slate-800 text-sm hover:text-[#FF6600] cursor-pointer transition line-clamp-1"
                          >
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-base font-extrabold text-slate-900">{formatPrice(finalPrice, currencySymbol)}</span>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="px-2.5 py-1.5 bg-[#FF6600] hover:bg-[#e05a00] text-white text-[10px] font-bold rounded-md transition shadow-md shadow-[#FF6600]/20"
                          >
                            {t('addToCart')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <UserDashboard />
        )}

        {activeTab === 'page-become-a-seller' && (
          <BecomeSellerPage onBackToHome={() => setActiveTab('home')} onAuthClick={() => setAuthOpen(true)} />
        )}

        {(activeTab === 'page-seller-policy' ||
          activeTab === 'page-product-policy' ||
          activeTab === 'page-pickup-delivery-policy' ||
          activeTab === 'page-seller-exchange-return-policy') && (
          <SellerPolicyPage
            onBackToHome={() => setActiveTab('home')}
            onAuthClick={() => setAuthOpen(true)}
            onTabChange={setActiveTab}
            initialTab={
              activeTab === 'page-product-policy'
                ? 'product-policy'
                : activeTab === 'page-pickup-delivery-policy'
                ? 'pickup-delivery-policy'
                : activeTab === 'page-seller-exchange-return-policy'
                ? 'seller-exchange-return-policy'
                : 'product-policy'
            }
          />
        )}

        {activeTab === 'page-about-us' && (
          <AboutUsPage onBackToHome={() => setActiveTab('home')} onTabChange={setActiveTab} />
        )}

        {(activeTab === 'page-terms-conditions' || activeTab === 'page-terms-&-conditions') && (
          <TermsPage onBackToHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'page-privacy-policy' && (
          <PrivacyPage onBackToHome={() => setActiveTab('home')} />
        )}

        {(activeTab === 'page-return-refund-policy' || activeTab === 'page-return-&-refund-policy') && (
          <ReturnRefundPage onBackToHome={() => setActiveTab('home')} />
        )}

        {activeTab.startsWith('page-') &&
          activeTab !== 'page-become-a-seller' &&
          activeTab !== 'page-seller-policy' &&
          activeTab !== 'page-product-policy' &&
          activeTab !== 'page-pickup-delivery-policy' &&
          activeTab !== 'page-seller-exchange-return-policy' &&
          activeTab !== 'page-about-us' &&
          activeTab !== 'page-terms-conditions' &&
          activeTab !== 'page-terms-&-conditions' &&
          activeTab !== 'page-privacy-policy' &&
          activeTab !== 'page-return-refund-policy' &&
          activeTab !== 'page-return-&-refund-policy' && (
          <CustomPageView slug={activeTab.replace('page-', '')} onBackToHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'videos' && (
          <VideoReelsView onBackToHome={() => setActiveTab('home')} onBuyNow={handleBuyNow} />
        )}
      </main>

      {/* Modals and Side Drawers */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onAuthTrigger={() => setAuthOpen(true)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToWishlist={handleAddToWishlist}
        onBuyNow={handleBuyNow}
      />
      {activeTab !== 'videos' && activeTab !== 'admin' && (
        <FloatingCartButton onClick={() => setCartOpen(true)} hidden={cartOpen} />
      )}
      {activeTab === 'home' && (
        <OfferPopup products={activeProducts} onShopClick={() => setActiveTab('shop')} />
      )}

      {/* Chat Support */}
      {activeTab !== 'videos' && <ChatWidget />}
      {/* Footer */}
      {activeTab !== 'videos' && (
        <Footer onTabChange={setActiveTab} onCartClick={() => setCartOpen(true)} />
      )}
    </div>
  );
}
