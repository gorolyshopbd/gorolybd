'use client';

import React from 'react';
import { Tag, ShieldCheck, CreditCard, Truck } from 'lucide-react';

const features = [
  {
    icon: Tag,
    iconBg: 'from-[#FF6600] to-[#ff8a1f]',
    shadow: 'shadow-orange-500/25',
    title: 'Competitive Price',
    subtitle: 'Get The Best Prices Everyday',
  },
  {
    icon: ShieldCheck,
    iconBg: 'from-violet-600 to-fuchsia-400',
    shadow: 'shadow-violet-500/25',
    title: 'Authentic Products',
    subtitle: 'Secured with Brand Warranty',
  },
  {
    icon: CreditCard,
    iconBg: 'from-emerald-600 to-teal-400',
    shadow: 'shadow-emerald-500/25',
    title: 'Easy & Secured Payment',
    subtitle: 'Pre-payment, Cash on Delivery',
  },
  {
    icon: Truck,
    iconBg: 'from-blue-600 to-sky-400',
    shadow: 'shadow-blue-500/25',
    title: 'Fast Delivery',
    subtitle: 'Rapid delivery At Your Doorstep',
  },
];

export default function FeatureStrip() {
  return (
    <section className="w-full bg-white border-y border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-3 divide-x-0 lg:divide-x divide-slate-100">
          {features.map(({ icon: Icon, iconBg, shadow, title, subtitle }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 sm:gap-4 px-2.5 sm:px-5 lg:px-6 py-2.5 group cursor-default"
            >
              {/* Icon with gradient background */}
              <div
                className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-lg ${shadow} transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-105`}
              >
                <Icon size={21} className="text-white" strokeWidth={2.35} />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="text-[13px] sm:text-sm font-extrabold text-slate-800 leading-tight">
                  {title}
                </p>
                <p className="text-[11px] sm:text-[13px] text-slate-500 font-semibold mt-1 leading-snug">
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
