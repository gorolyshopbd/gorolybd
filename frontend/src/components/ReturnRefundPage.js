'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShopContext } from '@/context/ShopContext';
import {
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  CreditCard,
  Truck,
  Phone,
  Mail,
  Zap,
  Info,
  Package,
} from 'lucide-react';

const content = {
  en: {
    backHome: 'Back to Home',
    badge: 'Returns & Refunds',
    title: 'Return & Refund Policy',
    subtitle: 'At Goroly Shop, we strive to ensure a smooth shopping experience. If you are not satisfied with your purchase or received a damaged item, we are here to help.',
    
    sections: {
      delivery: {
        title: 'Shipping & Delivery Info',
        items: [
          'Cash on delivery is available all over Bangladesh. Full payment in advance is required for Sundarban courier delivery.',
          'Delivery charges inside Dhaka are BDT 70 (up to 1kg), and outside Dhaka are BDT 130 (up to 1kg). Normal delivery takes 48-72 hours.',
          'Our delivery partners are Steadfast, Pathao, E-courier, Redx, and Sundarban courier service.'
        ]
      },
      exchange: {
        title: 'Exchange Terms & Conditions',
        items: [
          'Products must be in their original condition and requested within 3 days of delivery.',
          'Items should be unused, unwashed, and intact with all tags attached to be eligible for exchange.',
          'Exchange is subject to stock availability. If the stock is unavailable, you can choose another product of a similar or higher price range.',
          'There is no monetary/cash compensation for exchanges.',
          'Exchange is not applicable on promotional products purchased during sales/campaigns.',
          'If any cashback was received during payment, it will be adjusted/deducted during the return/refund process.',
          'Email us at info@gorolyshop.com with your Order ID and issues within 12 hours of delivery. We will verify the request and guide you on the pickup.'
        ]
      },
      returns: {
        title: 'Return Guidelines',
        subtitle: 'Our products are packaged with great care and undergo a rigorous quality check before shipping. If you receive a flawed, damaged, or broken item, you can request a return/exchange.',
        items: [
          'Returns are free within 3 days of purchase.',
          'Goroly Shop will not accept return claims submitted after 3 days.',
          'If you want to return a product simply because you do not like it, you must bear the return delivery charges.',
          'If a product is damaged or broken during delivery, you must call and inform us immediately in front of the delivery agent at 01313924485 or email info@gorolyshop.com. No complaints will be accepted after the delivery agent has left.',
          'If the invoice details do not match the products received, notify us in front of the delivery agent. We will deliver the missing products within 24-72 hours with no extra delivery charge.'
        ]
      },
      refunds: {
        title: 'Refund Processing',
        items: [
          'Refund from returns: Processed once your item reaches our warehouse and Quality Control (QC) is completed successfully.',
          'Refunds from cancelled orders: Automatically triggered once cancellation is processed successfully.',
          'Any cashback received during payment will be adjusted and deducted from the refund amount.',
          'Pre-orders & Sale Items: No cancellation, refund, or exchange is allowed once a pre-order is confirmed or booked during sale campaigns.'
        ]
      },
      contact: {
        title: 'Need Help with a Return?',
        subtitle: 'Our support team is available to assist you with your return or refund request:',
        email: 'info@gorolyshop.com',
        phone: '+8801313924485'
      }
    },
    agreeFooter: 'By using Goroly Shop, you acknowledge that you have read, understood, and agreed to this Return & Refund Policy.'
  },
  bn: {
    backHome: 'হোমে ফিরুন',
    badge: 'রিটার্ন ও রিফান্ড',
    title: 'রিটার্ন ও রিফান্ড নীতি',
    subtitle: 'গোরোলি শপে আমরা আপনার কেনাকাটার অভিজ্ঞতা মসৃণ করতে প্রতিশ্রুতিবদ্ধ। আপনি যদি কোনো পণ্যে সন্তুষ্ট না হন বা ক্ষতিগ্রস্ত পণ্য পেয়ে থাকেন, আমরা আপনাকে সাহায্য করতে এখানে আছি।',
    
    sections: {
      delivery: {
        title: 'শিপিং ও ডেলিভারি তথ্য',
        items: [
          'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। সুন্দরবন কুরিয়ারের মাধ্যমে ডেলিভারির জন্য সম্পূর্ণ পেমেন্ট অগ্রিম পরিশোধ করতে হবে।',
          'ডেলিভারি চার্জ ঢাকার মধ্যে প্রতি ১ কেজির জন্য ৭০ টাকা এবং ঢাকার বাইরে প্রতি ১ কেজির জন্য ১৩০ টাকা। পার্সেল ডেলিভারি হতে ৪৮-৭২ ঘণ্টা সময় লাগে।',
          'আমাদের ডেলিভারি পার্টনাররা হলো- Steadfast, Pathao, E-courier, Redx এবং সুন্দরবন কুরিয়ার সার্ভিস।'
        ]
      },
      exchange: {
        title: 'এক্সচেঞ্জ শর্তাবলী',
        items: [
          'পণ্যটি অবশ্যই তার মূল অবস্থায় থাকতে হবে। এক্সচেঞ্জ অনুরোধটি পণ্য পাওয়ার ৩ দিনের মধ্যে করতে হবে।',
          'এক্সচেঞ্জের জন্য পণ্যটি অব্যবহৃত, না ধোয়া এবং অক্ষত হতে হবে।',
          'এক্সচেঞ্জ স্টকের প্রাপ্যতার ওপর নির্ভরশীল। স্টক না থাকলে, গ্রাহক সমমূল্য বা তার বেশি মূল্যের অন্য কোনো পণ্য নির্বাচন করতে পারেন।',
          'এক্সচেঞ্জের ক্ষেত্রে কোনো আর্থিক ক্ষতিপূরণ বা নগদ অর্থ ফেরত দেওয়া হবে না।',
          'সেল বা ডিসকাউন্ট ক্যাম্পেইন চলাকালীন কেনা পণ্যের ক্ষেত্রে এক্সচেঞ্জ প্রযোজ্য নয়।',
          'পেমেন্টের সময় কোনো ক্যাশব্যাক পেয়ে থাকলে, রিফান্ড বা এক্সচেঞ্জের সময় ক্যাশব্যাকের সমপরিমাণ অর্থ কেটে নেওয়া হবে।',
          'ডেলিভারি পাওয়ার ১২ ঘণ্টার মধ্যে অর্ডার আইডি এবং সমস্যার বিবরণসহ info@gorolyshop.com এ ইমেল করুন। আমরা রিটার্ন অনুরোধটি যাচাই করব এবং পিকআপ প্রক্রিয়া সম্পর্কে জানাব।'
        ]
      },
      returns: {
        title: 'রিটার্ন নির্দেশিকা',
        subtitle: 'আমাদের পণ্যগুলো অত্যন্ত যত্নসহকারে প্যাক করা হয় এবং শিপিংয়ের আগে কঠোর মান নিয়ন্ত্রণ করা হয়। আপনি যদি কোনো ত্রুটিযুক্ত বা ক্ষতিগ্রস্ত পণ্য পান, তবে আপনি তা রিটার্ন বা এক্সচেঞ্জ করতে পারেন।',
        items: [
          'ক্রয়ের ৩ দিনের মধ্যে রিটার্ন সম্পূর্ণ ফ্রি।',
          'পণ্য ক্রয়ের ৩ দিন পর রিটার্ন দাবি করা হলে গোরোলি শপ কোনো দায়ভার গ্রহণ করবে না।',
          'পণ্য পছন্দ না হওয়ার কারণে রিটার্ন করতে চাইলে গ্রাহককে রিটার্ন ডেলিভারি চার্জ বহন করতে হবে।',
          'ডেলিভারির সময় পণ্য ক্ষতিগ্রস্ত বা ভাঙা থাকলে, কুরিয়ারের প্রতিনিধির সামনেই আমাদের কল করে জানাতে হবে (01313924485) অথবা info@gorolyshop.com এ ইমেল করতে হবে। ডেলিভারিম্যান চলে যাওয়ার পর কোনো অভিযোগ গ্রহণযোগ্য হবে না।',
          'প্রাপ্ত পণ্য বা ইনভয়েসের গড়মিল থাকলে ডেলিভারিম্যানের সামনেই আমাদের জানান। আমরা কোনো অতিরিক্ত ডেলিভারি চার্জ ছাড়াই ২৪-৭২ ঘণ্টার মধ্যে সঠিক পণ্য ডেলিভারি করব।'
        ]
      },
      refunds: {
        title: 'রিফান্ড প্রক্রিয়া',
        items: [
          'রিটার্ন থেকে রিফান্ড: পণ্যটি আমাদের ওয়্যারহাউসে পৌঁছানোর পর এবং কোয়ালিটি কন্ট্রোল (QC) সফলভাবে সম্পন্ন হলে রিফান্ড প্রসেস করা হয়।',
          'বাতিলকৃত অর্ডারের রিফান্ড: অর্ডার সফলভাবে বাতিল হলে রিফান্ড স্বয়ংক্রিয়ভাবে সক্রিয় হবে।',
          'পেমেন্টের সময় কোনো ক্যাশব্যাক পেয়ে থাকলে, তা চূড়ান্ত রিফান্ড মূল্যের সাথে সমন্বয় করা হবে।',
          'প্রি-অর্ডার ও সেল আইটেম: প্রি-অর্ডার নিশ্চিত হলে বা সেলের সময়ে বুক করা হলে অর্ডার বাতিল, রিফান্ড বা এক্সচেঞ্জ গ্রহণযোগ্য নয়।'
        ]
      },
      contact: {
        title: 'রিটার্ন নিয়ে সাহায্য প্রয়োজন?',
        subtitle: 'আমাদের সাপোর্ট টিম আপনার রিটার্ন বা রিফান্ড অনুরোধে সাহায্য করতে প্রস্তুত:',
        email: 'info@gorolyshop.com',
        phone: '+8801313924485'
      }
    },
    agreeFooter: 'গোরোলি শপ ব্যবহারের মাধ্যমে আপনি স্বীকার করছেন যে আপনি এই রিটার্ন ও রিফান্ড নীতি পড়েছেন, বুঝেছেন এবং এতে সম্মত হয়েছেন।'
  }
};

export default function ReturnRefundPage({ onBackToHome }) {
  const { lang, setLang } = useLanguage();
  const { API_URL } = useContext(ShopContext);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [dbPage, setDbPage] = useState(null);
  const t = content[lang] || content.en;

  useEffect(() => {
    fetch(`${API_URL}/pages/return-refund-policy`)
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
              <RotateCcw size={13} />
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

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {dbPage && lang === 'bn' ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div 
              className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed sm:text-base space-y-4"
              dangerouslySetInnerHTML={{ __html: dbPage.content }}
            />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Shipping & Delivery section */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
            <Truck size={20} className="text-violet-500" />
            {t.sections.delivery.title}
          </h2>
          <ul className="space-y-3">
            {t.sections.delivery.items.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Exchange section */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
            <Package size={20} className="text-[#FF6600]" />
            {t.sections.exchange.title}
          </h2>
          <ul className="space-y-3">
            {t.sections.exchange.items.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed bg-slate-50/50 rounded-xl p-3 border border-slate-100/50 transition">
                <span className="w-6 h-6 rounded-full bg-[#FF6600]/10 text-[#FF6600] flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{idx + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Return Guidelines */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
            <RotateCcw size={20} className="text-rose-500" />
            {t.sections.returns.title}
          </h2>
          <p className="text-slate-500 text-xs font-bold leading-relaxed">{t.sections.returns.subtitle}</p>
          <ul className="space-y-3 pt-2">
            {t.sections.returns.items.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed bg-rose-50/10 rounded-xl p-3 border border-rose-100/20 transition">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Refund Processing */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
            <CreditCard size={20} className="text-emerald-500" />
            {t.sections.refunds.title}
          </h2>
          <ul className="space-y-3">
            {t.sections.refunds.items.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact info card */}
        <section className="bg-gradient-to-br from-[#17243a] via-[#1e2f4a] to-[#17243a] text-white rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Phone size={24} className="text-[#FF6600]" />
              {t.sections.contact.title}
            </h2>
            <p className="text-white/60 font-semibold text-xs sm:text-sm">{t.sections.contact.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`mailto:${t.sections.contact.email}`}
              className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition text-white group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FF6600]/20 text-[#FF6600] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Mail size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Email Us</div>
                <div className="text-sm font-black mt-0.5">{t.sections.contact.email}</div>
              </div>
            </a>

            <a
              href={`tel:${t.sections.contact.phone}`}
              className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition text-white group"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Phone size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Call Support</div>
                <div className="text-sm font-black mt-0.5">{t.sections.contact.phone}</div>
              </div>
            </a>
          </div>
        </section>
        </div>
        )}

        {/* Footer Disclaimer */}
        <div className="text-center text-slate-400 text-xs font-bold leading-relaxed pt-8 mt-12 border-t border-slate-100 max-w-2xl mx-auto">
          {t.agreeFooter}
        </div>

      </div>

    </div>
  );
}
