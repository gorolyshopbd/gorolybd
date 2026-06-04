'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shirt, Laptop, Carrot, Sparkles, Watch, Dumbbell, BookOpen, LayoutGrid } from 'lucide-react';
import { getImageUrl } from '@/context/ShopContext';
import { useRealtime } from '@/hooks/useRealtime';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const iconMap = {
  Fashion: Shirt, Electronics: Laptop, Grocery: Carrot, Beauty: Sparkles,
  Accessories: Watch, Sports: Dumbbell, Books: BookOpen,
};

const bgMap = {
  Fashion: 'from-indigo-500 to-indigo-600', Electronics: 'from-blue-500 to-blue-600',
  Grocery: 'from-amber-500 to-amber-600', Beauty: 'from-pink-500 to-pink-600',
  Accessories: 'from-emerald-500 to-emerald-600', Sports: 'from-orange-500 to-orange-600',
  Books: 'from-violet-500 to-violet-600',
};

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

export default function CategorySection({ onCategoryClick }) {
  const [cats, setCats] = useState([]);

  const loadCats = useCallback(() => {
    fetch(`${API_URL}/categories`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setCats(Array.isArray(d) ? dedupeCategoriesByName(d) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCats();
  }, [loadCats]);

  // Realtime: refetch whenever an admin adds/edits/removes a category
  useRealtime('dashboard', { category_updated: loadCats });

  // Only show root-level categories (those not listed as subcategory of another category)
  const displayCats = cats.filter(c => !c.rootCategory || c.rootCategory === '--' || !cats.some(p => p.name === c.rootCategory));
  // Only duplicate for marquee if we have enough items to scroll (e.g., > 6)
  const isMarquee = displayCats.length > 6;
  const scrollingCats = isMarquee ? [...displayCats, ...displayCats] : displayCats;

  if (displayCats.length === 0) return null;

  return (
    <section className="bg-white py-4 sm:py-5">
      <style>{`
        @keyframes categoryMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .category-marquee-track {
          display: flex;
          width: max-content;
          animation: categoryMarquee 36s linear infinite;
          will-change: transform;
        }
        .category-marquee-shell:hover .category-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 bg-white py-2">
          <h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">Categories</h2>
          <button
            onClick={() => onCategoryClick('')}
            className="inline-flex h-9 w-fit items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF6600]/30 hover:bg-[#FF6600] hover:text-white hover:shadow-lg hover:shadow-orange-500/20"
          >
            View All
          </button>
        </div>

        <div className={`category-marquee-shell overflow-hidden bg-white py-3 ${!isMarquee ? 'flex justify-center sm:justify-start overflow-x-auto' : ''}`}>
          <div className={`${isMarquee ? 'category-marquee-track' : 'flex'} gap-6 pr-6 sm:gap-9 sm:pr-9 lg:gap-12 lg:pr-12`}>
          {scrollingCats.map((cat, idx) => {
            const Icon = iconMap[cat.name] || LayoutGrid;
            const fallbackBg = bgMap[cat.name] || 'from-slate-500 to-slate-600';
            return (
              <button
                key={`${cat._id || cat.name}-${idx}`}
                onClick={() => onCategoryClick(cat.name)}
                className="group flex w-24 shrink-0 flex-col items-center gap-2 bg-transparent text-center transition duration-300 hover:-translate-y-1 sm:w-28"
              >
                <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-white to-slate-100 p-1.5 shadow-[0_15px_28px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-100 transition duration-300 group-hover:shadow-[0_20px_35px_rgba(255,102,0,0.22),inset_0_1px_0_rgba(255,255,255,0.95)] group-hover:ring-[#FF6600]/30 sm:h-24 sm:w-24">
                  <span className="absolute inset-x-3 bottom-1 h-3 rounded-full bg-slate-900/15 blur-md transition group-hover:bg-[#FF6600]/25" />
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                  {cat.image ? (
                    <img src={getImageUrl(cat.image)} alt={cat.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${fallbackBg}`}>
                      <Icon size={34} className="text-white/85" />
                    </div>
                  )}
                  </div>
                </div>
                <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-snug text-slate-800 transition group-hover:text-[#FF6600] sm:text-sm">{cat.name}</h3>
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
