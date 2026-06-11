'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/context/ShopContext';
import { useRealtime } from '@/hooks/useRealtime';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function CategoryBannerCarousel({ onCategoryClick }) {
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadCats = useCallback(() => {
    fetch(`${API_URL}/categories`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => {
        const deduped = Array.isArray(d) ? dedupeCategoriesByName(d) : [];
        // Only show categories with banners
        setCats(deduped.filter(c => c.banner));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCats();
  }, [loadCats]);

  // Realtime: refetch whenever categories are updated
  useRealtime('dashboard', { category_updated: loadCats });

  // Auto-rotate banner every 5 seconds
  useEffect(() => {
    if (cats.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cats.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [cats.length]);

  if (cats.length === 0) return null;

  const currentCat = cats[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cats.length) % cats.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cats.length);
  };

  return (
    <section className="bg-white py-4 sm:py-6">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 group">
          {/* Banner Image */}
          <div className="relative w-full h-48 sm:h-64 lg:h-80">
            {currentCat?.banner ? (
              <img
                src={getImageUrl(currentCat.banner)}
                alt={currentCat.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-700" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

            {/* Category Info */}
            <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 lg:p-8">
              <button
                onClick={() => onCategoryClick(currentCat?.name)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#FF6600] hover:bg-[#E55A00] text-white font-bold rounded-lg transition text-sm sm:text-base"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          {cats.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-900 transition opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-900 transition opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={20} />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {cats.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 sm:h-2.5 rounded-full transition ${
                      idx === currentIndex ? 'w-6 sm:w-8 bg-[#FF6600]' : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
