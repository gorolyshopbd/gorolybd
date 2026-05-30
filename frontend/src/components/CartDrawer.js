'use client';

import React, { useContext, useState, useEffect } from 'react';
import { ShopContext, getImageUrl, formatPrice } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Trash2, ShoppingBag, Plus, Minus, Tag, CreditCard, Ship, CheckCircle, Smartphone, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isOpen, onClose, onAuthTrigger }) {
  const router = useRouter();
  const {
    user,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQty,
    coupon,
    applyCouponCode,
    setCoupon,
    placeOrder,
    sendOtpCode,
    verifyOtpCode,
    fetchAvailableCoupons,
    API_URL,
    currencySymbol,
  } = useContext(ShopContext);
  const { t } = useLanguage();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, shipping, payment, success
  const [shippingInfo, setShippingInfo] = useState({
    name: 'John Doe',
    address: '123 Main Street',
    city: 'Dhaka',
    postalCode: '1212',
    phone: '+8801712345678',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Shipping method states
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Available coupons for dropdown
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Advance payment settings
  const [advancePaymentEnabled, setAdvancePaymentEnabled] = useState(false);
  const [advancePaymentThreshold, setAdvancePaymentThreshold] = useState(1000);
  const [advancePaymentPercent, setAdvancePaymentPercent] = useState(50);

  // Checkout OTP enabled setting (from admin)
  const [checkoutOtpEnabled, setCheckoutOtpEnabled] = useState(true);

  const fetchShippingMethods = async () => {
    try {
      const res = await fetch(`${API_URL}/shipping`);
      if (res.ok) {
        const data = await res.json();
        setShippingMethods(data);
        if (data.length > 0) {
          setSelectedShipping(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchShippingMethods();
      fetchAvailableCoupons().then(setAvailableCoupons);
      fetch(`${API_URL}/settings/public`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (d) {
            setAdvancePaymentEnabled(d.advancePaymentEnabled || false);
            setAdvancePaymentThreshold(d.advancePaymentThreshold || 1000);
            setAdvancePaymentPercent(d.advancePaymentPercent || 50);
            // If admin disabled checkout OTP, auto-verify phone
            const otpOn = d.checkoutOtpEnabled !== false;
            setCheckoutOtpEnabled(otpOn);
            if (!otpOn) {
              setPhoneVerified(true);
            }
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const itemsPrice = cartItems.reduce((acc, item) => {
    const finalPrice = item.price * (1 - (item.discountPercent || 0) / 100);
    return acc + finalPrice * item.qty;
  }, 0);

  const shippingPrice = selectedShipping ? selectedShipping.price : 0;
  const discountPrice = coupon ? (itemsPrice * coupon.discount) / 100 : 0;
  const totalPrice = itemsPrice + shippingPrice - discountPrice;

  const needsAdvancePayment = advancePaymentEnabled && totalPrice > advancePaymentThreshold;
  const advanceAmount = needsAdvancePayment ? (totalPrice * advancePaymentPercent) / 100 : 0;

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;

    const res = await applyCouponCode(couponCode);
    if (res.success) {
      setCouponSuccess(t('couponAppliedSuccess', { discount: res.discount }));
    } else {
      setCouponError(res.error || t('couponApplyFailed'));
    }
  };

  const handleQtyChange = (item, diff) => {
    const newQty = item.qty + diff;
    if (newQty <= 0) {
      removeFromCart(item.product);
    } else {
      updateCartQty(item.product, Math.min(item.countInStock, newQty));
    }
  };

  const handleSendOtp = async (method = 'sms') => {
    if (!shippingInfo.phone || shippingInfo.phone.trim().length < 10) {
      setOtpError(t('enterValidPhone'));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    setPhoneVerified(false);
    const res = await sendOtpCode('phone', shippingInfo.phone, method);
    setOtpLoading(false);
    if (res.success) {
      setOtpSent(true);
      setOtpSuccess(method === 'call' ? 'Calling your phone with OTP...' : t('otpSentSuccess'));
    } else {
      setOtpError(res.error || t('otpSendFailed'));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError(t('enterOtpCode'));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    const res = await verifyOtpCode('phone', shippingInfo.phone, otpCode);
    setOtpLoading(false);
    if (res.success) {
      setPhoneVerified(true);
      setOtpSuccess(t('phoneVerifiedSuccess'));
      setOtpError('');
    } else {
      setOtpError(res.error || t('invalidOtpCode'));
    }
  };

  const handleSubmitOrder = async () => {
    if (checkoutOtpEnabled && !phoneVerified) {
      alert(t('verifyPhoneAlert'));
      return;
    }
    setPlacing(true);
    const orderInfo = {
      ...shippingInfo,
      advancePayment: needsAdvancePayment,
      advanceAmount: needsAdvancePayment ? advanceAmount : 0,
    };
    const res = await placeOrder(orderInfo, paymentMethod, selectedShipping);
    setPlacing(false);
    if (res.success) {
      setPlacedOrder(res.order);
      setCheckoutStep('success');
    } else {
      alert(res.error || t('orderPlaceError'));
    }
  };

  const handleItemClick = (productId) => {
    onClose();
    router.push(`/product/${productId}`);
  };

  // Step indicator details
  const steps = [
    { id: 'cart', label: t('myCart'), icon: ShoppingBag },
    { id: 'shipping', label: t('shipping'), icon: Ship },
    { id: 'payment', label: t('payment'), icon: CreditCard },
    { id: 'success', label: t('success'), icon: CheckCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 w-full flex">
        <div className="w-full bg-slate-50 shadow-2xl flex flex-col h-full overflow-y-auto animate-fade-in relative">
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="p-1.5 bg-orange-50 text-[#FF6600] rounded-lg">
                  <ShoppingBag size={20} />
                </span>
                {t('secureCheckoutTitle')}
              </h2>
              <p className="text-slate-400 text-xs font-semibold">{t('encryptedCheckout')}</p>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition duration-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Checkout Progression Bar */}
          <div className="bg-white border-b border-slate-200 py-4 px-6 sticky top-[85px] z-10">
            <div className="max-w-xl mx-auto flex items-center justify-between relative">
              {steps.map((s, idx) => {
                const StepIcon = s.icon;
                const isCompleted = steps.findIndex((x) => x.id === checkoutStep) >= idx;
                const isActive = checkoutStep === s.id;
                return (
                  <div key={s.id} className="flex items-center flex-grow last:flex-grow-0">
                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${
                          isCompleted 
                            ? 'bg-[#FF6600] border-[#FF6600] text-white shadow-md shadow-[#FF6600]/20' 
                            : 'bg-white border-slate-200 text-slate-400'
                        } ${isActive ? 'ring-4 ring-orange-100 scale-110' : ''}`}
                      >
                        <StepIcon size={14} />
                      </div>
                      <span className={`text-[10px] font-bold ${isCompleted ? 'text-[#FF6600]' : 'text-slate-400'}`}>{s.label}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="flex-grow h-0.5 mx-2 bg-slate-100 relative">
                        <div 
                          className="absolute inset-y-0 left-0 bg-[#FF6600] transition-all duration-500" 
                          style={{ width: steps.findIndex((x) => x.id === checkoutStep) > idx ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="flex-grow px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full">
            
            {/* STEP 1: CART ITEMS LIST */}
            {checkoutStep === 'cart' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {cartItems.length === 0 ? (
                  <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
                    <div className="p-6 bg-orange-50 text-[#FF6600] rounded-3xl animate-pulse">
                      <ShoppingBag size={56} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800">{t('cartEmpty')}</h3>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto">{t('cartEmptyNote')}</p>
                    </div>
                    <button 
                      onClick={onClose} 
                      className="px-6 py-3 font-bold text-white bg-[#FF6600] hover:bg-[#e05a00] rounded-xl transition duration-300 shadow-lg shadow-[#FF6600]/25 flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      {t('startShopping')}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex justify-between items-center bg-white px-5 py-3 rounded-2xl border border-slate-200/60">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{t('productDetails')}</span>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{cartItems.length} {t('items')}</span>
                      </div>
                      
                      <div className="space-y-3">
                        {cartItems.map((item) => {
                          const finalPrice = item.price * (1 - (item.discountPercent || 0) / 100);
                          return (
                            <div key={item.product} className="flex gap-4 p-4 rounded-2xl border border-slate-200/60 bg-white hover:shadow-md transition duration-300 group">
                              <img 
                                src={getImageUrl(item.image)} 
                                alt={item.name} 
                                onClick={() => handleItemClick(item.product)}
                                className="w-20 h-20 object-cover rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:opacity-90 transition duration-300" 
                              />
                              <div className="flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                  <h4 
                                    onClick={() => handleItemClick(item.product)}
                                    className="text-sm font-extrabold text-slate-850 line-clamp-2 hover:text-blue-650 cursor-pointer transition duration-205"
                                  >
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-base font-black text-slate-900">{formatPrice(finalPrice, currencySymbol)}</span>
                                    {item.discountPercent > 0 && (
                                      <>
                                        <span className="text-xs text-slate-400 line-through">{formatPrice(item.price, currencySymbol)}</span>
                                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">-{item.discountPercent}%</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                                  <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-lg">
                                    <button 
                                      onClick={() => handleQtyChange(item, -1)} 
                                      className="p-1.5 px-2.5 text-slate-550 hover:text-slate-900 transition hover:bg-slate-100 rounded-l-lg"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="px-3 text-xs font-black text-slate-800">{item.qty}</span>
                                    <button 
                                      onClick={() => handleQtyChange(item, 1)} 
                                      className="p-1.5 px-2.5 text-slate-550 hover:text-slate-900 transition hover:bg-slate-100 rounded-r-lg"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>

                                  <button 
                                    onClick={() => removeFromCart(item.product)} 
                                    className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition duration-300"
                                    title="Delete product"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order summary right side */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sticky top-[200px] shadow-xs space-y-5">
                        <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3 text-sm sm:text-base">{t('orderSummary')}</h3>
                        
                        {/* Coupon Selection */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('haveCoupon')}</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Tag className="absolute left-3 top-3 text-slate-400" size={14} />
                              <select
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] appearance-none font-bold"
                              >
                                <option value="">{t('selectCode')}</option>
                                {availableCoupons.map((c) => (
                                  <option key={c._id} value={c.code}>{c.code} ({c.discount}% OFF)</option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={handleApplyCoupon}
                              disabled={!couponCode || !!coupon}
                              className={`px-4 py-2.5 font-bold rounded-xl text-xs transition duration-300 ${
                                coupon
                                  ? 'bg-emerald-500 text-white cursor-not-allowed'
                                  : 'bg-[#FF6600] hover:bg-[#e05a00] text-white shadow-md shadow-[#FF6600]/25'
                              }`}
                            >
                              {coupon ? t('applied') : t('apply')}
                            </button>
                          </div>
                          {coupon && (
                            <button
                              onClick={() => { setCoupon(null); setCouponCode(''); setCouponSuccess(''); setCouponError(''); }}
                              className="text-[10px] text-red-500 font-bold hover:underline block"
                            >
                              {t('remove')} {coupon.code} {t('coupon')}
                            </button>
                          )}
                          {couponError && <p className="text-red-500 text-[10px] font-semibold mt-1">{couponError}</p>}
                          {couponSuccess && <p className="text-emerald-600 text-[10px] font-semibold mt-1">{couponSuccess}</p>}
                        </div>

                        {/* Calculations */}
                        <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                          <div className="flex justify-between text-slate-500 font-medium">
                            <span>{t('subtotal')}</span>
                            <span className="font-extrabold text-slate-900">{formatPrice(itemsPrice, currencySymbol)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 font-medium">
                            <span>{t('shippingCost')}</span>
                            <span className="font-extrabold text-slate-900">{shippingPrice === 0 ? t('free') : formatPrice(shippingPrice, currencySymbol)}</span>
                          </div>
                          {coupon && (
                            <div className="flex justify-between text-emerald-600 font-semibold">
                              <span>{t('couponDiscount')}</span>
                              <span>-{formatPrice(Math.abs(discountPrice), currencySymbol)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-800 border-t border-slate-100 pt-3 text-sm font-extrabold">
                            <span>{t('totalPrice')}</span>
                            <span className="text-lg font-black text-[#FF6600]">{formatPrice(totalPrice, currencySymbol)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!user) {
                              onAuthTrigger();
                            } else {
                              setCheckoutStep('shipping');
                            }
                          }}
                          className="w-full py-3.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-extrabold rounded-2xl shadow-lg shadow-[#FF6600]/25 transition duration-300 flex items-center justify-center gap-2 text-sm"
                        >
                          {t('checkout')}
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 2: SHIPPING INFO & METHOD */}
            {checkoutStep === 'shipping' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 border-l-4 border-l-[#FF6600] p-6 space-y-6 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="w-1 h-5 rounded-full bg-[#FF6600] inline-block"></span>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{t('shippingAddress')}</h3>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{t('shippingAddressNote')}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500">{t('fullName')}</label>
                      <input
                        type="text"
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent bg-slate-50/50 focus:bg-white transition"
                        placeholder={t('placeholderName')}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">{t('deliveryAddress')}</label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent bg-slate-50/50 focus:bg-white transition"
                        placeholder={t('placeholderAddress')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500">{t('city')}</label>
                        <input
                          type="text"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent bg-slate-50/50 focus:bg-white transition"
                          placeholder={t('placeholderCity')}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">{t('postalCode')}</label>
                        <input
                          type="text"
                          value={shippingInfo.postalCode}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                          className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent bg-slate-50/50 focus:bg-white transition"
                          placeholder={t('placeholderPostalCode')}
                        />
                      </div>
                    </div>
                    
                    {/* OTP verification container */}
                    {checkoutOtpEnabled ? (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                          <Smartphone size={16} className="text-[#FF6600]" />
                          {t('phoneVerification')}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shippingInfo.phone}
                            onChange={(e) => {
                              setShippingInfo({ ...shippingInfo, phone: e.target.value });
                              setPhoneVerified(false);
                              setOtpSent(false);
                              setOtpCode('');
                              setOtpError('');
                              setOtpSuccess('');
                            }}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] bg-white"
                            placeholder={t('placeholderPhone')}
                          />
                           {!otpSent ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleSendOtp('sms')}
                                disabled={otpLoading}
                                className="px-3.5 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white text-xs font-bold rounded-xl transition duration-300 shadow-md shadow-[#FF6600]/25 whitespace-nowrap border-0 cursor-pointer"
                              >
                                {otpLoading ? t('sending') : 'SMS'}
                              </button>
                              <button
                                onClick={() => handleSendOtp('call')}
                                disabled={otpLoading}
                                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition duration-300 shadow-md shadow-slate-900/25 whitespace-nowrap border-0 cursor-pointer"
                              >
                                {otpLoading ? 'Calling...' : 'Call Me'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={handleVerifyOtp}
                              disabled={otpLoading || phoneVerified}
                              className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl transition duration-300 whitespace-nowrap border-0 ${
                                phoneVerified ? 'bg-emerald-500 cursor-default' : 'bg-[#FF6600] hover:bg-[#e05a00]'
                              }`}
                            >
                              {otpLoading ? t('verifying') : phoneVerified ? t('verified') : t('verify')}
                            </button>
                          )}
                        </div>
                        {otpSent && !phoneVerified && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              placeholder={t('enterOtp')}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] bg-white font-mono tracking-widest text-center"
                            />
                          </div>
                        )}
                        {otpError && <p className="text-red-500 text-[10px] font-bold mt-1">{otpError}</p>}
                        {otpSuccess && <p className="text-emerald-600 text-[10px] font-bold mt-1 flex items-center gap-1"><ShieldCheck size={12} />{otpSuccess}</p>}
                      </div>
                    ) : (
                      /* OTP disabled — simple phone input only */
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                          <ShieldCheck size={14} className="text-emerald-500" />
                          Phone Number
                          <span className="ml-auto text-[9px] bg-emerald-100 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-200">OTP Disabled</span>
                        </div>
                        <input
                          type="text"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-400 bg-white"
                          placeholder={t('placeholderPhone')}
                        />
                        <p className="text-[9px] text-emerald-600 font-semibold">✓ Phone verification is not required for this checkout</p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Method Selection */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="w-1 h-5 rounded-full bg-[#FF6600] inline-block"></span>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{t('shippingMethods')}</h3>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{t('shippingMethodNote')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {shippingMethods.map((method) => (
                        <button
                          key={method._id}
                          onClick={() => setSelectedShipping(method)}
                          className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-300 ${
                            selectedShipping?._id === method._id
                              ? 'border-[#FF6600] bg-orange-50/20 ring-2 ring-[#FF6600]/20'
                              : 'border-slate-200 bg-white hover:border-slate-350 shadow-xs'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={selectedShipping?._id === method._id}
                            onChange={() => {}}
                            className="mt-0.5 accent-[#FF6600]"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-extrabold text-slate-800">{method.name}</div>
                              <div className="text-sm font-black text-slate-950">
                                {method.price === 0 ? t('free') : formatPrice(method.price, currencySymbol)}
                              </div>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{method.estimatedDays}</div>
                            {method.description && (
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{method.description}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subtotal & Steps Navigation */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sticky top-[200px] shadow-xs space-y-5">
                    <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3 text-sm sm:text-base font-bold">{t('confirmationSummary')}</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>{t('itemsSubtotal')}</span>
                        <span className="font-extrabold text-slate-900">{formatPrice(itemsPrice, currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>{t('shippingDelivery')}</span>
                        <span className="font-extrabold text-slate-900">{shippingPrice === 0 ? t('free') : formatPrice(shippingPrice, currencySymbol)}</span>
                      </div>
                      {coupon && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>{t('couponDiscount')}</span>
                          <span>-{formatPrice(Math.abs(discountPrice), currencySymbol)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-800 border-t border-slate-100 pt-3 text-sm font-extrabold">
                        <span>{t('grandTotal')}</span>
                        <span className="text-lg font-black text-[#FF6600]">{formatPrice(totalPrice, currencySymbol)}</span>
                      </div>
                    </div>

                    {checkoutOtpEnabled && !phoneVerified && (
                      <p className="text-amber-600 text-[10px] font-bold text-center">
                        {t('otpRequiredWarning')}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={() => setCheckoutStep('cart')}
                        className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1"
                      >
                        <ArrowLeft size={14} />
                        {t('backToCart')}
                      </button>
                      <button 
                        onClick={() => {
                          if (checkoutOtpEnabled && !phoneVerified) {
                            alert(t('verifyPhoneAlert'));
                            return;
                          }
                          setCheckoutStep('payment');
                        }}
                        className={`flex-grow-[2] py-3 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5 ${
                          (!checkoutOtpEnabled || phoneVerified)
                            ? 'bg-[#FF6600] hover:bg-[#e05a00] text-white shadow-lg shadow-[#FF6600]/20'
                            : 'bg-slate-200 text-slate-450 cursor-not-allowed'
                        }`}
                      >
                        {t('nextPayment')}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SECURE CHECKOUT PAYMENT SELECT */}
            {checkoutStep === 'payment' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-6 space-y-6">
                  {needsAdvancePayment && (
                    <div className="p-4 bg-amber-50/70 border border-amber-250 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-800 font-black text-xs sm:text-sm">
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {t('advancePaymentRequired')}
                      </div>
                      <p className="text-xs text-amber-700">
                        {t('advancePaymentPolicy', { threshold: formatPrice(advancePaymentThreshold, currencySymbol), percent: advancePaymentPercent })}
                      </p>
                      <div className="flex justify-between text-xs font-bold text-amber-850 bg-white/70 rounded-xl px-4 py-2.5 border border-amber-100">
                        <span>{t('requiredAdvanceAmount')}:</span>
                        <span className="text-sm font-black">{formatPrice(advanceAmount, currencySymbol)}</span>
                      </div>
                      <p className="text-[10px] text-amber-600">{t('remainingOnDelivery', { remaining: formatPrice(totalPrice - advanceAmount, currencySymbol) })}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3 text-sm sm:text-base">{t('paymentOptions')}</h3>
                    <p className="text-slate-400 text-xs mt-1">{t('paymentOptionsNote')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'Cash on Delivery', name: t('cashOnDelivery'), sub: t('payCashOnDelivery') },
                      { id: 'bKash', name: 'bKash Wallet', sub: t('instantMobilePayment') },
                      { id: 'Nagad', name: 'Nagad Wallet', sub: t('fastMobileBanking') },
                      { id: 'SSLCommerz', name: 'SSLCommerz Gateway', sub: t('gatewayMethods') },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-300 ${
                          paymentMethod === method.id 
                            ? 'border-[#FF6600] bg-orange-50/20 ring-2 ring-[#FF6600]/20' 
                            : 'border-slate-200 bg-white hover:border-slate-350 shadow-xs'
                        }`}
                      >
                        <input 
                          type="radio" 
                          checked={paymentMethod === method.id} 
                          onChange={() => {}} 
                          className="mt-1 accent-[#FF6600]" 
                        />
                        <div>
                          <div className="text-sm font-extrabold text-slate-800">{method.name}</div>
                          <div className="text-xs text-slate-450 mt-1">{method.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotal & Confirmation order button */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sticky top-[200px] shadow-xs space-y-5">
                    <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3 text-sm sm:text-base">{t('finalCheckout')}</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>{t('itemsSubtotal')}</span>
                        <span className="font-bold text-slate-850">{formatPrice(itemsPrice, currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>{t('shippingDelivery')}</span>
                        <span className="font-bold text-slate-850">{shippingPrice === 0 ? t('free') : formatPrice(shippingPrice, currencySymbol)}</span>
                      </div>
                      {coupon && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>{t('discountApplied')}</span>
                          <span>-{formatPrice(Math.abs(discountPrice), currencySymbol)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-850 border-t border-slate-100 pt-3 text-sm font-extrabold">
                        <span>{t('totalPayable')}</span>
                        <span className="text-lg font-black text-[#FF6600]">{formatPrice(totalPrice, currencySymbol)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => setCheckoutStep('shipping')}
                        className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1"
                      >
                        <ArrowLeft size={14} />
                        {t('back')}
                      </button>
                      <button 
                        onClick={handleSubmitOrder}
                        disabled={placing}
                        className="flex-grow-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/25 transition text-xs flex items-center justify-center gap-1.5"
                      >
                        {placing ? t('placingOrder') : t('confirmOrder')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS VIEW */}
            {checkoutStep === 'success' && placedOrder && (
              <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200/60 p-8 shadow-md flex flex-col items-center justify-center text-center space-y-6 animate-fade-in py-10">
                <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full animate-bounce">
                  <CheckCircle size={56} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">{t('thankYou')}</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {t('orderPlacedNote', { orderId: placedOrder._id?.substring(0, 8) })}
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left w-full space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('orderStatus')}</span>
                    <span className="font-extrabold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded">{t('pendingConfirmation')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('paymentSelection')}</span>
                    <span className="font-bold text-slate-800">{placedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('deliveryMethod')}</span>
                    <span className="font-bold text-slate-800">{placedOrder.shippingMethod?.name || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-3">
                    <span className="text-slate-450 font-bold">{t('totalBill')}</span>
                    <span className="font-black text-slate-900 text-sm">{formatPrice(placedOrder.totalPrice, currencySymbol)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCheckoutStep('cart');
                    onClose();
                  }}
                  className="w-full py-3.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-extrabold rounded-2xl shadow-lg shadow-[#FF6600]/25 transition duration-300"
                >
                  {t('continueShopping')}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
