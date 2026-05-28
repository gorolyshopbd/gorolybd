'use client';

import React, { useState, useEffect } from 'react';
import { Shirt, Laptop, Carrot, Sparkles, Watch, Dumbbell, BookOpen, LayoutGrid } from 'lucide-react';
import { getImageUrl } from '@/context/ShopContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const iconMap = {
  Fashion: Shirt, Electronics: Laptop, Grocery: Carrot, Beauty: Sparkles,
  Accessories: Watch, Sports: Dumbbell, Books: BookOpen,
};

const bgMap = {
  Fashion: 'from-indigo-500 to-indigo-600', Electronics: 'from-blue-500 to-blue-600',
  Grocery: 'from-amber-500 to-amber-600', Beauty: 'from-pink-500 to-pink-600',
  Accessories: 'from-emerald-500 to-emerald-600', Sports: 'from-rose-500 to-rose-600',
  Books: 'from-violet-500 to-violet-600',
};

export default function CategorySection({ onCategoryClick }) {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((r) => r.ok ? r.json() : [])
      .then(setCats)
      .catch(() => {});
  }, []);

  const displayCats = cats;

  if (displayCats.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shop By Categories</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Browse our extensive collections curated just for you</p>
          </div>
          <button
            onClick={() => onCategoryClick('')}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            View All &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6">
          {displayCats.map((cat, idx) => {
            const Icon = iconMap[cat.name] || LayoutGrid;
            const fallbackBg = bgMap[cat.name] || 'from-slate-500 to-slate-600';
            return (
              <button
                key={cat._id || idx}
                onClick={() => onCategoryClick(cat.name)}
                className="group flex flex-col rounded-2xl overflow-hidden border border-slate-100 bg-white hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200 transition duration-300"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                  {cat.image ? (
                    <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${fallbackBg} flex items-center justify-center`}>
                      <Icon size={40} className="text-white/80" />
                    </div>
                  )}
                </div>
                <div className="py-3 px-3 text-center">
                  <h3 className="font-bold text-slate-800 text-sm">{cat.name}</h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
