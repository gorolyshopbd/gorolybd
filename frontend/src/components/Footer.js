'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Home, ShoppingBag, LayoutGrid, Heart, ShoppingCart, Truck, RotateCcw, ShieldCheck, Download, Smartphone, PlayCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  return (
    <>
      {/* Mobile Sticky Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_15px_rgba(0,0,0,0.08)] md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-2.5 px-3">
          {[
            { icon: Home, label: 'Home', tab: 'home' },
            { icon: ShoppingBag, label: 'Shop', tab: 'shop' },
            { icon: PlayCircle, label: 'Videos', tab: 'videos' },
            { icon: Heart, label: 'Wishlist', tab: 'wishlist' },
            { icon: ShoppingCart, label: 'Cart', tab: 'cart', isCart: true },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.isCart && onCartClick) onCartClick();
                  else if (onTabChange) onTabChange(item.tab);
                }}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition active:scale-90"
              >
                <Icon size={24} className="text-slate-600 hover:text-blue-600 active:text-blue-600 transition" />
                <span className="text-xs font-extrabold text-slate-700">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="bg-slate-950 text-white border-t border-slate-900 pb-20 md:pb-0">
        
        {/* Brand & Newsletter Banner Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-6 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black text-white">{s.footerNewsletterTitle || 'Subscribe to our newsletter'}</h3>
              <p className="text-sm font-bold text-white">{s.footerNewsletterSubtitle || 'Get the latest updates on new products, flash sales, and exclusive coupons.'}</p>
            </div>

            <div className="md:col-span-6 flex flex-col sm:flex-row gap-3">
              <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-slate-900/50 transition duration-300" />
              <button onClick={() => alert('Thanks for subscribing!')} className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition duration-300 shadow-lg shadow-blue-600/25">Subscribe</button>
            </div>

          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Shopio Info & Socials */}
          <div className="space-y-5">
            <h2 className="text-2xl font-black text-white flex items-center gap-1.5">
              {s.footerLogo ? (
                <img src={s.footerLogo} alt={s.siteTitle || 'Shopio'} className="h-8 w-auto object-contain" />
              ) : (
                <>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm">S</span>
                  Shopio<span className="text-amber-500">.</span>
                </>
              )}
            </h2>
            <p className="text-sm font-bold leading-relaxed text-white">Automated MERN Stack eCommerce Platform designed for maximum performance, real-time tracking, and ease of checkout.</p>
            
            {s.footerAddress && (
              <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                <span>{s.footerAddress}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2.5 pt-2">
              <a href={s.footerFacebook || "https://facebook.com"} target="_blank" rel="noreferrer" className="p-3 bg-slate-900 rounded-xl hover:bg-blue-600 text-white transition duration-300" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href={s.footerTwitter || "https://x.com"} target="_blank" rel="noreferrer" className="p-3 bg-slate-900 rounded-xl hover:bg-zinc-800 text-white transition duration-300" title="X (Twitter)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={s.footerTiktok || "https://tiktok.com"} target="_blank" rel="noreferrer" className="p-3 bg-slate-900 rounded-xl hover:bg-rose-600 text-white transition duration-300" title="TikTok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12.83 2.53 1.18 3.81 1.28v3.4c-1.35-.07-2.68-.53-3.7-1.46V13c0 2.2-.6 4.47-2.12 5.92-1.6 1.64-4.04 2.23-6.21 1.78-2.6-.45-4.73-2.68-5.07-5.3-.4-3.08 1.54-6.09 4.54-6.73.9-.17 1.83-.1 2.72.16v3.48c-.68-.26-1.47-.32-2.15-.05-1.12.4-1.84 1.56-1.74 2.75.08 1.17.99 2.12 2.15 2.15 1.25.06 2.37-.9 2.45-2.15.02-1.07.01-8.15.01-9.22z"/></svg>
              </a>
              <a href={s.footerLinkedin || "https://linkedin.com"} target="_blank" rel="noreferrer" className="p-3 bg-slate-900 rounded-xl hover:bg-blue-700 text-white transition duration-300" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href={s.footerYoutube || "https://youtube.com"} target="_blank" rel="noreferrer" className="p-3 bg-slate-900 rounded-xl hover:bg-red-600 text-white transition duration-300" title="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2: Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-black text-white uppercase tracking-wider">Information</h4>
            <ul className="space-y-3.5 text-base font-black text-white">
              {pages.length > 0 ? (
                pages.map((page) => (
                  <li key={page.slug}>
                    <button 
                      onClick={() => onTabChange(`page-${page.slug}`)} 
                      className="hover:text-blue-500 hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1 text-white text-left"
                    >
                      &rsaquo; {page.title}
                    </button>
                  </li>
                ))
              ) : (
                ['About Us', 'Terms & Conditions', 'Privacy Policy'].map((p) => (
                  <li key={p}>
                    <button 
                      onClick={() => onTabChange(`page-${p.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`)} 
                      className="hover:text-blue-500 hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1 text-white text-left"
                    >
                      &rsaquo; {p}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Col 3: Delivery Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-black text-white uppercase tracking-wider">Delivery Information</h4>
            <ul className="space-y-4 text-sm font-bold text-white">
              <li className="flex gap-3 items-start">
                <Truck size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-extrabold text-sm">Fast Home Delivery</div>
                  <div className="text-xs text-white mt-0.5">Inside Dhaka: 2-3 Days<br />Outside Dhaka: 3-5 Days</div>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <RotateCcw size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-extrabold text-sm">Easy Returns</div>
                  <div className="text-xs text-white mt-0.5">7-day replacement guarantee on defective items.</div>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <ShieldCheck size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-extrabold text-sm">100% Original Products</div>
                  <div className="text-xs text-white mt-0.5">Sourced directly from verified brands.</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & App Download */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Customer Support</h4>
              <ul className="space-y-3 text-sm font-bold text-white">
                <li className="flex items-center gap-2.5 text-white"><Mail size={16} className="text-blue-500 flex-shrink-0" /><span>{s.footerEmail || 'support@shopio.com'}</span></li>
                <li className="flex items-center gap-2.5 text-white"><Phone size={16} className="text-blue-500 flex-shrink-0" /><span>{s.footerPhone || '+880 1712-345678'}</span></li>
              </ul>
            </div>

            {/* App Download Buttons */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <Download size={14} className="text-blue-500" />
                Download App
              </h5>
              <div className="flex flex-col sm:flex-row gap-2.5">
                {/* Google Play Store */}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('App coming soon!'); }}
                  className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-2 text-white hover:bg-slate-850 transition duration-350 group"
                >
                  <svg className="w-6 h-6 fill-current text-white group-hover:text-blue-500 transition duration-300" viewBox="0 0 24 24">
                    <path d="M3 5.277c0-.986.726-1.782 1.705-1.921l11.45-1.636a2.001 2.001 0 0 1 2.217 1.583l2.553 12.766a2 2 0 0 1-1.583 2.353L7.89 21.058a1.996 1.996 0 0 1-1.932-.486L3 17.5v-12.223zm13.5 4.723a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-6 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                    <path d="M5.25 3.03v17.94c0 .33.18.63.48.78.3.15.66.12.93-.09l9.36-7.49 3.06-2.45c.42-.34.42-.98 0-1.32l-3.06-2.45-9.36-7.49C6.39.72 6.03.69 5.73.84c-0.3.15-.48.45-.48.78z" fill="#fff"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[9px] font-bold text-white uppercase tracking-wider">Get it on</div>
                    <div className="text-xs font-black text-white">Google Play</div>
                  </div>
                </a>

                {/* Apple App Store */}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('App coming soon!'); }}
                  className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-2 text-white hover:bg-slate-850 transition duration-350 group"
                >
                  <svg className="w-6 h-6 fill-current text-white group-hover:text-blue-500 transition duration-300" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.99.08 2.16-.52 2.82-1.33z"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[9px] font-bold text-white uppercase tracking-wider">Download on the</div>
                    <div className="text-xs font-black text-white">App Store</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Payment Gateway Badges Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-bold text-white">
          <div className="text-center md:text-left">{s.footerCopyright || '© 2026 Shopio BD. All rights reserved.'}</div>
          
          {/* Visual Payment Gateway Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-white uppercase tracking-wider font-extrabold mr-1">We Accept Secure:</span>
            
            {/* bKash Badge */}
            <div className="h-8 px-3 bg-[#E2127A] text-white rounded-lg flex items-center justify-center text-xs font-black shadow-xs tracking-wider border border-white/5">
              bKash
            </div>

            {/* Nagad Badge */}
            <div className="h-8 px-3 bg-[#F7941D] text-white rounded-lg flex items-center justify-center text-xs font-black shadow-xs tracking-wider border border-white/5">
              Nagad
            </div>

            {/* VISA Badge */}
            <div className="h-8 px-3 bg-[#1A1F71] text-[#F7B600] rounded-lg flex items-center justify-center text-xs font-black italic shadow-xs tracking-wider border border-white/5">
              VISA
            </div>

            {/* MasterCard Badge */}
            <div className="h-8 px-3 bg-slate-900 rounded-lg flex items-center justify-center text-xs font-black shadow-xs tracking-wider border border-slate-800">
              <span className="text-[#FF5F00] mr-0.5">●</span>
              <span className="text-[#EB001B] mr-1">●</span>
              mastercard
            </div>

            {/* SSLCommerz Badge */}
            <div className="h-8 px-3 bg-blue-900 text-blue-100 rounded-lg flex items-center justify-center text-[10px] font-black shadow-xs tracking-wider border border-blue-800">
              🔒 SSLCommerz
            </div>

            {/* COD Badge */}
            <div className="h-8 px-3 bg-emerald-950 text-emerald-400 rounded-lg flex items-center justify-center text-[10px] font-black shadow-xs tracking-wider border border-emerald-900">
              💵 CASH ON DELIVERY
            </div>
          </div>
        </div>

      </footer>
    </>
  );
}
