'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import BannerSlider from './BannerSlider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Hero({ onShopClick }) {
  const { lang } = useLanguage();
  const [offers, setOffers] = useState([]);
  const [heroSettings, setHeroSettings] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/offers/active`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setOffers(data || []))
      .catch(() => setOffers([]));

    fetch(`${API_URL}/settings/hero`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setHeroSettings(data))
      .catch(() => setHeroSettings(null));
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-50 pt-6 sm:pt-10 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Dynamic Banner Slider */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden lg:min-h-[435px]">
            <BannerSlider onShopClick={onShopClick} />
          </div>

          {/* Right Sub-Promo Cards - Dynamic from Offers */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4 sm:gap-6 h-full">
            {offers.length > 0 ? (
              offers.slice(0, 3).map((offer) => (
                <div
                  key={offer.id}
                  className="bg-slate-100 rounded-3xl p-5 sm:p-8 flex-1 flex flex-col justify-between relative overflow-hidden border border-slate-200/50"
                >
                  {offer.image && (
                    <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 w-20 sm:w-28 lg:w-36 h-20 sm:h-28 lg:h-36 pointer-events-none">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  
                  <div className={`relative z-10 space-y-2 sm:space-y-3 ${offer.image ? 'max-w-[55%] sm:max-w-[60%]' : 'max-w-full'}`}>
                    {offer.discountPercent > 0 && (
                      <span className="inline-block text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {offer.discountPercent}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
                      </span>
                    )}
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 leading-tight">
                      {offer.title}
                    </h3>
                    {offer.description && (
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">{offer.description}</p>
                    )}
                    <button
                      onClick={() => {
                        if (offer.link) window.open(offer.link, '_blank');
                        else onShopClick();
                      }}
                      className="mt-1 sm:mt-2 text-xs font-bold text-white bg-slate-900 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg hover:bg-slate-800 transition"
                    >
                      {lang === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* Fallback static cards when no offers exist */
              <>
                <div className="bg-slate-100 rounded-3xl p-5 sm:p-8 flex-1 flex flex-col justify-between relative overflow-hidden border border-slate-200/50">
                  {heroSettings?.hero_image && (
                    <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 w-20 sm:w-28 lg:w-36 h-20 sm:h-28 lg:h-36 pointer-events-none">
                      <img
                        src={heroSettings.hero_image.startsWith('http') ? heroSettings.hero_image : `${API_URL}${heroSettings.hero_image}`}
                        alt="Promo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className={`relative z-10 space-y-2 sm:space-y-3 ${heroSettings?.hero_image ? 'max-w-[55%] sm:max-w-[60%]' : 'max-w-full'}`}>
                    <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">{heroSettings?.hero_badge || (lang === 'bn' ? 'গ্রীষ্মকালীন অফার' : 'Summer Sale')}</span>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 leading-tight">{heroSettings?.hero_title || (lang === 'bn' ? '৫০% ছাড়' : '50% OFF')}</h3>
                    <button
                      onClick={onShopClick}
                      className="mt-1 sm:mt-2 text-xs font-bold text-white bg-slate-900 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg hover:bg-slate-800 transition"
                    >
                      {lang === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-100 text-center space-y-1 sm:space-y-2 flex flex-col items-center justify-center">
                    {heroSettings?.hero_feature1_image && (
                      <img src={heroSettings.hero_feature1_image.startsWith('http') ? heroSettings.hero_feature1_image : `${API_URL}${heroSettings.hero_feature1_image}`} alt="Feature 1" className="h-8 sm:h-12 w-auto object-contain mb-1" />
                    )}
                    <div className="text-lg sm:text-2xl font-extrabold text-blue-600">{heroSettings?.hero_feature1_title || (lang === 'bn' ? 'ফ্রি' : 'Free')}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-500">{heroSettings?.hero_feature1_subtitle || (lang === 'bn' ? '৳১০০০ এর উপরে শিপিং ফ্রি' : 'Shipping Over $100')}</div>
                  </div>
                  <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-100 text-center space-y-1 sm:space-y-2 flex flex-col items-center justify-center">
                    {heroSettings?.hero_feature2_image && (
                      <img src={heroSettings.hero_feature2_image.startsWith('http') ? heroSettings.hero_feature2_image : `${API_URL}${heroSettings.hero_feature2_image}`} alt="Feature 2" className="h-8 sm:h-12 w-auto object-contain mb-1" />
                    )}
                    <div className="text-lg sm:text-2xl font-extrabold text-amber-500">{heroSettings?.hero_feature2_title || (lang === 'bn' ? '৩০ দিন' : '30 Days')}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-500">{heroSettings?.hero_feature2_subtitle || (lang === 'bn' ? 'ফেরত এবং রিফান্ড গ্যারান্টি' : 'Return & Money Back')}</div>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
