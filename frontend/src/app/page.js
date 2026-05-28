'use client';

import React, { useState, useEffect, useContext } from 'react';
import { ShopContext, getImageUrl, formatPrice } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeatureStrip from '@/components/FeatureStrip';
import CategorySection from '@/components/CategorySection';
import BrandSection from '@/components/BrandSection';
import FlashSale from '@/components/FlashSale';
import FeaturedProducts from '@/components/FeaturedProducts';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import ProductDetailModal from '@/components/ProductDetailModal';
import Footer from '@/components/Footer';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';
import ChatWidget from '@/components/ChatWidget';
import CustomPageView from '@/components/CustomPageView';
import VideoReelsView from '@/components/VideoReelsView';
import { ShoppingCart, Star, Heart, ArrowRight, Eye, LayoutGrid, List, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';



export default function Storefront() {
  const router = useRouter();
  const { user, fetchProducts, products, addToCart, currencySymbol } = useContext(ShopContext);
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('home'); // home, shop, categories, wishlist, admin, dashboard
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

  // Load products, branding, brands and categories on mount
  useEffect(() => {
    fetchProducts();
    fetch('http://localhost:5000/api/settings/public')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setBranding(d); })
      .catch(() => {});
    fetch('http://localhost:5000/api/brands')
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setShopBrands(d || []))
      .catch(() => {});
    fetch('http://localhost:5000/api/categories')
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setShopCategories(d || []))
      .catch(() => {});
  }, []);

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
      link.href = branding.faviconUrl;
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
    const matchesCategory = selectedCategory ? p.category.toLowerCase() === selectedCategory.toLowerCase() : true;
    const matchesBrand = selectedBrand ? (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase()) : true;
    const finalPrice = p.price * (1 - (p.discountPercent || 0) / 100);
    const matchesPrice = finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    const matchesRating = minRating > 0 ? (p.rating || 5) >= minRating : true;
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === 'price_asc') return (a.price * (1-(a.discountPercent||0)/100)) - (b.price * (1-(b.discountPercent||0)/100));
    if (sortOrder === 'price_desc') return (b.price * (1-(b.discountPercent||0)/100)) - (a.price * (1-(a.discountPercent||0)/100));
    return 0;
  });

  const toggleFilter = (key) => setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }));
  const resetShopFilters = () => { setSelectedCategory(''); setSelectedBrand(''); setPriceRange([0, 100000]); setMinRating(0); setSearchQuery(''); };

  // Endless pagination sync
  useEffect(() => {
    setVisibleProducts(sortedProducts.slice(0, 12));
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
    <div className="flex flex-col min-h-screen bg-white justify-between">
      {/* Header */}
      {activeTab !== 'videos' && (
        <Header 
          onCartClick={() => setCartOpen(true)}
          onAuthClick={() => setAuthOpen(true)}
          onSearchChange={setSearchQuery}
          currentSearch={searchQuery}
          onTabChange={setActiveTab}
          activeTab={activeTab}
        />
      )}

      {/* Main Pages Content */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div className="flex flex-col gap-1">
            <Hero onShopClick={() => setActiveTab('shop')} />
            <FeatureStrip />
            <div className="flex flex-col gap-4 mt-4">
            <CategorySection onCategoryClick={handleCategoryClick} />
            <BrandSection onBrandClick={(brand) => { setSelectedCategory(''); setSearchQuery(brand); setActiveTab('shop'); }} />
            <FlashSale 
              products={activeProducts} 
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
                      {shopCategories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`text-left text-sm px-3 py-2 rounded-lg transition font-semibold ${selectedCategory === cat.name ? 'bg-[#FF6600] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
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

                {/* Category Banner */}
                {(() => {
                  const activeCat = shopCategories.find(c => c.name === selectedCategory);
                  return (
                    <div className="w-full rounded-2xl overflow-hidden mb-4 relative" style={{ height: '160px' }}>
                      {activeCat?.image ? (
                        <img
                          src={getImageUrl(activeCat.image)}
                          alt={activeCat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FF6600 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)' }} />
                          <div className="text-center z-10">
                            <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{lang === 'bn' ? 'ব্রাউজ' : 'Browse'}</div>
                            <div className="text-white text-2xl font-extrabold">{selectedCategory || t('allProducts')}</div>
                          </div>
                        </div>
                      )}
                      {/* Overlay with category name */}
                      {activeCat?.image && (
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center px-6">
                          <div>
                            <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</div>
                            <div className="text-white text-2xl font-extrabold drop-shadow">{selectedCategory}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Sort bar + count + view toggle */}
                <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-xs">
                  <div>
                    <span className="font-extrabold text-slate-800 text-sm">{t('allProducts')}</span>
                    <span className="ml-2 text-xs font-semibold text-[#FF6600]">{t('showing')} {sortedProducts.length} {t('results')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF6600] bg-white"
                    >
                      <option value="newest">{t('newest')}</option>
                      <option value="oldest">{t('oldest')}</option>
                      <option value="price_asc">{t('priceLowHigh')}</option>
                      <option value="price_desc">{t('priceHighLow')}</option>
                    </select>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button onClick={() => setViewMode('grid')} className={`p-2 transition ${viewMode === 'grid' ? 'bg-[#FF6600] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <LayoutGrid size={15} />
                      </button>
                      <button onClick={() => setViewMode('list')} className={`p-2 transition ${viewMode === 'list' ? 'bg-[#FF6600] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                        {visibleProducts.map((product) => {
                          const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);
                          const isWish = wishlist.some((x) => x._id === product._id);
                          return (
                            <div key={product._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group shadow-sm hover:shadow-xl hover:border-slate-200 transition duration-300 flex flex-col">
                              <div className="relative pt-[80%] bg-slate-50 overflow-hidden">
                                {product.discountPercent > 0 && (
                                  <span className="absolute top-2 left-2 bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md z-10">-{product.discountPercent}%</span>
                                )}
                                <button onClick={() => handleAddToWishlist(product)} className={`absolute top-2 right-2 p-1.5 rounded-full shadow-xs transition z-10 ${isWish ? 'bg-red-50 text-red-500' : 'bg-white/80 text-slate-400 hover:text-red-500'}`}>
                                  <Heart size={14} fill={isWish ? 'currentColor' : 'none'} />
                                </button>
                                <img src={getImageUrl(product.image)} alt={product.name} onClick={() => router.push(`/product/${product._id}`)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer" />
                                <button onClick={() => setSelectedProduct(product)} className="absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-lg shadow-xs hover:bg-white transition z-10 text-slate-500 hover:text-[#FF6600]" title={t('quickView')}>
                                  <Eye size={13} />
                                </button>
                              </div>
                              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{product.category}</span>
                                  <h3 onClick={() => router.push(`/product/${product._id}`)} className="font-bold text-slate-800 text-sm hover:text-[#FF6600] cursor-pointer transition line-clamp-2 leading-snug mt-0.5">{product.name}</h3>
                                  <div className="flex items-center gap-1 mt-1">
                                    <div className="flex text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'} />)}</div>
                                    <span className="text-slate-400 text-[10px]">({product.numReviews || 12})</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-extrabold text-slate-900">{formatPrice(finalPrice, currencySymbol)}</span>
                                    {product.discountPercent > 0 && <span className="text-xs text-slate-400 line-through">{formatPrice(product.price, currencySymbol)}</span>}
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }} className="px-2.5 py-1.5 bg-[#FF6600] hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition">{t('add')}</button>
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
                          const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);
                          const isWish = wishlist.some((x) => x._id === product._id);
                          return (
                            <div key={product._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group shadow-sm hover:shadow-md transition duration-300 flex items-center gap-4 p-3">
                              <div className="relative w-24 h-24 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden">
                                {product.discountPercent > 0 && (
                                  <span className="absolute top-1 left-1 bg-red-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded z-10">-{product.discountPercent}%</span>
                                )}
                                <img src={getImageUrl(product.image)} alt={product.name} onClick={() => router.push(`/product/${product._id}`)} className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-500" />
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
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <div className="text-lg font-extrabold text-slate-900">{formatPrice(finalPrice, currencySymbol)}</div>
                                  {product.discountPercent > 0 && <div className="text-xs text-slate-400 line-through">{formatPrice(product.price, currencySymbol)}</div>}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }} className="px-4 py-2 bg-[#FF6600] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-orange-500/20">{t('addToCart')}</button>
                                <button onClick={() => handleAddToWishlist(product)} className={`text-xs font-semibold flex items-center gap-1 ${isWish ? 'text-red-500' : 'text-slate-400 hover:text-red-500'} transition`}>
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
                  const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden group shadow-sm hover:shadow-xl hover:border-slate-200 transition duration-300 flex flex-col justify-between"
                    >
                      <div className="relative pt-[100%] bg-slate-50 relative overflow-hidden">
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
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{product.category}</span>
                          <h3
                            onClick={() => router.push(`/product/${product._id}`)}
                            className="font-bold text-slate-800 text-sm hover:text-blue-600 cursor-pointer transition line-clamp-1"
                          >
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-base font-extrabold text-slate-900">{formatPrice(finalPrice, currencySymbol)}</span>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
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

        {activeTab.startsWith('page-') && (
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

      {/* Chat Support */}
      {activeTab !== 'videos' && <ChatWidget />}
      {/* Footer */}
      {activeTab !== 'videos' && (
        <Footer onTabChange={setActiveTab} onCartClick={() => setCartOpen(true)} />
      )}
    </div>
  );
}
