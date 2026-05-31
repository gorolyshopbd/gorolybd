'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShopContext } from '@/context/ShopContext';
import {
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  Eye,
  FileText,
  UserCheck,
  Lock,
  Database,
  Share2,
  Cookie,
  Mail,
  Phone,
  Info,
  Scale,
} from 'lucide-react';

const content = {
  en: {
    backHome: 'Back to Home',
    badge: 'Privacy Policy',
    title: 'Privacy Policy',
    subtitle: 'At Goroly Shop, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website.',
    agreeFooter: 'By using Goroly Shop, you acknowledge that you have read, understood, and agreed to this Privacy Policy.',
    
    sections: {
      sec1: {
        title: '1. Information We Collect',
        subtitle: 'We may collect the following types of information:',
        items: [
          { label: 'Personal Information', desc: 'Name, phone number, email address, shipping address.' },
          { label: 'Payment Information', desc: 'Payment method details (we do not store sensitive payment/card credentials).' },
          { label: 'Technical Data', desc: 'IP address, browser type, device information.' },
          { label: 'Usage Data', desc: 'Pages visited, time spent on the website.' }
        ]
      },
      sec2: {
        title: '2. How We Use Your Information',
        subtitle: 'We use your information to:',
        items: [
          'Process and deliver your orders.',
          'Communicate with you about your order status.',
          'Improve our website, products, and services.',
          'Send promotional offers (only if you opt-in and agree).'
        ]
      },
      sec3: {
        title: '3. Payment & Cash on Delivery (COD)',
        subtitle: 'We offer Cash on Delivery (COD) across Bangladesh.',
        items: [
          'For COD orders, we may contact you via phone call or SMS to confirm your order.',
          'We also accept bKash, Nagad, and Rocket payments for advance/pre-order bookings.',
          'We do not store sensitive financial credentials or mobile banking PINs.'
        ]
      },
      sec4: {
        title: '4. Sharing Your Information',
        subtitle: 'We do not sell or trade your personal information. We only share necessary data with trusted third parties, such as:',
        items: [
          { label: 'Courier Partners', desc: 'Trusted logistics networks (e.g., Pathao, Steadfast, Sundarban Courier) for secure delivery.' },
          { label: 'Payment Providers', desc: 'Authorized payment gateway gateways for secure transactions.' },
          { label: 'Government Authorities', desc: 'Official law enforcement agencies if legally required.' }
        ]
      },
      sec5: {
        title: '5. Cookies',
        items: [
          'Our website may use cookies to enhance your browsing experience.',
          'Cookies help us understand user behavior, preferences, and improve our services.',
          'You can choose to disable cookies through your individual browser settings.'
        ]
      },
      sec6: {
        title: '6. Data Security',
        items: [
          'We take appropriate security measures to protect your personal data from unauthorized access, alteration, disclosure, loss, or misuse.',
          'However, please note that no method of transmission over the Internet is 100% secure.'
        ]
      },
      sec7: {
        title: '7. Your Rights',
        subtitle: 'You have the right to:',
        items: [
          'Access your personal data.',
          'Request correction of incorrect or incomplete information.',
          'Request deletion of your account and personal data.'
        ]
      },
      sec8: {
        title: '8. Third-Party Links',
        items: [
          'Our website may contain links to other websites.',
          'We are not responsible for the privacy practices, content, or policies of those third-party sites.'
        ]
      },
      sec9: {
        title: '9. Children’s Privacy',
        items: [
          'Our website is not intended for individuals under 13 years of age.',
          'We do not knowingly collect personal data from children under 13.'
        ]
      },
      sec10: {
        title: '10. Changes to This Policy',
        items: [
          'We may update this Privacy Policy from time to time.',
          'Changes will be posted on this page with an updated modification date.'
        ]
      },
      sec11: {
        title: '11. Contact Us',
        subtitle: 'If you have any questions about this Privacy Policy, please contact us:',
        email: 'support@gorolyshop.com',
        phone: '+8801313924485'
      }
    }
  },
  bn: {
    backHome: 'হোমে ফিরুন',
    badge: 'গোপনীয়তা নীতি',
    title: 'গোপনীয়তা নীতি',
    subtitle: 'গোরোলি শপে আমরা আপনার গোপনীয়তাকে মূল্য দিই এবং আপনার ব্যক্তিগত তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা নীতিতে আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত করি তা ব্যাখ্যা করা হয়েছে।',
    agreeFooter: 'গোরোলি শপ ব্যবহারের মাধ্যমে আপনি স্বীকার করছেন যে আপনি এই গোপনীয়তা নীতি পড়েছেন, বুঝেছেন এবং এতে সম্মত হয়েছেন।',
    
    sections: {
      sec1: {
        title: '১. যে সকল তথ্য আমরা সংগ্রহ করি',
        subtitle: 'আমরা নিম্নলিখিত ধরণের তথ্য সংগ্রহ করতে পারি:',
        items: [
          { label: 'ব্যক্তিগত তথ্য', desc: 'নাম, ফোন নম্বর, ইমেল ঠিকানা, শিপিং ঠিকানা।' },
          { label: 'পেমেন্ট তথ্য', desc: 'পেমেন্ট পদ্ধতির বিবরণ (আমরা সংবেদনশীল কার্ড বা পেমেন্ট ক্রেডেনশিয়াল সংরক্ষণ করি না)।' },
          { label: 'প্রযুক্তিগত তথ্য', desc: 'আইপি ঠিকানা, ব্রাউজারের ধরণ, ডিভাইসের তথ্য।' },
          { label: 'ব্যবহারের তথ্য', desc: 'পরিদর্শিত পৃষ্ঠাগুলি, ওয়েবসাইটে কাটানো সময়।' }
        ]
      },
      sec2: {
        title: '২. কীভাবে আমরা আপনার তথ্য ব্যবহার করি',
        subtitle: 'আমরা আপনার তথ্য ব্যবহার করি:',
        items: [
          'আপনার অর্ডার প্রসেস এবং ডেলিভারি করতে।',
          'অর্ডারের স্ট্যাটাস সম্পর্কে আপনার সাথে যোগাযোগ করতে।',
          'আমাদের ওয়েবসাইট, পণ্য এবং সেবাসমূহ উন্নত করতে।',
          'প্রোমোশনাল অফার পাঠাতে (শুধুমাত্র আপনার সম্মতি সাপেক্ষে)।'
        ]
      },
      sec3: {
        title: '৩. পেমেন্ট ও ক্যাশ অন ডেলিভারি (COD)',
        subtitle: 'আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা অফার করি।',
        items: [
          'ক্যাশ অন ডেলিভারি অর্ডারের জন্য, অর্ডার নিশ্চিত করতে আমরা ফোন কল বা এসএমএস-এর মাধ্যমে যোগাযোগ করতে পারি।',
          'অগ্রিম অর্ডার বা প্রি-বুকিংয়ের জন্য আমরা বিকাশ, নগদ এবং রকেট পেমেন্ট গ্রহণ করি।',
          'আমরা কোনো সংবেদনশীল আর্থিক তথ্য বা মোবাইল ব্যাংকিং পিন (PIN) সংরক্ষণ করি না।'
        ]
      },
      sec4: {
        title: '৪. আপনার তথ্য শেয়ারিং',
        subtitle: 'আমরা আপনার ব্যক্তিগত তথ্য বিক্রি বা লেনদেন করি না। আমরা কেবল বিশ্বস্ত তৃতীয় পক্ষের সাথে প্রয়োজনীয় তথ্য শেয়ার করি, যেমন:',
        items: [
          { label: 'কুরিয়ার পার্টনার', desc: 'নিরাপদ ডেলিভারির জন্য লজিস্টিক নেটওয়ার্ক (যেমন: Pathao, Steadfast, সুন্দরবন কুরিয়ার)।' },
          { label: 'পেমেন্ট প্রোভাইডার', desc: 'নিরাপদ লেনদেনের জন্য অনুমোদিত পেমেন্ট গেটওয়ে।' },
          { label: 'সরকারি কর্তৃপক্ষ', desc: 'আইনিভাবে প্রয়োজনীয় হলে সরকারি আইন প্রয়োগকারী সংস্থা।' }
        ]
      },
      sec5: {
        title: '৫. কুকিজ নীতি',
        items: [
          'আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে আমাদের ওয়েবসাইট কুকিজ ব্যবহার করতে পারে।',
          'কুকিজ আমাদের ব্যবহারকারীর আচরণ, পছন্দ বুঝতে এবং আমাদের সেবা উন্নত করতে সাহায্য করে।',
          'আপনি চাইলে আপনার নিজস্ব ব্রাউজার সেটিংস থেকে কুকিজ নিষ্ক্রিয় করতে পারেন।'
        ]
      },
      sec6: {
        title: '৬. তথ্য নিরাপত্তা',
        items: [
          'আমরা আপনার ব্যক্তিগত তথ্য অননুমোদিত অ্যাক্সেস, পরিবর্তন, প্রকাশ, ক্ষতি বা অপব্যবহার থেকে রক্ষা করতে উপযুক্ত নিরাপত্তা ব্যবস্থা গ্রহণ করি।',
          'তবে, ইন্টারনেটের মাধ্যমে প্রেরণের কোনো পদ্ধতিই ১০০% নিরাপদ নয়।'
        ]
      },
      sec7: {
        title: '৭. আপনার অধিকারসমূহ',
        subtitle: 'আপনার অধিকার রয়েছে:',
        items: [
          'আপনার ব্যক্তিগত তথ্য অ্যাক্সেস করার।',
          'ভুল বা অসম্পূর্ণ তথ্য সংশোধনের অনুরোধ করার।',
          'আপনার অ্যাকাউন্ট এবং ব্যক্তিগত তথ্য মুছে ফেলার অনুরোধ করার।'
        ]
      },
      sec8: {
        title: '৮. থার্ড-পার্টি লিঙ্ক',
        items: [
          'আমাদের ওয়েবসাইটে অন্যান্য ওয়েবসাইটের লিঙ্ক থাকতে পারে।',
          'আমরা সেইসব থার্ড-পার্টি সাইটের গোপনীয়তা নীতি বা বিষয়বস্তুর জন্য দায়ী নই।'
        ]
      },
      sec9: {
        title: '৯. শিশুদের গোপনীয়তা',
        items: [
          'আমাদের ওয়েবসাইটটি ১৩ বছরের কম বয়সী ব্যক্তিদের জন্য তৈরি নয়।',
          'আমরা জেনেশুনে ১৩ বছরের কম বয়সী শিশুদের কোনো তথ্য সংগ্রহ করি না।'
        ]
      },
      sec10: {
        title: '১০. নীতিমালার পরিবর্তনসমূহ',
        items: [
          'আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি।',
          'যেকোনো পরিবর্তন এই পৃষ্ঠায় আপডেট করা সংশোধন তারিখসহ পোস্ট করা হবে।'
        ]
      },
      sec11: {
        title: '১১. যোগাযোগ',
        subtitle: 'এই গোপনীয়তা নীতি সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন:',
        email: 'support@gorolyshop.com',
        phone: '+8801313924485'
      }
    }
  }
};

const navItems = [
  { id: 'collect', label: '1. Collection / তথ্য সংগ্রহ' },
  { id: 'usage', label: '2. Usage / তথ্যের ব্যবহার' },
  { id: 'payment', label: '3. Payment & COD / পেমেন্ট ও সিওডি' },
  { id: 'sharing', label: '4. Sharing / তথ্য শেয়ারিং' },
  { id: 'security', label: '5-6. Security & Cookies / কুকিজ ও নিরাপত্তা' },
  { id: 'rights', label: '7. Your Rights / আপনার অধিকার' },
  { id: 'other', label: '8-10. Legal & Policy / আইনি ও পলিসি' },
  { id: 'contact', label: '11. Contact / যোগাযোগ' },
];

export default function PrivacyPage({ onBackToHome }) {
  const { lang, setLang } = useLanguage();
  const { API_URL } = useContext(ShopContext);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState('collect');
  const [dbPage, setDbPage] = useState(null);
  const t = content[lang] || content.en;

  useEffect(() => {
    fetch(`${API_URL}/pages/privacy-policy`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.content) setDbPage(data);
      })
      .catch(() => {});
  }, [API_URL]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20 font-sans">
      
      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#17243a] via-[#1e2f4a] to-[#17243a] text-white">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF6600]/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Top navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-all duration-200 group"
            >
              <span className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition">
                <ArrowLeft size={14} />
              </span>
              {t.backHome}
            </button>

            {/* Language Selection */}
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
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-orange-50 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'en' ? 'text-[#FF6600]' : 'text-slate-600'}`}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => { setLang('bn'); setShowLangDropdown(false); }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-orange-50 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'bn' ? 'text-[#FF6600]' : 'text-slate-600'}`}
                    >
                      🇧🇩 বাংলা
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hero titles */}
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6600]/20 border border-[#FF6600]/30 text-[#FF6600] rounded-full text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={13} />
              {t.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {t.title}
            </h1>
            <p className="text-sm sm:text-base text-white/70 font-medium leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {dbPage && lang === 'bn' ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div 
              className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed sm:text-base space-y-4"
              dangerouslySetInnerHTML={{ __html: dbPage.content }}
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left index sidebar (Sticky) */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-6 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText size={16} className="text-[#FF6600]" />
                {lang === 'en' ? 'Quick Navigation' : 'দ্রুত নেভিগেশন'}
              </h3>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border-0 cursor-pointer flex items-center justify-between ${
                      activeSection === item.id
                        ? 'bg-orange-50 text-[#FF6600]'
                        : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {activeSection === item.id && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600]" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right content panel */}
          <div className="flex-1 space-y-12">
            
            {/* Section 1: Information We Collect */}
            <section id="collect" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                <Database size={20} className="text-[#FF6600]" />
                {t.sections.sec1.title}
              </h2>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">{t.sections.sec1.subtitle}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {t.sections.sec1.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                    <h4 className="font-black text-slate-900 text-sm">{item.label}</h4>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: How We Use Your Information */}
            <section id="usage" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                <UserCheck size={20} className="text-sky-500" />
                {t.sections.sec2.title}
              </h2>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">{t.sections.sec2.subtitle}</p>
              <ul className="space-y-3 pt-2">
                {t.sections.sec2.items.map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 3: Payment & COD */}
            <section id="payment" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                <Lock size={20} className="text-emerald-500" />
                {t.sections.sec3.title}
              </h2>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">{t.sections.sec3.subtitle}</p>
              <ul className="space-y-3 pt-2">
                {t.sections.sec3.items.map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4: Sharing Your Information */}
            <section id="sharing" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                <Share2 size={20} className="text-violet-500" />
                {t.sections.sec4.title}
              </h2>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">{t.sections.sec4.subtitle}</p>
              <div className="space-y-3.5 pt-2">
                {t.sections.sec4.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-slate-600 text-sm font-semibold leading-relaxed bg-slate-50/50 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-100/50 transition">
                    <span className="w-6 h-6 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{idx + 1}</span>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{item.label}</h4>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5 & 6: Cookies & Security */}
            <section id="security" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 transition hover:shadow-md">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                  <Cookie size={20} className="text-amber-500" />
                  {t.sections.sec5.title}
                </h2>
                <ul className="space-y-3 pt-3">
                  {t.sections.sec5.items.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
                  <Lock size={18} className="text-rose-500" />
                  {t.sections.sec6.title}
                </h3>
                <ul className="space-y-3 pt-2">
                  {t.sections.sec6.items.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 7: Your Rights */}
            <section id="rights" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                <Scale size={20} className="text-[#FF6600]" />
                {t.sections.sec7.title}
              </h2>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">{t.sections.sec7.subtitle}</p>
              <ul className="space-y-3 pt-2">
                {t.sections.sec7.items.map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 8-10: Other Policies */}
            <section id="other" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 transition hover:shadow-md">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                <FileText size={20} className="text-sky-500" />
                {lang === 'en' ? '8-10. Additional Guidelines' : '৮-১০. অতিরিক্ত নির্দেশিকা'}
              </h2>
              <div className="space-y-4">
                {[
                  { title: t.sections.sec8.title, items: t.sections.sec8.items },
                  { title: t.sections.sec9.title, items: t.sections.sec9.items },
                  { title: t.sections.sec10.title, items: t.sections.sec10.items },
                ].map((group, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-sm font-black text-slate-800">{group.title}</h4>
                    <ul className="space-y-2">
                      {group.items.map((item, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-slate-500 text-xs font-bold leading-relaxed">
                          <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 11: Contact Us */}
            <section id="contact" className="bg-gradient-to-br from-[#17243a] via-[#1e2f4a] to-[#17243a] text-white rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Phone size={24} className="text-[#FF6600]" />
                  {t.sections.sec11.title}
                </h2>
                <p className="text-white/60 font-semibold text-xs sm:text-sm">{t.sections.sec11.subtitle}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`mailto:${t.sections.sec11.email}`}
                  className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition text-white group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FF6600]/20 text-[#FF6600] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Email Us</div>
                    <div className="text-sm font-black mt-0.5">{t.sections.sec11.email}</div>
                  </div>
                </a>

                <a
                  href={`tel:${t.sections.sec11.phone}`}
                  className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition text-white group"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Call Support</div>
                    <div className="text-sm font-black mt-0.5">{t.sections.sec11.phone}</div>
                  </div>
                </a>
              </div>
            </section>

          </div>

        </div>
        )}

        {/* Footer Agreement Disclaimer */}
        <div className="text-center text-slate-400 text-xs font-bold leading-relaxed pt-8 mt-12 border-t border-slate-100 max-w-3xl mx-auto">
          {t.agreeFooter}
        </div>
      </div>

    </div>
  );
}
