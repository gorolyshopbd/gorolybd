'use client';

import React, { useContext, useState, useEffect } from 'react';
import { ShopContext, formatPrice, getImageUrl, calculateFinalPrice, formatDiscountLabel } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Trash2, ShoppingBag, Star, Plus, Scale } from 'lucide-react';

export default function CompareModal({ isOpen, onClose }) {
  const { 
    compareList = [], 
    addToCompare,
    removeFromCompare, 
    clearCompare, 
    addToCart, 
    currencySymbol,
    API_URL
  } = useContext(ShopContext);
  
  const { lang, t } = useLanguage();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [localProducts, setLocalProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch all products on mount/open to ensure selector is always populated
  useEffect(() => {
    if (isOpen && API_URL) {
      setLoadingProducts(true);
      fetch(`${API_URL}/products?all=true`)
        .then(res => res.ok ? res.json() : { products: [] })
        .then(data => {
          if (data && data.products) {
            setLocalProducts(data.products);
          }
          setLoadingProducts(false);
        })
        .catch(err => {
          console.error("Error loading products in CompareModal:", err);
          setLoadingProducts(false);
        });
    }
  }, [isOpen, API_URL]);

  if (!isOpen) return null;

  const productsWithPrices = compareList.map(p => {
    const price = Number(p.price) || 0;
    const finalPrice = calculateFinalPrice(p);
    const savings = price - finalPrice;
    return { ...p, finalPrice, savings };
  });

  const minPrice = productsWithPrices.length > 0 
    ? Math.min(...productsWithPrices.map(p => p.finalPrice)) 
    : 0;

  const handleAddFromDropdown = (e) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const prod = localProducts.find(p => p._id === prodId);
    if (prod) {
      addToCompare(prod);
    }
    setSelectedProductId('');
  };

  // Filter out products already in comparison list
  const availableToSelect = localProducts.filter(p => !compareList.some(c => c._id === p._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden z-10 p-6 sm:p-8 animate-fade-in border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition duration-300"
        >
          <X size={20} className="stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-2">
            <Scale className="text-cyan-600 stroke-[2.5]" size={24} />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('compareTitle')} ({compareList.length}/3)
            </h2>
          </div>
          {compareList.length > 0 && (
            <button 
              onClick={clearCompare}
              className="text-xs font-bold text-red-500 hover:text-red-700 transition flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0"
            >
              <Trash2 size={14} />
              {lang === 'bn' ? 'তুলনা তালিকা খালি করুন' : 'Clear Comparison List'}
            </button>
          )}
        </div>

        {/* Top Product Selector (Only visible if list is not empty, and not full) */}
        {compareList.length > 0 && compareList.length < 3 && availableToSelect.length > 0 && (
          <div className="py-3 flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-4 rounded-2xl mt-4">
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              {lang === 'bn' ? 'তুলনা করতে আরেকটি পণ্য নির্বাচন করুন:' : 'Select another product to compare:'}
            </span>
            <div className="relative flex-1 w-full max-w-md">
              <select
                value={selectedProductId}
                onChange={handleAddFromDropdown}
                className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
              >
                <option value="">{lang === 'bn' ? '-- পণ্য নির্বাচন করুন --' : '-- Choose a product --'}</option>
                {availableToSelect.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({formatPrice(calculateFinalPrice(p), currencySymbol)})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500"></div>
            </div>
          </div>
        )}

        {/* Comparison Table / Grid */}
        <div className="flex-1 overflow-y-auto py-6">
          {compareList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 max-w-md mx-auto">
              <div className="p-4 bg-cyan-50 rounded-full text-cyan-600 animate-pulse">
                <Scale size={40} className="stroke-[2]" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-slate-800 font-extrabold text-base">
                  {t('emptyCompare')}
                </p>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' 
                    ? 'তুলনা শুরু করতে নিচের ড্রপডাউন থেকে যেকোনো পণ্য নির্বাচন করুন অথবা প্রোডাক্ট পেইজ থেকে তুলনা বাটন ক্লিক করুন।' 
                    : 'Select a product from the dropdown below to compare price variations side-by-side immediately.'}
                </p>
              </div>

              {/* Central Dropdown Selector */}
              {loadingProducts ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                  <span>{lang === 'bn' ? 'পণ্য লোড হচ্ছে...' : 'Loading products...'}</span>
                </div>
              ) : availableToSelect.length > 0 ? (
                <div className="w-full relative">
                  <select
                    value={selectedProductId}
                    onChange={handleAddFromDropdown}
                    className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition"
                  >
                    <option value="">{lang === 'bn' ? 'একটি পণ্য নির্বাচন করুন...' : 'Choose a product to compare...'}</option>
                    {availableToSelect.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({formatPrice(calculateFinalPrice(p), currencySymbol)})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-4.5 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500"></div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি।' : 'No products available to compare.'}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {productsWithPrices.map(p => (
                <div 
                  key={p._id} 
                  className="border border-slate-100 rounded-2xl p-4 flex flex-col justify-between relative bg-white hover:shadow-lg transition duration-300 group"
                >
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCompare(p._id)}
                    className="absolute right-3 top-3 p-1.5 bg-orange-50 text-orange-600 rounded-lg opacity-80 hover:opacity-100 transition"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="space-y-4">
                    {/* Image */}
                    <div className="h-40 bg-slate-50 rounded-xl flex items-center justify-center p-3 overflow-hidden border border-slate-50">
                      <img 
                        src={getImageUrl(p.image)} 
                        alt={p.name} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300" 
                      />
                    </div>

                    {/* Meta */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                        {p.category}
                      </span>
                      <h3 className="font-extrabold text-slate-800 text-sm line-clamp-2 h-10 pt-1 leading-snug">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              fill={i < Math.floor(p.rating || 5) ? 'currentColor' : 'none'} 
                            />
                          ))}
                        </div>
                        <span className="text-slate-400 text-[10px] font-semibold">({p.numReviews || 0})</span>
                      </div>
                    </div>

                    {/* Detailed Price Comparison Row */}
                    <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-100 text-xs">
                      {/* Original Price */}
                      <div className="flex justify-between items-center text-slate-500 font-semibold">
                        <span>{t('regularPrice')}:</span>
                        <span className={p.discountPercent > 0 ? 'line-through' : ''}>
                          {formatPrice(p.price, currencySymbol)}
                        </span>
                      </div>

                      {/* Discount Percent */}
                      {p.discountPercent > 0 && (
                        <div className="flex justify-between items-center text-red-500 font-extrabold">
                          <span>{lang === 'bn' ? 'ছাড় শতাংশ:' : 'Discount:'}</span>
                          <span>{formatDiscountLabel(p, currencySymbol)}</span>
                        </div>
                      )}

                      {/* Discount Price */}
                      <div className="flex justify-between items-center text-slate-900 font-black text-sm pt-1 border-t border-slate-200/60">
                        <span>{t('discountPrice')}:</span>
                        <span className="text-blue-600">{formatPrice(p.finalPrice, currencySymbol)}</span>
                      </div>

                      {/* Savings */}
                      {p.discountPercent > 0 && (
                        <div className="flex justify-between items-center text-emerald-600 font-bold text-[11px] pt-1">
                          <span>{t('comparePriceDiff')}:</span>
                          <span>{formatPrice(p.savings, currencySymbol)}</span>
                        </div>
                      )}

                      {/* Price variation relative to cheapest product */}
                      {compareList.length > 1 && (
                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 mt-1">
                          <span className="text-slate-500 font-bold">
                            {lang === 'bn' ? 'মূল্য তারতম্য:' : 'Price Variation:'}
                          </span>
                          {p.finalPrice === minPrice ? (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-extrabold text-[10px]">
                              {lang === 'bn' ? 'সবচেয়ে সাশ্রয়ী' : 'Cheapest'}
                            </span>
                          ) : (
                            <span className="text-orange-600 font-extrabold text-[11px]">
                              +{formatPrice(p.finalPrice - minPrice, currencySymbol)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stock & Brand details */}
                    <div className="text-xs space-y-1 text-slate-500 font-semibold pl-1">
                      <div>
                        <span className="text-slate-400">{lang === 'bn' ? 'ব্র্যান্ড: ' : 'Brand: '}</span>
                        <span className="text-slate-700 font-bold">{p.brand || 'Generic'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">{lang === 'bn' ? 'অবস্থা: ' : 'Status: '}</span>
                        <span className={p.countInStock > 0 ? 'text-emerald-600 font-bold' : 'text-orange-500 font-bold'}>
                          {p.countInStock > 0 ? t('inStock') : t('outOfStock')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Action */}
                  <div className="pt-4 mt-auto">
                    <button
                      onClick={() => {
                        addToCart(p, 1);
                        alert(lang === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
                      }}
                      disabled={p.countInStock <= 0}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer border-0 shadow-sm"
                    >
                      <ShoppingBag size={14} />
                      {t('addToCart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
