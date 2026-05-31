'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShopContext } from '@/context/ShopContext';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Star,
  Users,
  Heart,
  Globe,
  Package,
  ChevronDown,
  Zap,
  Award,
  Headphones,
} from 'lucide-react';

const content = {
  en: {
    backHome: 'Back to Home',
    badge: 'About Us',
    title: 'About Goroly Shop',
    subtitle:
      'Goroly Shop is a rapidly growing e-commerce brand in Bangladesh, committed to providing premium, authentic products with fast and reliable doorstep delivery.',
    missionTitle: 'Our Mission',
    missionText:
      'Our mission is to deliver high-quality products that bring value and satisfaction to our customers. From everyday essentials to unique finds, every item in our store is carefully selected to ensure quality and authenticity.',
    visionTitle: 'Our Vision',
    visionText:
      'We believe that online shopping should be simple, trustworthy, and convenient for everyone. At Goroly Shop, customer satisfaction is at the heart of everything we do.',
    commitmentTitle: 'Our Commitment',
    commitmentText:
      'We focus on fast delivery, secure ordering, and responsive customer support to give you a smooth and enjoyable shopping experience. We are continuously improving and expanding our product range to meet the evolving needs of our customers across Bangladesh.',

    values: [
      {
        icon: 'ShieldCheck',
        title: 'Authenticity',
        desc: 'Every product is verified genuine — no fakes, no compromises.',
      },
      {
        icon: 'Truck',
        title: 'Fast Delivery',
        desc: 'Reliable doorstep delivery across all of Bangladesh, always on time.',
      },
      {
        icon: 'Heart',
        title: 'Customer First',
        desc: 'Your satisfaction drives every decision we make.',
      },
      {
        icon: 'Star',
        title: 'Premium Quality',
        desc: 'Only carefully curated products make it to our shelves.',
      },
      {
        icon: 'Globe',
        title: 'Nationwide Reach',
        desc: 'Serving customers in every district across Bangladesh.',
      },
      {
        icon: 'Headphones',
        title: '24/7 Support',
        desc: 'Responsive customer support whenever you need us.',
      },
    ],

    stats: [
      { number: '100K+', label: 'Happy Customers', icon: 'Users' },
      { number: '5.6K+', label: 'Active Sellers', icon: 'Award' },
      { number: '240K+', label: 'Orders Delivered', icon: 'Package' },
      { number: '64+', label: 'Districts Served', icon: 'Globe' },
    ],

    ctaTitle: 'Join the Goroly Shop Family',
    ctaText:
      'Start shopping today and experience the difference — fast, trusted, and built for you.',
    ctaButton: 'Shop Now',
  },
  bn: {
    backHome: 'হোমে ফিরুন',
    badge: 'আমাদের সম্পর্কে',
    title: 'গোরোলি শপ সম্পর্কে',
    subtitle:
      'গোরোলি শপ বাংলাদেশে দ্রুত বর্ধনশীল একটি ই-কমার্স ব্র্যান্ড, যা প্রিমিয়াম, খাঁটি পণ্য দ্রুত এবং নির্ভরযোগ্য হোম ডেলিভারির মাধ্যমে সরবরাহ করতে প্রতিশ্রুতিবদ্ধ।',
    missionTitle: 'আমাদের লক্ষ্য',
    missionText:
      'আমাদের লক্ষ্য হলো উচ্চমানের পণ্য সরবরাহ করা যা আমাদের গ্রাহকদের মূল্য এবং সন্তুষ্টি প্রদান করে। প্রতিদিনের প্রয়োজনীয় জিনিস থেকে শুরু করে বিশেষ পণ্য পর্যন্ত, আমাদের স্টোরের প্রতিটি আইটেম মান ও খাঁটিত্ব নিশ্চিত করতে যত্নসহকারে নির্বাচন করা হয়।',
    visionTitle: 'আমাদের দৃষ্টিভঙ্গি',
    visionText:
      'আমরা বিশ্বাস করি অনলাইন শপিং সবার জন্য সহজ, বিশ্বাসযোগ্য এবং সুবিধাজনক হওয়া উচিত। গোরোলি শপে গ্রাহক সন্তুষ্টি আমাদের সবকিছুর কেন্দ্রে রয়েছে।',
    commitmentTitle: 'আমাদের প্রতিশ্রুতি',
    commitmentText:
      'আমরা দ্রুত ডেলিভারি, নিরাপদ অর্ডারিং এবং সক্রিয় কাস্টমার সাপোর্টে মনোযোগ দিই যাতে আপনার কেনাকাটার অভিজ্ঞতা মসৃণ ও আনন্দদায়ক হয়। আমরা ক্রমাগত আমাদের পণ্য পরিসর উন্নত করছি এবং বাংলাদেশ জুড়ে আমাদের গ্রাহকদের পরিবর্তনশীল চাহিদা পূরণে সম্প্রসারিত হচ্ছি।',

    values: [
      {
        icon: 'ShieldCheck',
        title: 'খাঁটিত্ব',
        desc: 'প্রতিটি পণ্য যাচাইকৃত খাঁটি — কোনো নকল নেই, কোনো আপস নেই।',
      },
      {
        icon: 'Truck',
        title: 'দ্রুত ডেলিভারি',
        desc: 'সারা বাংলাদেশে নির্ভরযোগ্য হোম ডেলিভারি, সবসময় সময়মতো।',
      },
      {
        icon: 'Heart',
        title: 'গ্রাহক প্রথমে',
        desc: 'আপনার সন্তুষ্টিই আমাদের প্রতিটি সিদ্ধান্তকে চালিত করে।',
      },
      {
        icon: 'Star',
        title: 'প্রিমিয়াম মান',
        desc: 'শুধুমাত্র যত্নসহকারে নির্বাচিত পণ্যই আমাদের শেলফে আসে।',
      },
      {
        icon: 'Globe',
        title: 'দেশব্যাপী পরিসর',
        desc: 'বাংলাদেশের প্রতিটি জেলায় গ্রাহকদের সেবা প্রদান।',
      },
      {
        icon: 'Headphones',
        title: '২৪/৭ সাপোর্ট',
        desc: 'আপনার যখন প্রয়োজন তখনই সক্রিয় কাস্টমার সাপোর্ট।',
      },
    ],

    stats: [
      { number: '১ লাখ+', label: 'সন্তুষ্ট গ্রাহক', icon: 'Users' },
      { number: '৫.৬K+', label: 'সক্রিয় বিক্রেতা', icon: 'Award' },
      { number: '২.৪ লাখ+', label: 'ডেলিভারি সম্পন্ন', icon: 'Package' },
      { number: '৬৪+', label: 'জেলায় সেবা', icon: 'Globe' },
    ],

    ctaTitle: 'গোরোলি শপ পরিবারে যোগ দিন',
    ctaText:
      'আজই কেনাকাটা শুরু করুন এবং পার্থক্যটি অনুভব করুন — দ্রুত, বিশ্বস্ত, এবং আপনার জন্য নির্মিত।',
    ctaButton: 'এখনই কিনুন',
  },
};

const iconMap = { ShieldCheck, Truck, Heart, Star, Globe, Headphones, Users, Award, Package, Zap };

const valueColors = [
  { bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100', glow: 'shadow-emerald-100' },
  { bg: 'bg-sky-50', text: 'text-sky-500', border: 'border-sky-100', glow: 'shadow-sky-100' },
  { bg: 'bg-rose-50', text: 'text-rose-500', border: 'border-rose-100', glow: 'shadow-rose-100' },
  { bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-100', glow: 'shadow-amber-100' },
  { bg: 'bg-violet-50', text: 'text-violet-500', border: 'border-violet-100', glow: 'shadow-violet-100' },
  { bg: 'bg-orange-50', text: 'text-[#FF6600]', border: 'border-orange-100', glow: 'shadow-orange-100' },
];

const statColors = [
  { from: 'from-[#FF6600]', to: 'to-orange-400' },
  { from: 'from-sky-500', to: 'to-cyan-400' },
  { from: 'from-emerald-500', to: 'to-teal-400' },
  { from: 'from-violet-500', to: 'to-purple-400' },
];

export default function AboutUsPage({ onBackToHome, onTabChange }) {
  const { lang, setLang } = useLanguage();
  const { API_URL } = useContext(ShopContext);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [dbPage, setDbPage] = useState(null);
  const t = content[lang] || content.en;

  useEffect(() => {
    fetch(`${API_URL}/pages/about-us`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.content) setDbPage(data);
      })
      .catch(() => {});
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20 font-sans">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#17243a] via-[#1e2f4a] to-[#17243a] text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF6600]/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Top bar: back + lang */}
          <div className="mb-10 flex items-center justify-between">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-all duration-200 group"
            >
              <span className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition">
                <ArrowLeft size={14} />
              </span>
              {t.backHome}
            </button>

            {/* Language toggle */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl px-3 py-2 text-xs font-black text-white transition-all duration-200 cursor-pointer"
              >
                <span>{lang === 'en' ? '🇬🇧 English' : '🇧🇩 বাংলা'}</span>
                <ChevronDown size={12} className="text-white/60" />
              </button>
              {showLangDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                    <button
                      onClick={() => { setLang('en'); setShowLangDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-orange-50 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'en' ? 'text-[#FF6600]' : 'text-slate-600'}`}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => { setLang('bn'); setShowLangDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-orange-50 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'bn' ? 'text-[#FF6600]' : 'text-slate-600'}`}
                    >
                      🇧🇩 বাংলা
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hero content */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6600]/20 border border-[#FF6600]/30 text-[#FF6600] rounded-full text-xs font-black uppercase tracking-wider">
                <ShieldCheck size={13} />
                {t.badge}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                {t.title}
              </h1>
              <p className="text-lg text-white/70 font-medium leading-relaxed max-w-xl">
                {t.subtitle}
              </p>

              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-black rounded-2xl transition-all duration-200 shadow-lg shadow-[#FF6600]/30 hover:shadow-[#FF6600]/50 hover:-translate-y-0.5 border-0 cursor-pointer text-sm"
              >
                <Zap size={15} className="fill-white" />
                {t.ctaButton}
              </button>
            </div>

            {/* Floating stats card */}
            <div className="lg:w-80 w-full">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-6 space-y-4">
                {t.stats.map((stat, i) => {
                  const Icon = iconMap[stat.icon] || Package;
                  const c = statColors[i];
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white leading-none">{stat.number}</div>
                        <div className="text-xs font-semibold text-white/60 mt-0.5">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ABOUT SECTIONS ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {dbPage && lang === 'bn' ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div 
              className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed sm:text-base space-y-4"
              dangerouslySetInnerHTML={{ __html: dbPage.content }}
            />
          </div>
        ) : (
          <div className="space-y-16">
            {/* Mission, Vision, Commitment cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: t.missionTitle, text: t.missionText, icon: 'Star', color: 'from-[#FF6600] to-orange-400', bg: 'from-orange-50 to-white' },
                { title: t.visionTitle,  text: t.visionText,  icon: 'Globe',  color: 'from-sky-500 to-cyan-400',  bg: 'from-sky-50 to-white' },
                { title: t.commitmentTitle, text: t.commitmentText, icon: 'Heart', color: 'from-emerald-500 to-teal-400', bg: 'from-emerald-50 to-white' },
              ].map((card, i) => {
                const Icon = iconMap[card.icon] || ShieldCheck;
                return (
                  <div
                    key={i}
                    className={`relative bg-gradient-to-br ${card.bg} rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                  >
                    {/* Decorative circle */}
                    <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-xl pointer-events-none`} />
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5 shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">{card.title}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{card.text}</p>
                  </div>
                );
              })}
            </div>

            {/* ── OUR VALUES ── */}
            <div>
              <div className="text-center mb-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FF6600]/10 text-[#FF6600] rounded-full text-xs font-black uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  {lang === 'en' ? 'Our Core Values' : 'আমাদের মূল মূল্যবোধ'}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                  {lang === 'en' ? 'What Drives Us Every Day' : 'প্রতিদিন আমাদের যা চালিত করে'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {t.values.map((val, i) => {
                  const Icon = iconMap[val.icon] || ShieldCheck;
                  const c = valueColors[i] || valueColors[0];
                  return (
                    <div
                      key={i}
                      className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg ${c.glow} transition-all duration-300 hover:-translate-y-1 group`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={20} className={c.text} />
                      </div>
                      <h4 className="font-black text-slate-900 text-base mb-2">{val.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{val.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── CTA BANNER ── */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#17243a] via-[#1e2f4a] to-[#17243a]">
              <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, #FF6600 0%, transparent 55%), radial-gradient(circle at 90% 10%, #3b82f6 0%, transparent 55%)' }} />
              <div className="relative p-10 sm:p-14 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6600] to-orange-400 flex items-center justify-center flex-shrink-0 shadow-xl shadow-orange-500/30">
                  <Heart size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">{t.ctaTitle}</h3>
                  <p className="text-white/60 font-medium text-sm sm:text-base leading-relaxed">{t.ctaText}</p>
                </div>
                <button
                  onClick={onBackToHome}
                  className="px-8 py-3.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-black rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 border-0 cursor-pointer flex-shrink-0 flex items-center gap-2"
                >
                  <Zap size={15} className="fill-white" />
                  {t.ctaButton}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
