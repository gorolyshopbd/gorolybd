'use client';

import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ShopContext, getImageUrl, formatPrice } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { Star, Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';

export default function FeaturedProducts({ products, onProductClick, onAddToWishlist }) {
  const router = useRouter();
  const { addToCart, currencySymbol } = useContext(ShopContext);
  const { t } = useLanguage();

  const featured = products.filter((p) => !p.isFlashSale);
  const displayProducts = featured.length > 0 ? featured : products;

  return (
    <section className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#FF6600] to-orange-400 rounded-xl shadow-lg shadow-[#FF6600]/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{t('featuredProducts')}</h2>
              <p className="text-slate-500 text-xs sm:text-sm">{t('handpicked')}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/shop')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#FF6600] bg-orange-50 hover:bg-orange-100 rounded-xl transition"
          >
            {t('viewAll')}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayProducts.map((product) => {
            const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);
            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-500 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative pt-[80%] bg-slate-50 overflow-hidden">
                  {product.discountPercent > 0 && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg z-10 shadow-lg shadow-emerald-500/30">
                      -{product.discountPercent}%
                    </span>
                  )}
                  <button
                    onClick={() => onAddToWishlist(product)}
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 rounded-full shadow-md backdrop-blur-sm transition z-10 scale-0 group-hover:scale-100"
                  >
                    <Heart size={15} />
                  </button>
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    onClick={() => router.push(`/product/${product._id}`)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <button
                    onClick={() => onProductClick(product)}
                    className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:bg-white transition z-10 text-slate-500 hover:text-[#FF6600] translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300"
                    title="Quick View"
                  >
                    <Eye size={15} />
                  </button>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-[0.1em]">{product.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[9px] font-semibold text-slate-400">{product.brand}</span>
                    </div>
                    <h3
                      onClick={() => router.push(`/product/${product._id}`)}
                      className="font-bold text-slate-800 text-sm leading-snug hover:text-[#FF6600] cursor-pointer transition line-clamp-2"
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <span className="text-slate-400 text-[10px] font-medium">({product.numReviews || 12})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-slate-900">{formatPrice(finalPrice, currencySymbol)}</span>
                      {product.discountPercent > 0 && (
                        <span className="text-[11px] text-slate-400 line-through font-medium">{formatPrice(product.price, currencySymbol)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="px-3.5 py-2 bg-[#FF6600] hover:bg-[#e05a00] text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md shadow-[#FF6600]/15 hover:shadow-lg hover:shadow-[#FF6600]/25 flex items-center gap-1.5 border-0 cursor-pointer"
                    >
                      <ShoppingBag size={12} />
                      {t('add')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
