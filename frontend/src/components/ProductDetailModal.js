'use client';

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShopContext, formatPrice } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Star, Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, Plus, Minus, Phone, ExternalLink, GitCompare } from 'lucide-react';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToWishlist, onBuyNow }) {
  const router = useRouter();
  const { addToCart, currencySymbol, addToCompare, compareList = [] } = useContext(ShopContext);
  const { lang, t } = useLanguage();
  const [qty, setQty] = useState(1);

  if (!isOpen || !product) return null;

  const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);

  const handleAddToCart = () => {
    addToCart(product, qty);
    onClose();
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product, qty);
    } else {
      addToCart(product, qty);
      onClose();
    }
  };

  const whatsappNumber = product.seller_phone || "8801700000000";
  const whatsappMessage = `Hi! I want to order "${product.name}" (Qty: ${qty}, Price: ${formatPrice(finalPrice * qty, currencySymbol)}). Please confirm my order.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const callUrl = `tel:+${whatsappNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl relative overflow-hidden z-10 p-6 sm:p-8 animate-fade-in border border-slate-100 flex flex-col md:flex-row gap-8">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
          <X size={18} />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100">
          <img 
            src={product.image} 
            alt={product.name} 
            className="max-h-[350px] object-contain rounded-xl hover:scale-105 transition duration-300"
          />
        </div>

        {/* Right: Details */}
        <div className="md:w-1/2 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                {product.category}
              </span>
              <span className={`text-xs font-semibold ${product.countInStock > 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                {product.countInStock > 0 ? t('inStock') : t('outOfStock')}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">{product.name}</h2>
            
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-slate-400 text-xs font-semibold">({product.numReviews || 35} {t('customerReviews')})</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-2 pb-2 border-b border-slate-150">
<span className="text-2xl font-black text-slate-900">{formatPrice(finalPrice, currencySymbol)}</span>
                  {product.discountPercent > 0 && (
                    <span className="text-sm text-slate-400 line-through">{formatPrice(product.price, currencySymbol)}</span>
                  )}
            </div>

            <p className="text-[14px] text-slate-500 leading-relaxed pt-2">{product.description}</p>

            <button
              onClick={() => {
                onClose();
                router.push(`/product/${product._id}`);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition pt-1"
            >
              <ExternalLink size={12} />
              {t('viewFullDetails')}
            </button>
          </div>

          {/* Add to Cart Actions */}
          {product.countInStock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('quantity')}</span>
                <div className="flex items-center border border-slate-200 bg-white rounded-lg">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))} 
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition rounded-l-lg"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-700">{qty}</span>
                  <button 
                    onClick={() => setQty(Math.min(product.countInStock, qty + 1))} 
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition rounded-r-lg"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Add to Cart & Buy Now Row */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <ShoppingBag size={16} />
                    {t('addToCart')}
                  </button>
                  
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    {t('buyNow')}
                  </button>

                  <button 
                    onClick={() => {
                      onAddToWishlist(product);
                      onClose();
                    }}
                    className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-red-500 transition"
                  >
                    <Heart size={16} />
                  </button>

                  <button 
                    onClick={() => {
                      addToCompare(product);
                      onClose();
                      alert(lang === 'bn' ? 'তুলনা তালিকায় যোগ করা হয়েছে!' : 'Added to comparison list!');
                    }}
                    className={`p-3 border rounded-xl hover:bg-slate-50 transition ${
                      compareList.some((x) => x._id === product._id)
                        ? 'border-cyan-200 text-cyan-600 bg-cyan-50'
                        : 'border-slate-200 text-slate-400 hover:text-cyan-600'
                    }`}
                    title={t('addToCompare')}
                  >
                    <GitCompare size={16} fill={compareList.some((x) => x._id === product._id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* WhatsApp Order & Call to Order Row */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6c-3.302 0-5.991 2.691-5.991 5.993 0 1.312.427 2.526 1.155 3.514L6.3 20.3l4.908-1.286c.944.515 2.017.809 3.162.809 3.302 0 6.009-2.707 6.009-6.01 0-3.302-2.707-5.992-6.009-5.992zm3.366 8.357c-.12.338-.713.626-1.025.663-.289.034-.666.059-1.072-.119a7.35 7.35 0 0 1-3.21-2.033 6.947 6.947 0 0 1-1.845-2.804c-.172-.416-.01-.734.095-.944.077-.156.173-.263.262-.365.088-.103.14-.15.21-.245.07-.095.053-.177.025-.262-.027-.083-.262-.63-.358-.863-.095-.23-.193-.2-.262-.204h-.226c-.078 0-.21-.03-.323.095-.112.127-.432.42-.432 1.026s.443 1.192.502 1.277c.06.085.871 1.328 2.11 1.865.295.127.525.204.704.262.296.094.566.08.779.049.238-.035.733-.3.837-.59.103-.288.103-.538.072-.59-.03-.049-.111-.082-.236-.144z" />
                    </svg>
                    {t('whatsappOrder')}
                  </a>

                  <a
                    href={callUrl}
                    className="py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                  >
                    <Phone size={14} />
                    {t('callToOrder')}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Shipping & trust indicators */}
          <div className="grid grid-cols-3 gap-2.5 border-t border-slate-100 pt-4 text-[10px] sm:text-xs text-slate-500">
            <div className="flex flex-col items-center text-center space-y-1">
              <Truck size={16} className="text-blue-500" />
              <span className="font-bold text-slate-700">{t('freeDelivery')}</span>
              <span className="text-[10px]">{t('freeDeliveryNote')}</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <RotateCcw size={16} className="text-amber-500" />
              <span className="font-bold text-slate-700">{t('returnPolicy')}</span>
              <span className="text-[10px]">{t('returnNote')}</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="font-bold text-slate-700">{t('secureCheckout')}</span>
              <span className="text-[10px]">{t('secureNote')}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
