'use client';

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShopContext, formatPrice, getImageUrl, calculateFinalPrice } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';

export default function ComparePage() {
  const router = useRouter();
  const { compareList = [], removeFromCompare, addToCart, currencySymbol } = useContext(ShopContext);
  const { lang, t } = useLanguage();
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        onCartClick={() => setCartOpen(true)}
        onAuthClick={() => setAuthOpen(true)}
        onSearchChange={() => {}}
        currentSearch=""
        onTabChange={(tab) => router.push('/')}
        activeTab="shop"
      />
      
      {/* Breadcrumb */}
      <div className="bg-slate-100 py-3 px-4 sm:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900 transition font-semibold">Home</Link>
          <span className="mx-2 text-slate-400">&gt;</span>
          <span className="text-amber-500 font-bold">Compare List</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-8">Compare List</h1>

        {compareList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xs p-12 text-center border border-slate-100">
            <h2 className="text-xl font-bold text-slate-700 mb-2">{t('emptyCompare') || 'Your comparison list is empty!'}</h2>
            <p className="text-slate-500 mb-6">You have no items to compare.</p>
            <Link href="/" className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg transition inline-flex items-center">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <tbody>
                {/* Images & Names & Remove Buttons */}
                <tr className="border-b border-slate-100">
                  <td className="w-48 p-4 align-top font-bold text-slate-600 bg-slate-50 text-sm border-r border-slate-100 uppercase">
                    Name
                  </td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 align-top border-r border-slate-100 relative min-w-[200px]">
                      <button
                        onClick={() => removeFromCompare(p._id)}
                        className="absolute right-4 top-4 p-1 text-amber-500 hover:text-amber-600 border border-amber-200 hover:border-amber-400 bg-amber-50 transition rounded-sm cursor-pointer"
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                      <div className="flex flex-col items-center pt-6">
                        <img 
                          src={getImageUrl(p.image)} 
                          alt={p.name} 
                          className="h-32 object-contain mb-4" 
                        />
                        <h3 className="font-bold text-slate-800 text-sm text-center leading-snug">
                          {p.name}
                        </h3>
                      </div>
                    </td>
                  ))}
                  {/* Fill empty columns if less than 3 products */}
                  {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, i) => (
                    <td key={`empty-name-${i}`} className="p-4 border-r border-slate-100 min-w-[200px] bg-white"></td>
                  ))}
                </tr>

                {/* Price */}
                <tr className="border-b border-slate-100">
                  <td className="w-48 p-4 font-bold text-slate-600 bg-slate-50 text-sm border-r border-slate-100 uppercase">
                    Price
                  </td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 border-r border-slate-100 font-bold text-slate-800">
                      {formatPrice(calculateFinalPrice(p), currencySymbol)}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, i) => (
                    <td key={`empty-price-${i}`} className="p-4 border-r border-slate-100 bg-white"></td>
                  ))}
                </tr>

                {/* Brand */}
                <tr className="border-b border-slate-100">
                  <td className="w-48 p-4 font-bold text-slate-600 bg-slate-50 text-sm border-r border-slate-100 uppercase">
                    Brand
                  </td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 border-r border-slate-100 font-semibold text-slate-700">
                      {p.brand || '-'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, i) => (
                    <td key={`empty-brand-${i}`} className="p-4 border-r border-slate-100 bg-white"></td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-b border-slate-100">
                  <td className="w-48 p-4 font-bold text-slate-600 bg-slate-50 text-sm border-r border-slate-100 uppercase">
                    Category
                  </td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 border-r border-slate-100 font-semibold text-slate-700">
                      {p.category || '-'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, i) => (
                    <td key={`empty-category-${i}`} className="p-4 border-r border-slate-100 bg-white"></td>
                  ))}
                </tr>

                {/* Add To Cart */}
                <tr>
                  <td className="w-48 p-4 bg-slate-50 border-r border-slate-100">
                  </td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 border-r border-slate-100 text-center bg-white">
                      <button
                        onClick={() => {
                          addToCart(p, 1);
                          alert(lang === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
                        }}
                        disabled={p.countInStock <= 0}
                        className="inline-block px-8 py-2.5 bg-[#FFB800] hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 font-bold rounded-md transition cursor-pointer border-0 shadow-sm text-sm"
                      >
                        {p.countInStock > 0 ? 'Add To Cart' : (t('outOfStock') || 'Out of Stock')}
                      </button>
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, i) => (
                    <td key={`empty-cart-${i}`} className="p-4 border-r border-slate-100 bg-white"></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onAuthTrigger={() => setAuthOpen(true)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <Footer onTabChange={(tab) => router.push('/')} />
    </div>
  );
}
