'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Download } from 'lucide-react';

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
    { slug: 'return-refund-policy', title: 'Return & Refund Policy' },
    { slug: 'privacy-policy', title: 'Privacy Policy' },
    { slug: 'terms-&-conditions', title: 'Terms & Conditions' },
    { slug: 'about-us', title: 'About Us' }
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
    <div className="relative">
      <footer className="bg-[#050505] text-white w-full mt-8 font-sans">
        {/* Newsletter Section */}
        <div className="border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 md:py-7 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="md:w-1/2 space-y-1">
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Subscribe to our newsletter</h3>
              <p className="text-slate-300 text-xs md:text-sm font-medium max-w-md">
                Get the latest updates on new products, flash sales, and exclusive coupons.
              </p>
            </div>
            <div className="md:w-1/2 w-full flex items-center gap-2">
              <input 
                type="email" 
                placeholder="" 
                className="flex-1 px-3 py-2.5 rounded-lg text-slate-900 focus:outline-none text-sm"
              />
              <button className="bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold px-6 py-2.5 rounded-lg transition text-sm shadow-[0_0_12px_rgba(255,102,0,0.3)]">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-7 md:py-9">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-7 lg:gap-10">
            
            {/* Col 1: Brand & Socials */}
            <div className="space-y-4">
              {/* Modern Goroly Shop Logo — white pill background */}
              <div className="inline-flex items-center gap-2.5 bg-white rounded-xl px-3 py-2 shadow-md">
                {/* Shopping Cart Icon */}
                <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Cart body */}
                  <rect x="14" y="26" width="36" height="22" rx="3" fill="#2d3e50" />
                  {/* Cart front panel */}
                  <rect x="16" y="28" width="32" height="18" rx="2" fill="#3a5068" />
                  {/* Shopping bag inside */}
                  <rect x="22" y="22" width="20" height="20" rx="3" fill="#FF6600" />
                  <rect x="27" y="18" width="3" height="6" rx="1.5" fill="#FF6600" />
                  <rect x="34" y="18" width="3" height="6" rx="1.5" fill="#FF6600" />
                  {/* Wheels */}
                  <circle cx="22" cy="50" r="4" fill="#2d3e50" />
                  <circle cx="22" cy="50" r="2" fill="#6b7280" />
                  <circle cx="42" cy="50" r="4" fill="#2d3e50" />
                  <circle cx="42" cy="50" r="2" fill="#6b7280" />
                  {/* Handle */}
                  <path d="M8 20 L14 26" stroke="#2d3e50" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="7" cy="19" r="3" fill="#e53e3e" />
                </svg>
                {/* Brand Name */}
                <div className="flex flex-col leading-none">
                  <span className="text-[#FF6600] font-black text-lg tracking-widest uppercase" style={{fontFamily: 'inherit', letterSpacing: '0.15em'}}>
                    GOROLY
                  </span>
                  <span className="text-[#FF6600] font-black text-lg tracking-widest uppercase" style={{letterSpacing: '0.18em'}}>
                    SHOP
                  </span>
                </div>
              </div>

              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                Goroly Shop is a rapidly growing e-commerce brand in Bangladesh, committed to providing premium, authentic products with fast and reliable doorstep delivery.
              </p>
              <div className="flex gap-2 pt-1">
                {/* Facebook */}
                <a href={s.footerFacebook || "#"} target="_blank" rel="noreferrer" className="w-7 h-7 bg-[#1a1f26] rounded flex items-center justify-center hover:bg-[#FF6600] text-white transition duration-300">
                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                {/* X / Twitter */}
                <a href={s.footerTwitter || "#"} target="_blank" rel="noreferrer" className="w-7 h-7 bg-[#1a1f26] rounded flex items-center justify-center hover:bg-[#FF6600] text-white transition duration-300">
                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* TikTok */}
                <a href={s.footerTiktok || "#"} target="_blank" rel="noreferrer" className="w-7 h-7 bg-[#1a1f26] rounded flex items-center justify-center hover:bg-[#FF6600] text-white transition duration-300">
                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c-.01 2.87-1.15 5.75-3.32 7.72-2.17 1.95-5.26 2.92-8.2 2.62-2.92-.31-5.65-1.92-7.34-4.25-1.7-2.33-2.32-5.32-1.71-8.15.61-2.83 2.5-5.34 4.95-6.81 2.45-1.47 5.48-1.93 8.28-1.19v4.19c-1.39-.53-3.03-.54-4.38.11-1.35.65-2.39 1.83-2.73 3.29-.34 1.45.02 3.04.97 4.19.95 1.15 2.52 1.73 4.01 1.5 1.49-.22 2.79-1.25 3.32-2.65.54-1.4.52-3.02.51-4.48V.02z"/></svg>
                </a>
                {/* LinkedIn */}
                <a href={s.footerLinkedin || "#"} target="_blank" rel="noreferrer" className="w-7 h-7 bg-[#1a1f26] rounded flex items-center justify-center hover:bg-[#FF6600] text-white transition duration-300">
                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                {/* YouTube */}
                <a href={s.footerYoutube || "#"} target="_blank" rel="noreferrer" className="w-7 h-7 bg-[#1a1f26] rounded flex items-center justify-center hover:bg-[#FF6600] text-white transition duration-300">
                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Col 2: Information */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Information</h4>
              <ul className="space-y-2 text-xs font-bold text-slate-200">
                {mergedPages.map((page) => (
                  <li key={page.slug}>
                    <button 
                      onClick={() => onTabChange(`page-${page.slug}`)} 
                      className="text-white hover:text-[#FF6600] transition-colors duration-200 flex items-center gap-1 text-left bg-transparent border-0 cursor-pointer"
                    >
                      <span className="text-slate-400 text-sm leading-none font-normal">›</span> {page.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Goroly Shop Seller */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Goroly Shop Seller</h4>
              <ul className="space-y-2 text-xs font-bold text-slate-200">
                {[{ label: 'Become A Seller', tab: 'page-become-a-seller' },{ label: 'Seller Policy', tab: 'page-seller-policy' },{ label: 'Product Policy', tab: 'page-product-policy' },{ label: 'Pickup & Delivery Policy', tab: 'page-pickup-delivery-policy' },{ label: 'Seller Exchange & Return Policy', tab: 'page-seller-exchange-return-policy' }].map((item) => (
                  <li key={item.tab}>
                    <button
                      onClick={() => onTabChange && onTabChange(item.tab)}
                      className="text-white hover:text-[#FF6600] transition-colors duration-200 flex items-center gap-1 text-left bg-transparent border-0 cursor-pointer"
                    >
                      <span className="text-slate-400 text-sm leading-none font-normal">›</span> {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Support & App Download */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Customer Support</h4>
                <ul className="space-y-2.5 text-xs font-bold text-white">
                  <li className="flex items-center gap-2">
                    <Mail size={13} className="text-[#FF6600] flex-shrink-0" />
                    <span>{s.footerEmail || 'support@shopio.com'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={13} className="text-[#FF6600] flex-shrink-0" />
                    <span>{s.footerPhone || '+880 1712-345678'}</span>
                  </li>
                </ul>
              </div>

              {/* App Download Buttons */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Download size={12} className="text-[#FF6600]" />
                  DOWNLOAD APP
                </h5>
                <div className="flex flex-row gap-2">
                  {/* Google Play Store */}
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); alert('App coming soon!'); }}
                    className="flex flex-1 items-center justify-center gap-1.5 bg-[#1a1f26] border border-transparent hover:border-[#FF6600] rounded-lg px-2 py-1.5 text-white transition-all duration-200 group"
                  >
                    <svg className="w-4 h-4 fill-current text-white group-hover:text-[#FF6600] transition duration-200" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.98.98 0 0 1-.365-.626V2.44c0-.256.13-.502.364-.626zM15.207 13.415l3.29-1.9a1.63 1.63 0 0 0 0-2.824l-3.29-1.9-2.275 2.275 2.275 2.275zM4.617 23.013l7.458-7.458 2.276 2.276-8.91 5.143a1.642 1.642 0 0 1-.824.239 1.55 1.55 0 0 1-.824-.239 1.63 1.63 0 0 1 0-2.824l.824-.438zM4.617.987l8.282 8.282-2.276 2.276L4.617.987A1.63 1.63 0 0 1 5.441.748c.305 0 .61.08.824.239l8.91 5.143z" /></svg>
                    <div className="text-left leading-tight">
                      <div className="text-[6px] font-bold uppercase tracking-wider opacity-80">GET IT ON</div>
                      <div className="text-[9px] font-bold">Google Play</div>
                    </div>
                  </a>
                  {/* Apple App Store */}
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); alert('App coming soon!'); }}
                    className="flex flex-1 items-center justify-center gap-1.5 bg-[#1a1f26] border border-transparent hover:border-[#FF6600] rounded-lg px-2 py-1.5 text-white transition-all duration-200 group"
                  >
                    <svg className="w-4 h-4 fill-current text-white group-hover:text-[#FF6600] transition duration-200" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.99.08 2.16-.52 2.82-1.33z"/></svg>
                    <div className="text-left leading-tight">
                      <div className="text-[6px] font-bold uppercase tracking-wider opacity-80">DOWNLOAD ON</div>
                      <div className="text-[9px] font-bold">App Store</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Bottom Secure Bar */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-bold text-slate-300">
              © {new Date().getFullYear()} Shopio BD. All rights reserved.
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
              <span className="text-[10px] font-bold text-white mr-1 uppercase tracking-wider">We Accept:</span>
              <div className="bg-[#e2136e] px-2 py-0.5 rounded text-white font-bold text-[10px] flex items-center justify-center">bKash</div>
              <div className="bg-[#f37021] px-2 py-0.5 rounded text-white font-bold text-[10px] flex items-center justify-center">Nagad</div>
              <div className="bg-[#1A1F71] text-[#F7B600] px-2 py-0.5 rounded text-[10px] font-black flex items-center justify-center italic border border-white/5">VISA</div>
              <div className="bg-[#1a1f26] border border-white/10 px-2 py-0.5 rounded flex items-center justify-center gap-1">
                <div className="flex -space-x-1">
                  <div className="w-2 h-2 rounded-full bg-[#eb001b]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#f79e1b]"></div>
                </div>
                <span className="text-[9px] text-white font-bold ml-0.5 tracking-tight">mastercard</span>
              </div>
              <div className="bg-[#1a1f26] border border-white/10 px-2 py-0.5 rounded flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded bg-blue-500 flex items-center justify-center">
                  <span className="w-0.5 h-0.5 bg-yellow-400 rounded-full"></span>
                </span>
                <span className="text-[9px] text-white font-bold tracking-tight">SSLCommerz</span>
              </div>
              <div className="bg-[#004e2d] border border-green-700/50 px-2 py-0.5 rounded text-emerald-400 font-bold text-[9px] uppercase flex items-center justify-center tracking-wider">
                Cash On Delivery
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
