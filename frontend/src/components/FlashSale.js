'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ShopContext, getImageUrl, formatPrice } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { Star, Heart, ShoppingCart, Eye, Zap } from 'lucide-react';

export default function FlashSale({ products, onProductClick, onAddToWishlist }) {
  const router = useRouter();
  const { addToCart, currencySymbol } = useContext(ShopContext);
  const { lang, t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 2, hours: 14, minutes: 36, seconds: 48,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');
  const flashSaleProducts = products.filter((p) => p.isFlashSale);
  if (flashSaleProducts.length === 0) return null;

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-pink-700" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{lang === 'bn' ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}</h2>
              <p className="text-orange-100 text-xs sm:text-sm opacity-90">{lang === 'bn' ? 'তাড়াতাড়ি করুন! এই অফারটি সীমিত সময়ের জন্য।' : "Hurry up! These deals won't last long."}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { val: timeLeft.days, label: lang === 'bn' ? 'দিন' : 'Days' },
              { val: timeLeft.hours, label: lang === 'bn' ? 'ঘণ্টা' : 'Hours' },
              { val: timeLeft.minutes, label: lang === 'bn' ? 'মিনিট' : 'Mins' },
              { val: timeLeft.seconds, label: lang === 'bn' ? 'সেকেন্ড' : 'Secs' },
            ].map((t, idx) => (
              <div key={idx} className="flex items-center">
                <div className="bg-white/15 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-center min-w-[48px]">
                  <div className="font-extrabold text-white text-sm sm:text-lg tracking-wider">{formatNumber(t.val)}</div>
                  <div className="text-[8px] font-semibold text-orange-200 uppercase tracking-wider">{t.label}</div>
                </div>
                {idx < 3 && <span className="mx-0.5 font-bold text-white/40 text-lg">:</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {flashSaleProducts.map((product) => {
            const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);
            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-black/20 transition-all duration-500 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative pt-[80%] bg-slate-100 overflow-hidden">
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg z-10 shadow-lg shadow-red-500/30">
                    -{product.discountPercent}%
                  </span>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <button
                    onClick={() => onProductClick(product)}
                    className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:bg-white transition z-10 text-slate-500 hover:text-[#FF6600] translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300"
                    title={lang === 'bn' ? 'দ্রুত দেখুন' : 'Quick View'}
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
                      <span className="text-slate-400 text-[10px] font-medium">({product.numReviews || 35})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-slate-900">{formatPrice(finalPrice, currencySymbol)}</span>
                      <span className="text-[11px] text-slate-400 line-through font-medium">{formatPrice(product.price, currencySymbol)}</span>
                    </div>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="px-3.5 py-2 bg-[#FF6600] hover:bg-[#e05a00] text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md shadow-[#FF6600]/20 hover:shadow-lg hover:shadow-[#FF6600]/30 flex items-center gap-1.5 border-0 cursor-pointer"
                    >
                      <ShoppingCart size={12} />
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
