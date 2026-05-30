'use client';

import React from 'react';
import { Tag, ShieldCheck, CreditCard, Truck } from 'lucide-react';

const features = [
  {
    icon: Tag,
    iconBg: 'from-[#ff0066] to-rose-400',
    title: 'Competitive Price',
    subtitle: 'Get The Best Prices Everyday',
  },
  {
    icon: ShieldCheck,
    iconBg: 'from-violet-600 to-purple-400',
    title: 'Authentic Products',
    subtitle: 'Secured with Brand Warranty',
  },
  {
    icon: CreditCard,
    iconBg: 'from-emerald-600 to-teal-400',
    title: 'Easy & Secured Payment',
    subtitle: 'Pre-payment, Cash on Delivery',
  },
  {
    icon: Truck,
    iconBg: 'from-blue-600 to-sky-400',
    title: 'Fast Delivery',
    subtitle: 'Rapid delivery At Your Doorstep',
  },
];

export default function FeatureStrip() {
  return (
    <section className="w-full bg-white border-y border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-slate-100">
          {features.map(({ icon: Icon, iconBg, title, subtitle }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 group cursor-default"
            >
              {/* Icon with gradient background */}
              <div
                className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={20} className="text-white" strokeWidth={2} />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="text-sm sm:text-[13px] font-extrabold text-slate-800 leading-tight">
                  {title}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-tight">
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
