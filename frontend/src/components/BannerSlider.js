'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getImageUrl } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SLIDE_DELAY = 5000;

export default function BannerSlider({ onShopClick }) {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    fetch(`${API_URL}/banners/active`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBanners(data || []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length < 2 || isPaused) return undefined;

    const timer = window.setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, SLIDE_DELAY);

    return () => window.clearInterval(timer);
  }, [banners.length, isPaused]);

  if (banners.length === 0) return null;

  const goTo = (index) => setCurrent(index);
  const goPrev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const goNext = () => setCurrent((c) => (c + 1) % banners.length);

  return (
    <section
      className="group relative h-[210px] w-full overflow-hidden rounded-[28px] border border-white/60 bg-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-950/5 transition duration-300 dark:border-slate-800 dark:bg-slate-900 dark:ring-white/10 sm:h-[330px] lg:h-[430px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 z-10 rounded-[28px] ring-1 ring-inset ring-white/20" />
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <article key={banner._id} className="relative h-full min-w-full overflow-hidden">
            <img
              src={getImageUrl(banner.image)}
              alt={banner.title || 'Banner'}
              className={`h-full w-full object-cover transition duration-[1400ms] ease-out ${
                index === current ? 'scale-100' : 'scale-105'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/76 via-slate-950/32 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />

            <div className="absolute inset-y-0 left-0 flex w-full items-center px-5 sm:px-10 lg:px-14">
              <div className="max-w-[82%] text-white sm:max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-[10px] font-black uppercase text-white/90 shadow-sm backdrop-blur-md sm:text-[11px]">
                  <Sparkles size={13} />
                  Featured Deal
                </div>
                {banner.title && (
                  <h2 className="line-clamp-2 text-2xl font-black leading-tight tracking-tight drop-shadow-sm sm:text-4xl lg:text-5xl">
                    {banner.title}
                  </h2>
                )}
                {banner.subtitle && (
                  <p className="mt-2 line-clamp-2 max-w-md text-sm font-medium leading-6 text-white/82 sm:mt-3 sm:text-base">
                    {banner.subtitle}
                  </p>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    onShopClick?.();
                  }}
                  className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-slate-950 shadow-lg shadow-slate-950/15 transition duration-200 hover:-translate-y-0.5 hover:bg-[#FF6600] hover:text-white hover:shadow-orange-500/25 active:translate-y-0 active:scale-95 sm:mt-6 sm:px-5 sm:text-sm"
                >
                  {lang === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right-side clickable area to open categories (e.g., person image area) */}
            <button
              aria-label="Open categories"
              onClick={() => {
                try { window.dispatchEvent(new CustomEvent('goroly-open-categories')); } catch (e) {}
              }}
              className="hidden lg:block absolute right-0 top-0 h-full w-1/3 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(0,0,0,0))' }}
            />
          </article>
        ))}
      </div>

      <div className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-[11px] font-black text-white shadow-sm backdrop-blur-md sm:right-5 sm:top-5">
        {String(current + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/88 text-slate-900 opacity-100 shadow-lg ring-1 ring-white/50 backdrop-blur transition duration-200 hover:-translate-x-0.5 hover:scale-105 hover:bg-white active:scale-95 sm:left-5 sm:h-12 sm:w-12 lg:opacity-0 lg:group-hover:opacity-100"
            title="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/88 text-slate-900 opacity-100 shadow-lg ring-1 ring-white/50 backdrop-blur transition duration-200 hover:translate-x-0.5 hover:scale-105 hover:bg-white active:scale-95 sm:right-5 sm:h-12 sm:w-12 lg:opacity-0 lg:group-hover:opacity-100"
            title="Next slide"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-4 left-5 right-5 z-20 flex items-center gap-3 sm:bottom-5 sm:left-10 sm:right-10">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                key={`${current}-${isPaused}`}
                className="h-full rounded-full bg-white"
                style={{
                  animation: isPaused ? 'none' : `banner-progress ${SLIDE_DELAY}ms linear forwards`,
                }}
              />
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {banners.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 active:scale-90 ${
                    index === current ? 'w-7 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  title={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
