'use client';

import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BrandSection({ onBrandClick }) {
  const [brands, setBrands] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/brands`)
      .then((r) => r.ok ? r.json() : [])
      .then(setBrands)
      .catch(() => {});
  }, []);

  if (!brands.length) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Shop by Brands</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">Discover products from top trusted brands</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {brands.map((brand) => (
            <button
              key={brand._id}
              onClick={() => onBrandClick?.(brand.name)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-300"
            >
              <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center p-6">
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-2xl font-black text-slate-300">{brand.name}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-sm font-bold text-white drop-shadow-lg">{brand.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
