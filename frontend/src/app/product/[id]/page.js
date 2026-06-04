'use client';

import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShopContext, getImageUrl, formatPrice, calculateFinalPrice, formatDiscountLabel } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import Head from 'next/head';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import FloatingCartButton from '@/components/FloatingCartButton';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import { Star, Heart, ShoppingBag, Truck, RotateCcw, RefreshCw, CreditCard, ShieldCheck, Plus, Minus, Phone, ArrowLeft, GitCompare, Tag } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, user, API_URL, currencySymbol, addToCompare, compareList = [] } = useContext(ShopContext);
  const { lang, t } = useLanguage();
  const imageContainerRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);

  // Review States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(t('reviewSuccess'));
        setReviewComment('');
        setReviewRating(5);
        // Refresh product details
        const prodRes = await fetch(`${API_URL}/products/${id}`);
        if (prodRes.ok) {
          setProduct(await prodRes.json());
        }
      } else {
        alert(data.message || t('reviewFailed'));
      }
    } catch (error) {
      console.error(error);
      alert(t('reviewError'));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMouseMove = (e) => {
    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.5)' });
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
    setIsZoomed(false);
  };

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setSelectedImageIndex(0);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProduct();
  }, [id, API_URL]);

  // Set document title from product meta
  useEffect(() => {
    if (!product) return;
    document.title = product.metaTitle || product.name || 'Product - Goroly Shop';
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const loadRelated = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${product._id}/related`);
        if (res.ok) {
          setRelatedProducts(await res.json());
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };
    loadRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const allImages = product
    ? Array.from(new Set([
        product.image,
        ...(Array.isArray(product.images) ? product.images : [])
      ])).filter((img) => img && typeof img === 'string' && img.trim() !== '')
    : [];

  const finalPrice = product ? calculateFinalPrice(product) : 0;
  const deliveryDays = Number(product?.shippingDays || product?.shipping_days || 2);
  const paymentText = product?.cashOnDelivery === false ? 'Online Payment' : 'COD Available';
  const productInfoRows = [
    { label: 'Return', value: '3 Days', icon: RotateCcw },
    { label: 'Exchange', value: '3 Days', icon: RefreshCw },
    { label: 'Delivery Time', value: `${deliveryDays || 2} Days`, icon: Truck },
    { label: 'Payment', value: paymentText, icon: CreditCard },
  ];

  const whatsappNumber = (product && product.seller_phone) || '8801700000000';
  const whatsappMessage = product
    ? `Hi! I want to order "${product.name}" (Qty: ${qty}, Price: ${formatPrice(finalPrice * qty, currencySymbol)}). Please confirm my order.`
    : '';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const callUrl = `tel:+${whatsappNumber}`;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, qty);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, qty);
      setCartOpen(true);
    }
  };

  const productJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: getImageUrl(product.image),
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand || 'Goroly Shop' },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gorolyshop.com'}/product/${product._id}`,
      priceCurrency: 'BDT', // Change if different default
      price: finalPrice,
      availability: product.countInStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  } : null;

  return (
    <div className="storefront-shell flex flex-col min-h-screen bg-slate-50">
      <Head>
        <title>{product?.metaTitle || product?.name || 'Product - Goroly Shop'}</title>
        <meta name="description" content={product?.metaDescription || (product?.description ? product.description.slice(0,160) : '')} />
        <meta name="keywords" content={product?.metaKeywords || (product?.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : '')} />
        <meta property="og:title" content={product?.metaTitle || product?.name || 'Product'} />
        <meta property="og:description" content={product?.metaDescription || (product?.description ? product.description.slice(0,160) : '')} />
        <meta property="og:image" content={product?.metaImage ? getImageUrl(product.metaImage) : product?.image ? getImageUrl(product.image) : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product?.metaTitle || product?.name || 'Product - Goroly Shop'} />
        <meta name="twitter:description" content={product?.metaDescription || (product?.description ? product.description.slice(0,160) : '')} />
        <meta name="twitter:image" content={product?.metaImage ? getImageUrl(product.metaImage) : product?.image ? getImageUrl(product.image) : ''} />
        {productJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
          />
        )}
      </Head>
      <Header
        onCartClick={() => setCartOpen(true)}
        onAuthClick={() => setAuthOpen(true)}
        onSearchChange={() => {}}
        currentSearch=""
        onTabChange={(tab) => router.push('/')}
        activeTab="shop"
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !product ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-slate-400 font-medium">{t('productNotFound')}</p>
            <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm">
              {t('backToShop')}
            </button>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <button onClick={() => router.push('/')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-semibold mb-4 transition">
              <ArrowLeft size={14} /> {t('backToStore')}
            </button>

            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white/95 backdrop-blur-lg p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left: Images */}
                <div className="lg:w-1/2 space-y-4">
                  <div
                    ref={imageContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100 relative overflow-hidden cursor-crosshair w-full aspect-square sm:aspect-[4/3] lg:aspect-square"
                  >
                    {product.discountPercent > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-md z-10">
                        {formatDiscountLabel(product, currencySymbol)}
                      </span>
                    )}
                    <div className={`w-full h-full flex items-center justify-center ${isZoomed ? '' : ''}`}>
                      <img
                        src={getImageUrl(allImages[selectedImageIndex] || product.image)}
                        alt={product?.image_alt || product.name}
                        title={product?.image_alt || product.name}
                        fetchpriority="high"
                        decoding="async"
                        style={isZoomed ? zoomStyle : {}}
                        className={`w-full h-full object-contain rounded-xl transition-transform duration-200 ease-out ${isZoomed ? '' : ''}`}
                      />
                    </div>
                  </div>
                  {allImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden transition ${
                            selectedImageIndex === idx
                              ? 'border-blue-500 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={getImageUrl(img)} alt={`${product.name} thumbnail ${idx+1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="lg:w-1/2 flex flex-col space-y-4 sm:space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                      <span className={`text-xs font-semibold ${product.countInStock > 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {product.countInStock > 0 ? t('inStock') : t('outOfStock')}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 leading-tight">{product.name}</h1>

                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <span className="text-slate-400 text-xs font-semibold">{t('reviewsCount', { count: product.numReviews || 0 })}</span>
                    </div>

                    <div className="flex items-baseline gap-2 pb-2 border-b border-slate-100 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">{formatPrice(finalPrice, currencySymbol)}</span>
                      {product.discountPercent > 0 && (
                        <>
                          <span className="text-sm text-slate-400 line-through">{formatPrice(product.price, currencySymbol)}</span>
                          <span className="text-xs font-extrabold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                            Save {formatDiscountLabel(product, currencySymbol).replace('-', '')}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-[14px] text-slate-500 leading-relaxed">{product.description}</p>

                    {product.brand && (
                      <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-700 shadow-sm">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#FF6600]/10 text-[#FF6600]">
                          <Tag size={12} />
                        </span>
                        <span className="text-slate-400">{t('brandLabel')}</span>
                        <span>{product.brand}</span>
                      </div>
                    )}

                    <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-3 text-sm text-slate-800 shadow-sm">
                      <div className="grid gap-1.5">
                        {productInfoRows.map(({ label, value, icon: Icon }) => (
                          <div key={label} className="flex items-center gap-2 leading-tight">
                            <Icon size={15} className="shrink-0 text-slate-700" />
                            <span>
                              <span className="font-black text-slate-950">{label}</span>
                              <span className="font-semibold"> : {value}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Actions */}
                  {product.countInStock > 0 && (
                    <div className="space-y-3 sm:space-y-4 pt-2">
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
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            onClick={handleAddToCart}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                          >
                            <ShoppingBag size={16} />
                            <span className="sm:inline hidden">{t('addToCart')}</span>
                            <span className="sm:hidden inline">{t('myCart')}</span>
                          </button>

                          <button
                            onClick={handleBuyNow}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                          >
                            {t('buyNow')}
                          </button>

                          <button
                            onClick={() => {
                              setWishlist((prev) => {
                                if (prev.find((x) => x._id === product._id)) {
                                  return prev.filter((x) => x._id !== product._id);
                                }
                                return [...prev, product];
                              });
                            }}
                            className={`p-3 border rounded-xl hover:bg-slate-50 transition ${
                              wishlist.some((x) => x._id === product._id)
                                ? 'border-red-200 text-red-500 bg-red-50'
                                : 'border-slate-200 text-slate-400 hover:text-red-500'
                            }`}
                          >
                            <Heart size={16} fill={wishlist.some((x) => x._id === product._id) ? 'currentColor' : 'none'} />
                          </button>

                          <button
                            onClick={() => {
                              addToCompare(product);
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

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12.031 6c-3.302 0-5.991 2.691-5.991 5.993 0 1.312.427 2.526 1.155 3.514L6.3 20.3l4.908-1.286c.944.515 2.017.809 3.162.809 3.302 0 6.009-2.707 6.009-6.01 0-3.302-2.707-5.992-6.009-5.992zm3.366 8.357c-.12.338-.713.626-1.025.663-.289.034-.666.059-1.072-.119a7.35 7.35 0 0 1-3.21-2.033 6.947 6.947 0 0 1-1.845-2.804c-.172-.416-.01-.734.095-.944.077-.156.173-.263.262-.365.088-.103.14-.15.21-.245.07-.095.053-.177.025-.262-.027-.083-.262-.63-.358-.863-.095-.23-.193-.2-.262-.204h-.226c-.078 0-.21-.03-.323.095-.112.127-.432.42-.432 1.026s.443 1.192.502 1.277c.06.085.871 1.328 2.11 1.865.295.127.525.204.704.262.296.094.566.08.779.049.238-.035.733-.3.837-.59.103-.288.103-.538.072-.59-.03-.049-.111-.082-.236-.144z" />
                            </svg>
                            <span className="sm:inline hidden">{t('whatsappOrder')}</span>
                            <span className="sm:hidden inline">{t('whatsappOrder')}</span>
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

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-[10px] text-slate-500">
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

            {/* YouTube Video Section */}
            {product.youtubeUrl && (
              <div className="mt-8 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-800">{t('productVideo')}</h3>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-slate-100">
                  {(() => {
                    const getYouTubeId = (url) => {
                      if (!url) return null;
                      const cleanUrl = url.trim();
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
                      const match = cleanUrl.match(regExp);
                      if (match && match[2] && match[2].trim().length === 11) {
                        return match[2].trim();
                      }
                      try {
                        const urlObj = new URL(cleanUrl);
                        if (urlObj.hostname.includes('youtube.com')) {
                          if (urlObj.pathname.startsWith('/shorts/')) {
                            return urlObj.pathname.split('/')[2];
                          }
                          return urlObj.searchParams.get('v');
                        }
                        if (urlObj.hostname.includes('youtu.be')) {
                          return urlObj.pathname.substring(1);
                        }
                      } catch (err) {}
                      return null;
                    };
                    const ytId = getYouTubeId(product.youtubeUrl);
                    if (ytId) {
                      return (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1`}
                          className="w-full h-full"
                          title={`${product.name} Video`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      );
                    }
                    return (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
                        {t('invalidVideoUrl')}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="mt-12 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">{t('customerReviewsTitle')}</h2>
                  <p className="text-slate-500 text-xs mt-1">{t('reviewsSub')}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                  <div className="text-3xl font-black text-slate-900">{Number(product.rating || 0).toFixed(1)}</div>
                  <div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{t('reviewsCount', { count: product.numReviews || 0 })}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Review Auto-Scroll Column */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 mb-2">{t('recentReviews')}</h3>
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="relative overflow-hidden h-[300px] border border-slate-100 rounded-2xl bg-slate-50/50 p-4">
                      {/* CSS Keyframes for vertical scrolling */}
                      <style dangerouslySetInnerHTML={{__html: `
                        @keyframes verticalScroll {
                          0% { transform: translateY(0); }
                          100% { transform: translateY(-50%); }
                        }
                        .scroll-container {
                          animation: verticalScroll 25s linear infinite;
                        }
                        .scroll-container:hover {
                          animation-play-state: paused;
                        }
                      `}} />
                      
                      <div className="absolute inset-0 overflow-hidden">
                        {/* Duplicate lists for infinite marquee effect */}
                        <div className="scroll-container space-y-3 py-2">
                          {[...product.reviews, ...product.reviews].map((rev, idx) => (
                            <div key={idx} className="p-4 bg-white border border-slate-100 rounded-xl space-y-2 shadow-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 text-xs sm:text-sm">{rev.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                              </div>
                              <div className="flex text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={10} fill={i < rev.rating ? 'currentColor' : 'none'} />
                                ))}
                              </div>
                              <p className="text-xs text-slate-650 font-medium leading-relaxed">{rev.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none z-10" />
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-10" />
                    </div>
                  ) : (
                    <div className="p-12 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-semibold text-sm">
                      {t('noReviews')}
                    </div>
                  )}
                </div>

                {/* Review Submission Column */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{t('writeReview')}</h3>
                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('yourRating')}</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="text-amber-400 hover:scale-110 transition"
                            >
                              <Star size={24} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('comment')}</label>
                        <textarea
                          rows="4"
                          required
                          placeholder={t('placeholderReview')}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 text-xs leading-relaxed"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-md shadow-blue-500/10 text-xs uppercase tracking-wider active:scale-95"
                      >
                        {reviewSubmitting ? t('submitting') : t('submitReview')}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-xs text-slate-500 font-bold">{t('loginToReview')}</p>
                      <button
                        onClick={() => setAuthOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition"
                      >
                        {t('loginSignUp')}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-extrabold text-slate-800 mb-6">{t('relatedProducts')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((rp) => {
                    const rpFinal = calculateFinalPrice(rp);
                    return (
                      <div
                        key={rp._id}
                        onClick={() => router.push(`/product/${rp._id}`)}
                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden group shadow-sm hover:shadow-xl hover:border-slate-200 transition duration-300 cursor-pointer"
                      >
                        <div className="relative pt-[100%] overflow-hidden">
                          {rp.discountPercent > 0 && (
                            <span className="absolute top-3 left-3 bg-red-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-md z-10">
                              {formatDiscountLabel(rp, currencySymbol)}
                            </span>
                          )}
                          <img
                            src={getImageUrl(rp.image)}
                            alt={rp.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        </div>
                        <div className="p-4 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{rp.category}</span>
                          <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{rp.name}</h3>
                          <div className="flex items-center gap-1">
                            <div className="flex text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={10} fill={i < Math.floor(rp.rating || 5) ? 'currentColor' : 'none'} />
                              ))}
                            </div>
                            <span className="text-slate-400 text-[10px]">({rp.numReviews || 0})</span>
                          </div>
                          <div className="flex items-baseline gap-1.5 pt-1">
                            <span className="text-base font-extrabold text-slate-900">{formatPrice(rpFinal, currencySymbol)}</span>
                            {rp.discountPercent > 0 && (
                              <span className="text-xs text-slate-400 line-through">{formatPrice(rp.price, currencySymbol)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onAuthTrigger={() => setAuthOpen(true)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <FloatingCartButton onClick={() => setCartOpen(true)} hidden={cartOpen} />
      <Footer onTabChange={(tab) => router.push('/')} />
    </div>
  );
}
