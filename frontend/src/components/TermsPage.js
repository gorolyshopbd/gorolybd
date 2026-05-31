'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShopContext } from '@/context/ShopContext';
import {
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  Scale,
  FileText,
  Truck,
  RotateCcw,
  CreditCard,
  AlertTriangle,
  Info,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';

const content = {
  en: {
    backHome: 'Back to Home',
    badge: 'Terms & Conditions',
    title: 'Terms & Conditions',
    subtitle: 'Welcome to Goroly Shop. By accessing and using our website, you agree to comply with and be bound by the following terms and conditions.',
    disclaimer: 'Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.',
    disagreeNote: 'By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.',
    
    sections: {
      sec1: {
        title: '1. General',
        items: [
          'By using this website, you confirm that you are at least 18 years old or using it under the supervision of a parent or guardian.',
          'We reserve the right to update or change these terms at any time without prior notice.'
        ]
      },
      sec2: {
        title: '2. Products & Services',
        items: [
          'All products listed on Goroly Shop are subject to availability.',
          'We reserve the right to limit quantities, discontinue products, or change pricing at any time without notice.'
        ]
      },
      sec3: {
        title: '3. Pricing & Payments',
        items: [
          'All prices are listed in Bangladeshi Taka (BDT).',
          'We accept payments via Cash on Delivery, Mobile Banking (bKash, Nagad, Rocket), and Debit/Credit Cards.',
          'Orders will be processed only after payment confirmation (if applicable).'
        ]
      },
      sec4: {
        title: '4. Orders & Confirmation',
        items: [
          'After placing an order, you will receive a confirmation message.',
          'Goroly Shop reserves the right to cancel or refuse any order due to stock issues, incorrect pricing, or suspicious activity.'
        ]
      },
      sec5: {
        title: '5. Shipping & Delivery',
        items: [
          'Cash on delivery is available all over Bangladesh. Full payment is required in advance for Sundarban courier delivery.',
          'Delivery charges in Dhaka are BDT 70 per 1kg, and outside Dhaka are BDT 130 per 1kg. It takes 48-72 hours to deliver the parcel.',
          'Our delivery partners are Steadfast, Pathao, E-courier, Redx, and Sundarban courier service.'
        ]
      },
      exchange: {
        title: 'Exchange Terms and Conditions',
        subtitle: 'After purchasing from Goroly Shop Website or App, customers can claim an exchange under the following instructions:',
        items: [
          'Products must be in their original condition. Exchange requests must be claimed within 3 days.',
          'Items should be unused and intact to be eligible for exchange.',
          'Exchange is subject to stock availability. If stock is unavailable, the customer can choose another product of a similar or higher price range.',
          'There will be no monetary compensation/cash refunds for the exchange.',
          'Exchange is not applicable on promotional/discounted products purchased during sale campaigns.',
          'If you received a cashback during payment, the cashback amount will be adjusted/deducted during the refund/exchange.',
          'The customer must ensure the item is packed and delivered securely. Goroly Shop will not be held responsible if goods are damaged during return transit to our warehouse.',
          'Email us at info@gorolyshop.com with your Order ID and issue details within 12 hours of delivery. We will verify the return request and guide you on the pickup process.'
        ]
      },
      returns: {
        title: '6. Returns Policy',
        subtitle: 'Our products are packaged with great care and go through rigorous quality checks before shipping. If you receive a flawed, damaged, or broken product, you can return or request an exchange.',
        items: [
          'Returns are free within 3 days of purchase.',
          'If the return is claimed after 3 days, Goroly Shop will not assume any responsibility.',
          'If you wish to return a product because you did not like it, you must bear the return delivery charges.',
          'If a product is damaged or broken during delivery, you must call and inform us immediately in front of the delivery agent at 01313924485 or email info@gorolyshop.com. If someone else receives the parcel on your behalf, please inform them to check. No such claims will be accepted after the delivery agent leaves.',
          'If the invoice details do not match the products received, notify us in front of the delivery agent. We will deliver the missing products within 24-72 hours without any extra delivery charge. No claims will be accepted after the delivery agent leaves.'
        ]
      },
      refunds: {
        title: 'Refunds Policy',
        subtitle: 'Goroly Shop processes refunds based on the following types:',
        items: [
          'Refund from returns: Processed once the returned item reaches our warehouse and Quality Control (QC) is completed successfully.',
          'Refunds from cancelled orders: Automatically triggered once cancellation is processed successfully.',
          'Any cashback received during payment will be adjusted and deducted from the final refund amount.',
          'Pre-orders & Sale Items: No cancellation, refund, or exchange is allowed once a pre-order is confirmed or booked during sale campaigns.'
        ]
      },
      sec7: {
        title: '7. User Responsibilities',
        items: [
          'You agree not to misuse the website, including providing false information.',
          'Attempting to harm, hack, or compromise the website.',
          'Using the site for any unauthorized or illegal purposes.'
        ]
      },
      sec8: {
        title: '8. Intellectual Property',
        items: [
          'All content on this website (logos, images, text, and graphics) is the property of Goroly Shop and may not be used without our prior written permission.'
        ]
      },
      sec9: {
        title: '9. Limitation of Liability',
        items: [
          'Goroly Shop shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our website or products.'
        ]
      },
      sec10: {
        title: '10. Privacy',
        items: [
          'Your personal information and privacy are handled securely according to our Privacy Policy.'
        ]
      },
      sec11: {
        title: '11. Governing Law',
        items: [
          'These terms and conditions are governed by and construed in accordance with the laws of Bangladesh.'
        ]
      },
      sec12: {
        title: '12. Contact Us',
        subtitle: 'If you have any questions about these Terms & Conditions, please contact us:',
        email: 'info@gorolyshop.com',
        phone: '+8801313924485'
      }
    },
    agreeFooter: 'By using Goroly Shop, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.'
  },
  bn: {
    backHome: 'হোমে ফিরুন',
    badge: 'শর্তাবলী ও নীতিমালা',
    title: 'শর্তাবলী ও নীতিমালা',
    subtitle: 'গোরোলি শপে আপনাকে স্বাগতম। আমাদের ওয়েবসাইটটি ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলী মেনে নিতে সম্মত হচ্ছেন।',
    disclaimer: 'আমাদের সেবা গ্রহণ ও ব্যবহার করার বিষয়টি এই শর্তাবলীর গ্রহণযোগ্যতা ও সম্মতির ওপর নির্ভরশীল। এই শর্তাবলী সকল ভিজিটর, ব্যবহারকারী এবং অন্যদের জন্য প্রযোজ্য যারা এই সেবা ব্যবহার করেন।',
    disagreeNote: 'সেবাটি ব্যবহার করে আপনি এই শর্তাবলী দ্বারা বাধ্য হতে সম্মত হন। আপনি যদি কোনো শর্তের সাথে দ্বিমত পোষণ করেন, তবে আপনি এই সেবা ব্যবহার করতে পারবেন না।',
    
    sections: {
      sec1: {
        title: '১. সাধারণ নিয়মাবলী',
        items: [
          'এই ওয়েবসাইটটি ব্যবহার করার মাধ্যমে আপনি নিশ্চিত করছেন যে আপনার বয়স কমপক্ষে ১৮ বছর অথবা আপনি পিতা-মাতা বা অভিভাবকের তত্ত্বাবধানে এটি ব্যবহার করছেন।',
          'আমরা যেকোনো সময় পূর্ব নোটিশ ছাড়াই এই শর্তাবলী পরিবর্তন বা আপডেট করার অধিকার সংরক্ষণ করি।'
        ]
      },
      sec2: {
        title: '২. পণ্য ও সেবা',
        items: [
          'গোরোলি শপে তালিকাভুক্ত সকল পণ্য স্টকের প্রাপ্যতার ওপর নির্ভরশীল।',
          'আমরা যেকোনো সময় নোটিশ ছাড়াই পণ্যের পরিমাণ সীমাবদ্ধ করার, পণ্য বন্ধ করার বা মূল্য পরিবর্তন করার অধিকার রাখি।'
        ]
      },
      sec3: {
        title: '৩. মূল্য ও পেমেন্ট',
        items: [
          'সকল মূল্য বাংলাদেশি টাকায় (BDT) তালিকাভুক্ত।',
          'আমরা ক্যাশ অন ডেলিভারি (COD), মোবাইল ব্যাংকিং (বিকাশ, নগদ, রকেট) এবং ডেবিট/ক্রেডিট কার্ডের মাধ্যমে পেমেন্ট গ্রহণ করি।',
          'পেমেন্ট নিশ্চিত হওয়ার পরেই কেবল অর্ডার প্রসেস করা হবে (প্রযোজ্য ক্ষেত্রে)।'
        ]
      },
      sec4: {
        title: '৪. অর্ডার ও কনফার্মেশন',
        items: [
          'অর্ডার প্লেস করার পর, আপনি একটি কনফার্মেশন মেসেজ পাবেন।',
          'স্টক স্বল্পতা, ভুল মূল্য নির্ধারণ বা সন্দেহজনক কার্যকলাপের কারণে যেকোনো অর্ডার বাতিল বা প্রত্যাখ্যান করার অধিকার গোরোলি শপ সংরক্ষণ করে।'
        ]
      },
      sec5: {
        title: '৫. শিপিং ও ডেলিভারি',
        items: [
          'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। সুন্দরবন কুরিয়ারের মাধ্যমে ডেলিভারির জন্য সম্পূর্ণ পেমেন্ট অগ্রিম পরিশোধ করতে হবে।',
          'ডেলিভারি চার্জ ঢাকার মধ্যে প্রতি ১ কেজির জন্য ৭০ টাকা এবং ঢাকার বাইরে প্রতি ১ কেজির জন্য ১৩০ টাকা। পার্সেল ডেলিভারি হতে ৪৮-৭২ ঘণ্টা সময় লাগে।',
          'আমাদের ডেলিভারি পার্টনাররা হলো- Steadfast, Pathao, E-courier, Redx এবং সুন্দরবন কুরিয়ার সার্ভিস।'
        ]
      },
      exchange: {
        title: 'এক্সচেঞ্জ শর্তাবলী',
        subtitle: 'গোরোলি শপ ওয়েবসাইট বা অ্যাপ থেকে পণ্য ক্রয়ের পর গ্রাহকরা নিম্নলিখিত নির্দেশনা অনুযায়ী এক্সচেঞ্জ দাবি করতে পারবেন:',
        items: [
          'পণ্যটি অবশ্যই তার মূল অবস্থায় থাকতে হবে। এক্সচেঞ্জ অনুরোধটি পণ্য পাওয়ার ৩ দিনের মধ্যে করতে হবে।',
          'এক্সচেঞ্জের জন্য পণ্যটি অব্যবহৃত এবং অক্ষত হতে হবে।',
          'এক্সচেঞ্জ স্টকের প্রাপ্যতার ওপর নির্ভরশীল। স্টক না থাকলে, গ্রাহক সমমূল্য বা তার বেশি মূল্যের অন্য কোনো পণ্য নির্বাচন করতে পারেন।',
          'এক্সচেঞ্জের ক্ষেত্রে কোনো আর্থিক ক্ষতিপূরণ বা নগদ অর্থ ফেরত দেওয়া হবে না।',
          'সেল বা ডিসকাউন্ট ক্যাম্পেইন চলাকালীন কেনা পণ্যের ক্ষেত্রে এক্সচেঞ্জ প্রযোজ্য নয়।',
          'পেমেন্টের সময় কোনো ক্যাশব্যাক পেয়ে থাকলে, রিফান্ড বা এক্সচেঞ্জের সময় ক্যাশব্যাকের সমপরিমাণ অর্থ কেটে নেওয়া হবে।',
          'গ্রাহককে অবশ্যই পণ্যটি নিরাপদে প্যাক করে ফেরত পাঠাতে হবে। গোরোলি শপ ওয়্যারহাউসে ফেরত আসার সময় পণ্য ক্ষতিগ্রস্ত হলে গোরোলি শপ দায়ী থাকবে না।',
          'ডেলিভারি পাওয়ার ১২ ঘণ্টার মধ্যে অর্ডার আইডি এবং সমস্যার বিবরণসহ info@gorolyshop.com এ ইমেল করুন। আমরা রিটার্ন অনুরোধটি যাচাই করব এবং পিকআপ প্রক্রিয়া সম্পর্কে জানাব।'
        ]
      },
      returns: {
        title: '৬. রিটার্ন পলিসি',
        subtitle: 'আমাদের পণ্যগুলো অত্যন্ত যত্নসহকারে প্যাক করা হয় এবং শিপিংয়ের আগে কঠোর মান নিয়ন্ত্রণ করা হয়। আপনি যদি কোনো ত্রুটিযুক্ত বা ক্ষতিগ্রস্ত পণ্য পান, তবে আপনি তা রিটার্ন বা এক্সচেঞ্জ করতে পারেন।',
        items: [
          'ক্রয়ের ৩ দিনের মধ্যে রিটার্ন সম্পূর্ণ ফ্রি।',
          'পণ্য ক্রয়ের ৩ দিন পর রিটার্ন দাবি করা হলে গোরোলি শপ কোনো দায়ভার গ্রহণ করবে না।',
          'পণ্য পছন্দ না হওয়ার কারণে রিটার্ন করতে চাইলে গ্রাহককে রিটার্ন ডেলিভারি চার্জ বহন করতে হবে।',
          'ডেলিভারির সময় পণ্য ক্ষতিগ্রস্ত বা ভাঙা থাকলে, কুরিয়ারের প্রতিনিধির সামনেই আমাদের কল করে জানাতে হবে (01313924485) অথবা info@gorolyshop.com এ ইমেল করতে হবে। আপনার পক্ষে অন্য কেউ পার্সেল গ্রহণ করলে তাদের বিষয়টি চেক করতে বলুন। ডেলিভারিম্যান চলে যাওয়ার পর কোনো অভিযোগ গ্রহণযোগ্য হবে না।',
          'প্রাপ্ত পণ্য বা ইনভয়েসের গড়মিল থাকলে ডেলিভারিম্যানের সামনেই আমাদের জানান। আমরা কোনো অতিরিক্ত ডেলিভারি চার্জ ছাড়াই ২৪-৭২ ঘণ্টার মধ্যে সঠিক পণ্য ডেলিভারি করব। ডেলিভারিম্যান চলে যাওয়ার পর কোনো অভিযোগ গ্রহণযোগ্য হবে না।'
        ]
      },
      refunds: {
        title: 'রিফান্ড পলিসি',
        subtitle: 'গোরোলি শপ নিম্নলিখিত নিয়মে রিফান্ড প্রসেস করে থাকে:',
        items: [
          'রিটার্ন থেকে রিফান্ড: পণ্যটি আমাদের ওয়্যারহাউসে পৌঁছানোর পর এবং কোয়ালিটি কন্ট্রোল (QC) সফলভাবে সম্পন্ন হলে রিফান্ড প্রসেস করা হয়।',
          'বাতিলকৃত অর্ডারের রিফান্ড: অর্ডার সফলভাবে বাতিল হলে রিফান্ড স্বয়ংক্রিয়ভাবে সক্রিয় হবে।',
          'পেমেন্টের সময় কোনো ক্যাশব্যাক পেয়ে থাকলে, তা চূড়ান্ত রিফান্ড মূল্যের সাথে সমন্বয় করা হবে।',
          'প্রি-অর্ডার ও সেল আইটেম: প্রি-অর্ডার নিশ্চিত হলে বা সেলের সময়ে বুক করা হলে অর্ডার বাতিল, রিফান্ড বা এক্সচেঞ্জ গ্রহণযোগ্য নয়।'
        ]
      },
      sec7: {
        title: '৭. ব্যবহারকারীর দায়িত্বসমূহ',
        items: [
          'আপনি ওয়েবসাইটের কোনো অপব্যবহার করবেন না, যার মধ্যে রয়েছে মিথ্যা তথ্য প্রদান করা।',
          'ওয়েবসাইট হ্যাক বা ক্ষতি করার চেষ্টা করা।',
          'কোনো অবৈধ উদ্দেশ্যে ওয়েবসাইটটি ব্যবহার করা।'
        ]
      },
      sec8: {
        title: '৮. মেধা সম্পত্তি',
        items: [
          'এই ওয়েবসাইটের সমস্ত কন্টেন্ট (লোগো, ছবি, টেক্সট এবং গ্রাফিক্স) গোরোলি শপের সম্পত্তি এবং আমাদের অনুমতি ছাড়া ব্যবহার করা যাবে না।'
        ]
      },
      sec9: {
        title: '৯. দায়ের সীমাবদ্ধতা',
        items: [
          'আমাদের ওয়েবসাইট বা পণ্য ব্যবহারের ফলে পরোক্ষ, আনুষঙ্গিক বা ফলস্বরূপ কোনো ক্ষয়ক্ষতির জন্য গোরোলি শপ দায়ী থাকবে না।'
        ]
      },
      sec10: {
        title: '১০. গোপনীয়তা',
        items: [
          'আপনার ব্যক্তিগত তথ্য আমাদের গোপনীয়তা নীতি (Privacy Policy) অনুযায়ী সুরক্ষিতভাবে পরিচালিত হয়।'
        ]
      },
      sec11: {
        title: '১১. প্রযোজ্য আইন',
        items: [
          'এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী পরিচালিত এবং ব্যাখ্যা করা হবে।'
        ]
      },
      sec12: {
        title: '১২. যোগাযোগ',
        subtitle: 'এই শর্তাবলী ও নীতিমালা সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন:',
        email: 'info@gorolyshop.com',
        phone: '+8801313924485'
      }
    },
    agreeFooter: 'গোরোলি শপ ব্যবহারের মাধ্যমে আপনি স্বীকার করছেন যে আপনি এই শর্তাবলী ও নীতিমালা পড়েছেন, বুঝেছেন এবং এতে সম্মত হয়েছেন।'
  }
};

const navItems = [
  { id: 'general', label: '1. General / সাধারণ' },
  { id: 'products', label: '2. Products / পণ্য ও সেবা' },
  { id: 'pricing', label: '3. Pricing / মূল্য ও পেমেন্ট' },
  { id: 'shipping', label: '5. Shipping / শিপিং ও ডেলিভারি' },
  { id: 'exchange', label: 'Exchange / এক্সচেঞ্জ শর্তাবলী' },
  { id: 'returns', label: '6. Returns & Refunds / রিটার্ন ও রিফান্ড' },
  { id: 'legal', label: 'Legal & Privacy / আইন ও গোপনীয়তা' },
  { id: 'contact', label: '12. Contact / যোগাযোগ' },
];

export default function TermsPage({ onBackToHome }) {
  const { lang, setLang } = useLanguage();
  const { API_URL } = useContext(ShopContext);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [dbPage, setDbPage] = useState(null);
  const t = content[lang] || content.en;

  useEffect(() => {
    fetch(`${API_URL}/pages/terms-&-conditions`)
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
              <Scale size={13} />
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

      {/* ── DISCLAIMER BLOCK ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center flex-shrink-0 text-[#FF6600]">
            <Info size={24} />
          </div>
          <div className="space-y-2">
            <p className="text-slate-700 text-sm font-semibold leading-relaxed">{t.disclaimer}</p>
            <p className="text-slate-500 text-xs font-bold leading-relaxed">{t.disagreeNote}</p>
          </div>
        </div>
      </div>

      {/* ── CONTENT INDEX & BODY LAYOUT ── */}
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
              
              {/* Section 1: General */}
              <section id="general" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                  <Scale size={20} className="text-[#FF6600]" />
                  {t.sections.sec1.title}
                </h2>
                <ul className="space-y-3">
                  {t.sections.sec1.items.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 2: Products */}
              <section id="products" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                  <Zap size={20} className="text-sky-500" />
                  {t.sections.sec2.title}
                </h2>
                <ul className="space-y-3">
                  {t.sections.sec2.items.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 3: Pricing */}
              <section id="pricing" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                  <CreditCard size={20} className="text-emerald-500" />
                  {t.sections.sec3.title} & {t.sections.sec4.title}
                </h2>
                <div className="space-y-4">
                  <ul className="space-y-3 border-b border-slate-50 pb-4">
                    {t.sections.sec3.items.map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.sections.sec4.title}</h4>
                    <ul className="space-y-3">
                      {t.sections.sec4.items.map((item, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 5: Shipping */}
              <section id="shipping" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                  <Truck size={20} className="text-violet-500" />
                  {t.sections.sec5.title}
                </h2>
                <ul className="space-y-3">
                  {t.sections.sec5.items.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-slate-600 text-sm font-semibold leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section: Exchange */}
              <section id="exchange" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 transition hover:shadow-md">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                  <RotateCcw size={20} className="text-[#FF6600]" />
                  {t.sections.exchange.title}
                </h2>
                <p className="text-slate-500 text-xs font-bold leading-relaxed">{t.sections.exchange.subtitle}</p>
                <ul className="space-y-3.5 pt-2">
                  {t.sections.exchange.items.map((item, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-slate-600 text-sm font-semibold leading-relaxed bg-slate-50/50 hover:bg-slate-50 rounded-xl p-3 border border-slate-100/50 transition">
                      <span className="w-6 h-6 rounded-full bg-[#FF6600]/10 text-[#FF6600] flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{idx + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 6: Returns & Refunds */}
              <section id="returns" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 transition hover:shadow-md">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                    <RotateCcw size={20} className="text-rose-500" />
                    {t.sections.returns.title}
                  </h2>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed mt-2">{t.sections.returns.subtitle}</p>
                  <ul className="space-y-3.5 pt-4">
                    {t.sections.returns.items.map((item, idx) => (
                      <li key={idx} className="flex gap-3 items-start text-slate-600 text-sm font-semibold leading-relaxed bg-rose-50/10 hover:bg-rose-50/20 rounded-xl p-3 border border-rose-100/30 transition">
                        <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{idx + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
                    <CreditCard size={18} className="text-emerald-500" />
                    {t.sections.refunds.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">{t.sections.refunds.subtitle}</p>
                  <ul className="space-y-3.5 pt-4">
                    {t.sections.refunds.items.map((item, idx) => (
                      <li key={idx} className="flex gap-3 items-start text-slate-600 text-sm font-semibold leading-relaxed bg-emerald-50/10 hover:bg-emerald-50/20 rounded-xl p-3 border border-emerald-100/30 transition">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{idx + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Section: Legal & Privacy */}
              <section id="legal" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 transition hover:shadow-md">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                  <ShieldCheck size={20} className="text-sky-500" />
                  {lang === 'en' ? '7-11. Legal & Intellectual Rights' : '৭-১১. আইনি ও মেধা সম্পত্তি অধিকার'}
                </h2>
                <div className="space-y-4">
                  {[
                    { title: t.sections.sec7.title, items: t.sections.sec7.items },
                    { title: t.sections.sec8.title, items: t.sections.sec8.items },
                    { title: t.sections.sec9.title, items: t.sections.sec9.items },
                    { title: t.sections.sec10.title, items: t.sections.sec10.items },
                    { title: t.sections.sec11.title, items: t.sections.sec11.items },
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

              {/* Section 12: Contact Us */}
              <section id="contact" className="bg-gradient-to-br from-[#17243a] via-[#1e2f4a] to-[#17243a] text-white rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Phone size={24} className="text-[#FF6600]" />
                    {t.sections.sec12.title}
                  </h2>
                  <p className="text-white/60 font-semibold text-xs sm:text-sm">{t.sections.sec12.subtitle}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={`mailto:${t.sections.sec12.email}`}
                    className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition text-white group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#FF6600]/20 text-[#FF6600] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Email Us</div>
                      <div className="text-sm font-black mt-0.5">{t.sections.sec12.email}</div>
                    </div>
                  </a>

                  <a
                    href={`tel:${t.sections.sec12.phone}`}
                    className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition text-white group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Phone size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Call Support</div>
                      <div className="text-sm font-black mt-0.5">{t.sections.sec12.phone}</div>
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
