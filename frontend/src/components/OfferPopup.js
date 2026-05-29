'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OfferPopup() {
  const [settings, setSettings] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/public`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        setSettings(data);
        if (data?.popupEnabled) {
          const shown = sessionStorage.getItem('popupShown');
          if (!shown) {
            const delay = (data.popupDelay || 3) * 1000;
            setTimeout(() => {
              setVisible(true);
              sessionStorage.setItem('popupShown', 'true');
            }, delay);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!visible || !settings?.popupEnabled) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in">
        {settings.popupImage && (
          <img src={settings.popupImage} alt="" className="w-full h-40 object-cover" />
        )}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Gift size={20} className="text-amber-500" />
            <h3 className="font-extrabold text-slate-800 text-lg">{settings.popupTitle || 'Special Offer!'}</h3>
          </div>
          <p className="text-sm text-slate-500">{settings.popupText}</p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setVisible(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition">Maybe Later</button>
            {settings.popupLink && (
              <a href={settings.popupLink} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition text-center">Shop Now</a>
            )}
          </div>
        </div>
        <button onClick={() => setVisible(false)} className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition"><X size={14} /></button>
      </div>
    </div>
  );
}
