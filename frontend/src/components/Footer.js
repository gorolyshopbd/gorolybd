'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Home, ShoppingBag, LayoutGrid, Heart, ShoppingCart, Download, Smartphone, PlayCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Footer({ onTabChange, onCartClick }) {
  const [settings, setSettings] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/settings/public`)
      .then((r) => r.ok ? r.json() : null)
      .then(setSettings)
      .catch(() => {});
    
    fetch(`${API_URL}/pages/public/all`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPages(d || []))
      .catch(() => {});
  }, []);

  const s = settings || {};

  const defaultPages = [
    { slug: 'about-us', title: 'About Us' },
    { slug: 'terms-&-conditions', title: 'Terms & Conditions' },
    { slug: 'privacy-policy', title: 'Privacy Policy' },
    { slug: 'return-refund-policy', title: 'Return & Refund Policy' }
  ];

  const getCoreSlugAndTitle = (slug) => {
    const clean = slug ? slug.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    if (clean === 'aboutus') {
      return { isCore: true, slug: 'about-us', title: 'About Us' };
    }
    if (clean.includes('terms') || clean.includes('condition')) {
      return { isCore: true, slug: 'terms-&-conditions', title: 'Terms & Conditions' };
    }
    if (clean === 'privacypolicy') {
      return { isCore: true, slug: 'privacy-policy', title: 'Privacy Policy' };
    }
    if (clean === 'returnrefundpolicy' || clean === 'refundpolicy' || clean === 'returnpolicy') {
      return { isCore: true, slug: 'return-refund-policy', title: 'Return & Refund Policy' };
    }
    return { isCore: false, slug: slug, title: '' };
  };

  const mergedPages = [...defaultPages];
  (pages || []).forEach(p => {
    const slug = p.slug ? p.slug.toLowerCase() : '';
    if (!slug) return;

    const core = getCoreSlugAndTitle(slug);
    if (core.isCore) {
      const existing = mergedPages.find(dp => dp.slug === core.slug);
      if (existing) {
        existing.title = core.title; // Force English title
      }
    } else {
      if (!mergedPages.some(dp => dp.slug === slug)) {
        mergedPages.push({ slug: slug, title: p.title });
      }
    }
  });

  return (
    <div>
      {/* Mobile Sticky Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_15px_rgba(0,0,0,0.08)] md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-1 px-2">
          {[{ icon: Home, label: 'Home', tab: 'home' },{ icon: ShoppingBag, label: 'Shop', tab: 'shop' },{ icon: PlayCircle, label: 'Videos', tab: 'videos' },{ icon: Heart, label: 'Wishlist', tab: 'wishlist' },{ icon: ShoppingCart, label: 'Cart', tab: 'cart', isCart: true }].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.isCart && onCartClick) onCartClick();
                  else if (onTabChange) onTabChange(item.tab);
                }}
                className="flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-lg transition active:scale-90"
              >
                <Icon size={20} className="text-slate-600 hover:text-[#FF6600] active:text-[#FF6600] transition" />
                <span className="text-[10px] font-extrabold text-slate-700">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="bg-[#17243a] text-white border-t border-white/10 pb-20 md:pb-0 sticky bottom-0 z-10 w-full">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white/95 backdrop-blur-lg p-4 md:p-6">

          <a href={s.footerLinkedin || "https://linkedin.com"} target="_blank" rel="noreferrer" className="p-2 bg-[#111c2e] border border-white/5 rounded-lg hover:bg-blue-700 hover:scale-105 hover:text-white text-slate-300 transition duration-300" title="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6 md:p-12">
        
        {/* Col 1: Socials */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Follow Us</h4>
          <div className="flex gap-2">
            <a href={s.footerLinkedin || "https://linkedin.com"} target="_blank" rel="noreferrer" className="p-2 bg-[#111c2e] border border-white/5 rounded-lg hover:bg-blue-700 hover:scale-105 hover:text-white text-slate-300 transition duration-300" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href={s.footerYoutube || "https://youtube.com"} target="_blank" rel="noreferrer" className="p-2 bg-[#111c2e] border border-white/5 rounded-lg hover:bg-red-600 hover:scale-105 hover:text-white text-slate-300 transition duration-300" title="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        {/* Col 2: Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Information</h4>
          <ul className="space-y-2 text-sm font-semibold text-slate-300">
            {mergedPages.map((page) => (
              <li key={page.slug}>
                <button 
                  onClick={() => onTabChange(`page-${page.slug}`)} 
                  className="hover:text-[#FF6600] hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1 text-slate-300 text-left bg-transparent border-0 cursor-pointer"
                >
                  &rsaquo; {page.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Goroly Shop Seller */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Goroly Shop Seller</h4>
          <ul className="space-y-2 text-sm font-semibold text-slate-300">
            {[{ label: 'Become A Seller', tab: 'page-become-a-seller' },{ label: 'Seller Policy', tab: 'page-seller-policy' },{ label: 'Product Policy', tab: 'page-product-policy' },{ label: 'Pickup & Delivery Policy', tab: 'page-pickup-delivery-policy' },{ label: 'Seller Exchange & Return Policy', tab: 'page-seller-exchange-return-policy' }].map((item) => (
              <li key={item.tab}>
                <button
                  onClick={() => onTabChange && onTabChange(item.tab)}
                  className="hover:text-[#FF6600] hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1 text-slate-300 text-left bg-transparent border-0 cursor-pointer"
                >
                  &rsaquo; {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Support & App Download */}
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-3 text-sm font-semibold text-slate-300">
              <li className="flex items-center gap-2.5"><Mail size={16} className="text-[#FF6600] flex-shrink-0" /><span>{s.footerEmail || 'support@gorolyshop.com'}</span></li>
              <li className="flex items-center gap-2.5"><Phone size={16} className="text-[#FF6600] flex-shrink-0" /><span>{s.footerPhone || '+880 1313-924485'}</span></li>
            </ul>
          </div>

          {/* App Download Buttons */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Download size={14} className="text-[#FF6600]" />
              Download App
            </h5>
            <div className="flex flex-col gap-2.5">
              {/* Google Play Store */}
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); alert('App coming soon!'); }}
                className="flex items-center gap-2.5 bg-[#111c2e] border border-white/10 hover:border-[#FF6600] rounded-xl px-4 py-2 text-white hover:bg-[#111c2e]/80 transition duration-300 group"
              >
                <svg className="w-6 h-6 fill-current text-white group-hover:text-[#FF6600] transition duration-300" viewBox="0 0 24 24"><path d="M3 5.277c0-.986.726-1.782 1.705-1.921l11.45-1.636a2.001 2.001 0 0 1 2.217 1.583l2.553 12.766a2 2 0 0 1-1.583 2.353L7.89 21.058a1.996 1.996 0 0 1-1.932-.486L3 17.5v-12.223zm13.5 4.723a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-6 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
                <div className="text-left leading-tight">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Get it on</div>
                  <div className="text-xs font-black text-white">Google Play</div>

              </a>
              {/* Apple App Store */}
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); alert('App coming soon!'); }}
                className="flex items-center gap-2.5 bg-[#111c2e] border border-white/10 hover:border-[#FF6600] rounded-xl px-4 py-2 text-white hover:bg-[#111c2e]/80 transition duration-300 group"
              >
                <svg className="w-6 h-6 fill-current text-white group-hover:text-[#FF6600] transition duration-300" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.99.08 2.16-.52 2.82-1.33z"/></svg>
                <div className="text-left leading-tight">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Download on the</div>
                  <div className="text-xs font-black text-white">App Store</div>
                </div>
              </a>
              <div className="text-center text-xs text-slate-400 mt-4">
                © {new Date().getFullYear()} Goroly Shop. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
