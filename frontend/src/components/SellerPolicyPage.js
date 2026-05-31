'use client';

import React, { useState, useContext } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShopContext } from '@/context/ShopContext';
import {
  ArrowLeft,
  Package,
  Truck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  XCircle,
  Info,
  Lock,
  Store,
  LayoutGrid,
} from 'lucide-react';

// ─── Translation dictionary ───────────────────────────────────────────────────
const dict = {
  en: {
    backHome: 'Back to Home',
    sellerCenter: 'Seller Center',
    sellerDashboard: 'Seller Dashboard',
    logOut: 'Log Out',
    logIn: 'Log In',
    signUp: 'Sign Up',
    pageTitle: 'Seller Policy Center',
    pageSubtitle:
      'Everything you need to know about selling on our platform — clear, fair, and transparent.',
    tabs: {
      product: 'Product Policy',
      delivery: 'Pickup & Delivery Policy',
      exchange: 'Exchange & Return Policy',
    },

    // ── Product Policy ──────────────────────────────────────────────────────
    product: {
      hero: 'Product Policy',
      heroSub:
        'Guidelines every seller must follow to maintain product quality and customer trust.',
      sections: [
        {
          icon: 'ShieldCheck',
          title: 'Product Listing Requirements',
          items: [
            'All product listings must contain accurate titles, descriptions, and images.',
            'Product images must be clear, high-resolution, and show the actual item.',
            'Counterfeit, fake, or replica products are strictly prohibited.',
            'Sellers must specify correct size, weight, colour, and material details.',
            'At least one main product image with a white or neutral background is required.',
            'Products must be categorised correctly to ensure buyers find them easily.',
          ],
        },
        {
          icon: 'CheckCircle',
          title: 'Approved Product Categories',
          items: [
            'Fashion & Apparel — clothing, footwear, accessories.',
            'Electronics — phones, laptops, gadgets, accessories.',
            'Home & Living — furniture, décor, kitchen appliances.',
            'Health & Beauty — cosmetics, personal care, supplements.',
            'Sports & Outdoors — equipment, activewear, gear.',
            'Books & Stationery — educational materials, office supplies.',
          ],
        },
        {
          icon: 'XCircle',
          title: 'Prohibited Products',
          items: [
            'Illegal drugs, controlled substances, or drug paraphernalia.',
            'Weapons, firearms, explosives, or related accessories.',
            'Counterfeit currency, documents, or identity materials.',
            'Pornographic or obscene content of any kind.',
            'Alcohol and tobacco products (unless specifically authorised).',
            'Endangered animal products or live animals.',
            'Stolen goods or items obtained through illegal means.',
          ],
        },
        {
          icon: 'AlertTriangle',
          title: 'Product Quality Standards',
          items: [
            'All products must match the listing description exactly.',
            'Sellers must maintain a product rating of at least 3.5/5 stars.',
            'Products with consistent quality complaints may be delisted.',
            'Expired or near-expiry consumables must not be listed.',
            'Packaging must be adequate to prevent damage during delivery.',
            'Sellers are responsible for quality assurance before dispatch.',
          ],
        },
      ],
    },

    // ── Pickup & Delivery Policy ────────────────────────────────────────────
    delivery: {
      hero: 'Pickup & Delivery Policy',
      heroSub:
        'Timelines, responsibilities, and processes for getting orders to customers safely and on time.',
      sections: [
        {
          icon: 'Clock',
          title: 'Order Processing Time',
          items: [
            'Sellers must confirm orders within 24 hours of placement.',
            'Products must be packed and ready for pickup within 48 hours of confirmation.',
            'Failure to confirm orders within 24 hours may result in auto-cancellation.',
            'Sellers must update the order status promptly at each stage.',
            'Weekend and public holiday orders are processed on the next business day.',
          ],
        },
        {
          icon: 'Truck',
          title: 'Pickup Procedure',
          items: [
            'Our delivery partner will collect the parcel from the seller\'s warehouse or pickup point.',
            'Sellers must ensure the package is properly labelled with the system-generated label.',
            'Pickup slots are available Monday to Saturday, 9 AM – 6 PM.',
            'Sellers should schedule pickup 12 hours in advance via the seller dashboard.',
            'The parcel must be sealed and tamper-evident before handover.',
            'Seller is responsible for any damage arising from improper packaging.',
          ],
        },
        {
          icon: 'Package',
          title: 'Delivery Timelines',
          items: [
            'Dhaka Metro: 1–2 business days after pickup.',
            'Outside Dhaka (Other Districts): 3–5 business days after pickup.',
            'Remote Areas: 5–7 business days after pickup.',
            'Express delivery (same-day/next-day) is available for Dhaka Metro orders.',
            'International shipping timelines vary; consult the platform\'s shipping guide.',
            'Delivery delays due to natural disasters or force majeure are exempt.',
          ],
        },
        {
          icon: 'ShieldCheck',
          title: 'Seller Responsibilities',
          items: [
            'Sellers must use platform-approved courier partners only.',
            'Shipping costs are calculated based on product weight and delivery zone.',
            'Sellers must provide accurate parcel weight and dimensions at listing.',
            'Wrong weight declarations may attract penalty charges.',
            'Track-and-trace must be enabled for all shipments above BDT 500.',
            'Sellers must cooperate with delivery investigations within 48 hours.',
          ],
        },
      ],
    },

    // ── Exchange & Return Policy ────────────────────────────────────────────
    exchange: {
      hero: 'Seller Exchange & Return Policy',
      heroSub:
        'A fair and transparent process to handle customer returns and exchanges smoothly.',
      sections: [
        {
          icon: 'RefreshCw',
          title: 'Return Eligibility',
          items: [
            'Customers may request a return within 7 days of delivery.',
            'Items must be unused, unwashed, and in original packaging with all tags attached.',
            'Returns are accepted for: defective products, wrong items sent, or items not as described.',
            'Perishable goods, digital products, and personalised items are non-returnable.',
            'Underwear, swimwear, and cosmetics are non-returnable for hygiene reasons.',
            'Sellers must accept all valid return requests within 48 hours.',
          ],
        },
        {
          icon: 'CheckCircle',
          title: 'Exchange Process',
          items: [
            'Customer submits an exchange request via the platform within 7 days.',
            'Seller reviews and approves or disputes within 48 hours.',
            'If approved, the courier collects the item from the customer.',
            'Seller dispatches the replacement within 2 business days of receiving the returned item.',
            'Exchange shipping cost is borne by the seller if the error is on the seller\'s side.',
            'Customers bear the shipping cost for exchange requests due to personal preference.',
          ],
        },
        {
          icon: 'AlertTriangle',
          title: 'Refund Policy',
          items: [
            'Full refunds are issued for: item not delivered, defective goods, or wrong item received.',
            'Partial refunds may be issued at the platform\'s discretion for minor discrepancies.',
            'Refunds are processed within 5–7 business days after the return is confirmed.',
            'Refunds are credited back to the original payment method.',
            'Cash on Delivery refunds are processed via mobile banking (bKash/Nagad).',
            'Sellers are liable for refund costs where the fault is on their part.',
          ],
        },
        {
          icon: 'XCircle',
          title: 'Seller Dispute Resolution',
          items: [
            'Sellers may dispute return or refund decisions within 72 hours.',
            'Disputes must be submitted with clear evidence (photos, order records, etc.).',
            'The platform\'s dispute team will review and respond within 5 business days.',
            'Sellers with frequent invalid disputes may face account restrictions.',
            'Final decisions made by the platform are binding.',
            'Repeated policy violations may result in permanent account suspension.',
          ],
        },
      ],
    },
  },

  bn: {
    backHome: 'হোম পেজে ফিরুন',
    sellerCenter: 'সেলার সেন্টার',
    sellerDashboard: 'সেলার ড্যাশবোর্ড',
    logOut: 'লগ আউট',
    logIn: 'লগ ইন',
    signUp: 'সাইন আপ',
    pageTitle: 'সেলার পলিসি সেন্টার',
    pageSubtitle:
      'আমাদের প্ল্যাটফর্মে বিক্রি করা সম্পর্কে আপনার জানার দরকার সব কিছু — স্পষ্ট, ন্যায্য এবং স্বচ্ছ।',
    tabs: {
      product: 'পণ্য নীতি',
      delivery: 'পিকআপ ও ডেলিভারি নীতি',
      exchange: 'বিনিময় ও রিটার্ন নীতি',
    },

    product: {
      hero: 'পণ্য নীতি',
      heroSub:
        'পণ্যের মান এবং গ্রাহকের আস্থা বজায় রাখতে প্রতিটি সেলারকে যে নির্দেশিকা অনুসরণ করতে হবে।',
      sections: [
        {
          icon: 'ShieldCheck',
          title: 'পণ্য তালিকার প্রয়োজনীয়তা',
          items: [
            'সমস্ত পণ্য তালিকায় সঠিক শিরোনাম, বিবরণ এবং ছবি থাকতে হবে।',
            'পণ্যের ছবি অবশ্যই স্পষ্ট, উচ্চ-রেজোলিউশন এবং আসল পণ্য দেখাতে হবে।',
            'নকল, জাল বা রেপ্লিকা পণ্য কঠোরভাবে নিষিদ্ধ।',
            'বিক্রেতাদের অবশ্যই সঠিক সাইজ, ওজন, রঙ এবং উপাদানের বিবরণ উল্লেখ করতে হবে।',
            'সাদা বা নিরপেক্ষ পটভূমি সহ কমপক্ষে একটি প্রধান পণ্য চিত্র প্রয়োজন।',
            'ক্রেতারা সহজে খুঁজে পাওয়ার জন্য পণ্যগুলি সঠিকভাবে বিভাগভুক্ত করতে হবে।',
          ],
        },
        {
          icon: 'CheckCircle',
          title: 'অনুমোদিত পণ্য বিভাগ',
          items: [
            'ফ্যাশন ও পোশাক — পোশাক, জুতা, আনুষাঙ্গিক।',
            'ইলেকট্রনিক্স — ফোন, ল্যাপটপ, গ্যাজেট, আনুষাঙ্গিক।',
            'হোম ও লিভিং — আসবাবপত্র, সাজসজ্জা, রান্নাঘরের যন্ত্রপাতি।',
            'স্বাস্থ্য ও সৌন্দর্য — প্রসাধনী, ব্যক্তিগত যত্ন, সাপ্লিমেন্ট।',
            'স্পোর্টস ও আউটডোর — সরঞ্জাম, অ্যাক্টিভওয়্যার, গিয়ার।',
            'বই ও স্টেশনারি — শিক্ষামূলক উপকরণ, অফিস সরবরাহ।',
          ],
        },
        {
          icon: 'XCircle',
          title: 'নিষিদ্ধ পণ্য',
          items: [
            'অবৈধ ওষুধ, নিয়ন্ত্রিত পদার্থ বা ড্রাগ প্যারাফেরনালিয়া।',
            'অস্ত্র, আগ্নেয়াস্ত্র, বিস্ফোরক বা সংশ্লিষ্ট আনুষাঙ্গিক।',
            'নকল মুদ্রা, নথি বা পরিচয় উপকরণ।',
            'যেকোনো ধরনের অশ্লীল বা অশালীন বিষয়বস্তু।',
            'অ্যালকোহল ও তামাকজাত পণ্য (বিশেষভাবে অনুমোদিত না হলে)।',
            'বিপন্ন প্রাণীর পণ্য বা জীবন্ত প্রাণী।',
            'চুরি করা পণ্য বা অবৈধ উপায়ে প্রাপ্ত আইটেম।',
          ],
        },
        {
          icon: 'AlertTriangle',
          title: 'পণ্যের মানের মানদণ্ড',
          items: [
            'সমস্ত পণ্য অবশ্যই তালিকার বিবরণের সাথে হুবহু মিলতে হবে।',
            'বিক্রেতাদের ন্যূনতম ৩.৫/৫ স্টার পণ্য রেটিং বজায় রাখতে হবে।',
            'ধারাবাহিক মান অভিযোগ সহ পণ্যগুলি তালিকা থেকে সরানো হতে পারে।',
            'মেয়াদোত্তীর্ণ বা প্রায় মেয়াদোত্তীর্ণ ভোগ্যপণ্য তালিকাভুক্ত করা যাবে না।',
            'ডেলিভারির সময় ক্ষতি প্রতিরোধ করতে প্যাকেজিং পর্যাপ্ত হতে হবে।',
            'পাঠানোর আগে মান নিশ্চিত করার জন্য বিক্রেতারা দায়ী।',
          ],
        },
      ],
    },

    delivery: {
      hero: 'পিকআপ ও ডেলিভারি নীতি',
      heroSub:
        'নিরাপদে এবং সময়মতো গ্রাহকদের কাছে অর্ডার পৌঁছে দেওয়ার সময়সীমা, দায়িত্ব এবং প্রক্রিয়া।',
      sections: [
        {
          icon: 'Clock',
          title: 'অর্ডার প্রক্রিয়াকরণের সময়',
          items: [
            'বিক্রেতাদের অর্ডার পাওয়ার ২৪ ঘণ্টার মধ্যে নিশ্চিত করতে হবে।',
            'নিশ্চিতকরণের ৪৮ ঘণ্টার মধ্যে পণ্য প্যাক করে পিকআপের জন্য প্রস্তুত থাকতে হবে।',
            '২৪ ঘণ্টার মধ্যে অর্ডার নিশ্চিত না করলে স্বয়ংক্রিয়ভাবে বাতিল হতে পারে।',
            'বিক্রেতাদের প্রতিটি পর্যায়ে অবিলম্বে অর্ডার স্ট্যাটাস আপডেট করতে হবে।',
            'সপ্তাহান্ত এবং সরকারি ছুটির দিনের অর্ডার পরের ব্যবসায়িক দিনে প্রক্রিয়া করা হয়।',
          ],
        },
        {
          icon: 'Truck',
          title: 'পিকআপ প্রক্রিয়া',
          items: [
            'আমাদের ডেলিভারি পার্টনার বিক্রেতার গুদাম বা পিকআপ পয়েন্ট থেকে পার্সেল সংগ্রহ করবে।',
            'বিক্রেতাকে অবশ্যই সিস্টেম-জেনারেটেড লেবেল দিয়ে প্যাকেজটি সঠিকভাবে লেবেল করতে হবে।',
            'পিকআপ স্লট সোমবার থেকে শনিবার, সকাল ৯টা – বিকাল ৬টা পর্যন্ত পাওয়া যায়।',
            'বিক্রেতাদের সেলার ড্যাশবোর্ডের মাধ্যমে ১২ ঘণ্টা আগে পিকআপ নির্ধারণ করা উচিত।',
            'হস্তান্তরের আগে পার্সেলটি সিলবদ্ধ এবং টেম্পার-এভিডেন্ট হতে হবে।',
            'অনুপযুক্ত প্যাকেজিং থেকে উদ্ভূত যেকোনো ক্ষতির জন্য বিক্রেতা দায়ী।',
          ],
        },
        {
          icon: 'Package',
          title: 'ডেলিভারি সময়সীমা',
          items: [
            'ঢাকা মেট্রো: পিকআপের পরে ১–২ ব্যবসায়িক দিন।',
            'ঢাকার বাইরে (অন্যান্য জেলা): পিকআপের পরে ৩–৫ ব্যবসায়িক দিন।',
            'দূরবর্তী অঞ্চল: পিকআপের পরে ৫–৭ ব্যবসায়িক দিন।',
            'ঢাকা মেট্রো অর্ডারের জন্য এক্সপ্রেস ডেলিভারি (একই দিন/পরের দিন) উপলব্ধ।',
            'আন্তর্জাতিক শিপিং সময়সীমা পরিবর্তিত হয়; প্ল্যাটফর্মের শিপিং গাইড দেখুন।',
            'প্রাকৃতিক দুর্যোগ বা অপ্রতিরোধ্য কারণে ডেলিভারি বিলম্ব থেকে অব্যাহতি দেওয়া হবে।',
          ],
        },
        {
          icon: 'ShieldCheck',
          title: 'বিক্রেতার দায়িত্ব',
          items: [
            'বিক্রেতাদের শুধুমাত্র প্ল্যাটফর্ম-অনুমোদিত কুরিয়ার পার্টনার ব্যবহার করতে হবে।',
            'শিপিং খরচ পণ্যের ওজন এবং ডেলিভারি জোনের উপর ভিত্তি করে গণনা করা হয়।',
            'বিক্রেতাদের তালিকায় সঠিক পার্সেলের ওজন এবং মাত্রা প্রদান করতে হবে।',
            'ভুল ওজন ঘোষণায় জরিমানা চার্জ হতে পারে।',
            'BDT ৫০০-এর উপরে সমস্ত শিপমেন্টের জন্য ট্র্যাক-অ্যান্ড-ট্রেস সক্ষম করতে হবে।',
            'বিক্রেতাদের ৪৮ ঘণ্টার মধ্যে ডেলিভারি তদন্তে সহযোগিতা করতে হবে।',
          ],
        },
      ],
    },

    exchange: {
      hero: 'সেলার বিনিময় ও রিটার্ন নীতি',
      heroSub:
        'গ্রাহকের রিটার্ন এবং বিনিময় মসৃণভাবে পরিচালনার জন্য একটি ন্যায্য ও স্বচ্ছ প্রক্রিয়া।',
      sections: [
        {
          icon: 'RefreshCw',
          title: 'রিটার্নের যোগ্যতা',
          items: [
            'ডেলিভারির ৭ দিনের মধ্যে গ্রাহকরা রিটার্ন অনুরোধ করতে পারবেন।',
            'আইটেমগুলি অব্যবহৃত, না ধোয়া এবং সমস্ত ট্যাগ সহ মূল প্যাকেজিংয়ে থাকতে হবে।',
            'ত্রুটিপূর্ণ পণ্য, ভুল পণ্য পাঠানো বা বিবরণ অনুযায়ী নয় এমন পণ্যের জন্য রিটার্ন গ্রহণযোগ্য।',
            'পচনশীল পণ্য, ডিজিটাল পণ্য এবং ব্যক্তিগতকৃত আইটেম ফেরতযোগ্য নয়।',
            'স্বাস্থ্যবিধির কারণে অন্তর্বাস, সাঁতারের পোশাক এবং প্রসাধনী ফেরতযোগ্য নয়।',
            'বিক্রেতাদের ৪৮ ঘণ্টার মধ্যে সমস্ত বৈধ রিটার্ন অনুরোধ গ্রহণ করতে হবে।',
          ],
        },
        {
          icon: 'CheckCircle',
          title: 'বিনিময় প্রক্রিয়া',
          items: [
            'গ্রাহক ৭ দিনের মধ্যে প্ল্যাটফর্মের মাধ্যমে একটি বিনিময় অনুরোধ জমা দেন।',
            'বিক্রেতা ৪৮ ঘণ্টার মধ্যে পর্যালোচনা করে অনুমোদন বা বিরোধ করেন।',
            'অনুমোদন হলে কুরিয়ার গ্রাহকের কাছ থেকে আইটেমটি সংগ্রহ করে।',
            'বিক্রেতা ফেরত পণ্য পাওয়ার ২ ব্যবসায়িক দিনের মধ্যে প্রতিস্থাপন পাঠান।',
            'ভুল বিক্রেতার পক্ষে হলে বিনিময় শিপিং খরচ বিক্রেতা বহন করবেন।',
            'ব্যক্তিগত পছন্দের কারণে বিনিময় অনুরোধের জন্য শিপিং খরচ গ্রাহক বহন করবেন।',
          ],
        },
        {
          icon: 'AlertTriangle',
          title: 'ফেরত নীতি',
          items: [
            'পণ্য ডেলিভারি না হলে, ত্রুটিপূর্ণ পণ্য বা ভুল পণ্য পেলে পূর্ণ অর্থ ফেরত দেওয়া হবে।',
            'ছোটখাটো অসঙ্গতির জন্য প্ল্যাটফর্মের বিবেচনায় আংশিক অর্থ ফেরত হতে পারে।',
            'রিটার্ন নিশ্চিত হওয়ার পরে ৫–৭ ব্যবসায়িক দিনের মধ্যে অর্থ ফেরত প্রক্রিয়া করা হয়।',
            'অর্থ মূল পেমেন্ট পদ্ধতিতে ফেরত দেওয়া হবে।',
            'ক্যাশ অন ডেলিভারি রিফান্ড মোবাইল ব্যাংকিং (bKash/Nagad) এর মাধ্যমে প্রক্রিয়া করা হয়।',
            'দোষ বিক্রেতার পক্ষে থাকলে বিক্রেতা রিফান্ড খরচের জন্য দায়বদ্ধ।',
          ],
        },
        {
          icon: 'XCircle',
          title: 'বিক্রেতার বিরোধ নিষ্পত্তি',
          items: [
            'বিক্রেতারা ৭২ ঘণ্টার মধ্যে রিটার্ন বা রিফান্ড সিদ্ধান্তে বিরোধ করতে পারবেন।',
            'বিরোধ অবশ্যই স্পষ্ট প্রমাণ সহ জমা দিতে হবে (ছবি, অর্ডার রেকর্ড, ইত্যাদি)।',
            'প্ল্যাটফর্মের বিরোধ দল ৫ ব্যবসায়িক দিনের মধ্যে পর্যালোচনা করে সাড়া দেবে।',
            'ঘন ঘন অবৈধ বিরোধ করা বিক্রেতাদের অ্যাকাউন্ট সীমাবদ্ধতার সম্মুখীন হতে পারে।',
            'প্ল্যাটফর্মের চূড়ান্ত সিদ্ধান্ত বাধ্যকারী।',
            'বারবার নীতি লঙ্ঘনে স্থায়ী অ্যাকাউন্ট সাসপেনশন হতে পারে।',
          ],
        },
      ],
    },
  },
};

// ─── Icon resolver ────────────────────────────────────────────────────────────
const iconMap = { ShieldCheck, CheckCircle, XCircle, AlertTriangle, Clock, Truck, Package, RefreshCw };

const iconColors = {
  ShieldCheck: { bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100' },
  CheckCircle: { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100' },
  XCircle: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100' },
  AlertTriangle: { bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-100' },
  Clock: { bg: 'bg-violet-50', text: 'text-violet-500', border: 'border-violet-100' },
  Truck: { bg: 'bg-sky-50', text: 'text-sky-500', border: 'border-sky-100' },
  Package: { bg: 'bg-orange-50', text: 'text-[#FF6600]', border: 'border-orange-100' },
  RefreshCw: { bg: 'bg-teal-50', text: 'text-teal-500', border: 'border-teal-100' },
};

// ─── Accordion Section Card ───────────────────────────────────────────────────
function PolicySection({ section, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = iconMap[section.icon] || Info;
  const colors = iconColors[section.icon] || { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100' };

  return (
    <div className={`rounded-2xl border ${open ? 'border-orange-200 shadow-md shadow-orange-50' : 'border-slate-100 shadow-sm'} bg-white overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/60 transition-colors duration-200"
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
          <Icon size={18} className={colors.text} />
        </div>
        <span className="flex-1 font-bold text-slate-800 text-sm sm:text-base">{section.title}</span>
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${open ? 'bg-[#FF6600] text-white' : 'bg-slate-100 text-slate-500'}`}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-50">
          <ul className="mt-4 space-y-3">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF6600]/10 text-[#FF6600] flex items-center justify-center text-[10px] font-black mt-0.5">
                  {i + 1}
                </span>
                <span className="text-slate-600 text-sm leading-relaxed font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SellerPolicyPage({ onBackToHome, onAuthClick, onTabChange, initialTab }) {
  const { lang, setLang } = useLanguage();
  const { user, logout } = useContext(ShopContext);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const t = dict[lang] || dict.en;

  // determine which tab to show from initialTab prop
  const tabFromProp = initialTab === 'product-policy'
    ? 'product'
    : initialTab === 'pickup-delivery-policy'
    ? 'delivery'
    : initialTab === 'seller-exchange-return-policy'
    ? 'exchange'
    : 'product';

  const [activeTab, setActiveTab] = useState(tabFromProp);

  const tabs = [
    { key: 'product', label: t.tabs.product, icon: Package, gradient: 'from-[#FF6600] to-orange-400' },
    { key: 'delivery', label: t.tabs.delivery, icon: Truck, gradient: 'from-sky-500 to-cyan-400' },
    { key: 'exchange', label: t.tabs.exchange, icon: RefreshCw, gradient: 'from-teal-500 to-emerald-400' },
  ];

  const content = t[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 font-sans">
      {/* ── HEADER ── */}
      <header className="flex justify-between items-center px-6 sm:px-12 py-4 border-b border-slate-100 bg-white sticky top-0 z-50">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-6">
          <div 
            onClick={onBackToHome} 
            className="cursor-pointer flex items-center gap-3"
          >
            {/* Shopping Bag Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#EC4899] to-[#D946EF] rounded-xl shadow-md">
              <div className="absolute top-1.5 w-4 h-4 border-2 border-white rounded-t-full opacity-90" style={{ borderBottom: 'none' }} />
              <svg className="w-5 h-5 text-white mt-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="leading-none text-left">
              <span className="text-2xl font-black text-[#00A8E8] tracking-tight">Goroly Shop</span>
              <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">{t.sellerCenter}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Log in, Sign up, Country, Language */}
        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-sm font-extrabold text-slate-800">{user.name}</span>
                <span className="block text-[10px] font-bold text-slate-400 capitalize">{user.role}</span>
              </div>
              {user.role === 'seller' || user.isAdmin ? (
                <button 
                  onClick={() => window.location.href = '/admin'}
                  className="bg-[#FF6600] hover:bg-[#e05a00] text-white px-6 py-2 rounded-full font-bold text-sm transition shadow-md shadow-[#FF6600]/10 flex items-center gap-1.5 cursor-pointer border-0"
                >
                  <LayoutGrid size={13} /> {t.sellerDashboard}
                </button>
              ) : (
                <button 
                  onClick={logout}
                  className="border-2 border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/5 px-5 py-1.5 rounded-full font-bold text-sm transition cursor-pointer bg-white"
                >
                  {t.logOut}
                </button>
              )}
            </div>
          ) : (
            <>
              <button 
                onClick={() => {
                  if (onAuthClick) onAuthClick();
                  else if (onTabChange) onTabChange('page-become-a-seller');
                }}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-full font-bold text-sm transition cursor-pointer border-2 border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/5 bg-white"
              >
                <Lock size={13} /> {t.logIn}
              </button>
              
              <button 
                onClick={() => {
                  if (onTabChange) onTabChange('page-become-a-seller');
                }}
                className="bg-[#FF6600] hover:bg-[#e05a00] text-white px-6 py-2 rounded-full font-bold text-sm transition shadow-md shadow-[#FF6600]/10 cursor-pointer border-0"
              >
                {t.signUp}
              </button>
            </>
          )}

          {/* Country flag selector */}
          <div className="hidden md:flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 transition">
            <span className="text-base" title="Bangladesh">🇧🇩</span>
            <span className="text-xs font-bold">Bangladesh</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition font-bold text-xs bg-transparent border-0 cursor-pointer"
            >
              <span>{lang === 'en' ? 'English' : 'বাংলা'}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {showLangDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                  <button 
                    onClick={() => { setLang('en'); setShowLangDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-[12px] font-semibold hover:bg-orange-50 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'en' ? 'text-[#FF6600]' : 'text-slate-600'}`}
                  >
                    <span>🇬🇧</span> English
                  </button>
                  <button 
                    onClick={() => { setLang('bn'); setShowLangDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-[12px] font-semibold hover:bg-orange-50 flex items-center gap-2 bg-transparent border-0 cursor-pointer ${lang === 'bn' ? 'text-[#FF6600]' : 'text-slate-600'}`}
                  >
                    <span>🇧🇩</span> বাংলা
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </header>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Decorative orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#FF6600]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6600] to-orange-400 items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0 mt-1">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-[#FF6600]/20 text-[#FF6600] text-xs font-black rounded-full uppercase tracking-wider border border-[#FF6600]/30">
                  {t.sellerCenter}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white mb-3">
                {t.pageTitle}
              </h1>
              <p className="text-base text-white/70 font-medium max-w-2xl leading-relaxed">
                {t.pageSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-3">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FF6600] text-white shadow-md shadow-orange-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <TabIcon size={15} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section Hero */}
        <div className="mb-8 flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6600] to-orange-400 items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
            {React.createElement(tabs.find((t) => t.key === activeTab)?.icon || Package, { size: 22, className: 'text-white' })}
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{content.hero}</h2>
            <p className="mt-1 text-slate-500 font-medium text-sm sm:text-base leading-relaxed">{content.heroSub}</p>
          </div>
        </div>

        {/* Quick summary chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {content.sections.map((sec, i) => {
            const Icon = iconMap[sec.icon] || Info;
            const colors = iconColors[sec.icon] || { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100' };
            return (
              <div
                key={i}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                <Icon size={11} />
                {sec.title}
              </div>
            );
          })}
        </div>

        {/* Accordion sections */}
        <div className="space-y-3">
          {content.sections.map((section, i) => (
            <PolicySection key={`${activeTab}-${i}`} section={section} defaultOpen={i === 0} />
          ))}
        </div>

        {/* CTA Footer */}
        <div className="mt-12 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 0% 100%, #FF6600 0%, transparent 60%)' }} />
          <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#FF6600] flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-white mb-1">
                {lang === 'bn' ? 'আরও সাহায্য দরকার?' : 'Need more help?'}
              </h3>
              <p className="text-white/60 font-medium text-sm">
                {lang === 'bn'
                  ? 'আমাদের সেলার সাপোর্ট টিম সর্বদা আপনাকে সাহায্য করতে প্রস্তুত।'
                  : 'Our seller support team is always ready to assist you with any queries.'}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={onBackToHome}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition border border-white/10 hover:border-white/20"
              >
                {lang === 'bn' ? 'হোমে ফিরুন' : 'Back to Home'}
              </button>
              <button
                onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-5 py-2.5 bg-[#FF6600] hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/30"
              >
                {lang === 'bn' ? 'উপরে যান' : 'Back to Top'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
