'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShopContext, getImageUrl, formatPrice, calculateFinalPrice, formatDiscountLabel } from '@/context/ShopContext';
import { ArrowRight, ShoppingCart, Truck, Zap } from 'lucide-react';

function SaleCard({ product }) {
  const router = useRouter();
  const { addToCart, currencySymbol } = useContext(ShopContext);
  const finalPrice = calculateFinalPrice(product);
  const sold = Number(product.soldCount || product.salesCount || product.numReviews || 1);
  const stock = Math.max(Number(product.countInStock || 0), 0);
  const total = Math.max(sold + stock, sold || 1);
  const progress = Math.min(Math.max((sold / total) * 100, 8), 100);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_12px_28px_rgba(2,6,23,0.28)] ring-1 ring-white/20 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(2,6,23,0.38)]">
      <button
        type="button"
        onClick={() => router.push(`/product/${product._id}`)}
        className="relative block aspect-[1.06/1] w-full overflow-hidden bg-white"
      >
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
        />
        <span className="absolute bottom-0 left-0 inline-flex h-6 items-center gap-1 rounded-tr-md bg-[#00B894] px-2 text-[10px] font-black uppercase text-white shadow-sm">
          <Truck size={12} />
          Free Delivery
        </span>
      </button>

      <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#ffffff_0%,#e9fff9_100%)] px-2.5 pb-9 pt-2">
        <button
          type="button"
          onClick={() => router.push(`/product/${product._id}`)}
          className="line-clamp-2 min-h-[34px] text-left text-[11px] font-semibold leading-snug text-slate-900 transition hover:text-[#00B894]"
        >
          {product.name}
        </button>

        <div className="mt-2">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-black text-slate-950">
            {stock > 0 ? `${stock} items left` : `${sold} items sold`}
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner">
              <span className="block h-full rounded-full bg-[linear-gradient(90deg,#064e3b,#00B894,#5eead4)]" style={{ width: `${progress}%` }} />
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="min-w-0">
            <div className="text-sm font-black text-[#008f75]">{formatPrice(finalPrice, currencySymbol)}</div>
            {Number(product.discountPercent || 0) > 0 && (
              <div className="text-[10px] font-semibold text-slate-400 line-through">{formatPrice(product.price, currencySymbol)}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#00B894] text-white shadow-md shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-[#008f75] active:translate-y-0 active:scale-95"
            title="Add to cart"
          >
            <ShoppingCart size={12} />
          </button>
        </div>
      </div>

      {Number(product.discountPercent || 0) > 0 && (
        <div className="absolute bottom-0 right-0 flex h-7 min-w-16 items-center justify-end bg-[#00B894] pl-6 pr-2 text-[10px] font-black text-white">
          <span className="absolute left-0 top-0 h-0 w-0 border-b-[28px] border-l-[16px] border-b-[#5eead4] border-l-transparent" />
          <Zap size={13} className="absolute left-3 top-1.5 fill-white text-white" />
          {formatDiscountLabel(product, currencySymbol).replace('-', '')}
        </div>
      )}
    </article>
  );
}

export default function FlashSale({ products = [], branding = {} }) {
  const flashSaleProducts = useMemo(() => products.filter((p) => p.isFlashSale).slice(0, 10), [products]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const scrollerRef = useRef(null);

  const flashSaleGradientStart = branding.flashSaleGradientStart || '#052e2b';
  const flashSaleGradientMid = branding.flashSaleGradientMid || '#047857';
  const flashSaleGradientEnd = branding.flashSaleGradientEnd || '#00B894';
  const flashSaleRadialColor = branding.flashSaleRadialColor || '#5eead4';
  const flashSaleAccentColor = branding.flashSaleAccentColor || '#00B894';

  const flashSaleBackgroundStyle = {
    backgroundImage: `radial-gradient(circle at 15% 16%, ${flashSaleRadialColor}, transparent 30%), radial-gradient(circle at 88% 12%, ${flashSaleAccentColor}, transparent 32%), linear-gradient(145deg, ${flashSaleGradientStart} 0%, ${flashSaleGradientMid} 34%, ${flashSaleGradientEnd} 68%, #7df7df 100%)`,
  };

  const flashSaleRadialStyle = {
    backgroundColor: flashSaleRadialColor,
    opacity: 0.35,
  };

  const flashSaleAccentStyle = {
    backgroundColor: flashSaleAccentColor,
    opacity: 0.4,
  };

  useEffect(() => {
    const getTarget = () => {
      const dated = flashSaleProducts
        .map((product) => product.flashSaleEnd || product.flash_sale_end)
        .filter(Boolean)
        .map((date) => new Date(date).getTime())
        .filter((time) => !Number.isNaN(time) && time > Date.now())
        .sort((a, b) => a - b);
      return dated[0] || Date.now() + 48 * 60 * 60 * 1000;
    };

    const target = getTarget();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [flashSaleProducts]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || flashSaleProducts.length < 3) return undefined;

    const interval = window.setInterval(() => {
      if (window.innerWidth >= 1024 || scroller.scrollWidth <= scroller.clientWidth) return;

      const nextLeft = scroller.scrollLeft + scroller.clientWidth;
      scroller.scrollTo({
        left: nextLeft >= scroller.scrollWidth - scroller.clientWidth - 8 ? 0 : nextLeft,
        behavior: 'smooth',
      });
    }, 4500);

    return () => window.clearInterval(interval);
  }, [flashSaleProducts.length]);

  if (flashSaleProducts.length === 0) return null;

  const formatNumber = (num) => String(num).padStart(2, '0');
  const scrollToProducts = () => {
    const target = Array.from(document.querySelectorAll('section')).find((section) => section.textContent?.includes('Product Picks'));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <style>{`
          @keyframes flashGradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes flashFloat {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(14px, -10px, 0) scale(1.06); }
          }
          @keyframes flashSweep {
            0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
            18% { opacity: 0.75; }
            45%, 100% { transform: translateX(180%) skewX(-18deg); opacity: 0; }
          }
          .flash-sale-dynamic-bg {
            background-size: 180% 180%;
            animation: flashGradientShift 9s ease-in-out infinite;
          }
          .flash-sale-float {
            animation: flashFloat 7s ease-in-out infinite;
          }
          .flash-sale-sweep {
            animation: flashSweep 5.5s ease-in-out infinite;
          }
        `}</style>
        <div className="flash-sale-dynamic-bg relative overflow-hidden rounded-3xl border border-white/25 p-2 sm:p-3 shadow-[0_26px_70px_rgba(0,184,148,0.24)]" style={flashSaleBackgroundStyle}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.12),transparent_32%,rgba(255,255,255,0.20))]" />
          <div className="flash-sale-float pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full blur-3xl" style={flashSaleRadialStyle} />
          <div className="flash-sale-float pointer-events-none absolute -right-20 bottom-6 h-64 w-64 rounded-full blur-3xl [animation-delay:1.4s]" style={flashSaleAccentStyle} />
          <div className="flash-sale-sweep pointer-events-none absolute inset-y-0 left-0 w-28 bg-white/20 blur-sm" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(17,24,39,0.18)_100%)]" />
          <div className="relative mb-3 grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
            <div className="flex items-center justify-center sm:justify-start">
              <div className="inline-flex max-w-full items-center gap-1.5 rounded-2xl border border-white/30 bg-slate-950/70 px-3 py-1.5 text-xl font-black uppercase tracking-tight text-white shadow-lg shadow-slate-950/20 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-slate-950/80 drop-shadow-[0_2px_0_rgba(0,0,0,0.45)] sm:text-2xl">
                Flash
                <Zap size={22} className="fill-yellow-300 text-yellow-300 drop-shadow" />
                Sale
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 rounded-full border border-white/30 bg-slate-950/35 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_30px_rgba(17,24,39,0.18)] backdrop-blur">
              {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((value, index) => (
                <React.Fragment key={index}>
                  <span className="grid h-7 min-w-9 place-items-center rounded-xl bg-slate-950 px-1.5 text-sm font-black tabular-nums text-white shadow-sm ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#047857]">
                    {formatNumber(value)}
                  </span>
                  {index < 2 && <span className="text-base font-black text-white">:</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="flex justify-center sm:justify-end">
              <button
                type="button"
                onClick={scrollToProducts}
                className="inline-flex h-9 items-center gap-2 rounded-full border-2 border-white/75 bg-white px-3.5 text-xs font-black text-slate-900 shadow-lg shadow-slate-950/15 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-[#00B894] hover:shadow-xl active:translate-y-0 active:scale-95 sm:text-sm"
              >
                Shop More
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#00B894] text-white">
                  <ArrowRight size={14} />
                </span>
              </button>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="relative grid snap-x snap-mandatory auto-cols-[calc((100%-0.75rem)/2)] grid-flow-col gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[calc((100%-3rem)/5)] lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-5 xl:grid-cols-6 lg:overflow-visible"
          >
            {flashSaleProducts.slice(0, 6).map((product) => (
              <div key={product._id} className="min-w-0 snap-start">
                <SaleCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
