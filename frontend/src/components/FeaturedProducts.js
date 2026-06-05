'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShopContext, getImageUrl, formatPrice, calculateFinalPrice } from '@/context/ShopContext';

import { ShoppingBag } from 'lucide-react';

function ProductCard({ product, onProductClick }) {
  const router = useRouter();
  const { currencySymbol, addToCart } = useContext(ShopContext);
  const finalPrice = calculateFinalPrice(product);

  return (
    <article 
      onClick={() => router.push(`/product/${product._id}`)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white cursor-pointer hover:shadow-lg transition-all duration-300 relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f3f4f6] p-4 flex items-center justify-center">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105 mix-blend-multiply"
        />
        {/* Modern Hover Quick Add */}
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
          className="absolute bottom-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition-all duration-300 hover:bg-[#FF6600] hover:scale-110 active:scale-95"
          title="Add to cart"
        >
          <ShoppingBag size={20} />
        </button>
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
          <span className="text-slate-500 truncate max-w-[60%]">{product.brand || 'Goroly'}</span>
          <span className="text-emerald-500 whitespace-nowrap">Sold {product.soldCount || Math.floor(Math.random() * 50) + 10}</span>
        </div>

        <h3 className="line-clamp-2 min-h-[40px] text-left text-[14px] font-medium leading-snug text-slate-800 transition group-hover:text-[#FF6600]">
          {product.name}
        </h3>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="text-[15px] font-black text-slate-900">
            {formatPrice(finalPrice, currencySymbol)}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedProducts({ products = [], onProductClick }) {
  const [activeTab, setActiveTab] = useState('all');
  const scrollerRef = useRef(null);

  const sections = useMemo(() => {
    const visible = products.filter((product) => product && product.isPublished !== false);
    const catalog = visible;

    const newArrivals = [...catalog]
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
      .slice(0, 10);

    const popular = [...catalog]
      .sort((a, b) => {
        const aScore = Number(a.soldCount || a.salesCount || 0);
        const bScore = Number(b.soldCount || b.salesCount || 0);
        return bScore - aScore;
      })
      .slice(0, 10);

    const deals = [...catalog]
      .filter(p => Number(p.discountPercent || 0) > 0)
      .slice(0, 10);

    return {
      all: { label: 'All', products: catalog.slice(0, 15) },
      latest: { label: 'Latest Product', products: newArrivals.length ? newArrivals : catalog.slice(0, 10) },
      best: { label: 'Best Selling', products: popular.length ? popular : catalog.slice(0, 10) },
      deals: { label: 'Today Deals', products: deals.length ? deals : catalog.slice(0, 10) },
    };
  }, [products]);

  const current = sections[activeTab];

  if (!products.length) return null;

  return (
    <section className="bg-white py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 md:gap-4">
            <h2 className="text-xl md:text-[22px] font-bold text-slate-900 whitespace-nowrap">All Product</h2>
            <div className="w-[1px] h-5 md:h-6 bg-slate-300"></div>
            <span className="text-base md:text-[18px] text-slate-400 font-medium whitespace-nowrap">Customer Favorite</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-semibold text-slate-500">
            {Object.entries(sections).map(([key, section], index) => {
              const isActive = activeTab === key;
              return (
                <React.Fragment key={key}>
                  <button
                    onClick={() => setActiveTab(key)}
                    className={`transition-colors whitespace-nowrap ${
                      isActive 
                        ? 'px-4 py-1.5 border border-yellow-400 rounded bg-yellow-50 text-slate-900' 
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {section.label}
                  </button>
                  {index < Object.entries(sections).length - 1 && (
                    <span className="text-slate-300 hidden sm:inline">-</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div
          ref={scrollerRef}
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
        >
          {current.products.map((product) => (
            <div key={product._id} className="min-w-0">
              <ProductCard
                product={product}
                onProductClick={onProductClick}
              />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
