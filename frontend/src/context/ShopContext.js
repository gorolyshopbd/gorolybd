'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@insforge/sdk';

// Helper to safely parse JSON responses without throwing on HTML
const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    // Return null if response is not JSON (e.g., HTML error page)
    return null;
  }
};

export const ShopContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = API_URL.replace('/api', '');

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});

export const formatPrice = (amount, symbol = '$') => {
  const num = Number(amount);
  return isNaN(num) ? `${symbol}0.00` : `${symbol}${num.toFixed(2)}`;
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return `${BASE_URL}${path}`;
  if (path.startsWith('uploads/')) return `${BASE_URL}/${path}`;
  return path;
};

export const ShopProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currencySymbol, setCurrencySymbol] = useState('৳');
  const [currencyCode, setCurrencyCode] = useState('BDT');
  const [payouts, setPayouts] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [sellerSettings, setSellerSettings] = useState({
    category_based_commission: false,
    seller_based_commission: false,
    message_to_seller_mail: true
  });
  const [sellerPackages, setSellerPackages] = useState([]);
  const [onlineSubscriptions, setOnlineSubscriptions] = useState([]);
  const [offlineSubscriptions, setOfflineSubscriptions] = useState([]);
  const [rewardSettings, setRewardSettings] = useState({
    is_enabled: true,
    earn_rate: 1.00,
    redeem_rate: 0.10,
    min_redeem_points: 100
  });
  const [userPoints, setUserPoints] = useState([]);
  const [pointLogs, setPointLogs] = useState([]);
  const [rewardProducts, setRewardProducts] = useState([]);
  const [rtLive, setRtLive] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await insforge.realtime.connect();
      const res = await insforge.realtime.subscribe('dashboard');
      if (res && res.ok && mounted) setRtLive(true);
    };
    init();

    insforge.realtime.on('order_updated', () => {});
    insforge.realtime.on('product_updated', () => {});

    insforge.realtime.on('connect', () => { if (mounted) setRtLive(true); });
    insforge.realtime.on('disconnect', () => { if (mounted) setRtLive(false); });

    return () => {
      mounted = false;
      insforge.realtime.unsubscribe('dashboard');
      insforge.realtime.disconnect();
    };
  }, []);

  // Seller Packages Functions
  const fetchSellerPackages = async () => {
    if (!user || !user.token) return;
    try {
      const res = await fetch(`${API_URL}/seller-packages`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSellerPackages(data);
        return data;
      }
      return [];
    } catch { return []; }
  };

  const fetchOnlineSubscriptions = async () => {
    if (!user || !user.token) return [];
    try {
      const res = await fetch(`${API_URL}/seller-subscriptions/online`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOnlineSubscriptions(data);
        return data;
      }
      return [];
    } catch { return []; }
  };

  const fetchOfflineSubscriptions = async () => {
    if (!user || !user.token) return [];
    try {
      const res = await fetch(`${API_URL}/seller-subscriptions/offline`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOfflineSubscriptions(data);
        return data;
      }
      return [];
    } catch { return []; }
  };

  const fetchRewardSettings = async () => {
    if (!user || !user.token) return;
    try {
      const res = await fetch(`${API_URL}/rewards/settings`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRewardSettings(data);
        return data;
      }
    } catch {}
  };

  const updateRewardSettings = async (settingsData) => {
    if (!user || !user.token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/rewards/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(settingsData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update reward settings');
      setRewardSettings(data);
      return { success: true, settings: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const fetchUserPoints = async () => {
    if (!user || !user.token) return [];
    try {
      const res = await fetch(`${API_URL}/rewards/user-points`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserPoints(data);
        return data;
      }
      return [];
    } catch { return []; }
  };

  const fetchPointLogs = async () => {
    if (!user || !user.token) return [];
    try {
      const res = await fetch(`${API_URL}/rewards/logs`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPointLogs(data);
        return data;
      }
      return [];
    } catch { return []; }
  };

  const adjustUserPoints = async (adjustData) => {
    if (!user || !user.token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/rewards/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(adjustData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to adjust points');
      fetchUserPoints();
      fetchPointLogs();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const fetchRewardProducts = async () => {
    if (!user || !user.token) return [];
    try {
      const res = await fetch(`${API_URL}/rewards/products`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRewardProducts(data);
        return data;
      }
      return [];
    } catch { return []; }
  };

  const setRewardByCategory = async (categoryData) => {
    if (!user || !user.token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/rewards/set-by-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(categoryData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to set category rewards');
      fetchRewardProducts();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const setRewardBySeller = async (sellerData) => {
    if (!user || !user.token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/rewards/set-by-seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(sellerData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to set seller rewards');
      fetchRewardProducts();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const setRewardByProduct = async (productData) => {
    if (!user || !user.token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/rewards/set-by-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to set product rewards');
      fetchRewardProducts();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createSellerPackage = async (pkgData) => {
    if (!user || !user.isAdmin) return { success: false, error: 'Not authorized' };
    try {
      const res = await fetch(`${API_URL}/seller-packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(pkgData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create package');
      fetchSellerPackages();
      return { success: true, pkg: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateSellerPackage = async (id, pkgData) => {
    if (!user || !user.isAdmin) return { success: false, error: 'Not authorized' };
    try {
      const res = await fetch(`${API_URL}/seller-packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(pkgData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update package');
      fetchSellerPackages();
      return { success: true, pkg: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteSellerPackage = async (id) => {
    if (!user || !user.isAdmin) return { success: false, error: 'Not authorized' };
    try {
      const res = await fetch(`${API_URL}/seller-packages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete package');
      }
      fetchSellerPackages();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Seller Settings Functions
  const fetchSellerSettings = async () => {
    if (!user || !user.token) return;
    try {
      const res = await fetch(`${API_URL}/seller-settings`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSellerSettings(data);
        return data;
      }
      return null;
    } catch { return null; }
  };

  const updateSellerSettings = async (settingsData) => {
    if (!user || !user.isAdmin) return { success: false, error: 'Not authorized' };
    try {
      const res = await fetch(`${API_URL}/seller-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(settingsData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update seller settings');
      fetchSellerSettings();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Payout Functions
  const fetchPayouts = async () => {
    if (!user || !user.token) return;
    try {
      const res = await fetch(`${API_URL}/payouts`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayouts(data);
        return data;
      }
      return [];
    } catch { return []; }
  };

  const requestPayout = async (payoutData) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/payouts/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(payoutData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request payout');
      fetchPayouts();
      return { success: true, payout: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updatePayoutStatus = async (id, statusData) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/payouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(statusData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update payout');
      fetchPayouts();
      return { success: true, payout: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/settings/public`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.currencySymbol) setCurrencySymbol(d.currencySymbol);
        if (d?.currency) setCurrencyCode(d.currency);
      })
      .catch(() => {});
  }, []);

  // Load user and cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('shop_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          
          // Auto-synchronize admin panel localstorage keys if missing
          if (parsed.isAdmin || parsed.role !== 'customer') {
            if (!localStorage.getItem('shop_admin_token')) {
              localStorage.setItem('shop_admin_token', parsed.token);
            }
            if (!localStorage.getItem('shop_admin_user')) {
              localStorage.setItem('shop_admin_user', storedUser);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      const storedCart = localStorage.getItem('shop_cart');
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (e) {
          console.error(e);
        }
      }

      const storedCompare = localStorage.getItem('shop_compare');
      if (storedCompare) {
        try {
          setCompareList(JSON.parse(storedCompare));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shop_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Auth Functions
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      setUser(data);
      localStorage.setItem('shop_user', JSON.stringify(data));
      
      // Auto-set admin tokens if user is admin
      if (data.isAdmin || data.role !== 'customer') {
        localStorage.setItem('shop_admin_token', data.token);
        localStorage.setItem('shop_admin_user', JSON.stringify(data));
      }
      
      setLoading(false);
      return { success: true, role: data.role, isAdmin: data.isAdmin };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password, phone, role) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setUser(data);
      localStorage.setItem('shop_user', JSON.stringify(data));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('shop_user');
    localStorage.removeItem('shop_cart');
    localStorage.removeItem('shop_admin_token');
    localStorage.removeItem('shop_admin_user');
  };

  // OTP Login Functions
  const sendOtpCode = async (type, target, method = 'sms') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, target, method }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        const errMsg = data?.message || 'Failed to send OTP';
        throw new Error(errMsg);
      }
      if (!data) {
        throw new Error('Invalid response from server');
      }

      setLoading(false);
      return { success: true, otp: data.otp };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const verifyOtpCode = async (type, target, otp, onlyVerify = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, target, otp, onlyVerify }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        const errMsg = data?.message || 'Invalid OTP code';
        throw new Error(errMsg);
      }
      if (!data) {
        throw new Error('Invalid response from server');
      }

      if (!onlyVerify) {
        setUser(data);
        localStorage.setItem('shop_user', JSON.stringify(data));

        // Auto-set admin tokens if user is admin
        if (data.isAdmin || data.role !== 'customer') {
          localStorage.setItem('shop_admin_token', data.token);
          localStorage.setItem('shop_admin_user', JSON.stringify(data));
        }
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Password Management Functions
  const changeUserPassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'Please log in' };
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.message || 'Password update failed');
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const changeUserEmail = async (password, newEmail) => {
    if (!user) return { success: false, error: 'Please log in' };
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/profile/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ password, newEmail }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.message || 'Email update failed');
      const updatedUser = { ...user, email: newEmail };
      setUser(updatedUser);
      localStorage.setItem('shop_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const forgotPasswordRequest = async (email) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.message || 'Failed to request reset');
      return { success: true, token: data.token };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const resetPasswordSubmit = async (email, token, newPassword) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Social OAuth Login
  const socialOauthLogin = async (provider, email, name) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.message || 'OAuth authentication failed');

      setUser(data);
      localStorage.setItem('shop_user', JSON.stringify(data));
      
      // Auto-set admin tokens if user is admin
      if (data.isAdmin || data.role !== 'customer') {
        localStorage.setItem('shop_admin_token', data.token);
        localStorage.setItem('shop_admin_user', JSON.stringify(data));
      }
      
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Cart Functions
  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const existItem = prev.find((x) => x.product === product._id);
      if (existItem) {
        return prev.map((x) =>
          x.product === product._id ? { ...x, qty: Math.min(product.countInStock, x.qty + qty) } : x
        );
      } else {
        return [
          ...prev,
          {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            discountPercent: product.discountPercent || 0,
            countInStock: product.countInStock,
            qty,
          },
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((x) => x.product !== id));
  };

  const updateCartQty = (id, qty) => {
    setCartItems((prev) =>
      prev.map((x) => (x.product === id ? { ...x, qty: Number(qty) } : x))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const addToCompare = (product) => {
    setCompareList((prev) => {
      if (prev.find((x) => x._id === product._id)) {
        return prev;
      }
      if (prev.length >= 3) {
        const isBn = typeof window !== 'undefined' && localStorage.getItem('goroly-lang') === 'bn';
        alert(isBn ? "আপনি সর্বোচ্চ ৩টি পণ্য তুলনা করতে পারেন!" : "You can compare up to 3 products!");
        return prev;
      }
      const updated = [...prev, product];
      localStorage.setItem('shop_compare', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCompare = (id) => {
    setCompareList((prev) => {
      const updated = prev.filter((x) => x._id !== id);
      localStorage.setItem('shop_compare', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('shop_compare');
  };

  // Fetch available coupons for dropdown
  const fetchAvailableCoupons = async () => {
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.filter((c) => c.isActive);
      }
      return [];
    } catch {
      return [];
    }
  };

  // Coupon functions
  const applyCouponCode = async (code) => {
    if (!user) return { success: false, error: 'Please login to apply coupons' };
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid Coupon');

      setCoupon(data);
      return { success: true, discount: data.discount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Products fetch helper
  const fetchProducts = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/products?${query}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      }
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      console.error(error);
      return { products: [], pages: 1 };
    }
  };

  // Order submission helper
  const placeOrder = async (shippingAddress, paymentMethod, shippingMethod = null) => {
    if (!user) return { success: false, error: 'User is not logged in' };
    
    const itemsPrice = cartItems.reduce((acc, item) => {
      const price = item.price * (1 - (item.discountPercent || 0) / 100);
      return acc + price * item.qty;
    }, 0);

    const shippingPrice = shippingMethod ? shippingMethod.price : 0;
    const discountPrice = coupon ? (itemsPrice * coupon.discount) / 100 : 0;
    const totalPrice = itemsPrice + shippingPrice - discountPrice;

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          discountPrice,
          totalPrice,
          advancePayment: shippingAddress?.advancePayment || false,
          advanceAmount: shippingAddress?.advanceAmount || 0,
          shippingMethod: shippingMethod ? {
            _id: shippingMethod._id,
            name: shippingMethod.name,
            price: shippingMethod.price,
            estimatedDays: shippingMethod.estimatedDays,
          } : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');

      clearCart();
      return { success: true, order: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Admin User Management
  const fetchUsers = async () => {
    if (!user || !user.token) return [];
    try {
      const res = await fetch(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) return await res.json();
      return [];
    } catch { return []; }
  };

  const createUserByAdmin = async (userData) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const importSellersByAdmin = async (file) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`${API_URL}/users/import-sellers`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to import sellers');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserByAdmin = async (id, userData) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update user');
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const adminResetUserPassword = async (id, newPassword) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/users/${id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteUserByAdmin = async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete user');
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <ShopContext.Provider
      value={{
        user,
        cartItems,
        coupon,
        products,
        loading,
        login,
        register,
        logout,
        sendOtpCode,
        verifyOtpCode,
        changeUserPassword,
        changeUserEmail,
        forgotPasswordRequest,
        resetPasswordSubmit,
        socialOauthLogin,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        applyCouponCode,
        fetchAvailableCoupons,
        setCoupon,
        fetchProducts,
        placeOrder,
        fetchUsers,
        createUserByAdmin,
        importSellersByAdmin,
        updateUserByAdmin,
        adminResetUserPassword,
        deleteUserByAdmin,
        API_URL,
        currencySymbol,
        currencyCode,
        payouts,
        fetchPayouts,
        requestPayout,
        updatePayoutStatus,
        sellerSettings,
        fetchSellerSettings,
        updateSellerSettings,
        sellerPackages,
        fetchSellerPackages,
        createSellerPackage,
        updateSellerPackage,
        deleteSellerPackage,
        onlineSubscriptions,
        offlineSubscriptions,
        fetchOnlineSubscriptions,
        fetchOfflineSubscriptions,
        rewardSettings,
        userPoints,
        pointLogs,
        fetchRewardSettings,
        updateRewardSettings,
        fetchUserPoints,
        fetchPointLogs,
        adjustUserPoints,
        rewardProducts,
        fetchRewardProducts,
        setRewardByCategory,
        setRewardBySeller,
        setRewardByProduct,
        rtLive,
        insforge,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
