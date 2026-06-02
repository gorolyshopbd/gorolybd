'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Gift, ArrowRight, Sparkles } from 'lucide-react';
import { getImageUrl, formatPrice, calculateFinalPrice, formatDiscountLabel } from '@/context/ShopContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const pickRandom = (items) => {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
};

export default function OfferPopup({ products = [], onShopClick }) {
  const [settings, setSettings] = useState({});
  const [offers, setOffers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const offersRef = useRef([]);
  const saleProductsRef = useRef([]);

  const saleProducts = useMemo(
    () => products.filter((product) => product && Number(product.discountPercent || 0) > 0),
    [products]
  );

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/settings/public`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_URL}/offers`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([settingsData, offersData]) => {
      setSettings(settingsData || {});
      const activeOffers = (offersData || []).filter((offer) => offer.isActive !== false);
      offersRef.current = activeOffers;
      setOffers(activeOffers);
    });
  }, []);

  useEffect(() => {
    saleProductsRef.current = saleProducts;
  }, [saleProducts]);

  useEffect(() => {
    const delay = Math.max(Number(settings.popupDelay || settings.popup_delay || 2), 1) * 1000;
    const timer = window.setTimeout(() => {
      const candidates = [
        ...offersRef.current.map((offer) => ({ type: 'offer', data: offer })),
        ...saleProductsRef.current.map((product) => ({ type: 'product', data: product })),
      ];

      const randomItem = pickRandom(candidates);
      if (randomItem) {
        setSelected(randomItem);
      } else {
        setSelected({
          type: 'settings',
          data: {
            title: settings.popupTitle || 'Special Offer!',
            description: settings.popupText || settings.popup_text || "Grab today's best deal before it ends.",
            image: settings.popupImage || settings.popup_image,
            link: settings.popupLink || settings.popup_link,
          },
        });
      }

      setVisible(true);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [settings.popupDelay, settings.popup_delay, settings.popupTitle, settings.popupText, settings.popupImage, settings.popupLink, settings.popup_text, settings.popup_image, settings.popup_link]);

  if (!visible || !selected) return null;

  const isProduct = selected.type === 'product';
  const data = selected.data;
  const title = isProduct ? data.name : data.title;
  const description = isProduct
    ? `${formatDiscountLabel(data, settings?.currencySymbol || '৳').replace('-', '')} off for a limited time.`
    : data.description || settings?.popupText || settings?.popup_text || 'Limited time sale is live now.';
  const image = isProduct ? data.image : data.image;
  const finalPrice = isProduct ? calculateFinalPrice(data) : null;
  const originalPrice = isProduct ? Number(data.price || 0) : null;
  const link = isProduct ? `/product/${data._id}` : data.link || settings?.popupLink || settings?.popup_link || '';

  const handleShop = () => {
    setVisible(false);
    if (link) {
      window.location.href = link;
      return;
    }
    onShopClick?.();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] animate-fade-in">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:scale-105 hover:text-slate-950 active:scale-95"
          title="Close"
        >
          <X size={16} />
        </button>

        <div className="relative h-48 overflow-hidden bg-slate-100">
          {image ? (
            <img src={getImageUrl(image)} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,#67e8f9,transparent_35%),linear-gradient(135deg,#071a34,#0f5f9f)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] font-black uppercase text-white backdrop-blur">
            <Sparkles size={14} />
            Random Sale
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-50 text-[#FF6600]">
              <Gift size={21} />
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-950">{title}</h3>
              <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
            </div>
          </div>

          {isProduct && (
            <div className="flex items-baseline gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-2xl font-black text-slate-950">{formatPrice(finalPrice, settings?.currencySymbol || '৳')}</span>
              {originalPrice > finalPrice && (
                <span className="text-sm font-semibold text-slate-400 line-through">{formatPrice(originalPrice, settings?.currencySymbol || '৳')}</span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 active:scale-95"
            >
              Later
            </button>
            <button
              type="button"
              onClick={handleShop}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FF6600] px-4 py-3 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 active:translate-y-0 active:scale-95"
            >
              Shop Now
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
