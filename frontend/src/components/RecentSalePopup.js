'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { getImageUrl } from '@/context/ShopContext';

const API_URL = 'http://localhost:5000/api';

const names = ['John D.', 'Sarah M.', 'Ahmed K.', 'Lisa W.', 'Rahim H.', 'Maria G.', 'David P.', 'Sara J.'];
const items = ['Smart Watch', 'Headphones', 'Running Shoes', 'Perfume', 'Handbag', 'Jacket', 'Sunglasses', 'T-Shirt'];

export default function RecentSalePopup() {
  const [enabled, setEnabled] = useState(true);
  const [visible, setVisible] = useState(false);
  const [sale, setSale] = useState({ name: '', item: '', time: '' });

  useEffect(() => {
    fetch(`${API_URL}/settings/public`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setEnabled(data.recentSaleEnabled !== false);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      setSale({
        name: names[Math.floor(Math.random() * names.length)],
        item: items[Math.floor(Math.random() * items.length)],
        time: `${Math.floor(Math.random() * 10) + 1} min ago`,
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 30000);
    return () => clearInterval(interval);
  }, [enabled]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-36 left-4 z-50 max-w-[260px] bg-white rounded-xl shadow-xl border border-slate-200 p-3 animate-fade-in flex items-start gap-2.5">
      <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full"><ShoppingBag size={14} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 truncate">{sale.name} purchased {sale.item}</p>
        <p className="text-[10px] text-slate-400">{sale.time}</p>
      </div>
      <button onClick={() => setVisible(false)} className="text-slate-300 hover:text-slate-500"><X size={12} /></button>
    </div>
  );
}
