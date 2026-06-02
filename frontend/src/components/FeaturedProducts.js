'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShopContext, getImageUrl, formatPrice, calculateFinalPrice, formatDiscountLabel } from '@/context/ShopContext';
import {
  ArrowRight,
  Eye,
  Grid2X2,
  Heart,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Clock3,
} from 'lucide-react';

function ProductCard({ product, onProductClick, onAddToWishlist }) {
  const router = useRouter();
  const { addToCart, currencySymbol } = useContext(ShopContext);
  const finalPrice = calculateFinalPrice(product);
  const rating = Math.max(0, Math.min(5, Math.floor(product.rating || 5)));
  const hasDiscount = Number(product.discountPercent || 0) > 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition duration-300 ease-out hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
      <button
        type="button"
        onClick={() => router.push(`/product/${product._id}`)}
        className="relative block aspect-[5/4] w-full overflow-hidden bg-slate-100 text-left sm:aspect-[6/5]"
      >
        {hasDiscount && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black text-white shadow-lg shadow-red-500/20">
            {formatDiscountLabel(product, currencySymbol)}
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute bottom-3 left-3 z-10 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black text-slate-900 shadow-sm backdrop-blur">
            Featured
          </span>
        )}
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/18 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </button>

      <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 opacity-100 sm:translate-x-2 sm:opacity-0 sm:transition sm:duration-300 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onAddToWishlist(product)}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-500 shadow-sm ring-1 ring-slate-200/80 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:text-red-500 hover:ring-red-100 active:translate-y-0 active:scale-95"
          title="Wishlist"
        >
          <Heart size={16} />
        </button>
        <button
          type="button"
          onClick={() => onProductClick(product)}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm ring-1 ring-slate-200/80 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:text-[#FF6600] hover:ring-orange-100 active:translate-y-0 active:scale-95"
          title="Quick view"
        >
          <Eye size={16} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
          <span className="max-w-[120px] truncate">{product.category || 'Product'}</span>
          {product.brand && <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />}
          {product.brand && <span className="truncate normal-case text-slate-500">{product.brand}</span>}
        </div>

        <button
          type="button"
          onClick={() => router.push(`/product/${product._id}`)}
          className="line-clamp-2 min-h-[44px] text-left text-[15px] font-black leading-snug text-slate-950 transition hover:text-[#FF6600] sm:text-base"
        >
          {product.name}
        </button>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} fill={i < rating ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">({product.numReviews || 0})</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <div className="text-base font-black text-slate-950 sm:text-lg">{formatPrice(finalPrice, currencySymbol)}</div>
            {hasDiscount && (
              <div className="text-xs font-semibold text-slate-400 line-through">{formatPrice(product.price, currencySymbol)}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-slate-950 px-3.5 text-xs font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#FF6600] hover:shadow-lg hover:shadow-orange-500/20 active:translate-y-0 active:scale-95 sm:px-4"
          >
            <ShoppingBag size={14} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedProducts({ products = [], onProductClick, onAddToWishlist }) {
  const [activeTab, setActiveTab] = useState('new');
  const scrollerRef = useRef(null);

  const sections = useMemo(() => {
    const visible = products.filter((product) => product && product.isPublished !== false);
    const nonFlash = visible.filter((product) => !product.isFlashSale);
    const catalog = nonFlash.length ? nonFlash : visible;

    const newArrivals = [...catalog]
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
      .slice(0, 10);

    const popular = [...catalog]
      .sort((a, b) => {
        const aScore = Number(a.soldCount || a.salesCount || 0) * 4 + Number(a.numReviews || 0) * 2 + Number(a.rating || 0);
        const bScore = Number(b.soldCount || b.salesCount || 0) * 4 + Number(b.numReviews || 0) * 2 + Number(b.rating || 0);
        return bScore - aScore;
      })
      .slice(0, 10);

    return {
      new: { label: 'New Arrival', icon: Clock3, products: newArrivals.length ? newArrivals : catalog.slice(0, 10) },
      popular: { label: 'Popular', icon: TrendingUp, products: popular.length ? popular : catalog.slice(0, 10) },
      all: { label: 'All Products', icon: Grid2X2, products: catalog.slice(0, 15) },
    };
  }, [products]);

  const current = sections[activeTab];
  const CurrentIcon = current.icon;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || current.products.length < 3) return undefined;

    const interval = window.setInterval(() => {
      if (window.innerWidth >= 1024 || scroller.scrollWidth <= scroller.clientWidth) return;

      const nextLeft = scroller.scrollLeft + scroller.clientWidth;
      scroller.scrollTo({
        left: nextLeft >= scroller.scrollWidth - scroller.clientWidth - 8 ? 0 : nextLeft,
        behavior: 'smooth',
      });
    }, 4500);

    return () => window.clearInterval(interval);
  }, [activeTab, current.products.length]);

  if (!products.length) return null;

  return (
    <section className="bg-[#f8fafc] py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-black uppercase text-[#FF6600] shadow-sm">
              <Sparkles size={14} />
              Product Picks
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Fresh products, picked for easy shopping</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Browse new arrivals, popular items, and the full collection without leaving the section.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:rounded-full">
            <div className="grid grid-cols-1 gap-1 min-[420px]:grid-cols-3 sm:flex sm:flex-wrap">
              {Object.entries(sections).map(([key, section]) => {
                const Icon = section.icon;
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-3 text-xs font-black transition duration-200 active:scale-95 sm:px-4 ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Icon size={14} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-50 text-[#FF6600]">
              <CurrentIcon size={17} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-950">{current.label}</h3>
              <p className="text-xs font-semibold text-slate-400">{current.products.length} products showing</p>
            </div>
          </div>
          {activeTab !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-[#FF6600] hover:shadow-sm active:translate-y-0 active:scale-95 sm:px-4"
            >
              <span className="sm:hidden">All</span>
              <span className="hidden sm:inline">Show all</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        <div
          ref={scrollerRef}
          className="grid snap-x snap-mandatory auto-cols-[calc((100%-0.875rem)/2)] grid-flow-col gap-3.5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[calc((100%-2rem)/3)] sm:gap-4 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:pb-0"
        >
          {current.products.map((product) => (
            <div key={product._id} className="min-w-0 snap-start">
              <ProductCard
                product={product}
                onProductClick={onProductClick}
                onAddToWishlist={onAddToWishlist}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
