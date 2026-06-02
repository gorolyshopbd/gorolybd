'use client';

import React, { useContext } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ShopContext, calculateFinalPrice, formatPrice } from '@/context/ShopContext';

export default function FloatingCartButton({ onClick, hidden = false }) {
  const { cartItems = [], currencySymbol } = useContext(ShopContext);

  if (hidden) return null;

  const cartCount = cartItems.reduce((total, item) => total + Number(item.qty || 0), 0);
  const cartTotal = cartItems.reduce((total, item) => total + calculateFinalPrice(item) * Number(item.qty || 0), 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-4 top-1/2 z-50 flex h-12 min-w-12 -translate-y-1/2 items-center justify-center gap-1.5 rounded-full border border-white/30 bg-slate-950 px-3 text-white shadow-xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-[55%] hover:bg-[#FF6600] hover:shadow-orange-500/25 active:-translate-y-1/2 active:scale-95 sm:right-6 md:right-8"
      title="Open cart"
    >
      <span className="relative grid h-7 w-7 place-items-center rounded-full bg-white/12">
        <ShoppingBag size={17} />
        {cartCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#FF6600] px-1 text-[9px] font-black text-white ring-2 ring-slate-950">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </span>
      <span className="hidden text-left leading-tight sm:block">
        <span className="block text-[9px] font-bold uppercase text-white/65">Cart</span>
        <span className="block text-[11px] font-black">{formatPrice(cartTotal, currencySymbol)}</span>
      </span>
    </button>
  );
}
