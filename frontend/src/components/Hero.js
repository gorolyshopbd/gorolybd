'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import BannerSlider from './BannerSlider';

export default function Hero({ onShopClick }) {
  const { lang, t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-slate-50 pt-6 sm:pt-10 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Dynamic Banner Slider */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden lg:min-h-[420px]">
            <BannerSlider onShopClick={onShopClick} />
          </div>

          {/* Right Sub-Promo Cards */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4 sm:gap-6 h-full">
            {/* Card 1 - Sunglasses Banner */}
            <div className="bg-slate-100 rounded-3xl p-5 sm:p-8 flex-1 flex flex-col justify-between relative overflow-hidden border border-slate-200/50">
              <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 w-20 sm:w-28 lg:w-36 h-20 sm:h-28 lg:h-36 pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=200&auto=format&fit=crop"
                  alt="Promo Sunglasses"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="relative z-10 max-w-[55%] sm:max-w-[60%] space-y-2 sm:space-y-3">
                <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">{lang === 'bn' ? 'গ্রীষ্মকালীন অফার' : 'Summer Sale'}</span>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 leading-tight">{lang === 'bn' ? '৫০% ছাড়' : '50% OFF'}</h3>
                <button
                  onClick={onShopClick}
                  className="mt-1 sm:mt-2 text-xs font-bold text-white bg-slate-900 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg hover:bg-slate-800 transition"
                >
                  {lang === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}
                </button>
              </div>
            </div>

            {/* Card 2 - Info Cards grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-100 text-center space-y-1 sm:space-y-2">
                <div className="text-lg sm:text-2xl font-extrabold text-blue-600">{lang === 'bn' ? 'ফ্রি' : 'Free'}</div>
                <div className="text-[10px] sm:text-xs font-medium text-slate-500">{lang === 'bn' ? '৳১০০০ এর উপরে শিপিং ফ্রি' : 'Shipping Over $100'}</div>
              </div>
              <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-100 text-center space-y-1 sm:space-y-2">
                <div className="text-lg sm:text-2xl font-extrabold text-amber-500">{lang === 'bn' ? '৩০ দিন' : '30 Days'}</div>
                <div className="text-[10px] sm:text-xs font-medium text-slate-500">{lang === 'bn' ? 'ফেরত এবং রিফান্ড গ্যারান্টি' : 'Return & Money Back'}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
