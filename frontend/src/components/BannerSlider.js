'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BannerSlider({ onShopClick }) {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const { lang, t } = useLanguage();

  useEffect(() => {
    fetch(`${API_URL}/banners/active`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setBanners(data || []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const goTo = (i) => setCurrent(i);

  return (
    <div className="relative w-full h-full min-h-[200px] sm:min-h-[300px] lg:min-h-[420px] overflow-hidden rounded-3xl">
      {banners.map((b, i) => (
        <div
          key={b._id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img src={getImageUrl(b.image)} alt={b.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center p-6 sm:p-12">
            <div className="text-white max-w-xl space-y-4">
              {b.title && <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">{b.title}</h2>}
              {b.subtitle && <p className="text-sm sm:text-base text-white/80 max-w-md">{b.subtitle}</p>}
              <button
                onClick={(e) => { e.preventDefault(); onShopClick?.(); }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition hover:-translate-y-0.5 text-xs sm:text-sm"
              >
                {lang === 'bn' ? 'এখনই কিনুন' : 'Shop Now'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
      {banners.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/25 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/50 hover:scale-110 transition-all duration-200 shadow-lg group"><ChevronLeft size={28} className="text-white group-hover:scale-110 transition-transform" /></button>
          <button onClick={() => setCurrent((c) => (c + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/25 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/50 hover:scale-110 transition-all duration-200 shadow-lg group"><ChevronRight size={28} className="text-white group-hover:scale-110 transition-transform" /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/70'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
