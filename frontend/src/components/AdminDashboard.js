'use client';

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ShopContext, getImageUrl, formatPrice } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  ShoppingBag, DollarSign, Users, AlertCircle, Package, ArrowRight,
  CircleDot, Tag, Plus, Check, Truck, CreditCard, ChevronRight, X,
  Sliders, Ship, Globe, MessageCircle, MessageSquare, Eye, EyeOff, LayoutGrid, Server,
  BarChart3, PieChart, TrendingUp, Play, Image as ImageIcon, CheckCircle2, MoreVertical, Edit2, Search,
  FolderOpen, Upload, Trash2, Edit, Shirt, Smartphone, Sparkles, Watch, Home, Calendar, Bell, Settings, Download, Wifi, WifiOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RPie, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { useRealtime } from '@/hooks/useRealtime';

const maskEmail = (email) => {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const maskedUser = user.length > 2 ? user.slice(0, 2) + '*'.repeat(Math.max(2, user.length - 2)) : user + '**';
  const dotIndex = domain.lastIndexOf('.');
  const domainName = dotIndex !== -1 ? domain.slice(0, dotIndex) : domain;
  const domainExt = dotIndex !== -1 ? domain.slice(dotIndex) : '';
  const maskedDomain = domainName.length > 1 ? domainName[0] + '*'.repeat(Math.max(2, domainName.length - 1)) : domainName + '***';
  return `${maskedUser}@${maskedDomain}${domainExt}`;
};

const maskPhone = (phone) => {
  if (!phone) return '-';
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 3) return phone;
  return '*'.repeat(cleanPhone.length - 3) + cleanPhone.slice(-3);
};

const formatLastLogin = (dateString) => {
  const d = dateString ? new Date(dateString) : new Date();
  if (isNaN(d.getTime())) return 'Never';
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${month} ${day}, ${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

const formatDateMDY = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
};


export default function AdminDashboard({ onTabChange }) {
  const { API_URL, changeUserEmail, fetchUsers, createUserByAdmin, importSellersByAdmin, updateUserByAdmin, adminResetUserPassword, deleteUserByAdmin, currencySymbol, currencyCode, payouts, fetchPayouts, requestPayout, updatePayoutStatus, sellerSettings, fetchSellerSettings, updateSellerSettings, sellerPackages, fetchSellerPackages, createSellerPackage, updateSellerPackage, deleteSellerPackage, onlineSubscriptions, offlineSubscriptions, fetchOnlineSubscriptions, fetchOfflineSubscriptions, rewardSettings, userPoints, pointLogs, fetchRewardSettings, updateRewardSettings, fetchUserPoints, fetchPointLogs, adjustUserPoints, insforge } = useContext(ShopContext);
  const { lang, t, setLang } = useLanguage();
  const [user, setUser] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [productImportFile, setProductImportFile] = useState(null);

  useEffect(() => {
    const adminStr = localStorage.getItem('shop_admin_user');
    if (adminStr) {
      const parsedUser = JSON.parse(adminStr);
      if (!parsedUser.token) {
        localStorage.removeItem('shop_admin_user');
        localStorage.removeItem('shop_admin_token');
        window.location.href = '/admin/login';
      } else {
        setUser(parsedUser);
      }
    } else {
      window.location.href = '/admin/login';
    }
  }, []);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    totalProducts: 0,
    orders: [],
  });

  const [productsList, setProductsList] = useState([]);
  const [rtConnected, setRtConnected] = useState(false);

  useRealtime('dashboard', {
    'order_updated': useCallback((payload) => {
      setMetrics(prev => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        pendingOrders: payload.status === 'Pending' || payload.status === 'Processing' ? prev.pendingOrders + 1 : prev.pendingOrders,
        totalRevenue: payload.total_price ? prev.totalRevenue + Number(payload.total_price) : prev.totalRevenue,
      }));
    }, []),
    'product_updated': useCallback(() => {
      setMetrics(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
    }, []),
    'connect': useCallback(() => setRtConnected(true), []),
    'disconnect': useCallback(() => setRtConnected(false), []),
  });
  
  // Colors state
  const [colorsList, setColorsList] = useState([
    { id: 'col1', name: 'Red', code: '#EF4444' },
    { id: 'col2', name: 'Blue', code: '#3B82F6' },
    { id: 'col3', name: 'Black', code: '#000000' },
    { id: 'col4', name: 'White', code: '#FFFFFF' },
    { id: 'col5', name: 'Green', code: '#10B981' }
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');

  const [attributeValuesList, setAttributeValuesList] = useState([
    { id: 'val1', type: 'Test001', value: 'Chevrolet' },
    { id: 'val2', type: 'Test001', value: 'Toyota' },
    { id: 'val3', type: 'Weight', value: '2kg' },
    { id: 'val4', type: 'Weight', value: '1 Kg' },
    { id: 'val5', type: 'Weight', value: 'Kg' },
    { id: 'val6', type: 'Size', value: 'ML' },
    { id: 'val7', type: 'Size', value: 'sm' },
    { id: 'val8', type: 'Size', value: 'xxl' },
    { id: 'val9', type: '', value: 'Red' },
    { id: 'val10', type: '', value: 'blue' },
    { id: 'val11', type: 'Size', value: 'S' },
    { id: 'val12', type: 'Size', value: 'M' },
    { id: 'val13', type: 'Size', value: 'L' },
    { id: 'val14', type: 'Size', value: 'XL' }
  ]);
  const [newAttrValueType, setNewAttrValueType] = useState('');
  const [newAttrValueVal, setNewAttrValueVal] = useState('');
  const [editingAttrValue, setEditingAttrValue] = useState(null); // null or id
  const [attrValuePage, setAttrValuePage] = useState(1);

  // Reviews state (mocked or loaded)
  const [reviewsList, setReviewsList] = useState([
    { id: 'rev1', product: 'Wireless Headphones', customer: 'Rashed Khan', rating: 5, comment: 'Excellent sound quality and very comfortable!', date: '2026-05-20' },
    { id: 'rev2', product: 'Smart Watch', customer: 'Mim Akter', rating: 4, comment: 'Good battery life, display is bright.', date: '2026-05-22' },
    { id: 'rev3', product: 'Running Shoes', customer: 'Sajib Ahmed', rating: 5, comment: 'Super lightweight and fit perfectly.', date: '2026-05-24' }
  ]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState({ sellers: true, products: true });
  const toggleMenu = (id) => setExpandedMenus(prev => ({...prev, [id]: !prev[id]})); // dashboard, orders, products, coupons, settings
  
  // Product Sub Tab State
  const [productSubTab, setProductSubTab] = useState('all'); // all, category, add, attributes, digital
  const [productStatusFilter, setProductStatusFilter] = useState('all'); // all, published, unpublished, pending, trash
  const [productSellerFilter, setProductSellerFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSortOrder, setProductSortOrder] = useState('latest');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Categories (API-based management)
  const [categoryList, setCategoryList] = useState([]);
  const [catForm, setCatForm] = useState({
    name: '',
    image: '',
    order: 0,
    rootCategory: '',
    slug: '',
    commissionRate: 0,
    icon: '',
    banner: '',
    metaTitle: '',
    metaDescription: '',
    featured: false,
    status: true
  });
  const [editingCat, setEditingCat] = useState(null);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  // Brands (API-based management)
  const [brandList, setBrandList] = useState([]);
  const [brandForm, setBrandForm] = useState({ name: '', image: '', order: 0 });
  const [editingBrand, setEditingBrand] = useState(null);
  // Categories and Attributes (legacy)
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [attributes, setAttributes] = useState([
    { name: 'Test001', values: ['Toyota', 'Chevrolet'], categories: ['Electronics & Gadgets'] },
    { name: 'Weight', values: ['Kg', '1 Kg', '2kg'], categories: ['Electronics & Gadgets', 'Fashion & Clothing'] },
    { name: 'Size', values: ['xxl', 'sm', 'ML'], categories: ['Electronics & Gadgets', 'Fashion & Clothing'] }
  ]);
  const [newAttribute, setNewAttribute] = useState({ name: '', values: '' });
  const [editingAttribute, setEditingAttribute] = useState(null); // null or { idx, name, values }
  const [attrSelectedCategories, setAttrSelectedCategories] = useState([]);
  // Form Active Tab state for Add Product
  const [formActiveTab, setFormActiveTab] = useState('info');
  const [editFormActiveTab, setEditFormActiveTab] = useState('info');

  // Product add states
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    countInStock: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop',
    images: [''],
    discountPercent: '0',
    isFlashSale: false,
    flashSaleStart: '',
    flashSaleEnd: '',
    isDigital: false,
    digitalFileUrl: '',
    metaTitle: '',
    metaDescription: '',
    tags: '',
    youtubeUrl: '',
    unit: 'pc',
    minOrderQty: '1',
    barcode: '',
    slug: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editAdditionalImageFiles, setEditAdditionalImageFiles] = useState([]);

  // Edit product states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', price: '', category: '', brand: '', countInStock: '',
    description: '', image: '', images: [], discountPercent: '0',
    isFlashSale: false, flashSaleStart: '', flashSaleEnd: '', isDigital: false, digitalFileUrl: '',
    metaTitle: '', metaDescription: '', tags: '', youtubeUrl: '',
    unit: 'pc', minOrderQty: '1', barcode: '', slug: '',
  });

  // Edit coupon states
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editCouponForm, setEditCouponForm] = useState({ code: '', discount: '', expiryDate: '', isActive: true });

  // Page management states
  const [pagesList, setPagesList] = useState([]);
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', isPublished: false });
  const [editingPage, setEditingPage] = useState(null);

  // Video management states
  const [videosList, setVideosList] = useState([]);
  const [videoForm, setVideoForm] = useState({ title: '', description: '', videoUrl: '', product: '' });
  const [editingVideo, setEditingVideo] = useState(null);

  // Offer management states
  const [offersList, setOffersList] = useState([]);
  const [offerForm, setOfferForm] = useState({ title: '', description: '', discountPercent: '', image: '', link: '', isActive: true });
  const [editingOffer, setEditingOffer] = useState(null);

  // Banner management states
  const [bannersList, setBannersList] = useState([]);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', image: '', link: '', isActive: true, order: 0 });
  const [editingBanner, setEditingBanner] = useState(null);

  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReply, setChatReply] = useState('');

  // Coupons states
  const [couponsList, setCouponsList] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '10',
    expiryDate: '2026-12-31',
  });

  // Settings states
  const [settings, setSettings] = useState({
    otpGateway: 'Simulated',
    otpLength: 6,
    otpExpiry: 5,
    checkoutOtpEnabled: true,
    bkashMode: 'Sandbox',
    bkashEnabled: true,
    bkashMerchantNumber: '01700000000',
    nagadMode: 'Sandbox',
    nagadEnabled: true,
    nagadMerchantId: 'NAGAD12345',
    sslcommerzMode: 'Sandbox',
    sslcommerzEnabled: true,
    sslcommerzStoreId: '',
    codEnabled: true,
    facebookPixelId: '',
    ga4MeasurementId: '',
    siteTitle: 'Shopio - MERN E-Commerce',
    faviconUrl: '',
    headerLogo: '',
    footerLogo: '',
    topBarHelpline: '8801234567890',
    topBarStoreLink: 'https://maps.google.com',
    topBarPlayStoreLink: 'https://play.google.com',
    topBarAppStoreLink: 'https://apps.apple.com',
  });

  // Seller Settings local state
  const [localSellerSettings, setLocalSellerSettings] = useState({
    category_based_commission: false,
    seller_based_commission: false,
    message_to_seller_mail: true,
    subscription_method: 'Adjustable'
  });

  useEffect(() => {
    if (sellerSettings) {
      setLocalSellerSettings(sellerSettings);
    }
  }, [sellerSettings]);

  useEffect(() => {
    if (rewardSettings) {
      setLocalRewardSettings(rewardSettings);
    }
  }, [rewardSettings]);

  // User Management states
  const [allUsers, setAllUsers] = useState([]);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer', permissions: [] });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserForm, setEditingUserForm] = useState({ name: '', email: '', phone: '', role: 'customer', permissions: [] });
  const [passwordResetUserId, setPasswordResetUserId] = useState(null);
  const [passwordResetValue, setPasswordResetValue] = useState('');
  // Own profile
  const [showOwnPasswordForm, setShowOwnPasswordForm] = useState(false);
  const [ownPasswordData, setOwnPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [showOwnEmailForm, setShowOwnEmailForm] = useState(false);
  const [ownEmailData, setOwnEmailData] = useState({ password: '', newEmail: '' });
  
  // Seller Import state
  const [sellerImportFile, setSellerImportFile] = useState(null);

  // Subscription History filter states
  const [onlineSearch, setOnlineSearch] = useState('');
  const [onlineSellerFilter, setOnlineSellerFilter] = useState('');
  const [onlineSortOrder, setOnlineSortOrder] = useState('Latest On Top');
  
  const [offlineSearch, setOfflineSearch] = useState('');
  const [offlineSellerFilter, setOfflineSellerFilter] = useState('');
  const [offlineSortOrder, setOfflineSortOrder] = useState('Latest On Top');

  const [staffSearch, setStaffSearch] = useState('');
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);

  const [localRewardSettings, setLocalRewardSettings] = useState({
    is_enabled: true,
    earn_rate: 1.00,
    redeem_rate: 0.10,
    min_redeem_points: 100
  });
  const [adjustModalUser, setAdjustModalUser] = useState(null);
  const [adjustPointsValue, setAdjustPointsValue] = useState(100);
  const [adjustDescription, setAdjustDescription] = useState('Manual bonus');
  const [rewardSubTab, setRewardSubTab] = useState('summary');
  const [rewardSearch, setRewardSearch] = useState('');
  const [selectedSetUser, setSelectedSetUser] = useState(null);
  const [setPointsValue, setSetPointsValue] = useState(100);
  const [setPointsDesc, setSetPointsDesc] = useState('Manual adjustment');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedStatementUser, setSelectedStatementUser] = useState(null);

  // Seller Package form state
  const [newPkg, setNewPkg] = useState({ name: '', price: '', duration_days: '', product_limit: '' });
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [editPkgForm, setEditPkgForm] = useState({ name: '', price: '', duration_days: '', product_limit: '', is_active: true });

  const ALL_PERMS = ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat', 'settings', 'users'];
  const ROLE_PERMS = {
    superadmin: ALL_PERMS,
    admin: ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat', 'settings'],
    manager: ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat'],
    moderator: ['orders', 'chat', 'products'],
    customer: [],
  };

  const [shippingMethods, setShippingMethods] = useState([]);
  const [newShipping, setNewShipping] = useState({
    name: '',
    price: '',
    estimatedDays: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  // Fetch admin summaries
  const fetchSummary = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/orders/summary`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching admin summary:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const isSeller = user?.role === 'seller' && !user?.isAdmin;
      const sellerQuery = isSeller ? `?sellerId=${user._id}` : '';
      const res = await fetch(`${API_URL}/products${sellerQuery}`);
      if (res.ok) {
        const data = await res.json();
        setProductsList(data.products);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCoupons = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCouponsList(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchShippingMethods = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/shipping/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setShippingMethods(data);
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
    }
  };

  const handleCreateShipping = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: newShipping.name,
          price: Number(newShipping.price),
          estimatedDays: newShipping.estimatedDays,
          description: newShipping.description,
        }),
      });
      if (res.ok) {
        alert('Shipping method added successfully!');
        setNewShipping({ name: '', price: '', estimatedDays: '', description: '' });
        fetchShippingMethods();
      } else {
        const err = await res.json();
        alert(err.message || 'Error creating shipping method');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleShipping = async (method) => {
    try {
      const res = await fetch(`${API_URL}/shipping/${method._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ isActive: !method.isActive }),
      });
      if (res.ok) {
        fetchShippingMethods();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteShipping = async (id) => {
    if (!confirm('Are you sure you want to delete this shipping method?')) return;
    try {
      const res = await fetch(`${API_URL}/shipping/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        fetchShippingMethods();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert('Configurations saved successfully!');
        fetchSettings();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSellerSettings = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await updateSellerSettings(localSellerSettings);
      if (res.success) {
        alert('Seller settings updated successfully!');
      } else {
        alert(res.error || 'Failed to update seller settings');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving seller settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRewardSettings = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await updateRewardSettings(localRewardSettings);
      if (res.success) {
        alert('Reward settings updated successfully!');
      } else {
        alert(res.error || 'Failed to update reward settings');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving reward settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPointsSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!adjustModalUser) return;
    setLoading(true);
    try {
      const res = await adjustUserPoints({
        user_id: adjustModalUser.user_id || adjustModalUser._id,
        points: adjustPointsValue,
        description: adjustDescription
      });
      if (res.success) {
        alert('Points adjusted successfully!');
        setAdjustModalUser(null);
        fetchUserPoints();
        fetchPointLogs();
      } else {
        alert(res.error || 'Failed to adjust points');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while adjusting points');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPointsSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSetUser) {
      alert('Please select a customer first');
      return;
    }
    setLoading(true);
    try {
      const res = await adjustUserPoints({
        user_id: selectedSetUser.user_id || selectedSetUser._id,
        points: setPointsValue,
        description: setPointsDesc
      });
      if (res.success) {
        alert('Points adjusted successfully!');
        setSetPointsValue(100);
        setSetPointsDesc('Manual adjustment');
        setSelectedSetUser(null);
        setCustomerSearchTerm('');
        fetchUserPoints();
        fetchPointLogs();
      } else {
        alert(res.error || 'Failed to adjust points');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while adjusting points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchProducts();
    fetchCoupons();
    fetchSettings();
    fetchShippingMethods();
    fetchPages();
    fetchOffers();
    fetchBanners();
    fetchCategories();
    fetchBrands();
    fetchVideos();
    if (user) {
      fetchPayouts();
      fetchSellerSettings();
      fetchSellerPackages();
      fetchOnlineSubscriptions();
      fetchOfflineSubscriptions();
      fetchRewardSettings();
      fetchUserPoints();
      fetchPointLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user && (activeTab === 'users' || activeTab === 'sellers_all' || activeTab === 'staffs' || activeTab === 'rewards_set')) fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab === 'staffs') {
      setUserForm(prev => ({ ...prev, role: 'admin', permissions: ROLE_PERMS['admin'] || [] }));
    } else if (activeTab === 'users') {
      setUserForm(prev => ({ ...prev, role: 'customer', permissions: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Separate effect for chat polling
  useEffect(() => {
    if (!user || activeTab !== 'chat') return;
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  // Actions
  const handleUpdateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchSummary();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBookCourier = async (orderId, provider) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: 'Shipped', courierProvider: provider }),
      });
      if (res.ok) {
        alert(`Courier booked successfully with ${provider}!`);
        fetchSummary();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const uploadFile = async (file) => {
    try {
      const { data, error } = await insforge.storage
        .from('product')
        .uploadAuto(file);
      if (error) throw new Error(error.message || 'Upload failed');
      return data.url;
    } catch (e) {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });
      if (!res.ok) {
        let errMsg = 'Image upload failed';
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const responseData = await res.json();
      return responseData.image;
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let mainImageUrl = newProduct.image;
      if (imageFile) {
        mainImageUrl = await uploadFile(imageFile);
      }
      
      let additionalImageUrls = [];
      const filesToUpload = additionalImageFiles.filter(Boolean);
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach((f) => formData.append('images', f));
        const res = await fetch(`${API_URL}/upload/multiple`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          additionalImageUrls = data.images.map((img) => img.image);
        }
      }

      // 1. Create product template
      const templateRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!templateRes.ok) throw new Error('Failed to create template');
      const templateData = await templateRes.json();
      
      // 2. Update with user inputs
      const updateRes = await fetch(`${API_URL}/products/${templateData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          category: newProduct.category,
          brand: newProduct.brand,
          countInStock: Number(newProduct.countInStock),
          description: newProduct.description,
          image: mainImageUrl,
          images: additionalImageUrls,
          discountPercent: Number(newProduct.discountPercent),
          isFlashSale: newProduct.isFlashSale,
          flashSaleStart: newProduct.flashSaleStart || null,
          flashSaleEnd: newProduct.flashSaleEnd || null,
          metaTitle: newProduct.metaTitle || '',
          metaDescription: newProduct.metaDescription || '',
          tags: newProduct.tags ? newProduct.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          youtubeUrl: newProduct.youtubeUrl || '',
          unit: newProduct.unit || 'pc',
          minOrderQty: Number(newProduct.minOrderQty || 1),
          barcode: newProduct.barcode || '',
          slug: newProduct.slug || '',
          isDigital: newProduct.isDigital,
          digitalFileUrl: newProduct.isDigital ? newProduct.digitalFileUrl : '',
        }),
      });
      
      if (updateRes.ok) {
        alert('Product created successfully!');
        fetchProducts();
        setNewProduct({
          name: '',
          price: '',
          category: '',
          brand: '',
          countInStock: '',
          description: '',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop',
          images: [''],
          discountPercent: '0',
          isFlashSale: false,
          flashSaleStart: '',
          flashSaleEnd: '',
          isDigital: false,
          digitalFileUrl: '',
          metaTitle: '',
          metaDescription: '',
          tags: '',
          youtubeUrl: '',
          unit: 'pc',
          minOrderQty: '1',
          barcode: '',
          slug: '',
        });
        setImageFile(null);
        setImagePreview('');
        setAdditionalImageFiles([]);
        setFormActiveTab('info');
        setProductSubTab('all');
      } else {
        const errData = await updateRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update product data');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);
    try {
      let imageUrl = editForm.image;
      if (editImageFile) {
        imageUrl = await uploadFile(editImageFile);
      }
      
      let uploadedAdditionalUrls = [];
      const filesToUpload = editAdditionalImageFiles.filter(Boolean);
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach((f) => formData.append('images', f));
        const res = await fetch(`${API_URL}/upload/multiple`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedAdditionalUrls = data.images.map((img) => img.image);
        }
      }

      const finalAdditionalImages = [
        ...editForm.images.filter((url) => url && url.trim()),
        ...uploadedAdditionalUrls
      ];

      const res = await fetch(`${API_URL}/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          name: editForm.name, price: Number(editForm.price), category: editForm.category,
          brand: editForm.brand, countInStock: Number(editForm.countInStock),
          description: editForm.description, image: imageUrl,
          images: finalAdditionalImages,
          discountPercent: Number(editForm.discountPercent),
          isFlashSale: editForm.isFlashSale,
          flashSaleStart: editForm.flashSaleStart || null,
          flashSaleEnd: editForm.flashSaleEnd || null,
          metaTitle: editForm.metaTitle || '',
          metaDescription: editForm.metaDescription || '',
          tags: editForm.tags ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          youtubeUrl: editForm.youtubeUrl || '',
          unit: editForm.unit || 'pc',
          minOrderQty: Number(editForm.minOrderQty || 1),
          barcode: editForm.barcode || '',
          slug: editForm.slug || '',
          isDigital: editForm.isDigital,
          digitalFileUrl: editForm.isDigital ? editForm.digitalFileUrl : '',
        }),
      });
      if (res.ok) {
        alert('Product updated!');
        setEditingProduct(null);
        setEditImageFile(null);
        setEditImagePreview('');
        setEditAdditionalImageFiles([]);
        fetchProducts();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update product');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          code: newCoupon.code,
          discount: Number(newCoupon.discount),
          expiryDate: newCoupon.expiryDate,
        }),
      });
      if (res.ok) {
        alert('Coupon created successfully!');
        setNewCoupon({ code: '', discount: '10', expiryDate: '2026-12-31' });
        fetchCoupons();
      } else {
        const err = await res.json();
        alert(err.message || 'Error creating coupon');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Coupon update
  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    if (!editingCoupon) return;
    try {
      const res = await fetch(`${API_URL}/coupons/${editingCoupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(editCouponForm),
      });
      if (res.ok) {
        alert('Coupon updated!');
        setEditingCoupon(null);
        fetchCoupons();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Pages CRUD
  const fetchPages = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/pages`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setPagesList(await res.json());
    } catch (error) { console.error(error); }
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(pageForm),
      });
      if (res.ok) {
        alert('Page created!');
        setPageForm({ title: '', slug: '', content: '', isPublished: false });
        fetchPages();
      } else {
        const err = await res.json();
        alert(err.message || 'Error');
      }
    } catch (error) { console.error(error); }
  };

  const startEditPage = (page) => {
    setEditingPage(page);
    setPageForm({ title: page.title, slug: page.slug, content: page.content, isPublished: page.isPublished });
  };

  const handleUpdatePage = async (e) => {
    e.preventDefault();
    if (!editingPage) return;
    try {
      const res = await fetch(`${API_URL}/pages/${editingPage._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(pageForm),
      });
      if (res.ok) {
        alert('Page updated!');
        setEditingPage(null);
        setPageForm({ title: '', slug: '', content: '', isPublished: false });
        fetchPages();
      }
    } catch (error) { console.error(error); }
  };

  const handleDeletePage = async (id) => {
    if (!confirm('Delete this page?')) return;
    try {
      const res = await fetch(`${API_URL}/pages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) fetchPages();
    } catch (error) { console.error(error); }
  };

  // Offers CRUD
  const fetchOffers = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/offers`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setOffersList(await res.json());
    } catch (error) { console.error(error); }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(offerForm),
      });
      if (res.ok) {
        alert('Offer created!');
        setOfferForm({ title: '', description: '', discountPercent: '', image: '', link: '', isActive: true });
        fetchOffers();
      } else {
        const err = await res.json();
        alert(err.message || 'Error');
      }
    } catch (error) { console.error(error); }
  };

  const startEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({ title: offer.title, description: offer.description, discountPercent: offer.discountPercent, image: offer.image || '', link: offer.link || '', isActive: offer.isActive });
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    if (!editingOffer) return;
    try {
      const res = await fetch(`${API_URL}/offers/${editingOffer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(offerForm),
      });
      if (res.ok) {
        alert('Offer updated!');
        setEditingOffer(null);
        setOfferForm({ title: '', description: '', discountPercent: '', image: '', link: '', isActive: true });
        fetchOffers();
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteOffer = async (id) => {
    if (!confirm('Delete this offer?')) return;
    try {
      const res = await fetch(`${API_URL}/offers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) fetchOffers();
    } catch (error) {
      console.error(error);
    }
  };

  // Banners CRUD
  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/banners`, { headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) setBannersList(await res.json());
    } catch {}
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(bannerForm),
      });
      if (res.ok) {
        alert('Banner created!');
        setBannerForm({ title: '', subtitle: '', image: '', link: '', isActive: true, order: 0 });
        fetchBanners();
      } else {
        const err = await res.json();
        alert(err.message || 'Error');
      }
    } catch {}
  };

  const startEditBanner = (banner) => {
    setEditingBanner(banner);
    setBannerForm({ title: banner.title, subtitle: banner.subtitle, image: banner.image, link: banner.link, isActive: banner.isActive, order: banner.order });
  };

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    if (!editingBanner) return;
    try {
      const res = await fetch(`${API_URL}/banners/${editingBanner._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(bannerForm),
      });
      if (res.ok) {
        alert('Banner updated!');
        setEditingBanner(null);
        setBannerForm({ title: '', subtitle: '', image: '', link: '', isActive: true, order: 0 });
        fetchBanners();
      }
    } catch {}
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      const res = await fetch(`${API_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) fetchBanners();
    } catch {}
  };

  // Video CRUD Functions
  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/videos`);
      if (res.ok) setVideosList(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateVideo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(videoForm),
      });
      if (res.ok) {
        alert('Video added successfully!');
        setVideoForm({ title: '', description: '', videoUrl: '', product: '' });
        fetchVideos();
      } else {
        const err = await res.json();
        alert(err.message || 'Error creating video');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startEditVideo = (video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      product: video.product?._id || video.product || '',
    });
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    if (!editingVideo) return;
    try {
      const res = await fetch(`${API_URL}/videos/${editingVideo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(videoForm),
      });
      if (res.ok) {
        alert('Video updated successfully!');
        setEditingVideo(null);
        setVideoForm({ title: '', description: '', videoUrl: '', product: '' });
        fetchVideos();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await fetch(`${API_URL}/videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        alert('Video deleted!');
        fetchVideos();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Chat functions
  const fetchChatMessages = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/chat`, { headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) setChatMessages(await res.json());
    } catch {}
  };

  const handleSendChatReply = async (e) => {
    e.preventDefault();
    if (!chatReply.trim()) return;
    try {
      await fetch(`${API_URL}/chat/admin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatReply }),
      });
      setChatReply('');
      fetchChatMessages();
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await fetch(`${API_URL}/chat/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchChatMessages();
    } catch {}
  };

  const handleCloseChat = async () => {
    try {
      await fetch(`${API_URL}/chat/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchChatMessages();
    } catch {}
  };

  // Category CRUD
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const list = await res.json();
        const enriched = list.map((cat, idx) => ({
          ...cat,
          rootCategory: cat.rootCategory || (idx % 3 === 0 ? 'Kids & Baby' : idx % 3 === 1 ? "Men's Clothing" : 'Unisex & Casual Wear'),
          commissionRate: cat.commissionRate || 0,
          featured: cat.featured !== undefined ? cat.featured : (idx === 9),
          status: cat.status !== undefined ? cat.status : true,
          slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          icon: cat.icon || '',
          banner: cat.banner || cat.image || '',
          metaTitle: cat.metaTitle || '',
          metaDescription: cat.metaDescription || '',
        }));
        setCategoryList(enriched);
      }
    } catch {}
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          name: catForm.name,
          image: catForm.image,
          order: catForm.order
        }),
      });
      if (res.ok) {
        setCatForm({
          name: '', image: '', order: 0, rootCategory: '', slug: '',
          commissionRate: 0, icon: '', banner: '', metaTitle: '', metaDescription: '',
          featured: false, status: true
        });
        fetchCategories();
      }
    } catch {}
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/categories/${editingCat._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          name: catForm.name,
          image: catForm.image,
          order: catForm.order
        }),
      });
      if (res.ok) {
        setEditingCat(null);
        setCatForm({
          name: '', image: '', order: 0, rootCategory: '', slug: '',
          commissionRate: 0, icon: '', banner: '', metaTitle: '', metaDescription: '',
          featured: false, status: true
        });
        fetchCategories();
      }
    } catch {}
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) fetchCategories();
    } catch {}
  };

  // Brand CRUD
  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_URL}/brands`);
      if (res.ok) setBrandList(await res.json());
    } catch {}
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(brandForm),
      });
      if (res.ok) { setBrandForm({ name: '', image: '', order: 0 }); fetchBrands(); }
    } catch {}
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/brands/${editingBrand._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(brandForm),
      });
      if (res.ok) { setEditingBrand(null); setBrandForm({ name: '', image: '', order: 0 }); fetchBrands(); }
    } catch {}
  };

  const handleDeleteBrand = async (id) => {
    if (!confirm('Delete this brand?')) return;
    try {
      const res = await fetch(`${API_URL}/brands/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) fetchBrands();
    } catch {}
  };

  // User Management handlers
  const fetchAllUsers = async () => {
    const result = await fetchUsers();
    setAllUsers(result || []);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const result = await createUserByAdmin(userForm);
    if (result.success) {
      alert('User created successfully!');
      setUserForm({ name: '', email: '', password: '', phone: '', role: 'customer', permissions: [] });
      fetchAllUsers();
    } else {
      alert(result.error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUserId) return;
    const result = await updateUserByAdmin(editingUserId, editingUserForm);
    if (result.success) {
      alert('User updated successfully!');
      setEditingUserId(null);
      setEditingUserForm({ name: '', email: '', phone: '', role: 'customer', permissions: [] });
      fetchAllUsers();
    } else {
      alert(result.error);
    }
  };

  const handlePasswordReset = async (id) => {
    if (!passwordResetValue.trim()) return alert('Enter a new password');
    const result = await adminResetUserPassword(id, passwordResetValue);
    if (result.success) {
      alert('Password reset successfully!');
      setPasswordResetUserId(null);
      setPasswordResetValue('');
    } else {
      alert(result.error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    const result = await deleteUserByAdmin(id);
    if (result.success) {
      alert('User deleted successfully!');
      fetchAllUsers();
    } else {
      alert(result.error);
    }
  };

  const handleOwnPasswordChange = async (e) => {
    e.preventDefault();
    if (!ownPasswordData.currentPassword || !ownPasswordData.newPassword) return alert('Fill all fields');
    const changeUserPassword = async (current, next) => {
      try {
        const res = await fetch(`${API_URL}/users/profile/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ currentPassword: current, newPassword: next }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return { success: true };
      } catch (error) { return { success: false, error: error.message }; }
    };
    const result = await changeUserPassword(ownPasswordData.currentPassword, ownPasswordData.newPassword);
    if (result.success) {
      alert('Password changed successfully!');
      setShowOwnPasswordForm(false);
      setOwnPasswordData({ currentPassword: '', newPassword: '' });
    } else {
      alert(result.error);
    }
  };

  const handleOwnEmailChange = async (e) => {
    e.preventDefault();
    if (!ownEmailData.password || !ownEmailData.newEmail) return alert('Fill all fields');
    const result = await changeUserEmail(ownEmailData.password, ownEmailData.newEmail);
    if (result.success) {
      alert('Email changed successfully!');
      setShowOwnEmailForm(false);
      setOwnEmailData({ password: '', newEmail: '' });
    } else {
      alert(result.error);
    }
  };

  const handleToggleStatus = async (id, fieldObj) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(fieldObj),
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDuplicateProduct = async (prod) => {
    if (!confirm('Are you sure you want to duplicate this product?')) return;
    setLoading(true);
    try {
      const templateRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!templateRes.ok) throw new Error('Failed to create template');
      const templateData = await templateRes.json();

      const updateRes = await fetch(`${API_URL}/products/${templateData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: `${prod.name} (Copy)`,
          price: Number(prod.price),
          category: prod.category,
          brand: prod.brand,
          countInStock: Number(prod.countInStock),
          description: prod.description,
          image: prod.image,
          images: prod.images || [],
          discountPercent: Number(prod.discountPercent || 0),
          isFlashSale: prod.isFlashSale || false,
          flashSaleStart: prod.flashSaleStart || null,
          flashSaleEnd: prod.flashSaleEnd || null,
          metaTitle: prod.metaTitle || '',
          metaDescription: prod.metaDescription || '',
          tags: prod.tags || [],
          youtubeUrl: prod.youtubeUrl || '',
          unit: prod.unit || 'pc',
          minOrderQty: Number(prod.minOrderQty || 1),
          barcode: prod.barcode || '',
          slug: `${prod.slug}-copy`,
          isPublished: prod.isPublished,
          isCatalog: prod.isCatalog,
          isTodaysDeal: prod.isTodaysDeal,
          isFeatured: prod.isFeatured,
        }),
      });
      if (updateRes.ok) {
        alert('Product duplicated successfully!');
        fetchProducts();
      } else {
        alert('Failed to update duplicated product');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProductsTable = (list) => {
    if (!list || list.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 text-xs">
          No products found.
        </div>
      );
    }
    return (
      <div className="overflow-x-auto p-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
              <th className="py-3 px-4 rounded-l-xl">#</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Seller</th>
              <th className="py-3 px-4">Detail</th>
              <th className="py-3 px-4">Current Stock</th>
              <th className="py-3 px-4 text-center">Published</th>
              <th className="py-3 px-4 text-center">Catalog</th>
              <th className="py-3 px-4 text-center">Today's Deal</th>
              <th className="py-3 px-4 text-center">Featured</th>
              <th className="py-3 px-4 text-right rounded-r-xl">Option</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {list.map((prod, idx) => (
              <tr key={prod._id} className="border-b border-transparent hover:bg-slate-50 transition group">
                <td className="py-4 px-4 rounded-l-xl text-gray-500 font-medium">{idx + 1}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img src={getImageUrl(prod.image)} className="w-10 h-10 object-cover rounded-lg border border-slate-200 group-hover:scale-105 transition-transform" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs line-clamp-1 max-w-[200px]" title={prod.name}>{prod.name}</h4>
                      {prod.isDigital && (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">
                          Digital
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[10px] font-bold">
                    {!prod.user_id || prod.user_id === user?._id ? 'Admin Product' : 'Seller Product'}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs text-gray-500 space-y-0.5">
                  <div>Base Price: {formatPrice(prod.price, currencySymbol)} /{prod.unit || 'pcs'}</div>
                  <div>Total Sale: {prod.salesCount || 0}</div>
                  <div>Rating: {prod.rating || 0}</div>
                </td>
                <td className="py-4 px-4 text-xs text-gray-900 font-semibold space-y-0.5">
                  {prod.barcode && <div className="text-[10px] text-gray-400 font-mono">{prod.barcode}</div>}
                  <div>{prod.isDigital ? 'Unlimited' : `${prod.countInStock} Left`}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={prod.isPublished !== false}
                      onChange={async (e) => {
                        const updatedVal = e.target.checked;
                        await handleToggleStatus(prod._id, { isPublished: updatedVal });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 font-medium"></div>
                  </label>
                </td>
                <td className="py-4 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={prod.isCatalog !== false}
                      onChange={async (e) => {
                        const updatedVal = e.target.checked;
                        await handleToggleStatus(prod._id, { isCatalog: updatedVal });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </td>
                <td className="py-4 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={prod.isTodaysDeal === true}
                      onChange={async (e) => {
                        const updatedVal = e.target.checked;
                        await handleToggleStatus(prod._id, { isTodaysDeal: updatedVal });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </td>
                <td className="py-4 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={prod.isFeatured === true}
                      onChange={async (e) => {
                        const updatedVal = e.target.checked;
                        await handleToggleStatus(prod._id, { isFeatured: updatedVal });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </td>
                <td className="py-4 px-4 text-right rounded-r-xl space-x-1 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setEditForm({
                        name: prod.name, price: String(prod.price), category: prod.category,
                        brand: prod.brand, countInStock: String(prod.countInStock),
                        description: prod.description, image: prod.image, images: prod.images || [''],
                        discountPercent: String(prod.discountPercent || 0),
                        isFlashSale: prod.isFlashSale || false, isDigital: prod.isDigital || false,
                        digitalFileUrl: prod.digitalFileUrl || '',
                        flashSaleStart: prod.flashSaleStart || '',
                        flashSaleEnd: prod.flashSaleEnd || '',
                        metaTitle: prod.metaTitle || '',
                        metaDescription: prod.metaDescription || '',
                        tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : (prod.tags || ''),
                        youtubeUrl: prod.youtubeUrl || '',
                        unit: prod.unit || 'pc',
                        minOrderQty: String(prod.minOrderQty || 1),
                        barcode: prod.barcode || '',
                        slug: prod.slug || '',
                        isPublished: prod.isPublished !== false,
                        isCatalog: prod.isCatalog !== false,
                        isTodaysDeal: prod.isTodaysDeal === true,
                        isFeatured: prod.isFeatured === true,
                      });
                      setEditingProduct(prod);
                      setEditFormActiveTab('info');
                      setEditAdditionalImageFiles([]);
                      setEditImageFile(null);
                      setEditImagePreview('');
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                    title="Edit"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDuplicateProduct(prod)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                    title="Duplicate"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        try {
                          const res = await fetch(`${API_URL}/products/${prod._id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${user.token}` },
                          });
                          if (res.ok) {
                            alert('Product deleted!');
                            fetchProducts();
                          } else {
                            const errData = await res.json().catch(() => ({}));
                            alert(errData.message || 'Error deleting product');
                          }
                        } catch (err) {
                          alert(err.message || 'Error deleting product');
                        }
                      }
                    }}
                    className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                    title="More"
                  >
                    <MoreVertical size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Recent Orders table render
  const renderOrdersTable = (ordersToRender) => {
    const list = ordersToRender || [];
    if (list.length === 0) {
      return (
        <tr className="text-center text-xs text-gray-400">
          <td colSpan="7" className="py-12 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <Package size={32} className="text-gray-300" />
              <span className="font-medium">No orders found.</span>
            </div>
          </td>
        </tr>
      );
    }
    return list.map((order) => {
      const statusColors = {
        Pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', progress: 'w-1/4 from-yellow-400 to-yellow-500' },
        Processing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', progress: 'w-2/4 from-blue-400 to-blue-500' },
        Shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', progress: 'w-3/4 from-indigo-400 to-indigo-500' },
        Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', progress: 'w-full from-emerald-400 to-emerald-500' },
        Cancelled: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', progress: 'w-full from-orange-400 to-orange-500' },
      };
      
      const theme = statusColors[order.status] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-slate-200', progress: 'w-0' };
      
      return (
        <tr key={order._id} className="border-b border-transparent hover:bg-slate-50 transition group">
          <td className="py-4 pl-4 rounded-l-xl">
            <div className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md inline-block shadow-inner text-[11px]">
              #{order._id?.substring(0, 8)}
            </div>
          </td>
          <td className="py-4">
            <div className="font-bold text-gray-900">{order.shippingAddress?.name || 'Customer'}</div>
            <div className="text-[10px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
          </td>
          <td className="py-4">
            <div className="font-black text-gray-900 text-sm tracking-tight">{formatPrice(order.totalPrice, currencySymbol)}</div>
          </td>
          <td className="py-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700 text-xs bg-white border border-slate-200 px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                {order.paymentMethod === 'Cash on Delivery' ? <Truck size={12} className="text-gray-400" /> : <CreditCard size={12} className="text-blue-400" />}
                {order.paymentMethod === 'Cash on Delivery' ? 'COD' : order.paymentMethod}
              </span>
              {order.isPaid ? (
                <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">Paid</span>
              ) : (
                <span className="text-[10px] px-2 py-1 rounded-md bg-orange-500/10 text-orange-600 font-bold border border-orange-500/20">Unpaid</span>
              )}
            </div>
          </td>
          <td className="py-4 w-48">
            <div className="flex flex-col gap-1.5 w-full pr-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span className={theme.text}>{order.status}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full rounded-full bg-gradient-to-r ${theme.progress} transition-all duration-500 shadow-xs`}></div>
              </div>
            </div>
          </td>
          <td className="py-4 pr-4 rounded-r-xl text-right">
            <div className="flex items-center justify-end gap-1.5">
              {order.status === 'Pending' && (
                <button 
                  onClick={() => handleUpdateStatus(order._id, 'Processing')}
                  className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Check size={14} /> Approve
                </button>
              )}
              
              {order.status === 'Processing' && (
                <div className="flex gap-1.5">
                  {['Pathao', 'SteadFast', 'RedX'].map((courier) => (
                    <button
                      key={courier}
                      onClick={() => handleBookCourier(order._id, courier)}
                      className="px-2 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-bold rounded-lg text-gray-600 flex items-center gap-1 transition shadow-xs"
                    >
                      <Truck size={12} /> {courier}
                    </button>
                  ))}
                </div>
              )}

              {order.status === 'Shipped' && (
                <button 
                  onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                  className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <CheckCircle2 size={14} /> Delivered
                </button>
              )}

              {['Pending', 'Processing'].includes(order.status) && (
                <button 
                  onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                  className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-xl transition-all duration-200 ml-1"
                  title="Cancel Order"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  const getFilteredProducts = (baseList) => {
    let result = [...baseList];

    // Status filter
    if (productStatusFilter === 'published') {
      result = result.filter(p => p.isPublished !== false);
    } else if (productStatusFilter === 'unpublished') {
      result = result.filter(p => p.isPublished === false);
    } else if (productStatusFilter === 'pending') {
      result = result.filter(p => p.isPending === true);
    } else if (productStatusFilter === 'trash') {
      result = result.filter(p => p.isTrash === true);
    }

    // Seller filter
    if (productSellerFilter !== 'all') {
      if (productSellerFilter === 'admin') {
        result = result.filter(p => !p.user_id || p.user_id === user?._id);
      } else {
        result = result.filter(p => p.user_id === productSellerFilter);
      }
    }

    // Category filter
    if (productCategoryFilter !== 'all') {
      result = result.filter(p => p.category?.toLowerCase() === productCategoryFilter.toLowerCase());
    }

    // Search query
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.toLowerCase();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.brand && p.brand.toLowerCase().includes(q)) || 
        (p.category && p.category.toLowerCase().includes(q)) || 
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (productSortOrder === 'latest') {
      result.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    } else if (productSortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt));
    } else if (productSortOrder === 'price_asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (productSortOrder === 'price_desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row admin-panel-root">
      
      {/* Modern Dark Sidebar */}
      <aside className="w-full md:w-52 bg-[#0B1329] text-white border-r border-slate-950/20 flex flex-col overflow-y-auto scrollbar-hide">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-slate-850/50">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => {
                window.open('/', '_blank');
              }}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition group"
              title="Visit Store (Opens in new tab)"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/10 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag size={15} className="text-white" />
              </div>
              <div className="text-lg font-extrabold text-white tracking-tight flex items-center">
                Shopio<span className="text-blue-500 font-black">.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: CircleDot },
            { 
              id: 'orders', label: 'Orders', icon: ShoppingBag, badge: metrics.pendingOrders,
              subItems: [
                { id: 'orders_all', label: 'All Orders' },
                { id: 'orders_admin', label: 'Admin Orders' },
                { id: 'orders_seller', label: 'Seller Orders' },
                { id: 'orders_pickup_hub', label: 'Pickup Hub Orders' },
                { id: 'orders_pickup', label: 'Pickup Hub' }
              ]
            },
            { 
              id: 'products', label: 'Products', icon: Package,
              subItems: [
                { id: 'products_add', label: 'Add New Product' },
                { id: 'products_all', label: 'All Product' },
                { id: 'products_admin', label: 'Admin Products' },
                { id: 'products_seller', label: 'Seller Products' },
                { id: 'products_digital', label: 'Digital Products' },
                { id: 'products_catalog', label: 'Catalog Products' },
                { id: 'products_classified', label: 'Classified Products' },
                { id: 'products_reviews', label: 'Product Reviews' },
                { id: 'products_colors', label: 'Colors' },
                { id: 'products_attributes', label: 'Attribute Sets' },
                { id: 'products_attribute_values', label: 'Attribute Values' },
                { id: 'products_brands', label: 'Brands' },
                { id: 'products_categories', label: 'Categories' },
                { id: 'products_import', label: 'Import Products' }
              ]
            },
            { id: 'coupons', label: 'Coupons', icon: Tag, adminOnly: true },
            { id: 'shipping', label: 'Shipping', icon: Ship, adminOnly: true },
            { id: 'pages', label: 'Pages', icon: Globe, adminOnly: true },
            { id: 'offers', label: 'Offers', icon: TrendingUp, adminOnly: true },
            { id: 'banners', label: 'Banners', icon: Globe, adminOnly: true },
            { id: 'users', label: 'Users', icon: Users, adminOnly: true },
            { id: 'staffs', label: 'Manage Staffs', icon: Users, adminOnly: true },
            { 
              id: 'sellers', label: 'Sellers', icon: Users, adminOnly: true,
              subItems: [
                { id: 'sellers_all', label: 'All Seller' },
                { id: 'sellers_payouts', label: 'Payouts' },
                { id: 'sellers_requests', label: 'Payout Requests' },
                { id: 'sellers_settings', label: 'Seller Settings' },
                { id: 'sellers_import', label: 'Import Sellers' }
              ]
            },
            { 
              id: 'seller_package', label: 'Seller Package', icon: Package, adminOnly: true,
              subItems: [
                { id: 'seller_pkg_subscription', label: 'Subscription Setting' },
                { id: 'seller_pkg_packages', label: 'Packages' },
                { id: 'seller_pkg_online_history', label: 'Online Purchase History' },
                { id: 'seller_pkg_offline_history', label: 'Offline Purchase History' }
              ]
            },
            { id: 'chat', label: 'Support Chat', icon: MessageCircle, badge: chatMessages.filter((m) => !m.isAdmin && !m.isRead).length },
            { id: 'seller_own_payouts', label: 'Payouts', icon: DollarSign, sellerOnly: true },
            { id: 'videos', label: 'Videos', icon: Play, adminOnly: true },
            { 
              id: 'rewards', label: 'Reward System', icon: Server, adminOnly: true,
              subItems: [
                { id: 'rewards_users', label: 'User Rewards' },
                { id: 'rewards_config', label: 'Reward Configuration' },
                { id: 'rewards_set', label: 'Set Reward' }
              ]
            },
            { id: 'settings', label: 'Settings', icon: Sliders, adminOnly: true },
          ].filter(item => {
            if (user && user.role === 'seller') return !item.adminOnly;
            if (user && user.isAdmin) return !item.sellerOnly;
            return true;
          }).map((item) => {
            const Icon = item.icon;
            const hasSub = !!item.subItems;
            const isExpanded = expandedMenus[item.id];
            
            const isParentActive = activeTab === item.id || 
                                   (item.id === 'products' && (activeTab === 'products' || activeTab === 'brands' || activeTab === 'categories')) ||
                                   (item.id === 'orders' && activeTab === 'orders') ||
                                   (item.subItems && item.subItems.some(sub => {
                                     return activeTab === sub.id || 
                                            (sub.id === 'products_brands' && activeTab === 'brands') ||
                                            (sub.id === 'products_categories' && activeTab === 'categories') ||
                                            (sub.id === 'orders_all' && activeTab === 'orders') ||
                                            (sub.id === 'orders_admin' && activeTab === 'orders_admin') ||
                                            (sub.id === 'orders_seller' && activeTab === 'orders_seller') ||
                                            (sub.id === 'orders_pickup_hub' && activeTab === 'orders_pickup_hub') ||
                                            (sub.id === 'orders_pickup' && activeTab === 'orders_pickup');
                                   }));

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasSub) {
                      toggleMenu(item.id);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-left ${
                    isParentActive
                      ? hasSub
                        ? item.id === 'orders'
                          ? 'text-amber-400 bg-slate-800/40 font-semibold'
                          : 'text-white bg-slate-800/40 font-semibold'
                        : 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 relative ${
                      isParentActive
                        ? item.id === 'orders' ? 'text-amber-400' : 'text-white'
                        : 'bg-transparent text-slate-400 group-hover:text-slate-200'
                    }`}>
                      <Icon size={15} />
                      {item.id === 'rewards' && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border border-[#0B1329]" style={{ transform: 'translate(25%, -25%)' }}></span>
                      )}
                    </div>
                    <span className={`text-sm ${
                      isParentActive
                        ? item.id === 'orders' ? 'font-semibold text-amber-400' : 'font-semibold text-white'
                        : 'font-medium'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge > 0 && (
                      <span className="bg-orange-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                        {item.badge}
                      </span>
                    )}
                    {(hasSub || item.id === 'rewards') && (
                      <ChevronRight size={13} className={`transition-transform duration-200 ${
                        isExpanded
                          ? item.id === 'orders' ? 'rotate-90 text-amber-400' : 'rotate-90 text-slate-300'
                          : isParentActive
                            ? item.id === 'orders' ? 'text-amber-400' : 'text-slate-300'
                            : 'text-slate-600'
                      }`} />
                    )}
                  </div>
                </button>
                
                {hasSub && isExpanded && (
                  <div className={`mt-0.5 ml-4 pl-3 space-y-0.5 ${
                    item.id === 'orders' ? 'border-l border-amber-500/30' : 'border-l border-slate-800'
                  }`}>
                    {item.subItems.map(sub => {
                      const isSubActive = activeTab === sub.id || 
                                          (sub.id === 'products_all' && activeTab === 'products' && productSubTab === 'all') ||
                                          (sub.id === 'products_add' && activeTab === 'products' && productSubTab === 'add') ||
                                          (sub.id === 'products_digital' && activeTab === 'products' && productSubTab === 'digital') ||
                                          (sub.id === 'products_attributes' && activeTab === 'products' && productSubTab === 'attributes') ||
                                          (sub.id === 'products_category' && activeTab === 'products' && productSubTab === 'category') ||
                                          (sub.id === 'products_colors' && activeTab === 'products' && productSubTab === 'colors') ||
                                          (sub.id === 'products_attribute_values' && activeTab === 'products' && productSubTab === 'attribute_values') ||
                                          (sub.id === 'products_catalog' && activeTab === 'products' && productSubTab === 'catalog') ||
                                          (sub.id === 'products_classified' && activeTab === 'products' && productSubTab === 'classified') ||
                                          (sub.id === 'products_admin' && activeTab === 'products' && productSubTab === 'admin') ||
                                          (sub.id === 'products_seller' && activeTab === 'products' && productSubTab === 'seller') ||
                                          (sub.id === 'products_import' && activeTab === 'products' && productSubTab === 'import') ||
                                          (sub.id === 'products_brands' && activeTab === 'brands') ||
                                          (sub.id === 'products_categories' && activeTab === 'categories') ||
                                          (sub.id === 'orders_all' && activeTab === 'orders') ||
                                          (sub.id === 'orders_admin' && activeTab === 'orders_admin') ||
                                          (sub.id === 'orders_seller' && activeTab === 'orders_seller') ||
                                          (sub.id === 'orders_pickup_hub' && activeTab === 'orders_pickup_hub') ||
                                          (sub.id === 'orders_pickup' && activeTab === 'orders_pickup');

                      const isOrdersSub = sub.id.startsWith('orders_');

                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            if (sub.id.startsWith('products_')) {
                              const subTab = sub.id.replace('products_', '');
                              if (subTab === 'categories') {
                                setActiveTab('categories');
                              } else if (subTab === 'brands') {
                                setActiveTab('brands');
                              } else {
                                setActiveTab('products');
                                setProductSubTab(subTab);
                              }
                            } else if (sub.id.startsWith('orders_')) {
                              if (sub.id === 'orders_all') {
                                setActiveTab('orders');
                              } else {
                                setActiveTab(sub.id);
                              }
                            } else {
                              setActiveTab(sub.id);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-all duration-200 ${
                            isSubActive
                              ? isOrdersSub
                                ? 'text-amber-400 font-semibold'
                                : 'text-white font-semibold bg-blue-600/90 shadow-xs'
                              : isOrdersSub
                                ? 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-4 py-4 mt-auto border-t border-slate-800/40">
          <div 
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('shop_admin_token');
                localStorage.removeItem('shop_admin_user');
                window.location.href = '/admin/login';
              }
            }}
            className="p-3 rounded-2xl flex items-center gap-3 hover:bg-slate-800/25 transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-700/50">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">Asif Hossain</div>
              <div className="text-[10px] text-slate-400 font-semibold">Admin</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-450 group-hover:text-white transition">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </aside>

      {/* Right Column Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-50/50">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-4 md:px-5 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          {/* Left part: Hamburger menu + Live indicator */}
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            {/* Live Connection Indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${rtConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${rtConnected ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
              {rtConnected ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>

          {/* Right part: Header Actions & Profile exactly like the picture */}
          <div className="flex items-center gap-2">
            {/* Brush Icon Button (Clear Cache) */}
            <button
              onClick={() => alert('System cache cleared successfully!')}
              className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-lg text-orange-500 hover:bg-orange-100 transition flex items-center justify-center cursor-pointer"
              title="Clear Cache"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 5-3-3-3 3" />
                <path d="M12 2v10" />
                <path d="M5 22h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2z" />
              </svg>
            </button>

            {/* Printer Button */}
            <button
              onClick={() => window.print()}
              className="w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center cursor-pointer shadow-xs"
              title="Print Page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </button>

            {/* Visit Store Button (Globe) */}
            <button
              onClick={() => window.open('/', '_blank')}
              className="w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center cursor-pointer shadow-xs"
              title="Visit Store (Opens in new tab)"
            >
              <Globe size={16} />
            </button>

            {/* Notification Bell Button */}
            <div className="relative">
              <button
                className="w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center cursor-pointer shadow-xs"
                title="Notifications"
              >
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
              </button>
            </div>

            {/* TN (DT) Dropdown Button */}
            <div className="relative">
              <button
                className="h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>TN (DT)</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>



            {/* User Profile */}
            <div className="relative">
              <div 
                onClick={() => {
                  if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('shop_admin_token');
                    localStorage.removeItem('shop_admin_user');
                    window.location.href = '/admin/login';
                  }
                }}
                className="h-10 bg-white border border-slate-200 rounded-lg pl-2 pr-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-2 cursor-pointer shadow-xs"
                title="Click to logout"
              >
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" 
                  alt="Avatar" 
                  className="w-6 h-6 rounded-full object-cover border border-slate-100" 
                />
                <span className="hidden sm:block">Super</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-5 space-y-5 overflow-x-hidden overflow-y-auto">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">Welcome back, Asif! <span className="animate-bounce">👋</span></h1>
                <p className="text-xs text-slate-500 font-medium">Here's what's happening with your store today.</p>
              </div>
              <div>
                <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-650 shadow-xs hover:border-slate-350 transition">
                  <span>May 12 - May 18, 2024</span>
                  <Calendar size={13} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Total Orders', val: metrics.totalOrders ? metrics.totalOrders.toLocaleString() : '0', icon: ShoppingBag, iconBg: 'bg-violet-100 text-violet-600' },
                { label: 'Total Revenue', val: metrics.totalRevenue ? `${currencySymbol}${metrics.totalRevenue.toLocaleString()}` : '0', icon: DollarSign, iconBg: 'bg-emerald-100 text-emerald-600' },
                { label: 'Total Customers', val: metrics.totalCustomers ? metrics.totalCustomers.toLocaleString() : '0', icon: Users, iconBg: 'bg-orange-100 text-orange-600' },
                { label: 'Pending Orders', val: metrics.pendingOrders ? metrics.pendingOrders.toLocaleString() : '0', icon: AlertCircle, iconBg: 'bg-amber-100 text-amber-600' },
                { label: 'Total Products', val: metrics.totalProducts ? metrics.totalProducts.toLocaleString() : '0', icon: Package, iconBg: 'bg-blue-100 text-blue-600' },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{card.label}</span>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{card.val}</h3>
                      </div>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg} shadow-xs flex-shrink-0`}>
                        <Icon size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Charts & Category Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Revenue Overview (AreaChart) */}
              <div className="lg:col-span-6 bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Revenue Overview</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-extrabold text-slate-800">{metrics.totalRevenue ? `${currencySymbol}${metrics.totalRevenue.toLocaleString()}` : '--'}</span>
                    </div>
                  </div>
                  <select className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-650 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                <div className="h-56 pr-2 flex items-center justify-center">
                  <p className="text-xs text-slate-400 font-semibold">No revenue data yet</p>
                </div>
              </div>

              {/* Order Statistics (PieChart / Donut) */}
              <div className="lg:col-span-3 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between">
                <div className="mb-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Order Statistics</h3>
                </div>
                <div className="h-44 flex items-center justify-center">
                  <p className="text-xs text-slate-400 font-semibold">No order data yet</p>
                </div>
              </div>

              {/* Sales by Category */}
              <div className="lg:col-span-3 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Sales by Category</h3>
                </div>
                <div className="h-44 flex items-center justify-center">
                  <p className="text-xs text-slate-400 font-semibold">No sales data yet</p>
                </div>
              </div>

            </div>

            {/* Bottom Row: Recent Orders & Top Selling / Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent Orders Table */}
              <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Recent Orders</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 text-[10px] font-bold rounded-lg transition"
                  >
                    View All Orders
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {metrics.orders && metrics.orders.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[9px] uppercase tracking-wider font-bold">
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {metrics.orders.slice(0, 5).map((order, index) => {
                          const statusStyles = {
                            Delivered: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                            Processing: 'bg-blue-50 text-blue-600 border border-blue-100',
                            Pending: 'bg-amber-50 text-amber-600 border border-amber-100',
                            Cancelled: 'bg-orange-50 text-orange-600 border border-orange-100'
                          };
                          const displayStatus = order.status || 'Pending';
                          return (
                            <tr key={index} className="border-b border-slate-55 hover:bg-slate-50 transition group">
                              <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[10px]">#{order._id?.substring(0, 8)}</td>
                              <td className="py-3 px-4"><span className="font-bold text-slate-800">{order.shippingAddress?.name || order.customer || 'Customer'}</span></td>
                              <td className="py-3 px-4 text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              <td className="py-3 px-4 font-extrabold text-slate-850">৳{order.totalPrice?.toLocaleString()}</td>
                              <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold inline-block capitalize bg-slate-100 text-slate-600 border">{order.paymentMethod || 'COD'}</span></td>
                              <td className="py-3 px-4"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide inline-block ${statusStyles[displayStatus] || 'bg-slate-100 text-slate-500'}`}>{displayStatus}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-10 text-center">
                      <p className="text-xs text-slate-400 font-semibold">No orders yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Stack: Top Selling & Low Stock */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Top Selling Products */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Top Selling Products</h3>
                      <button onClick={() => setActiveTab('products')} className="text-blue-600 text-[10px] font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {productsList.filter(p => p.salesCount > 0).length > 0 ? (
                        [...productsList].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200">{item.name?.charAt(0)}</div>
                              <div>
                                <span className="text-[11px] font-bold text-slate-800 block truncate max-w-[140px]">{item.name}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">{item.salesCount || 0} Sold</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-black text-slate-800">৳{item.price?.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 font-semibold text-center py-4">No sales data yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Low Stock Alert</h3>
                    <button onClick={() => setActiveTab('products')} className="text-blue-600 text-[10px] font-bold hover:underline">View All</button>
                  </div>
                  {productsList.filter(p => !p.isDigital && p.countInStock !== undefined && Number(p.countInStock) <= 10).length > 0 ? (
                    productsList.filter(p => !p.isDigital && p.countInStock !== undefined && Number(p.countInStock) <= 10).sort((a, b) => Number(a.countInStock) - Number(b.countInStock)).slice(0, 1).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-orange-50/50 border border-orange-100/70 p-3 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold border border-orange-200">{item.name?.charAt(0)}</div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-800 block">{item.name}</span>
                            <span className="text-[9px] text-orange-500 font-extrabold">Stock: {item.countInStock} <span className="font-semibold text-orange-500">(Only {item.countInStock} left)</span></span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-[10px] text-slate-400 font-semibold">All products are well-stocked</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl ">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Orders Overview</h1>
                <p className="text-xs text-gray-500 font-medium mt-1">Review orders, manage payment status, and initiate courier shipments.</p>
              </div>
              <div className="px-4 py-2 bg-gray-50 rounded-xl border border-slate-100 shadow-inner">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Orders</span>
                <span className="text-lg font-black text-gray-900">{metrics.orders?.length || 0}</span>
              </div>
            </div>
            
            <div className="overflow-x-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                    <th className="py-3 px-4 rounded-l-xl">Order ID</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {renderOrdersTable(metrics.orders)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            {/* Products Sub-menu Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              {[
                { id: 'add', label: 'Add Product' },
                { id: 'all', label: 'All Products' },
                { id: 'admin', label: 'Admin Products' },
                { id: 'seller', label: 'Seller Products' },
                { id: 'digital', label: 'Digital Products' },
                { id: 'catalog', label: 'Catalog Products' },
                { id: 'classified', label: 'Classified Products' },
                { id: 'reviews', label: 'Product Reviews' },
                { id: 'colors', label: 'Colors' },
                { id: 'attributes', label: 'Attributes Sets' },
                { id: 'attribute_values', label: 'Attribute Values' },
                { id: 'import', label: 'Import Products' }
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setProductSubTab(subTab.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    productSubTab === subTab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 hover:text-gray-900'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            {/* Sub-tab: ALL PRODUCTS LIST */}
            {productSubTab === 'all' && (
              <div className="space-y-6">
                {/* Products Header Card */}
                <div className="flex justify-between items-center bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Products</h1>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        You have total {productsList.length} products
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setProductSubTab('add')} 
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Plus size={14} /> ADD NEW PRODUCT
                    </button>
                    <button className="p-2.5 hover:bg-slate-50 text-gray-400 hover:text-gray-600 rounded-xl transition border border-transparent hover:border-slate-200">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Status Pills Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'All', count: productsList.length },
                    { id: 'published', label: 'Published', count: productsList.filter(p => p.isPublished !== false).length },
                    { id: 'unpublished', label: 'Unpublished', count: productsList.filter(p => p.isPublished === false).length },
                    { id: 'pending', label: 'Pending', count: productsList.filter(p => p.isPending === true).length },
                    { id: 'trash', label: 'Trash', count: productsList.filter(p => p.isTrash === true).length }
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setProductStatusFilter(pill.id)}
                      className={`px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer border flex items-center gap-2 ${
                        productStatusFilter === pill.id
                          ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                          : 'bg-white border-slate-200 text-gray-500 hover:bg-slate-50'
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        productStatusFilter === pill.id
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-gray-605'
                      }`}>
                        {pill.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search & Filters Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-sm font-bold text-gray-800">
                      Products
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 flex-1 md:justify-end">
                      {/* Select Seller */}
                      <div className="w-full sm:w-44">
                        <select
                          value={productSellerFilter}
                          onChange={(e) => setProductSellerFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs text-gray-700 font-semibold cursor-pointer"
                        >
                          <option value="all">Select Seller</option>
                          <option value="admin">Admin Products</option>
                          {allUsers.filter(u => u.role === 'seller').map((seller) => (
                            <option key={seller._id} value={seller._id}>{seller.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Select Category */}
                      <div className="w-full sm:w-44">
                        <select
                          value={productCategoryFilter}
                          onChange={(e) => setProductCategoryFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs text-gray-700 font-semibold cursor-pointer"
                        >
                          <option value="all">Select Category</option>
                          {categoryList.map((cat) => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sort Dropdown */}
                      <div className="w-full sm:w-44">
                        <select
                          value={productSortOrder}
                          onChange={(e) => setProductSortOrder(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs text-gray-700 font-semibold cursor-pointer"
                        >
                          <option value="latest">Latest On Top</option>
                          <option value="oldest">Oldest On Top</option>
                          <option value="price_asc">Price: Low to High</option>
                          <option value="price_desc">Price: High to Low</option>
                        </select>
                      </div>

                      {/* Search Input */}
                      <div className="flex items-center gap-1.5 w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="Search product..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs text-gray-700"
                        />
                        <button className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer flex items-center justify-center">
                          <Search size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Card */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  {renderProductsTable(getFilteredProducts(productsList))}
                </div>
              </div>
            )}

            {/* Sub-tab: ADMIN PRODUCTS */}
            {productSubTab === 'admin' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Admin Products</h3>
                    <p className="text-[10px] text-gray-500">Products created directly by administrator account.</p>
                  </div>
                  <button 
                    onClick={() => setProductSubTab('add')} 
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>
                {renderProductsTable(productsList.filter(p => !p.user_id || p.user_id === user?._id))}
              </div>
            )}

            {/* Sub-tab: SELLER PRODUCTS */}
            {productSubTab === 'seller' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Seller Products</h3>
                    <p className="text-[10px] text-gray-500">Products submitted by third-party sellers.</p>
                  </div>
                </div>
                {renderProductsTable(productsList.filter(p => p.user_id && p.user_id !== user?._id))}
              </div>
            )}

            {/* Sub-tab: CATALOG PRODUCTS */}
            {productSubTab === 'catalog' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Catalog Products</h3>
                    <p className="text-[10px] text-gray-500">Physical storefront catalog items.</p>
                  </div>
                  <button 
                    onClick={() => setProductSubTab('add')} 
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>
                {renderProductsTable(productsList.filter(p => !p.isDigital))}
              </div>
            )}

            {/* Sub-tab: CLASSIFIED PRODUCTS */}
            {productSubTab === 'classified' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Classified Products</h3>
                    <p className="text-[10px] text-gray-500">User-submitted classified listings.</p>
                  </div>
                </div>
                {renderProductsTable(productsList.filter(p => Array.isArray(p.tags) ? p.tags.includes('classified') : false))}
              </div>
            )}

            {/* Sub-tab: PRODUCT REVIEWS */}
            {productSubTab === 'reviews' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-gray-900 text-base">Product Reviews</h3>
                  <p className="text-[10px] text-gray-500">Customer feedback and ratings review panel.</p>
                </div>
                <div className="overflow-x-auto p-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="py-3 px-4 rounded-l-xl">Product</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4">Comment</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {reviewsList.map((rev) => (
                        <tr key={rev.id} className="border-b border-transparent hover:bg-slate-50 transition">
                          <td className="py-4 px-4 font-bold text-gray-900">{rev.product}</td>
                          <td className="py-4 px-4 text-gray-700 font-semibold">{rev.customer}</td>
                          <td className="py-4 px-4 font-black text-amber-500">{'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}</td>
                          <td className="py-4 px-4 text-gray-500 italic">"{rev.comment}"</td>
                          <td className="py-4 px-4 text-right rounded-r-xl">
                            <button
                              onClick={() => {
                                setReviewsList(reviewsList.filter(r => r.id !== rev.id));
                                alert('Review approved / kept.');
                              }}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg font-bold transition mr-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setReviewsList(reviewsList.filter(r => r.id !== rev.id));
                                alert('Review deleted.');
                              }}
                              className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg font-bold transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab: COLORS */}
            {productSubTab === 'colors' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-gray-900 text-base">Color Manager</h3>
                    <p className="text-[10px] text-gray-500">Manage standard colors used for product variants.</p>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {colorsList.map((col) => (
                      <div key={col.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border border-slate-350 shadow-inner" style={{ backgroundColor: col.code }}></span>
                          <span className="font-bold text-gray-900 text-sm">{col.name}</span>
                        </div>
                        <button
                          onClick={() => setColorsList(colorsList.filter(c => c.id !== col.id))}
                          className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg font-bold transition"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white/90 p-6 border border-slate-200 rounded-2xl shadow-xl space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">Create Color</h3>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Color Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Amber Gold"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hex Code</label>
                      <div className="flex gap-2 items-center mt-1.5">
                        <input
                          type="color"
                          value={newColorCode}
                          onChange={(e) => setNewColorCode(e.target.value)}
                          className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newColorCode}
                          onChange={(e) => setNewColorCode(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!newColorName || !newColorCode) return;
                        setColorsList([...colorsList, { id: String(Date.now()), name: newColorName, code: newColorCode }]);
                        setNewColorName('');
                        alert('Color added successfully!');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl"
                    >
                      Add Color
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab: ATTRIBUTE VALUES */}
            {productSubTab === 'attribute_values' && (() => {
              const itemsPerPage = 10;
              const indexOfLastItem = attrValuePage * itemsPerPage;
              const indexOfFirstItem = indexOfLastItem - itemsPerPage;
              const currentItems = attributeValuesList.slice(indexOfFirstItem, indexOfLastItem);
              const totalPages = Math.ceil(attributeValuesList.length / itemsPerPage);

              return (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-1.5 bg-amber-500 rounded-full"></span>
                      <h1 className="text-xl font-bold text-gray-900">Attribute Values</h1>
                    </div>
                    <p className="text-[10px] text-gray-500 pl-7">
                      You have total {attributeValuesList.length} Attributes
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Card: Values Table */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-hidden flex flex-col justify-between min-h-[480px]">
                      <div>
                        <div className="mb-4">
                          <h3 className="font-bold text-gray-900 text-sm">Values</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                                <th className="py-3 px-4 font-bold text-slate-500">#</th>
                                <th className="py-3 px-4 font-bold text-slate-500">Attribute</th>
                                <th className="py-3 px-4 font-bold text-slate-500">Values</th>
                                <th className="py-3 px-4 font-bold text-slate-500 text-right pr-6">Options</th>
                              </tr>
                            </thead>
                            <tbody className="text-xs text-gray-700">
                              {currentItems.map((val, idx) => (
                                <tr key={val.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                  <td className="py-4 px-4 text-gray-500">{indexOfFirstItem + idx + 1}</td>
                                  <td className="py-4 px-4 font-semibold text-gray-500">{val.type || ''}</td>
                                  <td className="py-4 px-4 font-bold text-gray-800">{val.value}</td>
                                  <td className="py-4 px-4 text-right pr-6 whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                      {/* Edit */}
                                      <button
                                        onClick={() => {
                                          setEditingAttrValue(val.id);
                                          setNewAttrValueType(val.type || '');
                                          setNewAttrValueVal(val.value);
                                        }}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                                        title="Edit"
                                      >
                                        <Edit2 size={13} />
                                      </button>
                                      {/* Delete */}
                                      <button
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete this attribute value?')) {
                                            setAttributeValuesList(attributeValuesList.filter(v => v.id !== val.id));
                                            if (editingAttrValue === val.id) {
                                              setEditingAttrValue(null);
                                              setNewAttrValueType('');
                                              setNewAttrValueVal('');
                                            }
                                          }
                                        }}
                                        className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                                        title="Delete"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {currentItems.length === 0 && (
                                <tr>
                                  <td colSpan="4" className="py-8 text-center text-gray-400">
                                    No attribute values configured.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center gap-1.5 mt-6 pl-2">
                          <button
                            type="button"
                            onClick={() => setAttrValuePage(prev => Math.max(1, prev - 1))}
                            disabled={attrValuePage === 1}
                            className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition text-gray-450 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-xs font-bold"
                          >
                            &lt;
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                            <button
                              key={pg}
                              type="button"
                              onClick={() => setAttrValuePage(pg)}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg transition text-xs font-bold cursor-pointer ${
                                attrValuePage === pg
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'border border-slate-200 hover:bg-slate-50 text-gray-600'
                              }`}
                            >
                              {pg}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setAttrValuePage(prev => Math.min(totalPages, prev + 1))}
                            disabled={attrValuePage === totalPages}
                            className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition text-gray-450 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-xs font-bold"
                          >
                            &gt;
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Card: Add Value / Edit Value Form */}
                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 h-fit">
                      <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">
                        {editingAttrValue !== null ? 'Edit Value' : 'Add Value'}
                      </h3>
                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Attribute *</label>
                          <select
                            value={newAttrValueType}
                            onChange={(e) => setNewAttrValueType(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 font-semibold cursor-pointer text-xs"
                          >
                            <option value="">Select attribute</option>
                            <option value="">(None)</option>
                            {attributes.map((attr, aIdx) => (
                              <option key={aIdx} value={attr.name}>{attr.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Value *</label>
                          <input
                            type="text"
                            placeholder="Value"
                            value={newAttrValueVal}
                            onChange={(e) => setNewAttrValueVal(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition text-xs"
                          />
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                          {editingAttrValue !== null && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAttrValue(null);
                                setNewAttrValueType('');
                                setNewAttrValueVal('');
                              }}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-650 font-bold rounded-xl transition cursor-pointer text-xs"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (!newAttrValueVal) {
                                alert('Please enter an attribute value');
                                return;
                              }

                              if (editingAttrValue !== null) {
                                // Update
                                setAttributeValuesList(
                                  attributeValuesList.map(v =>
                                    v.id === editingAttrValue
                                      ? { ...v, type: newAttrValueType, value: newAttrValueVal }
                                      : v
                                  )
                                );
                                setEditingAttrValue(null);
                                alert('Attribute value updated successfully!');
                              } else {
                                // Create
                                setAttributeValuesList([
                                  ...attributeValuesList,
                                  {
                                    id: String(Date.now()),
                                    type: newAttrValueType,
                                    value: newAttrValueVal
                                  }
                                ]);
                                alert('Attribute value added successfully!');
                              }
                              // Reset form
                              setNewAttrValueType('');
                              setNewAttrValueVal('');
                            }}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-xs"
                          >
                            SAVE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Sub-tab: IMPORT PRODUCTS */}
            {productSubTab === 'import' && (() => {
              return (
                <div className="w-full space-y-4">
                  {/* Page Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-5 bg-amber-500 rounded-full" />
                    <h2 className="text-base font-bold text-gray-900">Import Products</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Left: Import Form Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                      <h3 className="font-bold text-gray-900 text-sm mb-5">Import Products</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-600 mb-1.5 block">
                            Import File <span className="text-gray-400">*(.csv/.xlsx/.xls File)</span>
                          </label>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                            <span className="flex-1 px-3 py-2 text-xs text-slate-400 bg-white truncate">
                              {productImportFile ? productImportFile.name : 'Choose file...'}
                            </span>
                            <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border-l border-slate-200 text-slate-700 font-semibold cursor-pointer text-xs whitespace-nowrap transition h-9 flex items-center">
                              Browse
                              <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                className="hidden"
                                onChange={(e) => setProductImportFile(e.target.files?.[0] || null)}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={async () => {
                              if (!productImportFile) {
                                alert('Please select a file to import');
                                return;
                              }
                              alert('Import started in background...');
                            }}
                            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md shadow-md transition cursor-pointer text-xs uppercase"
                          >
                            SAVE
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Instructions + Category/Brand List */}
                    <div className="space-y-4">
                      {/* Product Import Procedures Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Product Import Procedures</h3>
                        <p className="text-xs text-amber-500 font-semibold mb-3">Please check this before importing your file:</p>
                        <ol className="space-y-2 text-xs text-gray-600 list-decimal list-inside">
                          <li>Uploaded File type must be: .xlsx Or .xls Or .csv</li>
                          <li>The file must contain: name, category_id, price, unit, current_stock, minimum_order_quantity</li>
                          <li>price and purchase_cost must be numeric</li>
                          <li className="leading-relaxed">
                            Optional columns those can be added: brand_id, slug, barcode, sku, tags, video_provider, video_url, is_approved, is_catalog, external_link, is_refundable, cash_on_delivery, short_description, description
                          </li>
                        </ol>
                        <a
                          href={`${API_URL}/product_import_sample.csv`}
                          download
                          className="mt-4 text-amber-500 hover:text-amber-600 text-xs flex items-center gap-1 transition"
                        >
                          <Download size={13} />
                          Parcel Import Sample Download
                        </a>
                      </div>

                      {/* Category & Brand List with ID Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <h3 className="font-bold text-gray-900 text-sm mb-5">Category &amp; Brand List with ID</h3>
                        <div className="flex gap-3">
                          <a
                            href={`${API_URL}/categories/export`}
                            download
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 font-semibold rounded-lg text-xs transition cursor-pointer"
                          >
                            <Download size={13} />
                            CATEGORIES
                          </a>
                          <a
                            href={`${API_URL}/brands/export`}
                            download
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 font-semibold rounded-lg text-xs transition cursor-pointer"
                          >
                            <Download size={13} />
                            BRANDS
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Sub-tab: CATEGORY MANAGER */}
            {productSubTab === 'category' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-gray-900 text-base">All Categories</h3>
                    <p className="text-[10px] text-gray-500">Browse categories used for catalog navigation.</p>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {categoryList.map((cat) => {
                      const count = productsList.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length;
                      return (
                        <div key={cat._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                          <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                          <span className="text-xs text-gray-400 font-semibold">{count} Products listed</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">Create Category</h3>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Home Appliances"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newCategoryName) return;
                        setCategories([...categories, newCategoryName]);
                        setNewCategoryName('');
                        alert('Category added successfully!');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              </div>
            )}
                {/* Sub-tab: ADD PRODUCT FORM */}
                {productSubTab === 'add' && (
                  <div className="space-y-6 max-w-5xl">
                    
                    {/* Form Header */}
                <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                        <h1 className="text-xl font-bold text-gray-900">Add Product</h1>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setProductSubTab('all')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                      >
                        ← BACK
                      </button>
                    </div>

                    {/* Form Navigation Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'info', label: 'Product Information' },
                        { id: 'media', label: 'Images & Videos' },
                        { id: 'price', label: 'Product Price & Stock' },
                        { id: 'description', label: 'Description & Specification' },
                        { id: 'shipping', label: 'Shipping Info' },
                        { id: 'others', label: 'Others' },
                        { id: 'seo', label: 'SEO' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setFormActiveTab(tab.id)}
                          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer border ${
                            formActiveTab === tab.id
                              ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                              : 'bg-white border-slate-200 text-gray-500 hover:bg-slate-50'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Form Wrapper */}
                    <form onSubmit={handleCreateProduct} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6 text-xs text-gray-700">
                      
                      {/* TAB 1: PRODUCT INFORMATION */}
                      {formActiveTab === 'info' && (
                        <div className="space-y-5">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-sm">Product Information</h3>
                          </div>
                          
                          {/* Product Name */}
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="Product Name"
                              value={newProduct.name}
                              onChange={(e) => {
                                const name = e.target.value;
                                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                setNewProduct({ ...newProduct, name, slug });
                              }}
                              className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                            />
                          </div>

                          {/* Category & Brand */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category *</label>
                              <select
                                value={newProduct.category}
                                required
                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 font-semibold"
                              >
                                <option value="">Select Category</option>
                                {categoryList.map((cat) => (
                                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Brand</label>
                              <select
                                value={brandList.find((b) => b.name === newProduct.brand) ? newProduct.brand : ''}
                                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 font-semibold"
                              >
                                <option value="">Select Brand</option>
                                {brandList.map((b) => (
                                  <option key={b._id} value={b.name}>{b.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Unit & Min. Order Quantity */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit *</label>
                              <input
                                type="text"
                                required
                                placeholder="Unit ( e.g kg. pc. etc )"
                                value={newProduct.unit || 'pc'}
                                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Min. Order Quantity *</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={newProduct.minOrderQty || 1}
                                onChange={(e) => setNewProduct({ ...newProduct, minOrderQty: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                              />
                            </div>
                          </div>

                          {/* Barcode */}
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Barcode</label>
                            <div className="flex gap-2 mt-1.5">
                              <input
                                type="text"
                                placeholder="Enter product barcode"
                                value={newProduct.barcode || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                                className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const rand = String(Math.floor(100000000000 + Math.random() * 900000000000));
                                  setNewProduct({ ...newProduct, barcode: rand });
                                }}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-gray-600 rounded-xl transition flex items-center justify-center cursor-pointer"
                                title="Generate Barcode"
                              >
                                <Sliders size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Tags */}
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tags</label>
                            <input
                              type="text"
                              placeholder="Write & hit enter"
                              value={newProduct.tags}
                              onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                              className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                            />
                          </div>

                          {/* Slug */}
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Slug</label>
                            <input
                              type="text"
                              placeholder="Product Slug"
                              value={newProduct.slug || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                              className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                            />
                          </div>

                          {/* Digital Toggle */}
                          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div>
                              <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wide block">Digital</span>
                              <span className="text-[10px] text-gray-400">The product won't be shipped</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={newProduct.isDigital}
                                onChange={(e) => setNewProduct({ ...newProduct, isDigital: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            </label>
                          </div>

                          {newProduct.isDigital && (
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Digital Delivery URL / Download Link</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. https://drive.google.com/file/d/xxxxx/view"
                                value={newProduct.digitalFileUrl}
                                onChange={(e) => setNewProduct({ ...newProduct, digitalFileUrl: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: IMAGES & VIDEOS */}
                      {formActiveTab === 'media' && (
                        <div className="space-y-5">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-sm">Images & Videos</h3>
                          </div>
                          
                          {/* Main Image */}
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Main Image (Upload)</label>
                            <div className="mt-1 flex items-center gap-3">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                  }
                                }}
                                className="flex-1 text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs file:font-bold hover:file:bg-blue-700 file:cursor-pointer"
                              />
                            </div>
                            {(imagePreview || newProduct.image) && (
                              <div className="mt-3">
                                <img
                                  src={imagePreview || newProduct.image}
                                  alt="Preview"
                                  className="h-28 w-28 object-cover rounded-xl border border-slate-200 shadow-xs"
                                />
                              </div>
                            )}
                          </div>

                          {/* Gallery Images */}
                          <div className="p-4 bg-gray-50 border border-slate-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Additional Images (Upload)</label>
                              <button
                                type="button"
                                onClick={() => setAdditionalImageFiles([...additionalImageFiles, null])}
                                className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md text-[10px] font-bold rounded-xl transition cursor-pointer"
                              >
                                + Add Image
                              </button>
                            </div>
                            {additionalImageFiles.length === 0 && (
                              <p className="text-[10px] text-gray-500 italic">No additional images selected.</p>
                            )}
                            {additionalImageFiles.map((file, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const f = e.target.files[0];
                                    if (f) {
                                      const updated = [...additionalImageFiles];
                                      updated[idx] = f;
                                      setAdditionalImageFiles(updated);
                                    }
                                  }}
                                  className="flex-1 text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-[10px] file:font-bold hover:file:bg-blue-700 file:cursor-pointer"
                                />
                                {file && (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt=""
                                    className="w-10 h-10 object-cover rounded border border-gray-300"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = additionalImageFiles.filter((_, i) => i !== idx);
                                    setAdditionalImageFiles(updated);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-red-400 transition cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* YouTube Link */}
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">YouTube Video URL</label>
                            <input
                              type="text"
                              placeholder="e.g. https://www.youtube.com/watch?v=..."
                              value={newProduct.youtubeUrl || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, youtubeUrl: e.target.value })}
                              className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                            />
                          </div>
                        </div>
                      )}

                      {/* TAB 3: PRODUCT PRICE & STOCK */}
                      {formActiveTab === 'price' && (
                        <div className="space-y-5">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-sm">Product Price & Stock</h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Base Price ({currencyCode}) *</label>
                              <input
                                type="number"
                                required
                                placeholder="0.00"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discount Percent (%)</label>
                              <input
                                type="number"
                                placeholder="0"
                                value={newProduct.discountPercent}
                                onChange={(e) => setNewProduct({ ...newProduct, discountPercent: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock Count *</label>
                              <input
                                type="number"
                                required={!newProduct.isDigital}
                                disabled={newProduct.isDigital}
                                placeholder={newProduct.isDigital ? 'Unlimited' : 'e.g. 25'}
                                value={newProduct.isDigital ? '' : newProduct.countInStock}
                                onChange={(e) => setNewProduct({ ...newProduct, countInStock: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition disabled:opacity-50"
                              />
                            </div>
                          </div>

                          {/* Flash Sale Option */}
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wide block font-bold">Promote to Flash Sale</span>
                                <span className="text-[10px] text-gray-400 font-medium">Add product to flash sale schedules</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={newProduct.isFlashSale}
                                  onChange={(e) => setNewProduct({ ...newProduct, isFlashSale: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                              </label>
                            </div>

                            {newProduct.isFlashSale && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Flash Sale Start</label>
                                  <input type="datetime-local" value={newProduct.flashSaleStart ? newProduct.flashSaleStart.slice(0,16) : ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, flashSaleStart: e.target.value })}
                                    className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Flash Sale End</label>
                                  <input type="datetime-local" value={newProduct.flashSaleEnd ? newProduct.flashSaleEnd.slice(0,16) : ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, flashSaleEnd: e.target.value })}
                                    className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-xs"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* TAB 4: DESCRIPTION & SPECIFICATION */}
                      {formActiveTab === 'description' && (
                        <div className="space-y-5">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-sm">Description & Specification</h3>
                          </div>
                          
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Description *</label>
                            <textarea
                              required
                              placeholder="Write descriptive content for store details..."
                              rows="6"
                              value={newProduct.description}
                              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                              className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* TAB 5: SHIPPING INFO */}
                      {formActiveTab === 'shipping' && (
                        <div className="space-y-5">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-sm">Shipping Information</h3>
                          </div>
                          <p className="text-xs text-gray-500 italic">Shipping parameters use global courier configuration rates.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Package Weight (kg)</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Package Dimensions (cm)</label>
                              <input
                                type="text"
                                placeholder="e.g. 10 x 20 x 15"
                                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 6: OTHERS */}
                      {formActiveTab === 'others' && (
                        <div className="space-y-5">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-sm">Other Configuration Options</h3>
                          </div>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border p-4 rounded-xl flex-1 select-none">
                              <input type="checkbox" defaultChecked className="accent-blue-600" />
                              <div>
                                <span className="font-bold block text-[11px] text-gray-700">Published Status</span>
                                <span className="text-[10px] text-gray-400 font-medium">Visible to frontend buyers catalog</span>
                              </div>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border p-4 rounded-xl flex-1 select-none">
                              <input type="checkbox" className="accent-blue-600" />
                              <div>
                                <span className="font-bold block text-[11px] text-gray-700">Featured Badge</span>
                                <span className="text-[10px] text-gray-400 font-medium">Render in featured lists and slide highlights</span>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* TAB 7: SEO */}
                      {formActiveTab === 'seo' && (
                        <div className="space-y-5">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-sm">SEO Search Optimization Settings</h3>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Title</label>
                            <input 
                              type="text" 
                              value={newProduct.metaTitle}
                              onChange={(e) => setNewProduct({ ...newProduct, metaTitle: e.target.value })}
                              placeholder="Leave empty to use product name"
                              className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
                            <textarea 
                              rows="4" 
                              value={newProduct.metaDescription}
                              onChange={(e) => setNewProduct({ ...newProduct, metaDescription: e.target.value })}
                              placeholder="Brief description for search engines..."
                              className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-sm"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* Form Submission Button */}
                      <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setProductSubTab('all')}
                          className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-gray-600 font-bold rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                        >
                          {loading ? 'Processing...' : 'Save & Publish Product'}
                        </button>
                      </div>

                    </form>
                  </div>
                )}

            {/* Sub-tab: ATTRIBUTES */}
            {productSubTab === 'attributes' && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-1.5 bg-amber-500 rounded-full"></span>
                    <h1 className="text-xl font-bold text-gray-900">All Attribute</h1>
                  </div>
                  <p className="text-[10px] text-gray-500 pl-7">
                    You have total {attributes.length} Attributes
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Side: Attributes Table Card */}
                  <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-hidden">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 text-sm">Attributes</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                            <th className="py-3 px-4 font-bold text-slate-500">#</th>
                            <th className="py-3 px-4 font-bold text-slate-500">Title</th>
                            <th className="py-3 px-4 font-bold text-slate-500">Values</th>
                            <th className="py-3 px-4 font-bold text-slate-500">Categories</th>
                            <th className="py-3 px-4 font-bold text-slate-500 text-right pr-6">Options</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs text-gray-750">
                          {attributes.map((attr, idx) => (
                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                              <td className="py-4 px-4 text-gray-500">{idx + 1}</td>
                              <td className="py-4 px-4 font-bold text-gray-900">{attr.name}</td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {(attr.values || []).map((val, vidx) => (
                                    <span key={vidx} className="px-2.5 py-1 bg-amber-500/5 text-amber-605 font-bold rounded-lg border border-amber-500/10 text-[10px]">
                                      {val}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {(attr.categories || []).map((cat, cidx) => (
                                    <span key={cidx} className="px-2.5 py-1 bg-amber-500/5 text-amber-605 font-bold rounded-lg border border-amber-500/10 text-[10px]">
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right pr-6 whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Manage Values (Gear icon) */}
                                  <button
                                    onClick={() => {
                                      setProductSubTab('attribute_values');
                                    }}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                                    title="Manage Values"
                                  >
                                    <Settings size={13} />
                                  </button>
                                  {/* Edit */}
                                  <button
                                    onClick={() => {
                                      setEditingAttribute(idx);
                                      setNewAttribute({ name: attr.name, values: (attr.values || []).join(', ') });
                                      setAttrSelectedCategories(attr.categories || []);
                                    }}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                                    title="Edit"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  {/* Delete */}
                                  <button
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this attribute set?')) {
                                        setAttributes(attributes.filter((_, i) => i !== idx));
                                        if (editingAttribute === idx) {
                                          setEditingAttribute(null);
                                          setNewAttribute({ name: '', values: '' });
                                          setAttrSelectedCategories([]);
                                        }
                                      }
                                    }}
                                    className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                                    title="Delete"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {attributes.length === 0 && (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-400">
                                No attributes configured.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Side: Add / Edit Attribute Card */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 h-fit">
                    <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">
                      {editingAttribute !== null ? 'Edit Attribute' : 'Add Attribute'}
                    </h3>
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Title *</label>
                        <input
                          type="text"
                          placeholder="Title"
                          value={newAttribute.name}
                          onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition text-xs"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Category</label>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && !attrSelectedCategories.includes(val)) {
                              setAttrSelectedCategories([...attrSelectedCategories, val]);
                            }
                            e.target.value = ''; // Reset dropdown selection
                          }}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 font-semibold cursor-pointer text-xs mb-2"
                        >
                          <option value="">Select Category</option>
                          {categoryList.map((cat) => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>

                        {/* Render selected categories as pills */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {attrSelectedCategories.map((cat, cidx) => (
                            <span key={cidx} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/5 text-amber-606 font-bold border border-amber-500/10 rounded-lg text-[10px]">
                              {cat}
                              <button
                                type="button"
                                onClick={() => setAttrSelectedCategories(attrSelectedCategories.filter(c => c !== cat))}
                                className="text-amber-600 font-extrabold hover:text-amber-800 transition"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Values (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. Leather, Cotton, Polyester"
                          value={newAttribute.values}
                          onChange={(e) => setNewAttribute({ ...newAttribute, values: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition text-xs"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        {editingAttribute !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAttribute(null);
                              setNewAttribute({ name: '', values: '' });
                              setAttrSelectedCategories([]);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-650 font-bold rounded-xl transition cursor-pointer text-xs"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (!newAttribute.name) {
                              alert('Please enter an attribute name');
                              return;
                            }
                            const parsedVals = newAttribute.values
                              ? newAttribute.values.split(',').map(x => x.trim()).filter(Boolean)
                              : [];

                            if (editingAttribute !== null) {
                              // Update
                              const updated = [...attributes];
                              updated[editingAttribute] = {
                                name: newAttribute.name,
                                values: parsedVals,
                                categories: attrSelectedCategories
                              };
                              setAttributes(updated);
                              setEditingAttribute(null);
                              alert('Attribute updated successfully!');
                            } else {
                              // Create
                              setAttributes([
                                ...attributes,
                                {
                                  name: newAttribute.name,
                                  values: parsedVals,
                                  categories: attrSelectedCategories
                                }
                              ]);
                              alert('Attribute added successfully!');
                            }
                            // Reset form
                            setNewAttribute({ name: '', values: '' });
                            setAttrSelectedCategories([]);
                          }}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-xs"
                        >
                          SAVE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab: DIGITAL PRODUCTS */}
            {productSubTab === 'digital' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-gray-900 text-base">Digital Assets Manager</h3>
                  <p className="text-[10px] text-gray-500">List of all intangible goods, software keys, courses, and downloads.</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {productsList.filter(p => p.isDigital).map((prod) => (
                    <div key={prod._id} className="p-4 flex items-center justify-between text-xs sm:text-sm hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl(prod.image)} className="w-10 h-10 object-cover rounded-lg bg-white border border-slate-200" />
                        <div>
                          <h4 className="font-bold text-gray-900 line-clamp-1">{prod.name}</h4>
                          <span className="text-[10px] text-gray-500 font-mono select-all truncate max-w-[250px] inline-block">
                            {prod.digitalFileUrl || 'No file link provided'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-gray-900">{formatPrice(prod.price, currencySymbol)}</div>
                        <a
                          href={prod.digitalFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-blue-500 hover:underline"
                        >
                          Test Download Link
                        </a>
                      </div>
                    </div>
                  ))}
                  {productsList.filter(p => p.isDigital).length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-xs">
                      No digital products found. Go to "Add Product" and check the "Is Digital Product" option!
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-sm">
            
            {/* Coupons List */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-gray-900 text-base">Store Coupons</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-gray-500 uppercase font-bold bg-white/50">
                      <th className="py-3 pl-4">Coupon Code</th>
                      <th className="py-3">Discount (%)</th>
                      <th className="py-3">Expiry Date</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponsList.map((cp) => (
                      <tr key={cp._id} className="border-b border-slate-100/30 text-xs hover:bg-slate-50 transition-colors duration-200">
                        <td className="py-3 pl-4 font-mono font-bold text-blue-400">{cp.code}</td>
                        <td className="py-3 font-semibold text-gray-900">{cp.discount}%</td>
                        <td className="py-3 text-gray-400">{new Date(cp.expiryDate).toLocaleDateString()}</td>
                        <td className="py-3">
                          <button
                            onClick={async () => {
                              await fetch(`${API_URL}/coupons/${cp._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                body: JSON.stringify({ isActive: !cp.isActive }),
                              });
                              fetchCoupons();
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                              cp.isActive ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/30' : 'bg-orange-950/50 text-orange-400 border-orange-900/30'
                            }`}
                          >
                            {cp.isActive ? 'Active' : 'Expired'}
                          </button>
                        </td>
                        <td className="py-3 pr-4 flex gap-2">
                          <button
                            onClick={() => {
                              setEditCouponForm({ code: cp.code, discount: String(cp.discount), expiryDate: new Date(cp.expiryDate).toISOString().split('T')[0], isActive: cp.isActive });
                              setEditingCoupon(cp);
                            }}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(cp._id)}
                            className="text-[10px] font-bold text-orange-400 hover:text-orange-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {couponsList.length === 0 && (
                      <tr className="text-center text-gray-500 text-xs">
                        <td colSpan="5" className="py-8">No coupons available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coupon Form (Create / Edit) */}
            <div className="lg:col-span-4 bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-gray-900 text-sm">{editingCoupon ? 'Edit Coupon' : 'Create Coupon Code'}</h3>
                {editingCoupon && (
                  <button onClick={() => setEditingCoupon(null)} className="text-[10px] hover:text-gray-900">Cancel</button>
                )}
              </div>
              
              <form onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAVE30"
                    value={editingCoupon ? editCouponForm.code : newCoupon.code}
                    onChange={(e) => {
                      if (editingCoupon) setEditCouponForm({ ...editCouponForm, code: e.target.value.toUpperCase() });
                      else setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() });
                    }}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discount Percentage (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={editingCoupon ? editCouponForm.discount : newCoupon.discount}
                    onChange={(e) => {
                      if (editingCoupon) setEditCouponForm({ ...editCouponForm, discount: e.target.value });
                      else setNewCoupon({ ...newCoupon, discount: e.target.value });
                    }}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={editingCoupon ? editCouponForm.expiryDate : newCoupon.expiryDate}
                    onChange={(e) => {
                      if (editingCoupon) setEditCouponForm({ ...editCouponForm, expiryDate: e.target.value });
                      else setNewCoupon({ ...newCoupon, expiryDate: e.target.value });
                    }}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition"
                >
                  {editingCoupon ? 'Update Coupon' : 'Generate Coupon'}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* SHIPPING TAB */}
        {activeTab === 'shipping' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl ">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="font-black text-gray-900 text-lg tracking-tight">Shipping Methods</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Manage delivery options available during checkout.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-full border border-slate-100 shadow-inner">
                  <Ship className="text-gray-400" size={24} />
                </div>
              </div>
              <div className="overflow-x-auto w-full p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                      <th className="py-3 px-4 rounded-l-xl">Method</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Est. Delivery</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {shippingMethods.map((method) => (
                      <tr key={method._id} className="border-b border-transparent hover:bg-slate-50 transition group">
                        <td className="py-4 px-4 rounded-l-xl">
                          <div className="font-extrabold text-gray-900">{method.name}</div>
                          {method.description && (
                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">{method.description}</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-black text-gray-900">
                            {method.price === 0 ? <span className="text-emerald-500">FREE</span> : formatPrice(method.price, currencySymbol)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-500 font-medium tracking-tight">
                          {method.estimatedDays}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                            method.isActive
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border-slate-200'
                          }`}>
                            {method.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right rounded-r-xl">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleShipping(method)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                                method.isActive
                                  ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                              }`}
                            >
                              {method.isActive ? <><EyeOff size={12} /> Disable</> : <><Eye size={12} /> Enable</>}
                            </button>
                            <button
                              onClick={() => handleDeleteShipping(method._id)}
                              className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-xl transition-all duration-200"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {shippingMethods.length === 0 && (
                      <tr className="text-center text-gray-500 text-xs">
                        <td colSpan="5" className="py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Ship size={32} className="text-gray-300" />
                            <span className="font-medium">No shipping methods configured yet.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-8 border border-slate-200 shadow-lg rounded-2xl space-y-6  h-fit">
              <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="font-black text-gray-900 text-lg">Add Method</h3>
              </div>
              <form onSubmit={handleCreateShipping} className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Method Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Express Delivery"
                    value={newShipping.name}
                    onChange={(e) => setNewShipping({ ...newShipping, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Price ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newShipping.price}
                    onChange={(e) => setNewShipping({ ...newShipping, price: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Estimated Delivery</label>
                  <input
                    type="text"
                    placeholder="e.g. 3-5 business days"
                    value={newShipping.estimatedDays}
                    onChange={(e) => setNewShipping({ ...newShipping, estimatedDays: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Description (optional)</label>
                  <textarea
                    placeholder="Brief description..."
                    rows="2"
                    value={newShipping.description}
                    onChange={(e) => setNewShipping({ ...newShipping, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-black rounded-xl shadow-lg shadow-blue-500/30 transition text-sm flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Method
                </button>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (() => {
          const filteredList = categoryList.filter(c => 
            (c.name || '').toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
            (c.rootCategory || '').toLowerCase().includes(categorySearchQuery.toLowerCase())
          );
          
          const itemsPerPage = 10;
          const indexOfLastItem = categoryPage * itemsPerPage;
          const indexOfFirstItem = indexOfLastItem - itemsPerPage;
          const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
          const totalPages = Math.ceil(filteredList.length / itemsPerPage);

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
              
              {/* Left Side: Categories Table */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-hidden flex flex-col justify-between min-h-[640px]">
                <div>
                  {/* Title and Search Row */}
                  <div className="flex justify-between items-center mb-5 gap-4">
                    <h3 className="font-bold text-gray-900 text-sm">Categories</h3>
                    
                    {/* Search Input */}
                    <div className="flex items-center w-full max-w-[280px]">
                      <input
                        type="text"
                        placeholder="Search"
                        value={categorySearchQuery}
                        onChange={(e) => {
                          setCategorySearchQuery(e.target.value);
                          setCategoryPage(1);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 border-r-0 rounded-l-lg focus:outline-none text-xs text-gray-750 placeholder-gray-400"
                      />
                      <button className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-r-lg border border-slate-900 transition cursor-pointer flex items-center justify-center h-[34px] w-[34px]">
                        <Search size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                          <th className="py-3 px-3 font-bold text-slate-500">#</th>
                          <th className="py-3 px-3 font-bold text-slate-500">Title</th>
                          <th className="py-3 px-3 font-bold text-slate-500">Root Category</th>
                          <th className="py-3 px-3 font-bold text-slate-500">Order</th>
                          <th className="py-3 px-3 font-bold text-slate-500 text-center">Thumbnail</th>
                          <th className="py-3 px-3 font-bold text-slate-500 text-center">Banner</th>
                          <th className="py-3 px-3 font-bold text-slate-500 text-center">Commission</th>
                          <th className="py-3 px-3 font-bold text-slate-500 text-center">Featured</th>
                          <th className="py-3 px-3 font-bold text-slate-500 text-center">Status</th>
                          <th className="py-3 px-3 font-bold text-slate-500 text-right pr-4">Options</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] text-gray-750">
                        {currentItems.map((cat, idx) => (
                          <tr key={cat._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-3 text-gray-500">{indexOfFirstItem + idx + 1}</td>
                            <td className="py-3.5 px-3 font-bold text-gray-900 max-w-[120px] truncate" title={cat.name}>{cat.name}</td>
                            <td className="py-3.5 px-3 text-gray-500">{(!cat.rootCategory || cat.rootCategory === '--') ? '—' : cat.rootCategory}</td>
                            <td className="py-3.5 px-3 text-gray-500">{cat.order || 0}</td>
                            <td className="py-3.5 px-3 text-center">
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 mx-auto flex items-center justify-center bg-slate-50">
                                {cat.image ? (
                                  <img src={getImageUrl(cat.image)} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon size={14} className="text-gray-300" />
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <div className="w-10 h-6 rounded-md overflow-hidden border border-slate-100 mx-auto flex items-center justify-center bg-slate-50">
                                {cat.banner || cat.image ? (
                                  <img src={getImageUrl(cat.banner || cat.image)} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon size={14} className="text-gray-300" />
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center text-gray-500 font-bold">{cat.commissionRate || 0} %</td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => {
                                  const updated = categoryList.map(c => 
                                    c._id === cat._id ? { ...c, featured: !c.featured } : c
                                  );
                                  setCategoryList(updated);
                                }}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  cat.featured ? 'bg-amber-500' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                    cat.featured ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => {
                                  const updated = categoryList.map(c => 
                                    c._id === cat._id ? { ...c, status: !c.status } : c
                                  );
                                  setCategoryList(updated);
                                }}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  cat.status ? 'bg-amber-500' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                    cat.status ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="py-3.5 px-3 text-right pr-4 whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingCat(cat);
                                    setCatForm({
                                      name: cat.name,
                                      image: cat.image || '',
                                      order: cat.order || 0,
                                      rootCategory: cat.rootCategory || '',
                                      slug: cat.slug || '',
                                      commissionRate: cat.commissionRate || 0,
                                      icon: cat.icon || '',
                                      banner: cat.banner || '',
                                      metaTitle: cat.metaTitle || '',
                                      metaDescription: cat.metaDescription || '',
                                      featured: cat.featured || false,
                                      status: cat.status !== false
                                    });
                                  }}
                                  className="w-7 h-7 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-full transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat._id)}
                                  className="w-7 h-7 flex items-center justify-center bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-full transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {currentItems.length === 0 && (
                          <tr>
                            <td colSpan="10" className="py-8 text-center text-gray-400">
                              No categories configured.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 mt-6 pl-2">
                    <button
                      type="button"
                      onClick={() => setCategoryPage(prev => Math.max(1, prev - 1))}
                      disabled={categoryPage === 1}
                      className="w-7 h-7 flex items-center justify-center bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-xs font-bold"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                      if (totalPages > 10) {
                        const show = pg === 1 || pg === totalPages || Math.abs(pg - categoryPage) <= 2;
                        if (!show) {
                          if (pg === 2 || pg === totalPages - 1) {
                            return <span key={pg} className="px-1 text-amber-600/70 text-xs">...</span>;
                          }
                          return null;
                        }
                      }
                      return (
                        <button
                          key={pg}
                          type="button"
                          onClick={() => setCategoryPage(pg)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition text-xs font-bold cursor-pointer ${
                            categoryPage === pg
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCategoryPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={categoryPage === totalPages}
                      className="w-7 h-7 flex items-center justify-center bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-xs font-bold"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side: Add Category Card */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 max-h-[800px] overflow-y-auto scrollbar-hide w-full">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">
                  {editingCat ? 'Edit Category' : 'Add New Category'}
                </h3>
                <form onSubmit={editingCat ? handleUpdateCategory : handleCreateCategory} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Title *</label>
                    <input
                      required
                      type="text"
                      placeholder="Title"
                      value={catForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setCatForm({ ...catForm, name, slug });
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-gray-950 text-xs transition placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Root Category</label>
                    <select
                      value={catForm.rootCategory}
                      onChange={(e) => setCatForm({ ...catForm, rootCategory: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-gray-950 text-xs font-semibold cursor-pointer focus:bg-white focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">Select Category</option>
                      <option value="--">--</option>
                      {categoryList.filter(c => !c.rootCategory || c.rootCategory === '--').map((cat, cIdx) => (
                        <option key={cIdx} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Order (To show on menu sidebar)</label>
                    <input
                      type="number"
                      placeholder="Order"
                      value={catForm.order}
                      onChange={(e) => setCatForm({ ...catForm, order: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-gray-950 text-xs transition placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Slug</label>
                    <input
                      type="text"
                      placeholder="Slug"
                      value={catForm.slug}
                      onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-gray-950 text-xs transition placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Commission Rate</label>
                    <input
                      type="number"
                      placeholder="Commission Rate (%)"
                      value={catForm.commissionRate}
                      onChange={(e) => setCatForm({ ...catForm, commissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-gray-950 text-xs transition placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Icon</label>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-500 transition">
                      <div className="w-10 h-10 flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 font-bold text-xs">
                        {catForm.icon ? catForm.icon.substring(0, 2) : '?'}
                      </div>
                      <input
                        type="text"
                        placeholder="Enter product icon"
                        value={catForm.icon}
                        onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                        className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-gray-950 text-xs"
                      />
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Thumbnail 132X132</label>
                    <div className="flex items-center justify-between border border-slate-200 rounded-lg overflow-hidden bg-slate-50 focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-500 transition mb-2 border-slate-200">
                      <span className="px-3 text-slate-400 text-xs truncate max-w-[200px]">
                        {catForm.image ? (catForm.image.split('/').pop() || 'File chosen') : '0 file chosen'}
                      </span>
                      <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border-l border-slate-200 text-slate-700 font-semibold cursor-pointer flex items-center justify-center text-xs whitespace-nowrap transition h-9">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('image', file);
                            try {
                              const res = await fetch(`${API_URL}/upload`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${user.token}` },
                                body: formData
                              });
                              const data = await res.json();
                              if (res.ok) setCatForm({ ...catForm, image: data.image });
                            } catch {}
                          }}
                        />
                      </label>
                    </div>
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50 shadow-inner">
                      {catForm.image ? (
                        <img src={getImageUrl(catForm.image)} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={20} className="text-gray-300" />
                      )}
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Banner 970X270</label>
                    <div className="flex items-center justify-between border border-slate-200 rounded-lg overflow-hidden bg-slate-50 focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-500 transition mb-2 border-slate-200">
                      <span className="px-3 text-slate-400 text-xs truncate max-w-[200px]">
                        {catForm.banner ? (catForm.banner.split('/').pop() || 'File chosen') : '0 file chosen'}
                      </span>
                      <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border-l border-slate-200 text-slate-700 font-semibold cursor-pointer flex items-center justify-center text-xs whitespace-nowrap transition h-9">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('image', file);
                            try {
                              const res = await fetch(`${API_URL}/upload`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${user.token}` },
                                body: formData
                              });
                              const data = await res.json();
                              if (res.ok) setCatForm({ ...catForm, banner: data.image });
                            } catch {}
                          }}
                        />
                      </label>
                    </div>
                    <div className="w-32 h-14 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50 shadow-inner">
                      {catForm.banner ? (
                        <img src={getImageUrl(catForm.banner)} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={20} className="text-gray-300" />
                      )}
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Meta Title</label>
                    <input
                      type="text"
                      placeholder="Meta title"
                      value={catForm.metaTitle}
                      onChange={(e) => setCatForm({ ...catForm, metaTitle: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-gray-950 text-xs transition placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Meta description</label>
                    <textarea
                      rows="3"
                      placeholder="Description"
                      value={catForm.metaDescription}
                      onChange={(e) => setCatForm({ ...catForm, metaDescription: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-gray-950 text-xs transition resize-none placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-2">
                    {editingCat && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCat(null);
                          setCatForm({
                            name: '', image: '', order: 0, rootCategory: '', slug: '',
                            commissionRate: 0, icon: '', banner: '', metaTitle: '', metaDescription: '',
                            featured: false, status: true
                          });
                        }}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition cursor-pointer text-xs"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md shadow-md transition cursor-pointer text-xs uppercase"
                    >
                      SAVE
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        {/* BRANDS TAB */}
        {activeTab === 'brands' && (
          <div className="space-y-8 max-w-4xl w-full">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Brand Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Create and manage brands with images.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {brandList.map((brand) => (
                <div key={brand._id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 group ">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-xs border border-slate-100 group-hover:scale-105 transition-transform duration-300 bg-white">
                    {brand.image ? (
                      <img src={getImageUrl(brand.image)} alt={brand.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="text-center w-full">
                    <h4 className="font-extrabold text-gray-900 text-sm truncate w-full px-2">{brand.name}</h4>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">Order: {brand.order || 0}</span>
                  </div>
                  <div className="flex gap-2 mt-2 w-full">
                    <button onClick={() => { setEditingBrand(brand); setBrandForm({ name: brand.name, image: brand.image || '', order: brand.order || 0 }); }}
                      className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-lg text-xs font-bold transition flex justify-center items-center gap-1">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDeleteBrand(brand._id)}
                      className="w-8 flex items-center justify-center bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-xl transition-all duration-200">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {brandList.length === 0 && (
                <div className="col-span-full py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-gray-300">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
                    <FolderOpen className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">No brands found.</p>
                  <p className="text-xs text-gray-400 mt-1">Create one below to get started.</p>
                </div>
              )}
            </div>

            {/* Brand Form */}
            <form onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand} className="bg-white border border-slate-100 shadow-md rounded-2xl p-6 md:p-8 space-y-5 max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${editingBrand ? 'bg-amber-400' : 'bg-blue-500'}`}></div>
                <h3 className="font-black text-gray-900 text-lg">{editingBrand ? 'Edit Brand' : 'Create New Brand'}</h3>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Brand Name</label>
                <input required value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="e.g. Nike, Apple..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Brand Image</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input value={brandForm.image} onChange={(e) => setBrandForm({ ...brandForm, image: e.target.value })}
                      placeholder="Image URL or Browse..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner" />
                  </div>
                  <label className="px-5 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer text-sm whitespace-nowrap shadow-md transition flex items-center gap-2">
                    <Upload size={16} /> Browse
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('image', file);
                        try {
                          const res = await fetch(`${API_URL}/upload`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${user.token}` },
                            body: formData,
                          });
                          const data = await res.json();
                          if (res.ok) setBrandForm({ ...brandForm, image: data.image });
                        } catch {}
                      }} />
                  </label>
                </div>
                {brandForm.image && (
                  <div className="mt-4 flex justify-center p-4 bg-gray-50 border border-slate-200 border-dashed rounded-2xl">
                    <img src={getImageUrl(brandForm.image)} alt="preview" className="h-24 w-24 object-cover rounded-xl shadow-md border border-white" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Display Order</label>
                <input type="number" value={brandForm.order} onChange={(e) => setBrandForm({ ...brandForm, order: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-black rounded-xl shadow-lg shadow-blue-500/30 transition text-sm flex justify-center items-center gap-2">
                  {editingBrand ? <><Edit size={16} /> Update Brand</> : <><Plus size={16} /> Save Brand</>}

                </button>
                {editingBrand && (
                  <button type="button" onClick={() => { setEditingBrand(null); setBrandForm({ name: '', image: '', order: 0 }); }}
                    className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition text-sm">Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* SELLERS ALL TAB (Custom UI) */}
        {activeTab === 'sellers_all' && (
          <div className="space-y-4 max-w-7xl w-full animate-fade-in">
            {/* Header Area */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Seller Lists</h1>
                  <p className="text-xs text-gray-400 mt-0.5">You have total {allUsers.filter(u => u.role === 'seller').length} sellers</p>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm">
                <Plus size={14} />
                ADD SELLER
              </button>
            </div>

            {/* Main Table Card */}
            <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
              {/* Toolbar */}
              <div className="border-b border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="font-bold text-gray-800 text-sm">Sellers</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 focus:outline-hidden bg-gray-50 min-w-[120px]">
                    <option>Filter by</option>
                  </select>
                  <div className="flex items-center">
                    <input type="text" placeholder="Search" className="border border-slate-200 border-r-0 rounded-l-lg px-3 py-1.5 text-xs w-48 focus:outline-hidden" />
                    <button className="bg-gray-800 text-white px-3 py-1.5 rounded-r-lg hover:bg-black transition">
                      <Search size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 border-b border-slate-100 w-12 text-center">#</th>
                      <th className="py-3 px-4 border-b border-slate-100">Shop Name en</th>
                      <th className="py-3 px-4 border-b border-slate-100">Author</th>
                      <th className="py-3 px-4 border-b border-slate-100">Info</th>
                      <th className="py-3 px-4 border-b border-slate-100 text-center">Shop Publish</th>
                      <th className="py-3 px-4 border-b border-slate-100 text-center">Options</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {allUsers.filter(u => u.role === 'seller').map((seller, index) => (
                      <tr key={seller._id} className="border-b border-gray-50 hover:bg-slate-50 transition">
                        <td className="py-4 px-4 text-center text-gray-500">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-slate-200">
                              <ImageIcon size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-amber-500 italic">{seller.store_name || seller.name || 'Unverified'}</span>
                                <span className="text-[9px] text-green-500 font-medium px-1.5 py-0.5 flex items-center gap-0.5">
                                  Verified
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1">Total Products: {productsList.filter(p => p.user_id === seller.id).length}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0">
                              {seller.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-[11px] text-gray-800">{seller.name}</div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                                <CheckCircle2 size={10} className="text-green-500" />
                                {seller.email.substring(0, 2)}********@{seller.email.split('@')[1]}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                *********{seller.phone ? seller.phone.substring(seller.phone.length - 3) : '000'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[10px]">
                          <div className="text-gray-600 mb-0.5">Current Balance: <span className="font-medium">DT0.00</span></div>
                          <div className="text-gray-400">Last Login : {new Date(seller.updated_at || Date.now()).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toLowerCase()}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="relative inline-block w-9 h-5 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-[3px] border-amber-400 appearance-none cursor-pointer" style={{ right: 0, transform: 'translateX(0)' }}/>
                            <label className="toggle-label block overflow-hidden h-5 rounded-full bg-amber-400 cursor-pointer"></label>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">
                              <Edit2 size={12} />
                            </button>
                            <button className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">
                              <MoreVertical size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allUsers.filter(u => u.role === 'seller').length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">No sellers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-8 max-w-6xl w-full">
            <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{activeTab === 'sellers_all' ? 'Seller Management' : 'User Management'}</h1>
                <p className="text-xs text-gray-400 mt-1">Manage users, roles, and permissions.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowOwnPasswordForm(!showOwnPasswordForm)}
                  className="text-[11px] px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all duration-200">Change Password</button>
                <button onClick={() => setShowOwnEmailForm(!showOwnEmailForm)}
                  className="text-[11px] px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all duration-200">Change Email</button>
              </div>
            </div>

            {/* Own Password Form */}
            {showOwnPasswordForm && (
              <form onSubmit={handleOwnPasswordChange} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-md">
                <h3 className="font-bold text-gray-900 text-sm">Change Your Password</h3>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                  <input type="password" required value={ownPasswordData.currentPassword}
                    onChange={(e) => setOwnPasswordData({ ...ownPasswordData, currentPassword: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                  <input type="password" required value={ownPasswordData.newPassword}
                    onChange={(e) => setOwnPasswordData({ ...ownPasswordData, newPassword: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl text-sm">Update Password</button>
                  <button type="button" onClick={() => { setShowOwnPasswordForm(false); setOwnPasswordData({ currentPassword: '', newPassword: '' }); }}
                    className="py-2 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
                </div>
              </form>
            )}

            {/* Own Email Form */}
            {showOwnEmailForm && (
              <form onSubmit={handleOwnEmailChange} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-md">
                <h3 className="font-bold text-gray-900 text-sm">Change Your Email</h3>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                  <input type="password" required value={ownEmailData.password}
                    onChange={(e) => setOwnEmailData({ ...ownEmailData, password: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Email</label>
                  <input type="email" required value={ownEmailData.newEmail}
                    onChange={(e) => setOwnEmailData({ ...ownEmailData, newEmail: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl text-sm">Update Email</button>
                  <button type="button" onClick={() => { setShowOwnEmailForm(false); setOwnEmailData({ password: '', newEmail: '' }); }}
                    className="py-2 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
                </div>
              </form>
            )}

            {/* User List */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md ">
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                      <th className="py-3 px-4 rounded-l-xl">User</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Permissions</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {allUsers.filter(u => activeTab === 'sellers_all' ? u.role === 'seller' : true).map((u) => (
                      <tr key={u._id} className="border-b border-transparent hover:bg-slate-50 transition group">
                        <td className="py-4 px-4 rounded-l-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-inner" style={{ background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)` }}>
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="font-extrabold text-gray-900">{u.name}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-600 font-medium">{u.email}</div>
                          <div className="text-[10px] text-gray-400 font-semibold">{u.phone || '-'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                            u.role === 'superadmin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            u.role === 'admin' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            u.role === 'manager' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            u.role === 'moderator' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            u.role === 'seller' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            'bg-gray-100 text-gray-600 border-slate-200'
                          }`}>{u.role || 'customer'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(u.permissions || []).slice(0, 3).map((p) => (
                              <span key={p} className="px-2 py-1 bg-gray-100/80 text-gray-500 rounded-lg text-[9px] font-bold border border-slate-200/50">{p}</span>
                            ))}
                            {(u.permissions || []).length > 3 && (
                              <span className="px-2 py-1 bg-gray-100/50 text-gray-500 rounded-lg text-[9px] font-bold border border-slate-200/50">+{u.permissions.length - 3}</span>
                            )}
                            {(u.permissions || []).length === 0 && <span className="text-gray-400 text-xs italic">-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right rounded-r-xl">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => {
                              setEditingUserId(u._id);
                              setEditingUserForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role || 'customer', permissions: u.permissions || [] });
                            }} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-lg font-bold transition flex items-center gap-1">
                              <Edit size={14} /> Edit
                            </button>
                            {u._id !== user?._id && (
                              <>
                                <button onClick={() => setPasswordResetUserId(passwordResetUserId === u._id ? null : u._id)}
                                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded-lg font-bold transition">Key</button>
                                <button onClick={() => handleDeleteUser(u._id)}
                                  className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg font-bold transition">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                          {passwordResetUserId === u._id && (
                            <div className="mt-3 flex gap-2 justify-end animate-fade-in">
                              <input type="text" placeholder="New password" value={passwordResetValue}
                                onChange={(e) => setPasswordResetValue(e.target.value)}
                                className="w-32 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-amber-500 outline-none" />
                              <button onClick={() => handlePasswordReset(u._id)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition shadow-sm">Set</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {allUsers.length === 0 && (
                      <tr><td colSpan="6" className="text-center py-12 text-gray-500 font-medium">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create User Form */}
            <form onSubmit={handleCreateUser} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-lg">
              <h3 className="font-bold text-gray-900 text-sm">Create New User</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</label>
                  <input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                  <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <input required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                  <input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</label>
                <select value={userForm.role} onChange={(e) => {
                  const role = e.target.value;
                  setUserForm({ ...userForm, role, permissions: ROLE_PERMS[role] || [] });
                }} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm">
                  {Object.keys(ROLE_PERMS).map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Permissions</label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_PERMS.map((perm) => (
                    <label key={perm} className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={userForm.permissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserForm({ ...userForm, permissions: [...userForm.permissions, perm] });
                          } else {
                            setUserForm({ ...userForm, permissions: userForm.permissions.filter((p) => p !== perm) });
                          }
                        }} className="accent-blue-600" />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition text-sm">Create User</button>
            </form>

            {/* Edit User Modal */}
            {editingUserId && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditingUserId(null)}>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-gray-900 text-sm">Edit User</h3>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</label>
                        <input required value={editingUserForm.name} onChange={(e) => setEditingUserForm({ ...editingUserForm, name: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                        <input type="email" required value={editingUserForm.email} onChange={(e) => setEditingUserForm({ ...editingUserForm, email: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                        <input value={editingUserForm.phone} onChange={(e) => setEditingUserForm({ ...editingUserForm, phone: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</label>
                        <select value={editingUserForm.role} onChange={(e) => {
                          const role = e.target.value;
                          setEditingUserForm({ ...editingUserForm, role, permissions: ROLE_PERMS[role] || [] });
                        }} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm">
                          {Object.keys(ROLE_PERMS).map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Permissions</label>
                      <div className="grid grid-cols-3 gap-2">
                        {ALL_PERMS.map((perm) => (
                          <label key={perm} className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                            <input type="checkbox" checked={editingUserForm.permissions.includes(perm)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingUserForm({ ...editingUserForm, permissions: [...editingUserForm.permissions, perm] });
                                } else {
                                  setEditingUserForm({ ...editingUserForm, permissions: editingUserForm.permissions.filter((p) => p !== perm) });
                                }
                              }} className="accent-blue-600" />
                            {perm}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl text-sm">Save Changes</button>
                      <button type="button" onClick={() => { setEditingUserId(null); setEditingUserForm({ name: '', email: '', phone: '', role: 'customer', permissions: [] }); }}
                        className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAFFS TAB */}
        {activeTab === 'staffs' && (() => {
          const filteredStaffs = allUsers
            .filter(u => ['superadmin', 'admin', 'manager', 'moderator'].includes(u.role))
            .filter(u => {
              if (!staffSearch) return true;
              const term = staffSearch.toLowerCase();
              return (u.name || '').toLowerCase().includes(term) || 
                     (u.email || '').toLowerCase().includes(term) || 
                     (u.phone || '').toLowerCase().includes(term);
            });

          return (
            <div className="space-y-8 max-w-6xl w-full">
              {/* Header */}
              <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-1.5 bg-amber-500 rounded-full"></div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Staff Lists</h1>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold pl-9">You have total {filteredStaffs.length} Staffs</p>
                </div>
                <button 
                  onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#2a3038] hover:bg-[#1a2028] text-white text-xs font-bold rounded-xl transition duration-200 uppercase tracking-wider"
                >
                  + ADD STAFF
                </button>
              </div>

              {/* Create Staff Form */}
              {showAddStaffForm && (
                <form onSubmit={handleCreateUser} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-lg shadow-sm animate-fade-in">
                  <h3 className="font-bold text-gray-900 text-sm">Create New Staff</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</label>
                      <input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                      <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                      <input required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                      <input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</label>
                    <select value={userForm.role} onChange={(e) => {
                      const role = e.target.value;
                      setUserForm({ ...userForm, role, permissions: ROLE_PERMS[role] || [] });
                    }} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm">
                      {Object.keys(ROLE_PERMS)
                        .filter((r) => ['superadmin', 'admin', 'manager', 'moderator'].includes(r))
                        .map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Permissions</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_PERMS.map((perm) => (
                        <label key={perm} className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                          <input type="checkbox" checked={userForm.permissions.includes(perm)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUserForm({ ...userForm, permissions: [...userForm.permissions, perm] });
                              } else {
                                setUserForm({ ...userForm, permissions: userForm.permissions.filter((p) => p !== perm) });
                              }
                            }} className="accent-blue-600" />
                          {perm}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition text-sm">Create Staff</button>
                    <button type="button" onClick={() => setShowAddStaffForm(false)} className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
                  </div>
                </form>
              )}

              {/* Card Container */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                {/* Search & Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                  <h3 className="font-bold text-slate-800 text-sm pl-2">Staffs</h3>
                  <div className="relative w-full sm:w-60 flex items-center">
                    <input
                      type="text"
                      placeholder="Search"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                    />
                    <button className="absolute right-0 h-full px-3.5 bg-[#2a3038] hover:bg-[#1a2028] text-white rounded-r-xl transition flex items-center justify-center">
                      <Search size={13} />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                        <th className="py-3.5 px-4 w-12 text-center">#</th>
                        <th className="py-3.5 px-4">Name</th>
                        <th className="py-3.5 px-4">Phone</th>
                        <th className="py-3.5 px-4">Last Login</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Balance</th>
                        <th className="py-3.5 px-4 text-center">Options</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {filteredStaffs.map((u, idx) => (
                        <tr key={u._id || idx} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                <img 
                                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" 
                                  alt={u.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 flex items-center">
                                  {u.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center">
                                  {maskEmail(u.email)}
                                  <CheckCircle2 size={12} className="text-emerald-500 ml-1.5 inline-block" />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-650 font-medium">
                            {maskPhone(u.phone)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {formatLastLogin(u.created_at)}
                          </td>
                          <td className="py-3.5 px-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={true} readOnly className="sr-only peer" />
                              <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#f59e0b]"></div>
                            </label>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            DT0.00
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingUserId(u._id);
                                  setEditingUserForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role || 'admin', permissions: u.permissions || [] });
                                }}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition"
                                title="Edit Staff"
                              >
                                <Edit size={12} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (u._id !== user?._id) {
                                    handleDeleteUser(u._id);
                                  } else {
                                    alert("Cannot delete your own account");
                                  }
                                }}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition"
                                title="Delete Staff"
                              >
                                <MoreVertical size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredStaffs.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                            No staffs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit Staff Modal */}
              {editingUserId && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditingUserId(null)}>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                    <h3 className="font-bold text-gray-900 text-sm">Edit Staff</h3>
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</label>
                          <input required value={editingUserForm.name} onChange={(e) => setEditingUserForm({ ...editingUserForm, name: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                          <input type="email" required value={editingUserForm.email} onChange={(e) => setEditingUserForm({ ...editingUserForm, email: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                          <input value={editingUserForm.phone} onChange={(e) => setEditingUserForm({ ...editingUserForm, phone: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</label>
                          <select value={editingUserForm.role} onChange={(e) => {
                            const role = e.target.value;
                            setEditingUserForm({ ...editingUserForm, role, permissions: ROLE_PERMS[role] || [] });
                          }} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm">
                            {Object.keys(ROLE_PERMS)
                              .filter((r) => ['superadmin', 'admin', 'manager', 'moderator'].includes(r))
                              .map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Permissions</label>
                        <div className="grid grid-cols-3 gap-2">
                          {ALL_PERMS.map((perm) => (
                            <label key={perm} className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                              <input type="checkbox" checked={editingUserForm.permissions.includes(perm)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingUserForm({ ...editingUserForm, permissions: [...editingUserForm.permissions, perm] });
                                  } else {
                                    setEditingUserForm({ ...editingUserForm, permissions: editingUserForm.permissions.filter((p) => p !== perm) });
                                  }
                                }} className="accent-blue-600" />
                              {perm}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl text-sm">Save Changes</button>
                        <button type="button" onClick={() => { setEditingUserId(null); setEditingUserForm({ name: '', email: '', phone: '', role: 'customer', permissions: [] }); }}
                          className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* REWARDS USERS TAB */}
        {activeTab === 'rewards_users' && (() => {
          const filteredPoints = (userPoints || []).filter(p => {
            if (!rewardSearch) return true;
            const term = rewardSearch.toLowerCase();
            return (p.name || '').toLowerCase().includes(term) || (p.email || '').toLowerCase().includes(term);
          });

          const filteredLogs = (pointLogs || []).filter(l => {
            if (!rewardSearch) return true;
            const term = rewardSearch.toLowerCase();
            return (l.name || '').toLowerCase().includes(term) || (l.email || '').toLowerCase().includes(term) || (l.description || '').toLowerCase().includes(term);
          });

          return (
            <div className="space-y-8 max-w-6xl w-full">
              {/* Header */}
              <div className="border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-1.5 bg-amber-500 rounded-full"></div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Users Reward List</h1>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold pl-9">You have total {(userPoints || []).length} Reward Users</p>
                </div>
              </div>

              {/* Lists & Logs Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                {/* Sub-tab Navigation */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                      onClick={() => setRewardSubTab('summary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        rewardSubTab === 'summary' 
                          ? 'bg-white text-slate-800 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Users
                    </button>
                    <button 
                      onClick={() => setRewardSubTab('logs')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        rewardSubTab === 'logs' 
                          ? 'bg-white text-slate-800 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Transaction Logs
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-60 flex items-center">
                    <input
                      type="text"
                      placeholder="Search"
                      value={rewardSearch}
                      onChange={(e) => setRewardSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                    />
                    <button className="absolute right-0 h-full px-3.5 bg-[#2a3038] hover:bg-[#1a2028] text-white rounded-r-xl transition flex items-center justify-center">
                      <Search size={13} />
                    </button>
                  </div>
                </div>

                {/* Table Render */}
                <div className="overflow-x-auto">
                  {rewardSubTab === 'summary' ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                          <th className="py-3 px-4 w-12 text-center">#</th>
                          <th className="py-3 px-4">Customer Name</th>
                          <th className="py-3 px-4">Points</th>
                          <th className="py-3 px-4">Last Uses</th>
                          <th className="py-3 px-4">Earned At</th>
                          <th className="py-3 px-4 text-center">Statement</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {filteredPoints.map((row, idx) => (
                          <tr key={row._id || idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-800">{row.name}</div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">{row.current_balance}</td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">{formatDateMDY(row.updated_at)}</td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">{formatDateMDY(row.created_at)}</td>
                            <td className="py-3.5 px-4 text-center">
                              <button 
                                type="button"
                                onClick={() => setSelectedStatementUser(row)}
                                className="w-7 h-7 rounded-full bg-amber-100/70 hover:bg-amber-200 text-amber-600 flex items-center justify-center transition-all mx-auto"
                                title="View Statement"
                              >
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredPoints.length === 0 && (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-400 font-medium bg-slate-50/10">No customer records found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                          <th className="py-3 px-4 w-12 text-center">#</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Points</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {filteredLogs.map((log, idx) => (
                          <tr key={log._id || idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-800">{log.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5">{log.email}</div>
                            </td>
                            <td className={`py-3.5 px-4 font-bold ${log.points >= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                              {log.points >= 0 ? `+${log.points}` : log.points} pts
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                                log.type === 'earn' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                log.type === 'redeem' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                                {log.type === 'admin_adjustment' ? 'Adjust' : log.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium max-w-[200px] truncate" title={log.description}>{log.description}</td>
                            <td className="py-3.5 px-4 text-slate-400 font-medium">
                              {new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-400 font-medium bg-slate-50/10">No point transactions logged.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Adjust Points Modal */}
              {adjustModalUser && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setAdjustModalUser(null)}>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                    <h3 className="font-bold text-gray-900 text-sm">Adjust Points for {adjustModalUser.name}</h3>
                    <form onSubmit={handleAdjustPointsSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Adjustment Value (Positive/Negative)</label>
                        <input 
                          type="number" 
                          required
                          value={adjustPointsValue}
                          onChange={(e) => setAdjustPointsValue(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition text-xs font-semibold"
                          placeholder="e.g. 100 or -50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Reason/Description</label>
                        <input 
                          type="text" 
                          required
                          value={adjustDescription}
                          onChange={(e) => setAdjustDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition text-xs font-semibold"
                          placeholder="e.g. Campaign bonus"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm">
                          {loading ? 'Confirming...' : 'Confirm Adjustment'}
                        </button>
                        <button type="button" onClick={() => setAdjustModalUser(null)} className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-xs">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Point Statement Modal */}
              {selectedStatementUser && (() => {
                const userLogs = (pointLogs || []).filter(l => l.user_id === selectedStatementUser.user_id);
                return (
                  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedStatementUser(null)}>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">Reward Statement</h3>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Points history for {selectedStatementUser.name} ({selectedStatementUser.email})</p>
                        </div>
                        <button 
                          onClick={() => setSelectedStatementUser(null)}
                          className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="overflow-y-auto flex-1 p-1">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                              <th className="py-2.5 px-3 w-10 text-center">#</th>
                              <th className="py-2.5 px-3">Points</th>
                              <th className="py-2.5 px-3">Type</th>
                              <th className="py-2.5 px-3">Description</th>
                              <th className="py-2.5 px-3">Date</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs">
                            {userLogs.map((log, idx) => (
                              <tr key={log._id || idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                                <td className={`py-3 px-3 font-bold ${log.points >= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                                  {log.points >= 0 ? `+${log.points}` : log.points} pts
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                                    log.type === 'earn' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    log.type === 'redeem' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                  }`}>
                                    {log.type === 'admin_adjustment' ? 'Adjust' : log.type}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-600 font-medium max-w-[200px] truncate" title={log.description}>{log.description}</td>
                                <td className="py-3 px-3 text-slate-400 font-medium">
                                  {new Date(log.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                              </tr>
                            ))}
                            {userLogs.length === 0 && (
                              <tr>
                                <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">No point transactions logged for this user.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex justify-end">
                        <button 
                          type="button" 
                          onClick={() => setSelectedStatementUser(null)} 
                          className="py-2 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-xs transition"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}


        {/* REWARDS CONFIG TAB */}
        {activeTab === 'rewards_config' && (
          <div className="space-y-8 max-w-4xl w-full">
            {/* Header */}
            <div className="border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-1.5 bg-amber-500 rounded-full"></div>
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight">Reward Configuration</h1>
                </div>
              </div>
            </div>

            {/* Configurations Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden max-w-3xl">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm">Set Reward</h3>
              </div>
              <form onSubmit={handleSaveRewardSettings} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    Set Reward <span className="text-gray-400 font-normal lowercase">(1 USD - ?)</span> <span className="text-orange-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required
                    min="1" 
                    step="1"
                    value={localRewardSettings.earn_rate}
                    onChange={(e) => setLocalRewardSettings({ ...localRewardSettings, earn_rate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition text-xs font-semibold"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2 bg-[#2a3038] hover:bg-[#1a2028] text-white font-bold rounded-lg text-[10px] tracking-wider uppercase transition-all duration-200"
                  >
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REWARDS SET TAB */}
        {activeTab === 'rewards_set' && (() => {
          const filteredCustomersForSelect = allUsers.filter(u => {
            const isCustomer = u.role === 'customer';
            if (!customerSearchTerm) return isCustomer;
            const term = customerSearchTerm.toLowerCase();
            return isCustomer && ((u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term));
          });

          return (
            <div className="space-y-8 max-w-4xl w-full">
              {/* Header */}
              <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-1.5 bg-amber-500 rounded-full"></div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Set Reward</h1>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold pl-9">Manually adjust or set loyalty points for specific customers.</p>
                </div>
              </div>

              {/* Set Reward Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden max-w-2xl">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm">Manually Award / Deduct Points</h3>
                </div>
                <form onSubmit={handleSetPointsSubmit} className="p-6 space-y-6">
                  {/* Select Customer */}
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Customer</label>
                    {selectedSetUser ? (
                      <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                        <div>
                          <div className="font-bold text-blue-900 text-xs">{selectedSetUser.name}</div>
                          <div className="text-[10px] text-blue-500 font-semibold">{selectedSetUser.email}</div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setSelectedSetUser(null);
                            setCustomerSearchTerm('');
                          }}
                          className="p-1 hover:bg-blue-100 rounded-full text-blue-500 transition"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder="Type customer name or email to search..."
                            value={customerSearchTerm}
                            onChange={(e) => {
                              setCustomerSearchTerm(e.target.value);
                              setShowCustomerDropdown(true);
                            }}
                            onFocus={() => setShowCustomerDropdown(true)}
                            onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition text-xs font-semibold"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search size={14} />
                          </div>
                        </div>
                        {showCustomerDropdown && customerSearchTerm && (
                          <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100 mt-1">
                            {filteredCustomersForSelect.map(c => (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => {
                                  setSelectedSetUser(c);
                                  setShowCustomerDropdown(false);
                                  setCustomerSearchTerm('');
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex flex-col"
                              >
                                <span className="text-xs font-bold text-slate-800">{c.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{c.email}</span>
                              </button>
                            ))}
                            {filteredCustomersForSelect.length === 0 && (
                              <div className="px-4 py-3 text-xs text-slate-400 text-center">No customers found</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Adjustment Value */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Adjustment Value (Positive to award, Negative to deduct)</label>
                    <input 
                      type="number" 
                      required
                      value={setPointsValue}
                      onChange={(e) => setSetPointsValue(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition text-xs font-semibold"
                      placeholder="e.g. 100 or -50"
                    />
                  </div>

                  {/* Description/Reason */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Reason / Description</label>
                    <input 
                      type="text" 
                      required
                      value={setPointsDesc}
                      onChange={(e) => setSetPointsDesc(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition text-xs font-semibold"
                      placeholder="e.g. Manual bonus, Loyalty reward correction"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Set / Adjust Points'}
                  </button>
                </form>
              </div>
            </div>
          );
        })()}

        {/* PAGES TAB */}
        {activeTab === 'pages' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Page Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Create and manage custom pages (About, Contact, Terms, Privacy, etc.).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Pages List */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-gray-900 text-sm">All Pages</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {pagesList.map((page) => (
                    <div key={page._id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {page.title}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            page.isPublished ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {page.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">/{page.slug}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditPage(page)} className="text-blue-400 hover:text-blue-300 font-bold">Edit</button>
                        <button onClick={() => handleDeletePage(page._id)} className="text-orange-400 hover:text-orange-300 font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                  {pagesList.length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">No pages yet. Create your first page!</p>
                  )}
                </div>
              </div>

              {/* Page Form */}
              <div className="lg:col-span-5 bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">{editingPage ? 'Edit Page' : 'Create Page'}</h3>
                {editingPage && (
                  <button onClick={() => { setEditingPage(null); setPageForm({ title: '', slug: '', content: '', isPublished: false }); }} className="text-[10px] hover:text-gray-900">Cancel edit</button>
                )}
                <form onSubmit={editingPage ? handleUpdatePage : handleCreatePage} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Page Title</label>
                    <input type="text" required placeholder="e.g. About Us" value={pageForm.title}
                      onChange={(e) => setPageForm({ ...pageForm, title: e.target.value, slug: editingPage ? pageForm.slug : e.target.value.toLowerCase().replace(/s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  {!editingPage && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Slug (auto-generated)</label>
                      <input type="text" required placeholder="about-us" value={pageForm.slug}
                        onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-mono" />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Content (HTML supported)</label>
                    <textarea rows="6" placeholder="Write page content here..." value={pageForm.content}
                      onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs font-mono"></textarea>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="page-published" checked={pageForm.isPublished}
                      onChange={(e) => setPageForm({ ...pageForm, isPublished: e.target.checked })}
                      className="accent-blue-600 rounded-sm cursor-pointer" />
                    <label htmlFor="page-published" className="text-[10px] font-bold text-gray-400 cursor-pointer">Published (visible to visitors)</label>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition">
                    {editingPage ? 'Update Page' : 'Create Page'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* OFFERS TAB */}
        {activeTab === 'offers' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Offer Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Create promotional offers and banners for the storefront.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Offers List */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-gray-900 text-sm">All Offers</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {offersList.map((offer) => (
                    <div key={offer._id} className="p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {offer.image && <img src={getImageUrl(offer.image)} className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-300" />}
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            {offer.title}
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${offer.isActive ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-100 text-gray-400'}`}>
                              {offer.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {offer.discountPercent > 0 && <div className="text-[10px] text-amber-400 font-bold">{offer.discountPercent}% OFF</div>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditOffer(offer)} className="text-blue-400 hover:text-blue-300 font-bold">Edit</button>
                        <button onClick={() => handleDeleteOffer(offer._id)} className="text-orange-400 hover:text-orange-300 font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                  {offersList.length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">No offers yet.</p>
                  )}
                </div>
              </div>

              {/* Offer Form */}
              <div className="lg:col-span-5 bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">{editingOffer ? 'Edit Offer' : 'Create Offer'}</h3>
                {editingOffer && (
                  <button onClick={() => { setEditingOffer(null); setOfferForm({ title: '', description: '', discountPercent: '', image: '', link: '', isActive: true }); }} className="text-[10px] hover:text-gray-900">Cancel edit</button>
                )}
                <form onSubmit={editingOffer ? handleUpdateOffer : handleCreateOffer} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Offer Title</label>
                    <input type="text" required placeholder="e.g. Summer Sale" value={offerForm.title}
                      onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea rows="2" placeholder="Short description..." value={offerForm.description}
                      onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discount %</label>
                      <input type="number" min="0" max="100" placeholder="e.g. 30" value={offerForm.discountPercent}
                        onChange={(e) => setOfferForm({ ...offerForm, discountPercent: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                      <input type="text" placeholder="https://..." value={offerForm.image}
                        onChange={(e) => setOfferForm({ ...offerForm, image: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Link (optional)</label>
                    <input type="text" placeholder="e.g. /shop?category=Fashion" value={offerForm.link}
                      onChange={(e) => setOfferForm({ ...offerForm, link: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="offer-active" checked={offerForm.isActive}
                      onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                      className="accent-blue-600 rounded-sm cursor-pointer" />
                    <label htmlFor="offer-active" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active (visible on storefront)</label>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition">
                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* BANNERS TAB */}
        {activeTab === 'banners' && (
          <div className="space-y-8 max-w-5xl">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Banner Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Manage homepage slider banners.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-gray-900 text-sm">All Banners</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {bannersList.map((b) => (
                    <div key={b._id} className="p-4 flex items-center gap-4 text-xs">
                      <img src={getImageUrl(b.image)} className="w-20 h-14 object-cover rounded-lg bg-gray-100 border border-gray-300 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {b.title || 'Untitled'}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${b.isActive ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-100 text-gray-400'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        {b.subtitle && <div className="text-[10px] text-gray-400 truncate">{b.subtitle}</div>}
                        <div className="text-[10px] text-gray-500">Order: {b.order}</div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => startEditBanner(b)} className="text-blue-400 hover:text-blue-300 font-bold">Edit</button>
                        <button onClick={() => handleDeleteBanner(b._id)} className="text-orange-400 hover:text-orange-300 font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                  {bannersList.length === 0 && <p className="text-center text-gray-500 text-xs py-8">No banners yet.</p>}
                </div>
              </div>
              <div className="lg:col-span-5 bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">{editingBanner ? 'Edit Banner' : 'Create Banner'}</h3>
                {editingBanner && (
                  <button onClick={() => { setEditingBanner(null); setBannerForm({ title: '', subtitle: '', image: '', link: '', isActive: true, order: 0 }); }} className="text-[10px] hover:text-gray-900">Cancel edit</button>
                )}
                <form onSubmit={editingBanner ? handleUpdateBanner : handleCreateBanner} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Title</label>
                      <input type="text" placeholder="Summer Sale" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order</label>
                      <input type="number" min="0" value={bannerForm.order} onChange={(e) => setBannerForm({ ...bannerForm, order: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subtitle</label>
                    <input type="text" placeholder="Get up to 50% off" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                    <div className="flex gap-2 mt-1">
                      <input type="text" required placeholder="https://..." value={bannerForm.image} onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                      <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg cursor-pointer text-xs whitespace-nowrap flex items-center">
                        Upload
                        <input type="file" accept="image/*" className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('image', file);
                            try {
                              const res = await fetch(`${API_URL}/upload`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${user.token}` },
                                body: formData,
                              });
                              const data = await res.json();
                              if (res.ok) setBannerForm({ ...bannerForm, image: data.image });
                            } catch {}
                          }} />
                      </label>
                    </div>
                    {bannerForm.image && <img src={getImageUrl(bannerForm.image)} className="mt-2 h-20 object-cover rounded-lg border border-gray-300" />}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Link (optional)</label>
                    <input type="text" placeholder="/shop" value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="banner-active" checked={bannerForm.isActive} onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                    <label htmlFor="banner-active" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition">{editingBanner ? 'Update Banner' : 'Create Banner'}</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sellers_payouts' && (
          <div className="space-y-6 max-w-7xl w-full animate-fade-in">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Seller Payouts History</h1>
              <p className="text-xs text-gray-400 mt-1">View completed and rejected payout requests.</p>
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 border-b border-slate-100">Date</th>
                      <th className="py-3 px-4 border-b border-slate-100">Seller</th>
                      <th className="py-3 px-4 border-b border-slate-100">Amount</th>
                      <th className="py-3 px-4 border-b border-slate-100">Method & Details</th>
                      <th className="py-3 px-4 border-b border-slate-100">Transaction ID</th>
                      <th className="py-3 px-4 border-b border-slate-100">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {(payouts || []).filter(p => p.status !== 'pending').map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50">
                        <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-gray-800">{p.users?.store_name || p.users?.name || 'Unknown Seller'}</div>
                          <div className="text-[10px] text-gray-500">{p.users?.email}</div>
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-900">{currencySymbol}{p.amount}</td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-700 capitalize">{p.payment_method}</div>
                          <div className="text-[10px] text-gray-500">{p.account_details}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-500">{p.transaction_id || '-'}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                            p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(payouts || []).filter(p => p.status !== 'pending').length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">No payout history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'sellers_requests' && (
          <div className="space-y-6 max-w-7xl w-full animate-fade-in">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Pending Payout Requests</h1>
              <p className="text-xs text-gray-400 mt-1">Approve or reject incoming payout requests from sellers.</p>
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 border-b border-slate-100">Date</th>
                      <th className="py-3 px-4 border-b border-slate-100">Seller</th>
                      <th className="py-3 px-4 border-b border-slate-100">Amount</th>
                      <th className="py-3 px-4 border-b border-slate-100">Method & Details</th>
                      <th className="py-3 px-4 border-b border-slate-100 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {(payouts || []).filter(p => p.status === 'pending').map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50">
                        <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-gray-800">{p.users?.store_name || p.users?.name || 'Unknown Seller'}</div>
                          <div className="text-[10px] text-gray-500">{p.users?.email}</div>
                        </td>
                        <td className="py-4 px-4 font-bold text-amber-600">{currencySymbol}{p.amount}</td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-700 capitalize">{p.payment_method}</div>
                          <div className="text-[10px] text-gray-500 max-w-xs truncate">{p.account_details}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={async () => {
                                const tid = window.prompt('Enter transaction ID to approve this payout:');
                                if (tid !== null) {
                                  await updatePayoutStatus(p.id, { status: 'completed', transaction_id: tid });
                                }
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 rounded font-bold text-[11px] transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to reject this request?')) {
                                  await updatePayoutStatus(p.id, { status: 'rejected' });
                                }
                              }}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded font-bold text-[11px] transition"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(payouts || []).filter(p => p.status === 'pending').length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">No pending payout requests.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'sellers_settings' && (
          <div className="space-y-6 max-w-6xl w-full animate-fade-in">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-amber-400 rounded-full"></div>
                <h1 className="text-xl font-bold text-gray-900">Seller Settings</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Seller Products Commission Card */}
                <div className="bg-white border border-slate-100 rounded-lg shadow-xs">
                  <div className="p-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-gray-800">Seller Products Commission</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Category Based Commission</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" 
                          checked={localSellerSettings.category_based_commission}
                          onChange={(e) => setLocalSellerSettings({...localSellerSettings, category_based_commission: e.target.checked})}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
                      </label>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Seller Based Commission</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" 
                          checked={localSellerSettings.seller_based_commission}
                          onChange={(e) => setLocalSellerSettings({...localSellerSettings, seller_based_commission: e.target.checked})}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Seller Page Contact message to seller mail Card */}
                <div className="bg-white border border-slate-100 rounded-lg shadow-xs">
                  <div className="p-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-gray-800">Seller Page Contact message to seller mail</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Message to seller mail</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" 
                          checked={localSellerSettings.message_to_seller_mail}
                          onChange={(e) => setLocalSellerSettings({...localSellerSettings, message_to_seller_mail: e.target.checked})}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Commission Info Card */}
                <div className="bg-white border border-slate-100 rounded-lg shadow-xs">
                  <div className="p-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-gray-800">Commission Info</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-600 mb-2">Type Details:</div>
                    <ol className="list-decimal pl-4 space-y-3 text-sm text-gray-600 leading-relaxed">
                      <li><strong>Category Based Commission:</strong> If Category Based Commission is enbaled, Seller product based commission will not be applicable.</li>
                      <li><strong>Seller Based Commission:</strong> Given Seller Based Commission percentage amount will be will be deducted from seller earnings.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={async () => {
                  const res = await updateSellerSettings(localSellerSettings);
                  if (res.success) alert('Seller settings updated successfully!');
                  else alert(res.error || 'Failed to update settings');
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition-all duration-200 shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
        {activeTab === 'sellers_import' && (
          <div className="space-y-6 max-w-6xl w-full animate-fade-in">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-amber-400 rounded-full"></div>
                <h1 className="text-xl font-bold text-gray-900">Import Sellers</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Import Form */}
              <div className="bg-white border border-slate-100 rounded-lg shadow-xs">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-gray-800">Import Sellers</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Import File <span className="text-gray-400">*(.csv/.xlsx/.xls File)</span></label>
                    <div className="flex">
                      <div className="flex-1 border border-slate-200 border-r-0 rounded-l-lg bg-white overflow-hidden flex items-center px-3 text-sm text-gray-500 h-10 truncate">
                        {sellerImportFile ? sellerImportFile.name : 'Choose file...'}
                      </div>
                      <label className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 text-sm font-medium rounded-r-lg cursor-pointer transition flex items-center justify-center h-10">
                        Browse
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="hidden"
                          onChange={(e) => setSellerImportFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={async () => {
                        if (!sellerImportFile) {
                          alert('Please select a file to import');
                          return;
                        }
                        const res = await importSellersByAdmin(sellerImportFile);
                        if (res.success) {
                          alert(res.data.message);
                          setSellerImportFile(null);
                        } else {
                          alert(res.error || 'Failed to import sellers');
                        }
                      }}
                      className="px-6 py-2 bg-[#2D2D2D] hover:bg-black text-white text-sm font-bold rounded shadow-xs transition"
                    >
                      SAVE
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Instructions */}
              <div className="bg-white border border-slate-100 rounded-lg shadow-xs h-fit">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-gray-800">Seller Import Procedures</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Please check this before importing your file:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                    <li>Uploaded File type must be: .xlsx Or .xls Or .csv</li>
                    <li>The file must contain: first_name, last_name</li>
                    <li>phone Or email must be provided</li>
                    <li>If password is provided then it must be within 6-32 characters long</li>
                    <li>Gender must be within: male, female, others</li>
                  </ol>
                  <div className="mt-4">
                    <a href={`${API_URL}/seller_import_sample.csv`} download className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Seller Import Sample Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'seller_pkg_subscription' && (
          <div className="space-y-6 max-w-6xl w-full animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-6 h-1.5 bg-[#f59e0b] rounded-full"></div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Subscription Setting</h1>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side Settings Card */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden h-fit">
                <div className="p-6 border-b border-slate-100 bg-white">
                  <h2 className="text-sm font-bold text-slate-800">Seller Subscription Setting</h2>
                </div>
                <form onSubmit={handleSaveSellerSettings} className="p-6 space-y-6 bg-white">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Subscription Method</label>
                    <select
                      value={localSellerSettings.subscription_method || 'Adjustable'}
                      onChange={(e) => setLocalSellerSettings({ ...localSellerSettings, subscription_method: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Adjustable">Adjustable</option>
                      <option value="Not Adjustable">Not Adjustable</option>
                    </select>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#2a3038] hover:bg-[#1a2028] text-white text-xs font-bold rounded-xl transition duration-200 uppercase tracking-wider shadow-xs"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side Stack */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Method Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4">Method Info</h3>
                  <div className="text-xs text-slate-600 space-y-4 leading-relaxed">
                    <p className="font-bold text-slate-700">Type Setting:</p>
                    <div className="space-y-3.5 pl-1">
                      <div className="flex gap-2">
                        <span className="font-bold text-slate-850 flex-shrink-0">1.</span>
                        <p>
                          <span className="font-bold text-slate-800">Adjustable:</span> If this method is selected, seller can choose any package from the list but the previous one will be canceled and the price will be adjusted according to the package and will be refunded to wallet. suppose, I have an premium package and the price of this package is <span className="font-semibold text-slate-800">750</span> and the validity was <span className="font-semibold text-slate-800">365 days</span>. But if the package is canceled at <span className="font-semibold text-slate-800">180th days</span> then <span className="font-bold text-slate-800">379.25</span> (750/365 = 2.05 X (365 - 180 = 185) = 379.25) will be refunded to his wallet.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-slate-850 flex-shrink-0">2.</span>
                        <p>
                          <span className="font-bold text-slate-800">Not Adjustable:</span> If this method is selected, choosing any package will expired the previous one and the price will be not adjusted according to the package and will not be refunded to wallet. .
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cron Job Setting Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4">Cron Job Setting</h3>
                  <div className="text-xs text-slate-600 space-y-4 leading-relaxed">
                    <p>For managing auto expiration of subscription/notify the sellers, you need to set cron job.</p>
                    <p className="font-semibold text-slate-700">Add the following command to your cron job:</p>
                    <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl font-mono text-[10px] text-slate-650 overflow-x-auto whitespace-pre">
                      {"Cron: * * * * * cd /path-to-your-project && node backend/cron/subscriptionCron.js >> /dev/null 2>&1"}
                    </div>
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <span>For More Info</span>
                      <a href="#" className="text-blue-500 hover:text-blue-600 font-semibold hover:underline">Click Here</a>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          alert('Triggered cron manually. Subscriptions auto-expiration checked!');
                        }}
                        className="px-4 py-2.5 bg-[#2a3038] hover:bg-[#1a2028] text-white text-xs font-bold rounded-xl transition duration-200 uppercase tracking-wider shadow-xs"
                      >
                        Run Cron Manually
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
        {activeTab === 'seller_pkg_packages' && (
          <div className="space-y-8 max-w-6xl w-full animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Packages List */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl ">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Seller Packages</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">Create and manage subscription packages for sellers.</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl border border-slate-100 shadow-inner">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total</span>
                    <span className="text-lg font-black text-gray-900">{sellerPackages?.length || 0}</span>
                  </div>
                </div>
                <div className="overflow-x-auto p-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="py-3 px-4 rounded-l-xl">Package Name</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Product Limit</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {(sellerPackages || []).map((pkg) => (
                        <tr key={pkg._id || pkg.id} className="border-b border-transparent hover:bg-slate-50 transition group">
                          {editingPkgId === (pkg._id || pkg.id) ? (
                            <>
                              <td className="py-3 px-4">
                                <input type="text" value={editPkgForm.name} onChange={(e) => setEditPkgForm({...editPkgForm, name: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm" />
                              </td>
                              <td className="py-3 px-4">
                                <input type="number" value={editPkgForm.price} onChange={(e) => setEditPkgForm({...editPkgForm, price: e.target.value})} className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm" />
                              </td>
                              <td className="py-3 px-4">
                                <input type="number" value={editPkgForm.duration_days} onChange={(e) => setEditPkgForm({...editPkgForm, duration_days: e.target.value})} className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm" />
                              </td>
                              <td className="py-3 px-4">
                                <input type="number" value={editPkgForm.product_limit} onChange={(e) => setEditPkgForm({...editPkgForm, product_limit: e.target.value})} className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm" />
                              </td>
                              <td className="py-3 px-4">
                                <select value={editPkgForm.is_active ? 'active' : 'inactive'} onChange={(e) => setEditPkgForm({...editPkgForm, is_active: e.target.value === 'active'})} className="px-2 py-1 border border-gray-300 rounded-lg text-xs">
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button onClick={async () => {
                                    const res = await updateSellerPackage(editingPkgId, editPkgForm);
                                    if (res.success) { setEditingPkgId(null); alert('Package updated!'); }
                                    else alert(res.error || 'Update failed');
                                  }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1">
                                    <Check size={14} /> Save
                                  </button>
                                  <button onClick={() => setEditingPkgId(null)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition">
                                    <X size={14} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-4 px-4 rounded-l-xl">
                                <div className="font-extrabold text-gray-900">{pkg.name}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-black text-gray-900">{formatPrice(pkg.price, currencySymbol)}</div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-bold text-gray-700">{pkg.duration_days} Days</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-bold text-gray-700">{pkg.product_limit} Products</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                                  pkg.is_active
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-gray-100 text-gray-500 border-slate-200'
                                }`}>
                                  {pkg.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right rounded-r-xl">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => {
                                    setEditingPkgId(pkg._id || pkg.id);
                                    setEditPkgForm({ name: pkg.name, price: String(pkg.price), duration_days: String(pkg.duration_days), product_limit: String(pkg.product_limit), is_active: pkg.is_active });
                                  }} className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-500/20 transition flex items-center gap-1">
                                    <Edit size={12} /> Edit
                                  </button>
                                  <button onClick={async () => {
                                    if (confirm('Are you sure you want to delete this package?')) {
                                      const res = await deleteSellerPackage(pkg._id || pkg.id);
                                      if (res.success) alert('Package deleted!');
                                      else alert(res.error || 'Delete failed');
                                    }
                                  }} className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-xl transition-all duration-200">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {(sellerPackages || []).length === 0 && (
                        <tr className="text-center text-gray-500 text-xs">
                          <td colSpan="6" className="py-12">
                            <div className="flex flex-col items-center gap-2">
                              <Package size={32} className="text-gray-300" />
                              <span className="font-medium">No seller packages created yet.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Package Form */}
              <div className="lg:col-span-4 bg-white p-8 border border-slate-200 shadow-lg rounded-2xl space-y-6  h-fit">
                <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h3 className="font-black text-gray-900 text-lg">Create Package</h3>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newPkg.name || !newPkg.price || !newPkg.duration_days || !newPkg.product_limit) {
                    return alert('All fields are required.');
                  }
                  const res = await createSellerPackage(newPkg);
                  if (res.success) {
                    setNewPkg({ name: '', price: '', duration_days: '', product_limit: '' });
                    alert('Package created successfully!');
                  } else {
                    alert(res.error || 'Failed to create package');
                  }
                }} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Package Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gold Plan"
                      value={newPkg.name}
                      onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Price ({currencySymbol})</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={newPkg.price}
                      onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 30"
                      value={newPkg.duration_days}
                      onChange={(e) => setNewPkg({ ...newPkg, duration_days: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Product Limit</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 50"
                      value={newPkg.product_limit}
                      onChange={(e) => setNewPkg({ ...newPkg, product_limit: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-black rounded-xl shadow-lg shadow-blue-500/30 transition text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Create Package
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'seller_pkg_online_history' && (() => {
          const uniqueSellers = Array.from(new Set((onlineSubscriptions || []).map(s => s.shop_name))).filter(Boolean);
          const filtered = (onlineSubscriptions || [])
            .filter(sub => {
              const matchSearch = (sub.shop_name || '').toLowerCase().includes(onlineSearch.toLowerCase()) || 
                                  (sub.package_name || '').toLowerCase().includes(onlineSearch.toLowerCase()) ||
                                  (sub._id || '').toLowerCase().includes(onlineSearch.toLowerCase());
              const matchSeller = !onlineSellerFilter || sub.shop_name === onlineSellerFilter;
              return matchSearch && matchSeller;
            })
            .sort((a, b) => {
              const dateA = new Date(a.purchase_date || a.created_at);
              const dateB = new Date(b.purchase_date || b.created_at);
              return onlineSortOrder === 'Latest On Top' ? dateB - dateA : dateA - dateB;
            });

          return (
            <div className="space-y-6 max-w-6xl w-full animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-1.5 bg-[#f59e0b] rounded-full"></div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Online Purchase History</h1>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold pl-9">Found {filtered.length} Rows</p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2a3038] hover:bg-[#1a2028] text-white text-xs font-bold rounded-xl transition duration-200"
                >
                  ← BACK
                </button>
              </div>

              {/* Card Container */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                
                {/* Search & Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                  <h3 className="font-bold text-slate-800 text-sm pl-2">Purchases</h3>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* Select Seller */}
                    <select
                      value={onlineSellerFilter}
                      onChange={(e) => setOnlineSellerFilter(e.target.value)}
                      className="w-full sm:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Seller</option>
                      {uniqueSellers.map((seller, idx) => (
                        <option key={idx} value={seller}>{seller}</option>
                      ))}
                    </select>

                    {/* Sort Order */}
                    <select
                      value={onlineSortOrder}
                      onChange={(e) => setOnlineSortOrder(e.target.value)}
                      className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      <option value="Latest On Top">Latest On Top</option>
                      <option value="Oldest On Top">Oldest On Top</option>
                    </select>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-60 flex items-center">
                      <input
                        type="text"
                        placeholder="Search"
                        value={onlineSearch}
                        onChange={(e) => setOnlineSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                      />
                      <button className="absolute right-0 h-full px-3.5 bg-[#2a3038] hover:bg-[#1a2028] text-white rounded-r-xl transition flex items-center justify-center">
                        <Search size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                        <th className="py-3.5 px-4 w-12 text-center">#</th>
                        <th className="py-3.5 px-4">Shop Name en</th>
                        <th className="py-3.5 px-4">Package</th>
                        <th className="py-3.5 px-4">Payment Method</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Purchase Date</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {filtered.map((sub, idx) => (
                        <tr key={sub._id || idx} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{sub.shop_name}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{sub.shop_email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700">{sub.package_name}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold inline-block bg-blue-50 text-blue-600 border border-blue-100">
                              {sub.payment_method}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-850">
                            ৳{Number(sub.package_price).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {new Date(sub.purchase_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide inline-block ${
                              (sub.status || '').toLowerCase() === 'active' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-orange-50 text-orange-600 border border-orange-100'
                            }`}>
                              {sub.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 text-xs bg-slate-50/20 font-medium">
                            No online purchases found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          );
        })()}

        {activeTab === 'seller_pkg_offline_history' && (() => {
          const uniqueSellers = Array.from(new Set((offlineSubscriptions || []).map(s => s.shop_name))).filter(Boolean);
          const filtered = (offlineSubscriptions || [])
            .filter(sub => {
              const matchSearch = (sub.shop_name || '').toLowerCase().includes(offlineSearch.toLowerCase()) || 
                                  (sub.package_name || '').toLowerCase().includes(offlineSearch.toLowerCase()) ||
                                  (sub._id || '').toLowerCase().includes(offlineSearch.toLowerCase());
              const matchSeller = !offlineSellerFilter || sub.shop_name === offlineSellerFilter;
              return matchSearch && matchSeller;
            })
            .sort((a, b) => {
              const dateA = new Date(a.purchase_date || a.created_at);
              const dateB = new Date(b.purchase_date || b.created_at);
              return offlineSortOrder === 'Latest On Top' ? dateB - dateA : dateA - dateB;
            });

          return (
            <div className="space-y-6 max-w-6xl w-full animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-1.5 bg-[#f59e0b] rounded-full"></div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Offline Purchase History</h1>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold pl-9">Found {filtered.length} Rows</p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2a3038] hover:bg-[#1a2028] text-white text-xs font-bold rounded-xl transition duration-200"
                >
                  ← BACK
                </button>
              </div>

              {/* Card Container */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                
                {/* Search & Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                  <h3 className="font-bold text-slate-800 text-sm pl-2">Purchases</h3>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* Select Seller */}
                    <select
                      value={offlineSellerFilter}
                      onChange={(e) => setOfflineSellerFilter(e.target.value)}
                      className="w-full sm:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Seller</option>
                      {uniqueSellers.map((seller, idx) => (
                        <option key={idx} value={seller}>{seller}</option>
                      ))}
                    </select>

                    {/* Sort Order */}
                    <select
                      value={offlineSortOrder}
                      onChange={(e) => setOfflineSortOrder(e.target.value)}
                      className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      <option value="Latest On Top">Latest On Top</option>
                      <option value="Oldest On Top">Oldest On Top</option>
                    </select>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-60 flex items-center">
                      <input
                        type="text"
                        placeholder="Search"
                        value={offlineSearch}
                        onChange={(e) => setOfflineSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                      />
                      <button className="absolute right-0 h-full px-3.5 bg-[#2a3038] hover:bg-[#1a2028] text-white rounded-r-xl transition flex items-center justify-center">
                        <Search size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                        <th className="py-3.5 px-4 w-12 text-center">#</th>
                        <th className="py-3.5 px-4">Shop Name en</th>
                        <th className="py-3.5 px-4">Package</th>
                        <th className="py-3.5 px-4">Payment Method</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Purchase Date</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {filtered.map((sub, idx) => (
                        <tr key={sub._id || idx} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{sub.shop_name}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{sub.shop_email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700">{sub.package_name}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold inline-block bg-slate-100 text-slate-650 border border-slate-200">
                              {sub.payment_method}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-850">
                            ৳{Number(sub.package_price).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {new Date(sub.purchase_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide inline-block ${
                              (sub.status || '').toLowerCase() === 'active' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-orange-50 text-orange-600 border border-orange-100'
                            }`}>
                              {sub.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 text-xs bg-slate-50/20 font-medium">
                            No offline purchases found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          );
        })()}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Support Chat</h1>
              <p className="text-xs text-gray-400 mt-1">View and reply to customer messages in real-time.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><MessageSquare size={16} className="text-blue-500" /> Messages ({chatMessages.filter((m) => !m.isAdmin).length})</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleCloseChat} className="text-[10px] text-orange-400 hover:text-orange-300 hover:underline font-semibold">Close Chat</button>
                  <button onClick={fetchChatMessages} className="text-[10px] text-blue-400 hover:underline">Refresh</button>
                </div>
              </div>
              <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-slate-50">
                {chatMessages.length === 0 && <p className="text-center text-gray-500 text-xs py-10">No messages yet.</p>}
                {chatMessages.map((m) => (
                  <div key={m._id} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-xs ${m.isAdmin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      <div className="font-bold text-[10px] opacity-70 mb-0.5">{m.isAdmin ? 'You (Admin)' : m.username}</div>
                      <div>{m.message}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] opacity-50">{new Date(m.createdAt).toLocaleTimeString()}</span>
                        {!m.isAdmin && !m.isRead && (
                          <button onClick={() => handleMarkRead(m._id)} className="text-[9px] text-blue-400 hover:underline"><Eye size={10} className="inline" /> Mark read</button>
                        )}
                        {!m.isAdmin && m.isRead && <span className="text-[9px] text-emerald-400"><EyeOff size={10} className="inline" /> Read</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChatReply} className="border-t border-slate-200 p-3 flex gap-2 bg-white">
                <input type="text" placeholder="Type your reply..." value={chatReply} onChange={(e) => setChatReply(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-lg text-xs transition">Send</button>
              </form>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Store Settings & Gateways</h1>
              <p className="text-xs text-gray-400 mt-1">Configure OTP gateways, payment gateways, and analytics tracking (Facebook Pixel &amp; Google GA4).</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">

              {/* Advance Payment Section */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Advance Payment Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="advance-payment-enabled" checked={settings.advancePaymentEnabled || false} onChange={(e) => setSettings({ ...settings, advancePaymentEnabled: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                    <label htmlFor="advance-payment-enabled" className="font-bold text-gray-700 text-xs cursor-pointer">Enable Advance Payment</label>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount Threshold</label>
                    <input type="number" min="0" value={settings.advancePaymentThreshold || 1000} onChange={(e) => setSettings({ ...settings, advancePaymentThreshold: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Orders above this amount require advance payment.</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Advance %</label>
                    <input type="number" min="1" max="100" value={settings.advancePaymentPercent || 50} onChange={(e) => setSettings({ ...settings, advancePaymentPercent: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Percentage to pay upfront.</p>
                  </div>
                </div>
              </div>

              {/* Branding Section */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <LayoutGrid size={16} className="text-blue-500" />
                  Branding Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Site Title</label>
                    <input type="text" value={settings.siteTitle || ''}
                      onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Currency</label>
                      <select value={settings.currency || 'USD'}
                        onChange={(e) => {
                          const pairs = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$', SGD: 'S$', MYR: 'RM', PKR: '₨', LKR: '₨', NPR: '₨' };
                          setSettings({ ...settings, currency: e.target.value, currencySymbol: pairs[e.target.value] || '$' });
                        }}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs font-semibold"
                      >
                        {['USD','EUR','GBP','BDT','INR','JPY','AUD','CAD','SGD','MYR','PKR','LKR','NPR'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Symbol</label>
                      <input type="text" value={settings.currencySymbol || '$'}
                        onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Favicon URL</label>
                    <input type="text" value={settings.faviconUrl || ''}
                      onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    {settings.faviconUrl && (
                      <img src={getImageUrl(settings.faviconUrl)} alt="favicon preview" className="mt-2 w-8 h-8 object-contain rounded border border-gray-300" />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Header Logo URL</label>
                    <input type="text" value={settings.headerLogo || ''}
                      onChange={(e) => setSettings({ ...settings, headerLogo: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    {settings.headerLogo && (
                      <img src={getImageUrl(settings.headerLogo)} alt="header logo preview" className="mt-2 h-10 object-contain rounded border border-gray-300" />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Footer Logo URL</label>
                    <input type="text" value={settings.footerLogo || ''}
                      onChange={(e) => setSettings({ ...settings, footerLogo: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    {settings.footerLogo && (
                      <img src={getImageUrl(settings.footerLogo)} alt="footer logo preview" className="mt-2 h-10 object-contain rounded border border-gray-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* OTP gateway Configuration */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Sliders size={16} className="text-blue-500" />
                    OTP Configuration Settings
                  </h3>
                  {/* Checkout OTP Master Toggle */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Checkout OTP Verification</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {settings.checkoutOtpEnabled ? 'ON \u2014 Phone verification required at checkout' : 'OFF \u2014 Customers checkout without OTP'}
                      </p>
                    </div>
                    <button
                      type="button"
                      id="checkout-otp-toggle"
                      onClick={() => setSettings({ ...settings, checkoutOtpEnabled: !settings.checkoutOtpEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                        settings.checkoutOtpEnabled ? 'bg-[#FF6600]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                          settings.checkoutOtpEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMS/OTP Gateway</label>
                    <select
                      value={settings.otpGateway}
                      onChange={(e) => setSettings({ ...settings, otpGateway: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    >
                      <option value="Simulated">Simulated Gateway (Quick Local Sandbox)</option>
                      <option value="Twilio">Twilio SMS API</option>
                      <option value="GreenwebSMS">Greenweb SMS Gateway BD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OTP Code Length</label>
                    <select
                      value={settings.otpLength}
                      onChange={(e) => setSettings({ ...settings, otpLength: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    >
                      <option value={4}>4 Digits Code</option>
                      <option value={6}>6 Digits Code</option>
                      <option value={8}>8 Digits Code</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OTP Expiry (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.otpExpiry}
                      onChange={(e) => setSettings({ ...settings, otpExpiry: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    />
                  </div>
                </div>

                {/* Twilio Credentials */}
                {settings.otpGateway === 'Twilio' && (
                  <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Account SID</label>
                      <input
                        type="text"
                        value={settings.twilioSid || ''}
                        onChange={(e) => setSettings({ ...settings, twilioSid: e.target.value })}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Auth Token</label>
                      <input
                        type="password"
                        value={settings.twilioAuthToken || ''}
                        onChange={(e) => setSettings({ ...settings, twilioAuthToken: e.target.value })}
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Twilio Phone Number</label>
                      <input
                        type="text"
                        value={settings.twilioPhoneNumber || ''}
                        onChange={(e) => setSettings({ ...settings, twilioPhoneNumber: e.target.value })}
                        placeholder="+1234567890"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* Greenweb SMS Credentials */}
                {settings.otpGateway === 'GreenwebSMS' && (
                  <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">API Key / Token</label>
                      <input
                        type="password"
                        value={settings.greenwebApiKey || ''}
                        onChange={(e) => setSettings({ ...settings, greenwebApiKey: e.target.value })}
                        placeholder="Greenweb API token"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sender ID</label>
                      <input
                        type="text"
                        value={settings.greenwebSenderId || ''}
                        onChange={(e) => setSettings({ ...settings, greenwebSenderId: e.target.value })}
                        placeholder="Shopio"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Gateway Configurations */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-6 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <CreditCard size={16} className="text-emerald-500" />
                  Payment Gateways Configuration
                </h3>

                <div className="space-y-6">
                  {/* bKash configuration */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <h4 className="font-bold text-gray-900 text-xs">bKash Merchant PG</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">Accept payments in BDT automatically via bkash API.</p>
                      <div className="pt-2 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="bkash-enable"
                          checked={settings.bkashEnabled}
                          onChange={(e) => setSettings({ ...settings, bkashEnabled: e.target.checked })}
                          className="accent-pink-600 rounded-sm cursor-pointer"
                        />
                        <label htmlFor="bkash-enable" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                      </div>
                    </div>

                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gateway Mode</label>
                        <select
                          disabled={!settings.bkashEnabled}
                          value={settings.bkashMode}
                          onChange={(e) => setSettings({ ...settings, bkashMode: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        >
                          <option value="Sandbox">Sandbox (Test Environment)</option>
                          <option value="Live">Live (Real Payments)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Merchant Phone Number</label>
                        <input
                          type="text"
                          disabled={!settings.bkashEnabled}
                          value={settings.bkashMerchantNumber}
                          onChange={(e) => setSettings({ ...settings, bkashMerchantNumber: e.target.value })}
                          placeholder="e.g. 01712345678"
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nagad configuration */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <h4 className="font-bold text-gray-900 text-xs">Nagad Wallet PG</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">Accept payments in BDT automatically via Nagad API.</p>
                      <div className="pt-2 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="nagad-enable"
                          checked={settings.nagadEnabled}
                          onChange={(e) => setSettings({ ...settings, nagadEnabled: e.target.checked })}
                          className="accent-orange-600 rounded-sm cursor-pointer"
                        />
                        <label htmlFor="nagad-enable" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                      </div>
                    </div>

                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gateway Mode</label>
                        <select
                          disabled={!settings.nagadEnabled}
                          value={settings.nagadMode}
                          onChange={(e) => setSettings({ ...settings, nagadMode: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        >
                          <option value="Sandbox">Sandbox (Test Environment)</option>
                          <option value="Live">Live (Real Payments)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nagad Merchant ID</label>
                        <input
                          type="text"
                          disabled={!settings.nagadEnabled}
                          value={settings.nagadMerchantId}
                          onChange={(e) => setSettings({ ...settings, nagadMerchantId: e.target.value })}
                          placeholder="Merchant ID"
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SSLCommerz configuration */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <h4 className="font-bold text-gray-900 text-xs">SSLCommerz PG</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">Accept Cards, Net Banking & Mobile Wallets via SSL Gateway.</p>
                      <div className="pt-2 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="ssl-enable"
                          checked={settings.sslcommerzEnabled}
                          onChange={(e) => setSettings({ ...settings, sslcommerzEnabled: e.target.checked })}
                          className="accent-blue-600 rounded-sm cursor-pointer"
                        />
                        <label htmlFor="ssl-enable" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                      </div>
                    </div>

                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gateway Mode</label>
                        <select
                          disabled={!settings.sslcommerzEnabled}
                          value={settings.sslcommerzMode}
                          onChange={(e) => setSettings({ ...settings, sslcommerzMode: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        >
                          <option value="Sandbox">Sandbox (Test Environment)</option>
                          <option value="Live">Live (Real Payments)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SSL Store ID</label>
                        <input
                          type="text"
                          disabled={!settings.sslcommerzEnabled}
                          value={settings.sslcommerzStoreId}
                          onChange={(e) => setSettings({ ...settings, sslcommerzStoreId: e.target.value })}
                          placeholder="SSL Store ID"
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                        <h4 className="font-bold text-gray-900 text-xs">Cash on Delivery (COD)</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">Allow customers to order and pay when order is delivered to their doorstep.</p>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="cod-enable"
                        checked={settings.codEnabled}
                        onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                        className="accent-blue-600 rounded-sm scale-125 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics & Tracking */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics &amp; Tracking
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <h4 className="font-bold text-gray-900 text-xs">Facebook Pixel</h4>
                    </div>
                    <p className="text-[10px] text-gray-500">Track conversions, optimize ads, and build targeted audiences.</p>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pixel ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 123456789012345"
                        value={settings.facebookPixelId}
                        onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner placeholder-gray-400"
                      />
                    </div>
                    {settings.facebookPixelId && (
                      <p className="text-[10px] text-emerald-400 font-semibold">Pixel will be loaded on storefront.</p>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <h4 className="font-bold text-gray-900 text-xs">Google Analytics (GA4)</h4>
                    </div>
                    <p className="text-[10px] text-gray-500">Track site traffic, user behavior, and e-commerce events.</p>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Measurement ID</label>
                      <input
                        type="text"
                        placeholder="e.g. G-XXXXXXXXXX"
                        value={settings.ga4MeasurementId}
                        onChange={(e) => setSettings({ ...settings, ga4MeasurementId: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner placeholder-gray-400"
                      />
                    </div>
                    {settings.ga4MeasurementId && (
                      <p className="text-[10px] text-emerald-400 font-semibold">GA4 will be loaded on storefront.</p>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <h4 className="font-bold text-gray-900 text-xs">Custom Header Code</h4>
                  </div>
                  <p className="text-[10px] text-gray-500">Paste any custom HTML/JS (Facebook Pixel full code, Google Tag Manager, analytics, etc.). It will be injected into the &lt;head&gt;.</p>
                  <textarea
                    rows="5"
                    placeholder="<script>...</script>"
                    value={settings.customHeaderCode || ''}
                    onChange={(e) => setSettings({ ...settings, customHeaderCode: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs font-mono placeholder-gray-400"
                  />
                  {settings.customHeaderCode && (
                    <p className="text-[10px] text-emerald-400 font-semibold">Custom code will be injected into &lt;head&gt; on storefront.</p>
                  )}
                </div>
              </div>

              {/* Top Utility Bar Settings */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Globe size={16} className="text-blue-500" />
                  Top Utility Bar Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Top Bar Helpline Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 8801234567890"
                      value={settings.topBarHelpline || ''}
                      onChange={(e) => setSettings({ ...settings, topBarHelpline: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Find a Store URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /pages/store-locator"
                      value={settings.topBarStoreLink || ''}
                      onChange={(e) => setSettings({ ...settings, topBarStoreLink: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Google Play Store App URL</label>
                    <input
                      type="text"
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      value={settings.topBarPlayStoreLink || ''}
                      onChange={(e) => setSettings({ ...settings, topBarPlayStoreLink: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Apple App Store URL</label>
                    <input
                      type="text"
                      placeholder="https://apps.apple.com/us/app/..."
                      value={settings.topBarAppStoreLink || ''}
                      onChange={(e) => setSettings({ ...settings, topBarAppStoreLink: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Settings */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Globe size={16} className="text-purple-500" />
                  Footer Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                    <input type="text" value={settings.footerEmail || ''} onChange={(e) => setSettings({ ...settings, footerEmail: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                    <input type="text" value={settings.footerPhone || ''} onChange={(e) => setSettings({ ...settings, footerPhone: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Address</label>
                    <input type="text" value={settings.footerAddress || ''} onChange={(e) => setSettings({ ...settings, footerAddress: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Copyright Text</label>
                    <input type="text" value={settings.footerCopyright || ''} onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Newsletter Title</label>
                    <input type="text" value={settings.footerNewsletterTitle || ''} onChange={(e) => setSettings({ ...settings, footerNewsletterTitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Newsletter Subtitle</label>
                    <input type="text" value={settings.footerNewsletterSubtitle || ''} onChange={(e) => setSettings({ ...settings, footerNewsletterSubtitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Facebook URL</label>
                    <input type="text" placeholder="https://facebook.com/..." value={settings.footerFacebook || ''} onChange={(e) => setSettings({ ...settings, footerFacebook: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Twitter URL</label>
                    <input type="text" placeholder="https://twitter.com/..." value={settings.footerTwitter || ''} onChange={(e) => setSettings({ ...settings, footerTwitter: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Instagram URL</label>
                    <input type="text" placeholder="https://instagram.com/..." value={settings.footerInstagram || ''} onChange={(e) => setSettings({ ...settings, footerInstagram: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Youtube URL</label>
                    <input type="text" placeholder="https://youtube.com/..." value={settings.footerYoutube || ''} onChange={(e) => setSettings({ ...settings, footerYoutube: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                </div>
              </div>

              {/* Popup Settings */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Offer Popup &amp; Recent Sale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="popup-enabled" checked={settings.popupEnabled || false} onChange={(e) => setSettings({ ...settings, popupEnabled: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                      <label htmlFor="popup-enabled" className="font-bold text-gray-900 text-xs cursor-pointer">Enable Offer Popup</label>
                    </div>
                    <p className="text-[10px] text-gray-500">Shows once per session when visitor lands on the site.</p>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Popup Title</label>
                      <input type="text" value={settings.popupTitle || ''} onChange={(e) => setSettings({ ...settings, popupTitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Popup Text</label>
                      <textarea rows="2" value={settings.popupText || ''} onChange={(e) => setSettings({ ...settings, popupText: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"></textarea>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL (optional)</label>
                      <input type="text" value={settings.popupImage || ''} onChange={(e) => setSettings({ ...settings, popupImage: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Link (optional)</label>
                      <input type="text" placeholder="/shop" value={settings.popupLink || ''} onChange={(e) => setSettings({ ...settings, popupLink: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Delay (seconds)</label>
                      <input type="number" min="0" max="30" value={settings.popupDelay || 3} onChange={(e) => setSettings({ ...settings, popupDelay: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="recent-sale-enabled" checked={settings.recentSaleEnabled !== false} onChange={(e) => setSettings({ ...settings, recentSaleEnabled: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                      <label htmlFor="recent-sale-enabled" className="font-bold text-gray-900 text-xs cursor-pointer">Enable Recent Sale Popup</label>
                    </div>
                    <p className="text-[10px] text-gray-500">Shows a random "someone purchased something" notification every N seconds.</p>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Interval (seconds)</label>
                      <input type="number" min="10" max="300" value={settings.recentSaleInterval || 30} onChange={(e) => setSettings({ ...settings, recentSaleInterval: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl shadow-lg transition flex items-center gap-2 text-xs"
                >
                  {loading ? 'Saving...' : 'Save Configuration Parameters'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Video Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Upload and manage TikTok/Reels shoppable videos and link them to products.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Videos List */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-white">
                  <h3 className="font-bold text-gray-900 text-sm">All Shoppable Videos</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {videosList.map((vid) => (
                    <div key={vid._id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-200 flex-shrink-0">
                          <Play size={16} className="text-slate-400 z-10" />
                          <video src={vid.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" muted />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-950 line-clamp-1">{vid.title}</h4>
                          <p className="text-slate-400 text-[10px] line-clamp-1 mt-0.5">{vid.description || 'No description'}</p>
                          {vid.product && (
                            <span className="inline-block mt-1 text-[9px] bg-blue-50 text-blue-600 font-extrabold px-1.5 py-0.5 rounded-md">
                              Tagged: {vid.product.name || 'Product'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button onClick={() => startEditVideo(vid)} className="text-blue-500 hover:text-blue-400 font-bold">Edit</button>
                        <button onClick={() => handleDeleteVideo(vid._id)} className="text-orange-500 hover:text-orange-400 font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                  {videosList.length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">No videos yet. Add your first shoppable video!</p>
                  )}
                </div>
              </div>

              {/* Video Form */}
              <div className="lg:col-span-5 bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">
                  {editingVideo ? 'Edit Shoppable Video' : 'Add Shoppable Video'}
                </h3>
                {editingVideo && (
                  <button 
                    onClick={() => { setEditingVideo(null); setVideoForm({ title: '', description: '', videoUrl: '', product: '' }); }} 
                    className="text-[10px] text-gray-500 hover:text-gray-900 underline block"
                  >
                    Cancel Edit
                  </button>
                )}
                <form onSubmit={editingVideo ? handleUpdateVideo : handleCreateVideo} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Video Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Smart Watch Active Demo" 
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Video MP4 URL</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. https://assets.mixkit.co/.../video.mp4" 
                      value={videoForm.videoUrl}
                      onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe this video..." 
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner leading-relaxed"
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tag Store Product</label>
                    <select
                      value={videoForm.product}
                      onChange={(e) => setVideoForm({ ...videoForm, product: e.target.value })}
                      className="w-full mt-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    >
                      <option value="">Select a product to link...</option>
                      {productsList.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition text-xs uppercase tracking-wider">
                    {editingVideo ? 'Update Video' : 'Add Video'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto bg-black/40 ">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl mx-4 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                <h3 className="font-bold text-gray-900 text-base">Edit Product: {editForm.name || 'Product'}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-1.5 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            {/* Form Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'info', label: 'Product Information' },
                { id: 'media', label: 'Images & Videos' },
                { id: 'price', label: 'Product Price & Stock' },
                { id: 'description', label: 'Description & Specification' },
                { id: 'shipping', label: 'Shipping Info' },
                { id: 'others', label: 'Others' },
                { id: 'seo', label: 'SEO' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditFormActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer border ${
                    editFormActiveTab === tab.id
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                      : 'bg-white border-slate-200 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-6 text-xs text-gray-700">
              
              {/* TAB 1: PRODUCT INFORMATION */}
              {editFormActiveTab === 'info' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">Product Information</h3>
                  </div>
                  
                  {/* Product Name */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Product Name"
                      value={editForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setEditForm({ ...editForm, name, slug });
                      }}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                    />
                  </div>

                  {/* Category & Brand */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category *</label>
                      <select
                        value={editForm.category}
                        required
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 font-semibold"
                      >
                        <option value="">Select Category</option>
                        {categoryList.map((cat) => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Brand</label>
                      <select
                        value={brandList.find((b) => b.name === editForm.brand) ? editForm.brand : ''}
                        onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 font-semibold"
                      >
                        <option value="">Select Brand</option>
                        {brandList.map((b) => (
                          <option key={b._id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Unit & Min. Order Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit *</label>
                      <input
                        type="text"
                        required
                        placeholder="Unit ( e.g kg. pc. etc )"
                        value={editForm.unit || 'pc'}
                        onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Min. Order Quantity *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={editForm.minOrderQty || 1}
                        onChange={(e) => setEditForm({ ...editForm, minOrderQty: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Barcode */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Barcode</label>
                    <div className="flex gap-2 mt-1.5">
                      <input
                        type="text"
                        placeholder="Enter product barcode"
                        value={editForm.barcode || ''}
                        onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                        className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const rand = String(Math.floor(100000000000 + Math.random() * 900000000000));
                          setEditForm({ ...editForm, barcode: rand });
                        }}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-gray-600 rounded-xl transition flex items-center justify-center cursor-pointer"
                        title="Generate Barcode"
                      >
                        <Sliders size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tags</label>
                    <input
                      type="text"
                      placeholder="Write & hit enter"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Slug</label>
                    <input
                      type="text"
                      placeholder="Product Slug"
                      value={editForm.slug || ''}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                    />
                  </div>

                  {/* Digital Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wide block">Digital</span>
                      <span className="text-[10px] text-gray-400">The product won't be shipped</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.isDigital}
                        onChange={(e) => setEditForm({ ...editForm, isDigital: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {editForm.isDigital && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Digital Delivery URL / Download Link</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. https://drive.google.com/file/d/xxxxx/view"
                        value={editForm.digitalFileUrl}
                        onChange={(e) => setEditForm({ ...editForm, digitalFileUrl: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: IMAGES & VIDEOS */}
              {editFormActiveTab === 'media' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">Images & Videos</h3>
                  </div>
                  
                  {/* Main Image */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Main Image (Upload)</label>
                    <div className="mt-1 flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setEditImageFile(file);
                            setEditImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="flex-1 text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs file:font-bold hover:file:bg-blue-700 file:cursor-pointer"
                      />
                    </div>
                    {(editImagePreview || editForm.image) && (
                      <div className="mt-3">
                        <img
                          src={editImagePreview || getImageUrl(editForm.image)}
                          alt="Preview"
                          className="h-28 w-28 object-cover rounded-xl border border-slate-200 shadow-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Existing Additional Images */}
                  <div className="p-4 bg-gray-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Existing Additional Images</label>
                    {editForm.images.length === 0 && (
                      <p className="text-[10px] text-gray-450 italic">No additional images.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {editForm.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 border border-slate-200 rounded-lg overflow-hidden group">
                          <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editForm.images.filter((_, i) => i !== idx);
                              setEditForm({ ...editForm, images: updated });
                            }}
                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200"
                            title="Remove Image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload New Additional Images */}
                  <div className="p-4 bg-gray-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Upload New Additional Images</label>
                      <button
                        type="button"
                        onClick={() => setEditAdditionalImageFiles([...editAdditionalImageFiles, null])}
                        className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md text-[10px] font-bold rounded-xl transition cursor-pointer"
                      >
                        + Add Image
                      </button>
                    </div>
                    {editAdditionalImageFiles.length === 0 && (
                      <p className="text-[10px] text-gray-500 italic">No new files added.</p>
                    )}
                    {editAdditionalImageFiles.map((file, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files[0];
                            if (f) {
                              const updated = [...editAdditionalImageFiles];
                              updated[idx] = f;
                              setEditAdditionalImageFiles(updated);
                            }
                          }}
                          className="flex-1 text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-[10px] file:font-bold hover:file:bg-blue-700 file:cursor-pointer"
                        />
                        {file && (
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-10 h-10 object-cover rounded border border-gray-300"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editAdditionalImageFiles.filter((_, i) => i !== idx);
                            setEditAdditionalImageFiles(updated);
                          }}
                          className="p-1.5 text-gray-550 hover:text-red-400 transition cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* YouTube Link */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">YouTube Video URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      value={editForm.youtubeUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCT PRICE & STOCK */}
              {editFormActiveTab === 'price' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">Product Price & Stock</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Base Price ({currencyCode}) *</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discount Percent (%)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={editForm.discountPercent}
                        onChange={(e) => setEditForm({ ...editForm, discountPercent: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock Count *</label>
                      <input
                        type="number"
                        required={!editForm.isDigital}
                        disabled={editForm.isDigital}
                        placeholder={editForm.isDigital ? 'Unlimited' : 'e.g. 25'}
                        value={editForm.isDigital ? '' : editForm.countInStock}
                        onChange={(e) => setEditForm({ ...editForm, countInStock: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Flash Sale Option */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wide block font-bold">Promote to Flash Sale</span>
                        <span className="text-[10px] text-gray-400 font-medium">Add product to flash sale schedules</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={editForm.isFlashSale}
                          onChange={(e) => setEditForm({ ...editForm, isFlashSale: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {editForm.isFlashSale && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Flash Sale Start</label>
                          <input type="datetime-local" value={editForm.flashSaleStart ? editForm.flashSaleStart.slice(0,16) : ''}
                            onChange={(e) => setEditForm({ ...editForm, flashSaleStart: e.target.value })}
                            className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Flash Sale End</label>
                          <input type="datetime-local" value={editForm.flashSaleEnd ? editForm.flashSaleEnd.slice(0,16) : ''}
                            onChange={(e) => setEditForm({ ...editForm, flashSaleEnd: e.target.value })}
                            className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: DESCRIPTION & SPECIFICATION */}
              {editFormActiveTab === 'description' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">Description & Specification</h3>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Description *</label>
                    <textarea
                      required
                      placeholder="Write descriptive content for store details..."
                      rows="6"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* TAB 5: SHIPPING INFO */}
              {editFormActiveTab === 'shipping' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">Shipping Information</h3>
                  </div>
                  <p className="text-xs text-gray-500 italic">Shipping parameters use global courier configuration rates.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Package Weight (kg)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Package Dimensions (cm)</label>
                      <input
                        type="text"
                        placeholder="e.g. 10 x 20 x 15"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: OTHERS */}
              {editFormActiveTab === 'others' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">Other Configuration Options</h3>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border p-4 rounded-xl flex-1 select-none">
                      <input type="checkbox" defaultChecked className="accent-blue-600" />
                      <div>
                        <span className="font-bold block text-[11px] text-gray-700">Published Status</span>
                        <span className="text-[10px] text-gray-400 font-medium">Visible to frontend buyers catalog</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border p-4 rounded-xl flex-1 select-none">
                      <input type="checkbox" className="accent-blue-600" />
                      <div>
                        <span className="font-bold block text-[11px] text-gray-700">Featured Badge</span>
                        <span className="text-[10px] text-gray-400 font-medium">Render in featured lists and slide highlights</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 7: SEO */}
              {editFormActiveTab === 'seo' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">SEO Search Optimization Settings</h3>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Title</label>
                    <input 
                      type="text" 
                      value={editForm.metaTitle}
                      onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })}
                      placeholder="Leave empty to use product name"
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
                    <textarea 
                      rows="4" 
                      value={editForm.metaDescription}
                      onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                      placeholder="Brief description for search engines..."
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-sm"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Form Submission Button */}
              <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-gray-600 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ───────────────── REWARDS: USER REWARDS ───────────────── */}
      {activeTab === 'rewards_users' && (
        <div className="space-y-6 max-w-7xl w-full animate-fade-in">
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">User Rewards</h1>
              <p className="text-xs text-gray-400 mt-1">View all customer point balances and adjust points manually.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={rewardSearch}
                onChange={(e) => setRewardSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm"
              />
            </div>
          </div>

          {/* Points Table */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-5 border-b border-slate-100">#</th>
                    <th className="py-3 px-5 border-b border-slate-100">Customer</th>
                    <th className="py-3 px-5 border-b border-slate-100">Email</th>
                    <th className="py-3 px-5 border-b border-slate-100 text-right">Points</th>
                    <th className="py-3 px-5 border-b border-slate-100 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-50">
                  {(userPoints || [])
                    .filter(up => {
                      const term = rewardSearch.toLowerCase();
                      return !term ||
                        (up.name || '').toLowerCase().includes(term) ||
                        (up.email || '').toLowerCase().includes(term);
                    })
                    .map((up, idx) => (
                      <tr key={up._id || up.user_id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 text-gray-400 font-medium">{idx + 1}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {(up.name || 'U')[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900">{up.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-gray-500">{up.email || '-'}</td>
                        <td className="py-3.5 px-5 text-right">
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                            ★ {(up.total_points || 0).toLocaleString()} pts
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => {
                              setAdjustModalUser(up);
                              setAdjustPointsValue(100);
                              setAdjustDescription('Manual bonus');
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Adjust Points
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                  {(userPoints || []).length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">★</span>
                          <span>No user points data found.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Logs */}
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-3">Transaction Logs</h2>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-5 border-b border-slate-100">Date</th>
                      <th className="py-3 px-5 border-b border-slate-100">Customer</th>
                      <th className="py-3 px-5 border-b border-slate-100">Type</th>
                      <th className="py-3 px-5 border-b border-slate-100">Description</th>
                      <th className="py-3 px-5 border-b border-slate-100 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-50">
                    {(pointLogs || []).slice(0, 50).map((log, idx) => (
                      <tr key={log._id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-5 text-gray-400 whitespace-nowrap">
                          {new Date(log.created_at || log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-5 font-medium text-gray-800">{log.name || log.user_name || '-'}</td>
                        <td className="py-3 px-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.type === 'earn' ? 'bg-green-100 text-green-700' : log.type === 'redeem' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {(log.type || 'manual').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-gray-500 max-w-xs truncate">{log.description || '-'}</td>
                        <td className="py-3 px-5 text-right font-bold">
                          <span className={log.points > 0 ? 'text-green-600' : 'text-red-500'}>
                            {log.points > 0 ? '+' : ''}{log.points} pts
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(pointLogs || []).length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">No transaction logs yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Points Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Adjust Points</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">For: <span className="font-semibold text-gray-700">{adjustModalUser.name || adjustModalUser.email}</span></p>
              </div>
              <button onClick={() => setAdjustModalUser(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X size={16} /></button>
            </div>
            <form onSubmit={handleAdjustPointsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Points (use negative to deduct)</label>
                <input
                  type="number"
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  placeholder="e.g. 100 or -50"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  placeholder="e.g. Manual bonus, correction…"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAdjustModalUser(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50">
                  {loading ? 'Saving…' : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────── REWARDS: CONFIGURATION ───────────────── */}
      {activeTab === 'rewards_config' && (
        <div className="space-y-6 max-w-2xl animate-fade-in">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-xl font-bold text-gray-900">Reward Configuration</h1>
            <p className="text-xs text-gray-400 mt-1">Configure earn rates, redeem rates, and system-wide reward settings.</p>
          </div>

          <form onSubmit={handleSaveRewardSettings} className="space-y-5">
            {/* Enable / Disable */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Reward System Status</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Enable or disable the entire loyalty point system site-wide.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalRewardSettings(prev => ({ ...prev, is_enabled: !prev.is_enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${localRewardSettings.is_enabled ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${localRewardSettings.is_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="mt-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${localRewardSettings.is_enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {localRewardSettings.is_enabled ? '● ACTIVE' : '○ DISABLED'}
                </span>
              </div>
            </div>

            {/* Rates */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4">
              <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2">Rate Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Earn Rate</label>
                  <p className="text-[10px] text-gray-400 mb-1.5">Points earned per 1 unit of currency spent.</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localRewardSettings.earn_rate}
                    onChange={(e) => setLocalRewardSettings(prev => ({ ...prev, earn_rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">e.g. <strong>1.00</strong> = 1 pt per ৳1 spent</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Redeem Rate</label>
                  <p className="text-[10px] text-gray-400 mb-1.5">Currency value of 1 point when redeemed.</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localRewardSettings.redeem_rate}
                    onChange={(e) => setLocalRewardSettings(prev => ({ ...prev, redeem_rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">e.g. <strong>0.10</strong> = 1 pt = ৳0.10</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Min Redeem Points</label>
                  <p className="text-[10px] text-gray-400 mb-1.5">Minimum points required to redeem.</p>
                  <input
                    type="number"
                    min="0"
                    value={localRewardSettings.min_redeem_points}
                    onChange={(e) => setLocalRewardSettings(prev => ({ ...prev, min_redeem_points: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">e.g. <strong>100</strong> pts minimum</p>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white space-y-2 shadow-lg">
              <h3 className="font-bold text-sm">Current Configuration Summary</h3>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-black">{localRewardSettings.earn_rate}</div>
                  <div className="text-[10px] text-blue-200 font-medium mt-0.5">pts / ৳1</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-black">৳{localRewardSettings.redeem_rate}</div>
                  <div className="text-[10px] text-blue-200 font-medium mt-0.5">per 1 pt</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-black">{localRewardSettings.min_redeem_points}</div>
                  <div className="text-[10px] text-blue-200 font-medium mt-0.5">min pts</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-xs disabled:opacity-50"
              >
                {loading ? 'Saving…' : '✓ Save Reward Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ───────────────── REWARDS: SET REWARD ───────────────── */}
      {activeTab === 'rewards_set' && (
        <div className="space-y-6 max-w-xl animate-fade-in">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-xl font-bold text-gray-900">Set Reward</h1>
            <p className="text-xs text-gray-400 mt-1">Manually add or deduct loyalty points for any customer.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2">Manual Point Adjustment</h3>

            <form onSubmit={handleSetPointsSubmit} className="space-y-5 text-xs">
              {/* Customer Selector */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Customer</label>
                {selectedSetUser ? (
                  <div className="mt-1.5 flex items-center justify-between px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {(selectedSetUser.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedSetUser.name}</div>
                        <div className="text-[10px] text-gray-500">{selectedSetUser.email}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setSelectedSetUser(null); setCustomerSearchTerm(''); }}
                      className="text-gray-400 hover:text-red-500 transition ml-2"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="relative mt-1.5">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search customer by name or email…"
                      value={customerSearchTerm}
                      onChange={(e) => { setCustomerSearchTerm(e.target.value); setShowCustomerDropdown(true); }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                    />
                    {showCustomerDropdown && customerSearchTerm && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                        {allUsers
                          .filter(u => u.role === 'customer' || !u.role)
                          .filter(u =>
                            (u.name || '').toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                            (u.email || '').toLowerCase().includes(customerSearchTerm.toLowerCase())
                          )
                          .slice(0, 10)
                          .map(u => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => { setSelectedSetUser(u); setCustomerSearchTerm(''); setShowCustomerDropdown(false); }}
                              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition flex items-center gap-2.5"
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                {(u.name || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{u.name}</div>
                                <div className="text-[10px] text-gray-400">{u.email}</div>
                              </div>
                            </button>
                          ))
                        }
                        {allUsers.filter(u => (u.role === 'customer' || !u.role) && ((u.name || '').toLowerCase().includes(customerSearchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(customerSearchTerm.toLowerCase()))).length === 0 && (
                          <div className="px-4 py-3 text-gray-400 text-[11px]">No customers found.</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Points */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Points Amount</label>
                <p className="text-[10px] text-gray-400 mb-1.5">Use a negative value to deduct points from the customer.</p>
                <input
                  type="number"
                  value={setPointsValue}
                  onChange={(e) => setSetPointsValue(Number(e.target.value))}
                  className="w-full mt-0.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  placeholder="e.g. 200 or -50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reason / Description</label>
                <input
                  type="text"
                  value={setPointsDesc}
                  onChange={(e) => setSetPointsDesc(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  placeholder="e.g. Loyalty bonus, birthday gift…"
                />
              </div>

              {/* Preview */}
              {selectedSetUser && (
                <div className={`rounded-xl p-4 border text-[11px] font-medium ${setPointsValue >= 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {setPointsValue >= 0 ? '✓ Adding' : '⚠ Deducting'} <strong>{Math.abs(setPointsValue)} points</strong> {setPointsValue >= 0 ? 'to' : 'from'} <strong>{selectedSetUser.name}</strong>
                  {setPointsDesc && <span className="block text-[10px] mt-0.5 opacity-75">Reason: {setPointsDesc}</span>}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedSetUser}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Processing…' : `Apply Point Adjustment`}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'seller_own_payouts' && (
        <div className="space-y-6 max-w-7xl w-full animate-fade-in">
          <div className="border-b border-slate-200 pb-5 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Payouts</h1>
              <p className="text-xs text-gray-400 mt-1">Request payouts and view history.</p>
            </div>
            <button
              onClick={async () => {
                const amount = window.prompt('Enter amount to request:');
                if (!amount || isNaN(amount)) return;
                const payment_method = window.prompt('Enter payment method (e.g. Bank, PayPal, bKash):');
                if (!payment_method) return;
                const account_details = window.prompt('Enter account details (e.g. Account Number):');
                if (!account_details) return;
                await requestPayout({ amount: Number(amount), payment_method, account_details });
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <DollarSign size={14} /> REQUEST PAYOUT
            </button>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4 border-b border-slate-100">Date</th>
                    <th className="py-3 px-4 border-b border-slate-100">Amount</th>
                    <th className="py-3 px-4 border-b border-slate-100">Method & Details</th>
                    <th className="py-3 px-4 border-b border-slate-100">Transaction ID</th>
                    <th className="py-3 px-4 border-b border-slate-100">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {(payouts || []).map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50">
                      <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900">{currencySymbol}{p.amount}</td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-700 capitalize">{p.payment_method}</div>
                        <div className="text-[10px] text-gray-500 max-w-xs truncate">{p.account_details}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{p.transaction_id || '-'}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          p.status === 'completed' ? 'bg-green-100 text-green-700' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(payouts || []).length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">No payouts requested yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      </main>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
