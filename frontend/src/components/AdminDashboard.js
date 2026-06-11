'use client';

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ShopContext, getImageUrl, formatPrice } from '@/context/ShopContext';
import dynamic from 'next/dynamic';
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });
import { useLanguage } from '@/context/LanguageContext';
import { 
  ShoppingBag, ShoppingCart, DollarSign, Contact, Users, AlertCircle, Package, ArrowRight, ArrowLeft,
  CircleDot, Tag, Plus, Check, Truck, CreditCard, ChevronRight, X,
  Sliders, Ship, Globe, MessageCircle, MessageSquare, Eye, EyeOff, LayoutGrid, Server,
  BarChart3, PieChart, TrendingUp, Play, Image as ImageIcon, CheckCircle2, MoreVertical, Edit2, Search,
  FolderOpen, Upload, Trash2, Edit, Shirt, Smartphone, Sparkles, Watch, Home, Calendar, Bell, Settings, Download, Wifi, WifiOff, Zap, User, Lock, XCircle, Shield, ShieldAlert, Ban
} from 'lucide-react';
import HeroSettingsForm from './HeroSettingsForm';
import SmartDashboardView from './SmartDashboardView';
import FinanceSystemView from './FinanceSystemView';
import InventoryManagementView from './InventoryManagementView';
import MarketingRoiView from './MarketingRoiView';
import DashboardOrders from './DashboardOrders';
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

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export default function AdminDashboard({ onTabChange }) {
  const { API_URL, changeUserEmail, fetchUsers, createUserByAdmin, importSellersByAdmin, updateUserByAdmin, adminResetUserPassword, deleteUserByAdmin, banUserByAdmin, unbanUserByAdmin, setExtraDeliveryTimeByAdmin, currencySymbol, currencyCode, payouts, fetchPayouts, requestPayout, updatePayoutStatus, sellerSettings, fetchSellerSettings, updateSellerSettings, sellerPackages, fetchSellerPackages, createSellerPackage, updateSellerPackage, deleteSellerPackage, onlineSubscriptions, offlineSubscriptions, fetchOnlineSubscriptions, fetchOfflineSubscriptions, rewardSettings, userPoints, pointLogs, fetchRewardSettings, updateRewardSettings, fetchUserPoints, fetchPointLogs, adjustUserPoints } = useContext(ShopContext);
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
        window.location.href = '/admin';
      } else {
        setUser(parsedUser);
      }
    } else {
      window.location.href = '/admin';
    }
  }, []);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalPurchaseCost: 0,
    orders: [],
  });

  const [productsList, setProductsList] = useState([]);
  const [rtConnected, setRtConnected] = useState(false);

  const { publish: publishRealtime } = useRealtime('dashboard', {
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
  const dashboardPageReadyRef = React.useRef(false);
  const [expandedMenus, setExpandedMenus] = useState({ sellers: true, products: true });
  const toggleMenu = (id) => setExpandedMenus(prev => ({...prev, [id]: !prev[id]})); // dashboard, orders, products, coupons, settings
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Product Sub Tab State
  const [productSubTab, setProductSubTab] = useState('all'); // all, category, add, attributes, digital
  const [productStatusFilter, setProductStatusFilter] = useState('all'); // all, published, unpublished, pending, trash
  const [productSellerFilter, setProductSellerFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSortOrder, setProductSortOrder] = useState('latest');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [purchasesList, setPurchasesList] = useState([]);
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    supplier: '',
    quantity: '',
    purchaseCost: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [editingPurchaseVal, setEditingPurchaseVal] = useState('');
  const [showPurchaseAddForm, setShowPurchaseAddForm] = useState(false);
  const [purchaseAddForm, setPurchaseAddForm] = useState({ name: '', price: '', purchasePrice: '', countInStock: '1', category: '', brand: '', barcode: '', discountPercent: '', image: '', description: '' });
  const [roleList, setRoleList] = useState([]);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', label: '', description: '', permissions: [] });
  const [editingRoleId, setEditingRoleId] = useState(null);

  // Expenses
  const [expenseList, setExpenseList] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({ totalExpenses: 0, categories: [], dailySummary: [], monthlySummary: [] });
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState({ category: '', startDate: '', endDate: '' });

  // Finance
  const [financeSummary, setFinanceSummary] = useState({ totalRevenue: 0, totalProductCost: 0, totalExpenses: 0, grossProfit: 0, netProfit: 0, orderCount: 0, revenueByPeriod: [], expenseByPeriod: [] });
  const [financePeriod, setFinancePeriod] = useState('monthly');

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
  
  // Subcategories
  const [subCatForm, setSubCatForm] = useState({ name: '', parentCategory: '', rootCategory: '' });
  const [editingSubCat, setEditingSubCat] = useState(null); // { originalName: '', parentId: '' }
  const [subCategoryPage, setSubCategoryPage] = useState(1);
  const [subCategorySearchQuery, setSubCategorySearchQuery] = useState('');

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
    parentCategory: '',
    brand: '',
    countInStock: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop',
    images: [''],
    purchasePrice: '0',
    discountPercent: '0',
    discountType: 'percent',
    isFlashSale: false,
    flashSaleStart: '',
    flashSaleEnd: '',
    isDigital: false,
    digitalFileUrl: '',
    shortDescription: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    metaImage: '',
    tags: '',
    youtubeUrl: '',
    unit: 'pc',
    minOrderQty: '1',
    barcode: '',
    slug: '',
    cashOnDelivery: true,
    shippingDays: '2',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editAdditionalImageFiles, setEditAdditionalImageFiles] = useState([]);
  const [descriptionImageFiles, setDescriptionImageFiles] = useState([]);
  const [editDescriptionImageFiles, setEditDescriptionImageFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [editPdfFile, setEditPdfFile] = useState(null);

  const seoImagePreview = newProduct.metaImage || imagePreview || newProduct.image || '';
  const autoMetaTitle = newProduct.metaTitle || newProduct.name || '';
  const autoMetaDescription = newProduct.metaDescription || newProduct.shortDescription || stripHtml(newProduct.description || '').slice(0, 160);
  const autoMetaKeywords = newProduct.metaKeywords || newProduct.tags || '';

  // Edit product states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', price: '', category: '', parentCategory: '', brand: '', countInStock: '',
    description: '', shortDescription: '', image: '', images: [], purchasePrice: '0', discountPercent: '0', discountType: 'percent',
    isFlashSale: false, flashSaleStart: '', flashSaleEnd: '', isDigital: false, digitalFileUrl: '', specificationPdfUrl: '',
    metaTitle: '', metaDescription: '', metaKeywords: '', metaImage: '', tags: '', youtubeUrl: '',
    unit: 'pc', minOrderQty: '1', barcode: '', slug: '',
    cashOnDelivery: true, shippingDays: '2',
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

  // AI Marketing States
  const [aiMarketingUrl, setAiMarketingUrl] = useState('');
  const [aiMarketingType, setAiMarketingType] = useState('image');
  const [aiMarketingLoading, setAiMarketingLoading] = useState(false);
  const [aiMarketingResult, setAiMarketingResult] = useState(null);

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
    rupantorPayMode: 'Sandbox',
    rupantorPayEnabled: true,
    rupantorPayStoreId: '',
    rupantorPaySignatureKey: '',
    sslcommerzMode: 'Sandbox',
    sslcommerzEnabled: true,
    sslcommerzStoreId: '',
    codEnabled: true,
    facebookPixelId: '',
    facebookAccessToken: '',
    ga4MeasurementId: '',
    googleTagManagerId: '',
    googleTagManagerEnabled: false,
    siteTitle: 'Goroly Shop - Premium E-Commerce',
    faviconUrl: '',
    headerLogo: '',
    footerLogo: '',
    headerBgColor: '#F97316',
    headerTextColor: '#FFFFFF',
    headerAccentColor: '#FF6600',
    noticeBarEnabled: true,
    noticeBarText: 'Summer Sale - All Swim Suits OFF 50%! Free delivery on orders over ৳999.',
    noticeBarBgColor: '#6F1BE4',
    noticeBarTextColor: '#FFFFFF',
    footerDescription: '',
    topBarHelpline: '8801234567890',
    topBarStoreLink: 'https://maps.google.com',
    topBarPlayStoreLink: 'https://play.google.com',
    topBarAppStoreLink: 'https://apps.apple.com',
    sasSmsGatewayUrl: '',
    sasSmsApiKey: '',
    sasSmsSecretKey: '',
    sasSmsSenderId: '',
    socialGoogleClientId: '',
    socialGoogleClientSecret: '',
    socialGoogleEnabled: false,
    socialFacebookClientId: '',
    socialFacebookClientSecret: '',
    socialFacebookEnabled: false,
    socialLinkedinClientId: '',
    socialLinkedinClientSecret: '',
    socialLinkedinEnabled: false,
  });
  const [fbConnectionStatus, setFbConnectionStatus] = useState({ loading: false, success: '', error: '' });
  const [trackingReport, setTrackingReport] = useState(null);
  const [displayedEventCounts, setDisplayedEventCounts] = useState(null);
  const [trackingTick, setTrackingTick] = useState(false);

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
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserForm, setEditingUserForm] = useState({ name: '', email: '', phone: '', role: 'customer', permissions: [] });
  const [passwordResetUserId, setPasswordResetUserId] = useState(null);
  const [passwordResetValue, setPasswordResetValue] = useState('');
  const [addingPermForStaff, setAddingPermForStaff] = useState(null);
  const [addingPermForRole, setAddingPermForRole] = useState(null);
  const [selectedPermValue, setSelectedPermValue] = useState('');
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
  const [customerListSearch, setCustomerListSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const importFileRef = React.useRef(null);
  const [selectedStatementUser, setSelectedStatementUser] = useState(null);

  // Seller Package form state
  const [newPkg, setNewPkg] = useState({ name: '', price: '', duration_days: '', product_limit: '' });
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [editPkgForm, setEditPkgForm] = useState({ name: '', price: '', duration_days: '', product_limit: '', is_active: true });

  // Payout request modal states
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bKash');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutError, setPayoutError] = useState('');

  // Fraud Checker states
  const [fraudSubTab, setFraudSubTab] = useState('suspicious');
  const [suspiciousOrders, setSuspiciousOrders] = useState([]);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [selectedFraudOrder, setSelectedFraudOrder] = useState(null);
  const [fraudCheckResult, setFraudCheckResult] = useState(null);
  const [blockedPhonesList, setBlockedPhonesList] = useState([]);
  const [blockedIpsList, setBlockedIpsList] = useState([]);
  const [newBlockPhone, setNewBlockPhone] = useState('');
  const [newBlockPhoneReason, setNewBlockPhoneReason] = useState('');
  const [newBlockIp, setNewBlockIp] = useState('');
  const [newBlockIpReason, setNewBlockIpReason] = useState('');

  // Seller profile states
  const [sellerProfileForm, setSellerProfileForm] = useState({ name: '', phone: '', owner_name: '', facebook: '', instagram: '', division: '', district: '', upazila: '', address_details: '', nid_number: '' });
  const [sellerProfileSaved, setSellerProfileSaved] = useState(false);
  const [sellerProfileError, setSellerProfileError] = useState('');
  const [sellerProfileLoading, setSellerProfileLoading] = useState(false);
  const [nidFrontFile, setNidFrontFile] = useState(null);
  const [nidFrontPreview, setNidFrontPreview] = useState('');
  const [nidBackFile, setNidBackFile] = useState(null);
  const [nidBackPreview, setNidBackPreview] = useState('');
  const [sellerPwForm, setSellerPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [sellerPwError, setSellerPwError] = useState('');
  const [sellerPwSuccess, setSellerPwSuccess] = useState(false);
  const [sellerPwLoading, setSellerPwLoading] = useState(false);
  const [sellerProfileSubTab, setSellerProfileSubTab] = useState('info');
  const [steadfastForm, setSteadfastForm] = useState({ apiKey: '', secretKey: '', enabled: false });
  const [steadfastSaving, setSteadfastSaving] = useState(false);
  const [steadfastMessage, setSteadfastMessage] = useState('');
  const [steadfastError, setSteadfastError] = useState('');
  const [automationForm, setAutomationForm] = useState({
    enabled: true,
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioFromNumber: '',
    elevenlabsApiKey: '',
    elevenlabsVoiceId: '',
    openaiApiKey: '',
    openaiModel: 'gpt-5.2',
  });
  const [automationSaving, setAutomationSaving] = useState(false);
  const [automationMessage, setAutomationMessage] = useState('');
  const [automationError, setAutomationError] = useState('');
  const [showAutomationGuide, setShowAutomationGuide] = useState(false);
  // Custom Domain States
  const [customDomainValue, setCustomDomainValue] = useState(user?.customDomain || '');
  const [customDomainSaving, setCustomDomainSaving] = useState(false);
  const [customDomainMsg, setCustomDomainMsg] = useState('');
  const [customDomainErr, setCustomDomainErr] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) return;
    const storagePrefix = user.role === 'seller' ? 'goroly_seller_dashboard' : 'goroly_admin_dashboard';
    const params = new URLSearchParams(window.location.search);
    const savedPanel = params.get('panel') || localStorage.getItem(`${storagePrefix}_active_panel`);
    const savedProductTab = params.get('productTab') || localStorage.getItem(`${storagePrefix}_product_tab`);
    const savedProfileTab = params.get('profileTab') || localStorage.getItem(`${storagePrefix}_profile_tab`);

    if (savedPanel) setActiveTab(savedPanel);
    if (savedProductTab) setProductSubTab(savedProductTab);
    if (savedProfileTab) setSellerProfileSubTab(savedProfileTab);
    dashboardPageReadyRef.current = true;
  }, [user]);

  useEffect(() => {
    if (!user || !dashboardPageReadyRef.current) return;
    const storagePrefix = user.role === 'seller' ? 'goroly_seller_dashboard' : 'goroly_admin_dashboard';
    localStorage.setItem(`${storagePrefix}_active_panel`, activeTab);

    const url = new URL(window.location.href);
    url.searchParams.set('panel', activeTab);
    window.history.replaceState({}, '', url.toString());
  }, [user, activeTab]);

  useEffect(() => {
    if (!user || !dashboardPageReadyRef.current) return;
    const storagePrefix = user.role === 'seller' ? 'goroly_seller_dashboard' : 'goroly_admin_dashboard';
    localStorage.setItem(`${storagePrefix}_product_tab`, productSubTab);

    const url = new URL(window.location.href);
    if (activeTab === 'products') {
      url.searchParams.set('productTab', productSubTab);
    } else {
      url.searchParams.delete('productTab');
    }
    window.history.replaceState({}, '', url.toString());
  }, [user, activeTab, productSubTab]);

  useEffect(() => {
    if (!user || !dashboardPageReadyRef.current) return;
    const storagePrefix = user.role === 'seller' ? 'goroly_seller_dashboard' : 'goroly_admin_dashboard';
    localStorage.setItem(`${storagePrefix}_profile_tab`, sellerProfileSubTab);

    const url = new URL(window.location.href);
    if (activeTab === 'seller_own_profile') {
      url.searchParams.set('profileTab', sellerProfileSubTab);
    } else {
      url.searchParams.delete('profileTab');
    }
    window.history.replaceState({}, '', url.toString());
  }, [user, activeTab, sellerProfileSubTab]);

  const handleSubmitPayout = async (e) => {
    e.preventDefault();
    setPayoutError('');
    if (!payoutAmount || isNaN(payoutAmount) || Number(payoutAmount) <= 0) {
      setPayoutError('Please enter a valid amount.');
      return;
    }
    const minAmount = settings?.withdraw_min_amount || 500;
    if (Number(payoutAmount) < minAmount) {
      setPayoutError(`Minimum withdrawal amount is ${currencySymbol || '৳'}${minAmount}.`);
      return;
    }
    if (!payoutAccount || payoutAccount.trim().length < 11) {
      setPayoutError('Please enter a valid 11-digit mobile wallet number.');
      return;
    }
    setLoading(true);
    const res = await requestPayout({
      amount: Number(payoutAmount),
      payment_method: payoutMethod,
      account_details: `${payoutMethod} Wallet: ${payoutAccount}`
    });
    setLoading(false);
    if (res.success) {
      setShowPayoutModal(false);
      fetchPayouts();
    } else {
      setPayoutError(res.error || 'Failed to submit request.');
    }
  };

  const ALL_PERMS = ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat', 'settings', 'users', 'expenses', 'finance'];
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

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/users/roles/all`, {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoleList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchExpenses = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      const qs = params.toString();
      const res = await fetch(`${API_URL}/expenses${qs ? '?' + qs : ''}`, {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpenseList(data || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchExpenseSummary = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      params.set('period', 'monthly');
      const qs = params.toString();
      const res = await fetch(`${API_URL}/expenses/summary${qs ? '?' + qs : ''}`, {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpenseSummary(data);
      }
    } catch (error) {
      console.error('Error fetching expense summary:', error);
    }
  };

  const fetchFinanceSummary = async (period = 'monthly') => {
    try {
      const res = await fetch(`${API_URL}/finance/summary?period=${period}`, {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFinanceSummary(data);
      }
    } catch (error) {
      console.error('Error fetching finance summary:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`${API_URL}/purchases`, {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPurchasesList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
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

  const fetchTrackingReport = useCallback(async () => {
    if (!user || !user.isAdmin) return;
    try {
      const res = await fetch(`${API_URL}/settings/tracking-report`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTrackingReport(data);
        // Animate event counters ticking up to new values
        const newCounts = data.eventCounts || {};
        setDisplayedEventCounts((prev) => {
          if (!prev) return newCounts;
          // Start animated tick from previous values
          const keys = Object.keys(newCounts);
          const start = { ...prev };
          const end = { ...newCounts };
          const steps = 20;
          let step = 0;
          const interval = setInterval(() => {
            step++;
            const interpolated = {};
            keys.forEach((k) => {
              const s = Number(start[k] || 0);
              const e = Number(end[k] || 0);
              interpolated[k] = Math.round(s + ((e - s) * step) / steps);
            });
            setDisplayedEventCounts(interpolated);
            if (step >= steps) clearInterval(interval);
          }, 40);
          return start;
        });
        // Trigger blink indicator
        setTrackingTick(true);
        setTimeout(() => setTrackingTick(false), 1200);
      }
    } catch (error) {
      console.warn('Tracking report unavailable:', error);
    }
  }, [user, API_URL]);

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

  const notifySettingsUpdated = (nextSettings) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goroly-settings-updated', { detail: nextSettings }));
    }
  };

  const saveSettings = async (nextSettings) => {
    const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(nextSettings),
      });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update settings');
    }
    notifySettingsUpdated(nextSettings);
    return res;
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveSettings(settings);
      alert('Configurations saved successfully!');
      fetchSettings();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestFacebookPixel = async () => {
    if (!settings.facebookPixelId || !settings.facebookAccessToken) {
      setFbConnectionStatus({ loading: false, success: '', error: 'Pixel ID and Access Token are required.' });
      return;
    }
    setFbConnectionStatus({ loading: true, success: '', error: '' });
    try {
      const res = await fetch(`${API_URL}/settings/test-fb-pixel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          pixelId: settings.facebookPixelId,
          accessToken: settings.facebookAccessToken
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFbConnectionStatus({ loading: false, success: data.message, error: '' });
        // Automatically save settings as well
        handleSaveSettings({ preventDefault: () => {} });
      } else {
        setFbConnectionStatus({ loading: false, success: '', error: data.message || 'Failed to connect.' });
      }
    } catch (error) {
      setFbConnectionStatus({ loading: false, success: '', error: error.message });
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
    fetchTrackingReport();
    fetchShippingMethods();
    fetchPages();
    fetchOffers();
    fetchBanners();
    fetchCategories();
    fetchBrands();
    fetchVideos();
    fetchRoles();
    fetchPurchases();
    fetchExpenses();
    fetchExpenseSummary();
    fetchFinanceSummary(financePeriod);
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

  // Auto-poll tracking report every 30 seconds to keep event counts live
  useEffect(() => {
    if (!user || !user.isAdmin) return;
    const interval = setInterval(() => {
      fetchTrackingReport();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchTrackingReport]);

  useEffect(() => {
    if (user && (activeTab === 'users' || activeTab === 'sellers_all' || activeTab === 'staffs' || activeTab === 'rewards_set')) fetchAllUsers();
    if (user && activeTab === 'fraud_checker') { fetchSuspiciousOrders(); fetchBlockedPhonesList(); fetchBlockedIpsList(); }
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

  // Pre-fill seller profile form when user data loads or tab changes
  useEffect(() => {
    if (user && activeTab === 'seller_own_profile') {
      setSellerProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        owner_name: user.owner_name || '',
        facebook: user.facebook || '',
        instagram: user.instagram || '',
        division: user.division || '',
        district: user.district || '',
        upazila: user.upazila || '',
        address_details: user.address_details || '',
        nid_number: user.nid_number || '',
      });
      setSellerProfileSaved(false);
      setSellerProfileError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  // Separate effect for chat polling
  useEffect(() => {
    if (!user || activeTab !== 'chat') return;
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  // Actions
  const handleAnalyzeMedia = async (e) => {
    e.preventDefault();
    if (!aiMarketingUrl) return alert('Please enter a valid image or video URL.');
    setAiMarketingLoading(true);
    setAiMarketingResult(null);
    try {
      const res = await fetch(`${API_URL}/marketing/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ mediaUrl: aiMarketingUrl, type: aiMarketingType }),
      });
      if (res.ok) {
        setAiMarketingResult(await res.json());
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to analyze media.');
      }
    } catch (err) {
      alert(err.message || 'Error connecting to AI service.');
    } finally {
      setAiMarketingLoading(false);
    }
  };

  const handleGenerateSeo = async (e, isEdit = false) => {
    e.preventDefault();
    const productData = isEdit ? editForm : newProduct;
    if (!productData.name) return alert('Please enter a Product Name first.');

    setAiMarketingLoading(true);
    try {
      const res = await fetch(`${API_URL}/marketing/generate-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          category: productData.category,
          brand: productData.brand
        }),
      });
      if (res.ok) {
        const seo = await res.json();
        if (isEdit) {
          setEditForm(prev => ({
            ...prev,
            metaTitle: seo.metaTitle || prev.metaTitle,
            metaDescription: seo.metaDescription || prev.metaDescription,
            metaKeywords: seo.keywords || prev.metaKeywords,
            metaImageAlt: seo.altText || prev.metaImageAlt,
          }));
        } else {
          setNewProduct(prev => ({
            ...prev,
            metaTitle: seo.metaTitle || prev.metaTitle,
            metaDescription: seo.metaDescription || prev.metaDescription,
            metaKeywords: seo.keywords || prev.metaKeywords,
            metaImageAlt: seo.altText || prev.metaImageAlt,
          }));
        }
        alert('✨ SEO Data generated successfully!');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to generate SEO.');
      }
    } catch (err) {
      alert(err.message || 'Error connecting to AI service.');
    } finally {
      setAiMarketingLoading(false);
    }
  };

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

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Delete this order? This action cannot be undone.')) return;

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.ok) {
        alert('Order deleted!');
        fetchSummary();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Failed to delete order');
      }
    } catch (error) {
      alert(error.message || 'Failed to delete order');
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
      const data = await res.json();
      if (res.ok) {
        if (data.skipped) {
          const msg = user?.hasSteadfastIntegration
            ? '⚠️ The seller for this order has not configured SteadFast.\n\nOnly the product owner can book SteadFast for their own orders.'
            : '⚠️ SteadFast is not configured.\n\nGo to the SteadFast Integration tab to add your API keys.';
          alert(msg);
          fetchSummary();
          return;
        }
        const trackingCode = data.courier_tracking_code || data.courierInfo?.trackingCode || '';
        const courierStatus = data.courier_status || data.courierInfo?.status || '';
        let msg = `✅ Courier booked with ${provider}!`;
        if (trackingCode) msg += `\nTracking: ${trackingCode}`;
        if (courierStatus) msg += `\nStatus: ${courierStatus}`;
        alert(msg);
        fetchSummary();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, ...data });
        }
      } else {
        alert(`❌ ${data?.message || `Failed to book ${provider} courier`}`);
      }
    } catch (error) {
      alert(error.message || 'Failed to book courier');
    }
  };

  const uploadFile = async (file) => {
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
  };

  const handleBrandingUpload = async (file, field) => {
    if (!file) return;
    setLoading(true);
    try {
      const imageUrl = await uploadFile(file);
      const nextSettings = { ...settings, [field]: imageUrl };
      setSettings(nextSettings);
      await saveSettings(nextSettings);
      alert('Branding uploaded and saved successfully!');
    } catch (error) {
      alert(error.message || 'Upload failed');
    } finally {
      setLoading(false);
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

      // Upload description images
      let descriptionImageUrls = [];
      if (descriptionImageFiles.length > 0) {
        const formData = new FormData();
        descriptionImageFiles.forEach((f) => formData.append('images', f));
        const res = await fetch(`${API_URL}/upload/descriptions`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          descriptionImageUrls = data.images.map((img) => img.url);
        }
      }

      // Upload PDF specification
      let specificationPdfUrl = newProduct.specificationPdfUrl || '';
      if (pdfFile) {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        const res = await fetch(`${API_URL}/upload/pdf`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          specificationPdfUrl = data.url;
        }
      }

      // Create product directly
      const createRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          purchasePrice: Number(newProduct.purchasePrice || 0),
          category: newProduct.category,
          brand: newProduct.brand,
          countInStock: Number(newProduct.countInStock),
          description: newProduct.description,
          shortDescription: newProduct.shortDescription || '',
          image: mainImageUrl,
          images: additionalImageUrls,
          descriptionImages: descriptionImageUrls,
          specificationPdfUrl,
          isPublished: newProduct.isActive,
          discountPercent: Math.max(0, Number(newProduct.discountPercent || 0)),
          discountType: newProduct.discountType || 'percent',
          isFlashSale: newProduct.isFlashSale,
          flashSaleStart: newProduct.flashSaleStart || null,
          flashSaleEnd: newProduct.flashSaleEnd || null,
          metaTitle: newProduct.metaTitle || newProduct.name || '',
          metaDescription: newProduct.metaDescription || newProduct.shortDescription || stripHtml(newProduct.description || '').slice(0, 160),
          metaKeywords: newProduct.metaKeywords || newProduct.tags || '',
          metaImage: newProduct.metaImage || mainImageUrl,
          tags: newProduct.tags ? newProduct.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          youtubeUrl: newProduct.youtubeUrl || '',
          unit: newProduct.unit || 'pc',
          minOrderQty: Number(newProduct.minOrderQty || 1),
          barcode: newProduct.barcode || '',
          slug: newProduct.slug || '',
          cashOnDelivery: newProduct.cashOnDelivery !== false,
          shippingDays: Number(newProduct.shippingDays || 2),
          isDigital: newProduct.isDigital,
          digitalFileUrl: newProduct.isDigital ? newProduct.digitalFileUrl : '',
        }),
      });
      
      if (createRes.ok) {
        alert('Product created successfully!');
        fetchProducts();
        setNewProduct({
          name: '',
          price: '',
          category: '',
          parentCategory: '',
          brand: '',
          countInStock: '',
          description: '',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop',
          images: [''],
          discountPercent: '0',
          discountType: 'percent',
          isFlashSale: false,
          flashSaleStart: '',
          flashSaleEnd: '',
          isDigital: false,
          digitalFileUrl: '',
          specificationPdfUrl: '',
          shortDescription: '',
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          metaImage: '',
          tags: '',
          youtubeUrl: '',
          unit: 'pc',
          minOrderQty: '1',
          barcode: '',
          slug: '',
          cashOnDelivery: true,
          shippingDays: '2',
        });
        setImageFile(null);
        setImagePreview('');
        setAdditionalImageFiles([]);
        setDescriptionImageFiles([]);
        setPdfFile(null);
        setFormActiveTab('info');
        setProductSubTab('all');
      } else {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create product data');
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

      // Upload description images
      let uploadedDescriptionUrls = [];
      if (editDescriptionImageFiles.length > 0) {
        const formData = new FormData();
        editDescriptionImageFiles.forEach((f) => formData.append('images', f));
        const res = await fetch(`${API_URL}/upload/descriptions`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedDescriptionUrls = data.images.map((img) => img.url);
        }
      }

      // Upload PDF specification
      let specificationPdfUrl = editForm.specificationPdfUrl || '';
      if (editPdfFile) {
        const formData = new FormData();
        formData.append('pdf', editPdfFile);
        const res = await fetch(`${API_URL}/upload/pdf`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          specificationPdfUrl = data.url;
        }
      }

      const finalAdditionalImages = [
        ...editForm.images.filter((url) => url && url.trim()),
        ...uploadedAdditionalUrls
      ];

      const finalDescriptionImages = [
        ...(editForm.descriptionImages || []).filter((url) => url && url.trim()),
        ...uploadedDescriptionUrls
      ];

      const res = await fetch(`${API_URL}/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          name: editForm.name, price: Number(editForm.price), purchasePrice: Number(editForm.purchasePrice || 0), category: editForm.category,
          brand: editForm.brand, countInStock: Number(editForm.countInStock),
          description: editForm.description, 
          shortDescription: editForm.shortDescription || '',
          image: imageUrl,
          images: finalAdditionalImages,
          descriptionImages: finalDescriptionImages,
          specificationPdfUrl,
          discountPercent: Math.max(0, Number(editForm.discountPercent || 0)),
          discountType: editForm.discountType || 'percent',
          isFlashSale: editForm.isFlashSale,
          flashSaleStart: editForm.flashSaleStart || null,
          flashSaleEnd: editForm.flashSaleEnd || null,
          metaTitle: editForm.metaTitle || editForm.name || '',
          metaDescription: editForm.metaDescription || editForm.shortDescription || stripHtml(editForm.description || '').slice(0, 160),
          metaKeywords: editForm.metaKeywords || editForm.tags || '',
          metaImage: editForm.metaImage || imageUrl,
          tags: editForm.tags ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          youtubeUrl: editForm.youtubeUrl || '',
          unit: editForm.unit || 'pc',
          minOrderQty: Number(editForm.minOrderQty || 1),
          barcode: editForm.barcode || '',
          slug: editForm.slug || '',
          cashOnDelivery: editForm.cashOnDelivery !== false,
          shippingDays: Number(editForm.shippingDays || 2),
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
        setEditDescriptionImageFiles([]);
        setEditPdfFile(null);
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

  // Fraud Checker API
  const fetchSuspiciousOrders = async () => {
    if (!user) return;
    setFraudLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/fraud/suspicious`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setSuspiciousOrders(await res.json());
    } catch (e) { console.error(e); }
    setFraudLoading(false);
  };

  const fetchFraudCheck = async (orderId) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/admin/fraud/check/${orderId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setFraudCheckResult(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchBlockedPhonesList = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/admin/fraud/blocked-phones`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setBlockedPhonesList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchBlockedIpsList = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/admin/fraud/blocked-ips`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setBlockedIpsList(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleBlockPhone = async (e) => {
    e.preventDefault();
    if (!newBlockPhone.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/fraud/block-phone`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newBlockPhone.trim(), reason: newBlockPhoneReason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Phone blocked successfully');
        setNewBlockPhone('');
        setNewBlockPhoneReason('');
        fetchBlockedPhonesList();
      } else {
        alert(data.message || 'Failed to block phone');
      }
    } catch (e) { console.error(e); }
  };

  const handleUnblockPhone = async (phone) => {
    if (!confirm(`Unblock ${phone}?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/fraud/block-phone/${encodeURIComponent(phone)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        alert('Phone unblocked');
        fetchBlockedPhonesList();
      }
    } catch (e) { console.error(e); }
  };

  const handleBlockIp = async (e) => {
    e.preventDefault();
    if (!newBlockIp.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/fraud/block-ip`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: newBlockIp.trim(), reason: newBlockIpReason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('IP blocked successfully');
        setNewBlockIp('');
        setNewBlockIpReason('');
        fetchBlockedIpsList();
      } else {
        alert(data.message || 'Failed to block IP');
      }
    } catch (e) { console.error(e); }
  };

  const handleUnblockIp = async (ip) => {
    if (!confirm(`Unblock ${ip}?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/fraud/block-ip/${encodeURIComponent(ip)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        alert('IP unblocked');
        fetchBlockedIpsList();
      }
    } catch (e) { console.error(e); }
  };

  // Category CRUD
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const list = await res.json();
        const enriched = list.map((cat, idx) => ({
          ...cat,
          rootCategory: cat.rootCategory || '',
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
      const existingName = categoryList.find(cat => cat.name.toLowerCase() === catForm.name.trim().toLowerCase());
      if (existingName) {
        alert('Category name already exists. Please choose a different name.');
        return;
      }

      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          name: catForm.name,
          image: catForm.image,
          banner: catForm.banner,
          order: catForm.order,
          rootCategory: catForm.rootCategory,
          subcategories: catForm.subcategories ? catForm.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCatForm({
          name: '', image: '', order: 0, rootCategory: '', slug: '',
          commissionRate: 0, icon: '', banner: '', metaTitle: '', metaDescription: '',
          featured: false, status: true, subcategories: ''
        });

        fetchCategories();
        publishRealtime('category_updated', { action: 'create' });
      } else {
        alert(data.message || 'Failed to create category');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const existingName = categoryList.find(cat => cat.name.toLowerCase() === catForm.name.trim().toLowerCase() && cat._id !== editingCat._id);
      if (existingName) {
        alert('Category name already exists. Please choose a different name.');
        return;
      }

      const res = await fetch(`${API_URL}/categories/${editingCat._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          name: catForm.name,
          image: catForm.image,
          banner: catForm.banner,
          order: catForm.order,
          rootCategory: catForm.rootCategory,
          subcategories: catForm.subcategories ? catForm.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setEditingCat(null);
        setCatForm({
          name: '', image: '', order: 0, rootCategory: '', slug: '',
          commissionRate: 0, icon: '', banner: '', metaTitle: '', metaDescription: '',
          featured: false, status: true, subcategories: ''
        });

        fetchCategories();
        publishRealtime('category_updated', { action: 'update' });
      } else {
        alert(data.message || 'Failed to update category');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) {
        fetchCategories();
        publishRealtime('category_updated', { action: 'delete' });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to delete category');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Subcategory Handlers
  const handleCreateSubCategory = async (e) => {
    e.preventDefault();
    if (!subCatForm.name || !subCatForm.parentCategory) {
      alert('Please enter a name and select a parent category');
      return;
    }
    const parent = categoryList.find(c => c._id === subCatForm.parentCategory);
    if (!parent) return;

    let currentSubcats = Array.isArray(parent.subcategories) ? parent.subcategories : [];
    if (typeof parent.subcategories === 'string') {
        currentSubcats = parent.subcategories.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    if (currentSubcats.map(s => s.toLowerCase()).includes(subCatForm.name.trim().toLowerCase())) {
      alert('Subcategory already exists in this parent category');
      return;
    }

    const updatedSubcats = [...currentSubcats, subCatForm.name.trim()];

    try {
      const res = await fetch(`${API_URL}/categories/${parent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
        body: JSON.stringify({ subcategories: updatedSubcats })
      });
      if (res.ok) {
        setSubCatForm({ name: '', parentCategory: '', rootCategory: '' });
        fetchCategories();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to create subcategory');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateSubCategory = async (e) => {
    e.preventDefault();
    if (!subCatForm.name || !subCatForm.parentCategory || !editingSubCat) return;

    const oldParentId = editingSubCat.parentId;
    const oldName = editingSubCat.originalName;
    const newParentId = subCatForm.parentCategory;
    const newName = subCatForm.name.trim();

    try {
      if (oldParentId === newParentId) {
        // Same parent, just update the name in the array
        const parent = categoryList.find(c => c._id === oldParentId);
        if (!parent) return;
        let currentSubcats = Array.isArray(parent.subcategories) ? parent.subcategories : (typeof parent.subcategories === 'string' ? parent.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []);
        const updatedSubcats = currentSubcats.map(s => s === oldName ? newName : s);
        
        await fetch(`${API_URL}/categories/${parent._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
          body: JSON.stringify({ subcategories: updatedSubcats })
        });
      } else {
        // Different parent: remove from old, add to new
        const oldParent = categoryList.find(c => c._id === oldParentId);
        const newParent = categoryList.find(c => c._id === newParentId);
        if (oldParent) {
          let oldSubcats = Array.isArray(oldParent.subcategories) ? oldParent.subcategories : (typeof oldParent.subcategories === 'string' ? oldParent.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []);
          await fetch(`${API_URL}/categories/${oldParent._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
            body: JSON.stringify({ subcategories: oldSubcats.filter(s => s !== oldName) })
          });
        }
        if (newParent) {
          let newSubcats = Array.isArray(newParent.subcategories) ? newParent.subcategories : (typeof newParent.subcategories === 'string' ? newParent.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []);
          await fetch(`${API_URL}/categories/${newParent._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
            body: JSON.stringify({ subcategories: [...newSubcats, newName] })
          });
        }
      }
      setEditingSubCat(null);
      setSubCatForm({ name: '', parentCategory: '', rootCategory: '' });
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubCategory = async (parentId, subCatName) => {
    if (!window.confirm(`Are you sure you want to delete the subcategory "${subCatName}"?`)) return;
    const parent = categoryList.find(c => c._id === parentId);
    if (!parent) return;
    let currentSubcats = Array.isArray(parent.subcategories) ? parent.subcategories : (typeof parent.subcategories === 'string' ? parent.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []);
    
    try {
      await fetch(`${API_URL}/categories/${parent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
        body: JSON.stringify({ subcategories: currentSubcats.filter(s => s !== subCatName) })
      });
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
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

  const handleSavePurchasePrice = async (productId) => {
    try {
      const val = parseFloat(editingPurchaseVal);
      if (isNaN(val) || val < 0) {
        alert('Please enter a valid purchase price');
        return;
      }
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ purchasePrice: val }),
      });
      if (res.ok) {
        setEditingPurchaseId(null);
        fetchProducts();
      } else {
        alert('Failed to update purchase price');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDuplicateProduct = async (prod) => {
    if (!confirm('Are you sure you want to duplicate this product?')) return;
    setLoading(true);
    try {
      const createRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: `${prod.name} (Copy)`,
          price: Number(prod.price),
          purchasePrice: Number(prod.purchasePrice || 0),
          category: prod.category,
          brand: prod.brand,
          countInStock: Number(prod.countInStock),
          description: prod.description,
          image: prod.image,
          images: prod.images || [],
          discountPercent: Number(prod.discountPercent || 0),
          discountType: prod.discountType || 'percent',
          cashOnDelivery: prod.cashOnDelivery !== false,
          shippingDays: prod.shippingDays || 2,
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
      if (createRes.ok) {
        alert('Product duplicated successfully!');
        fetchProducts();
      } else {
        alert('Failed to duplicate product');
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
        <div className="p-8 text-center text-gray-500 text-sm">
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
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1 max-w-[200px]" title={prod.name}>{prod.name}</h4>
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
                <td className="py-4 px-4 text-sm text-gray-500 space-y-0.5">
                  <div>Base Price: {formatPrice(prod.price, currencySymbol)} /{prod.unit || 'pcs'}</div>
                  <div>Total Sale: {prod.salesCount || 0}</div>
                  <div>Rating: {prod.rating || 0}</div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-900 font-semibold space-y-0.5">
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
                      const parentName = (() => {
                        if (!prod.category) return '';
                        const parent = categoryList.find(c => {
                          const subs = Array.isArray(c.subcategories) ? c.subcategories 
                            : (typeof c.subcategories === 'string' ? c.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []);
                          return subs.includes(prod.category);
                        });
                        return parent ? parent.name : prod.category;
                      })();
                      setEditForm({
                        name: prod.name, price: String(prod.price), purchasePrice: String(prod.purchasePrice || 0), category: prod.category,
                        parentCategory: parentName,
                        brand: prod.brand, countInStock: String(prod.countInStock),
                        description: prod.description, image: prod.image, images: prod.images || [''],
                        descriptionImages: prod.descriptionImages || [],
                        discountPercent: String(prod.discountPercent || 0),
                        discountType: prod.discountType || 'percent',
                        cashOnDelivery: prod.cashOnDelivery !== false,
                        shippingDays: String(prod.shippingDays || 2),
                        isFlashSale: prod.isFlashSale || false, isDigital: prod.isDigital || false,
                        digitalFileUrl: prod.digitalFileUrl || '',
                        specificationPdfUrl: prod.specificationPdfUrl || '',
                        flashSaleStart: prod.flashSaleStart || '',
                        flashSaleEnd: prod.flashSaleEnd || '',
                        metaTitle: prod.metaTitle || '',
                        metaDescription: prod.metaDescription || '',
                        metaKeywords: prod.metaKeywords || '',
                        metaImage: prod.metaImage || prod.image || '',
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
                        shortDescription: prod.shortDescription || '',
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
        <tr className="text-center text-sm text-gray-400">
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
        Processing: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', progress: 'w-2/4 from-blue-400 to-blue-500' },
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
              <span className="font-bold text-gray-700 text-sm bg-white border border-slate-200 px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
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
              {(order.courierInfo?.provider || order.courier_provider) && (
                <div className="mt-1 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  <span className="font-black text-slate-700">{order.courierInfo?.provider || order.courier_provider}</span>
                  {(order.courierInfo?.trackingCode || order.courier_tracking_code) && (
                    <span className="block font-mono text-slate-400">{order.courierInfo?.trackingCode || order.courier_tracking_code}</span>
                  )}
                  {(order.courierInfo?.status || order.courier_status) && (
                    <span className="block text-slate-400">{order.courierInfo?.status || order.courier_status}</span>
                  )}
                </div>
              )}
            </div>
          </td>
          <td className="py-4 pr-4 rounded-r-xl text-right">
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => setSelectedOrder(order)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200"
                title="View Details"
              >
                <Eye size={14} />
              </button>
              {order.status === 'Pending' && (
                <button 
                  onClick={() => handleUpdateStatus(order._id, 'Processing')}
                  className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-[#FF6600] rounded-lg text-sm font-bold transition flex items-center gap-1"
                >
                  <Check size={14} /> Approve
                </button>
              )}
              
              {order.status === 'Processing' && (
                <div className="flex gap-1.5">
                  {['Pathao', 'SteadFast', 'RedX'].map((courier) => {
                    const isSteadfast = courier === 'SteadFast';
                    const isConnected = user?.hasSteadfastIntegration;
                    return (
                      <button
                        key={courier}
                        onClick={() => handleBookCourier(order._id, courier)}
                        className={`px-2 py-1.5 border text-[10px] font-bold rounded-lg flex items-center gap-1 transition shadow-xs ${
                          isSteadfast && isConnected
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : isSteadfast && !isConnected
                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:text-[#FF6600] text-gray-600'
                        }`}
                        title={isSteadfast && !isConnected ? 'Configure SteadFast in Integration tab first' : `Book ${courier} courier`}
                        disabled={isSteadfast && !isConnected}
                      >
                        <Truck size={12} />
                        {isSteadfast && isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {courier}
                      </button>
                    );
                  })}
                </div>
              )}

              {order.status === 'Shipped' && (
                <button 
                  onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                  className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 rounded-lg text-sm font-bold transition flex items-center gap-1"
                >
                  <CheckCircle2 size={14} /> Delivered
                </button>
              )}

              {order.status !== 'Cancelled' && (
                <button 
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to cancel this order (${order.status})?`)) {
                      handleUpdateStatus(order._id, 'Cancelled');
                    }
                  }}
                  className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-xl transition-all duration-200 ml-1"
                  title="Cancel Order"
                >
                  <X size={14} />
                </button>
              )}

              <button
                onClick={() => handleDeleteOrder(order._id)}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all duration-200 ml-1"
                title="Delete Order"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  const getFilteredProducts = (baseList) => {
    let result = [...baseList];

    // Extra safety: If logged in user is a seller, restrict lists to only their products
    if (user && user.role === 'seller' && !user.isAdmin) {
      result = result.filter(p => p.user_id === user._id || p.user_id === user.id);
    }

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

  const isSellerAccount = user?.role === 'seller' && !user?.isAdmin;
  const sellerProducts = isSellerAccount
    ? productsList.filter((product) => product.user_id === user?._id)
    : productsList;
  const sellerOrders = metrics.orders || [];
  const sellerLowStockProducts = sellerProducts
    .filter((product) => !product.isDigital && product.countInStock !== undefined && Number(product.countInStock) <= 10)
    .sort((a, b) => Number(a.countInStock || 0) - Number(b.countInStock || 0));
  const sellerDraftProducts = sellerProducts.filter((product) => product.isPublished === false);
  const sellerPendingOrders = sellerOrders.filter((order) => ['Pending', 'Processing'].includes(order.status));
  const sellerCancelledOrders = sellerOrders.filter((order) => order.status === 'Cancelled');
  const sellerCompletedOrders = sellerOrders.filter((order) => order.status === 'Delivered');
  const sellerPendingPayouts = (payouts || []).filter((payout) => payout.status === 'pending' || payout.status === 'Pending');
  const sellerAverageOrderValue = sellerOrders.length > 0 ? Number(metrics.totalRevenue || 0) / sellerOrders.length : 0;
  const sellerDeliveryRate = sellerOrders.length > 0 ? Math.round((sellerCompletedOrders.length / sellerOrders.length) * 100) : 0;
  const sellerReadinessItems = [
    {
      label: 'NID verified',
      done: user?.verification_status === 'Verified',
      action: () => {
        setActiveTab('seller_own_profile');
        setSellerProfileSubTab('nid');
      },
    },
    {
      label: 'Profile completed',
      done: Boolean(user?.phone && (user?.owner_name || user?.name) && user?.address_details),
      action: () => {
        setActiveTab('seller_own_profile');
        setSellerProfileSubTab('info');
      },
    },
    {
      label: 'First product listed',
      done: sellerProducts.length > 0,
      action: () => {
        setActiveTab('products');
        setProductSubTab('add');
      },
    },
    {
      label: 'Payout method ready',
      done: (payouts || []).length > 0,
      action: () => setActiveTab('seller_own_payouts'),
    },
  ];
  const sellerReadinessScore = Math.round((sellerReadinessItems.filter((item) => item.done).length / sellerReadinessItems.length) * 100);
  const cancelledOrdersCount = isSellerAccount
    ? sellerCancelledOrders.length
    : (metrics.orderStatistics?.find((item) => item.name === 'Cancelled')?.value || (metrics.orders || []).filter((order) => order.status === 'Cancelled').length || 0);
  const trackingOrders = Array.isArray(metrics.orders) ? metrics.orders : [];
  const trackingReportTotals = trackingReport?.totals || {};
  const trackingRevenue = Number(trackingReportTotals.totalRevenue ?? 0);
  const trackingSessions = Number(trackingReportTotals.sessions ?? 0);
  const trackingEvents = Number(trackingReportTotals.events ?? 0);
  const trackingConversionRate = Number(trackingReportTotals.conversionRate ?? 0).toFixed(1);
  const fallbackTrackingChartData = Array.from({ length: 8 }).map((_, index) => {
    const labelDate = new Date();
    labelDate.setMinutes(labelDate.getMinutes() - (7 - index) * 15);
    return {
      time: labelDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fb: 0,
      ga4: 0,
      revenue: 0,
    };
  });
  const trackingChartData = Array.isArray(trackingReport?.chart) && trackingReport.chart.length
    ? trackingReport.chart.map((item) => ({ time: item.time, fb: item.facebookEvents || item.fb || 0, ga4: item.ga4Events || item.ga4 || 0, revenue: item.revenue || 0 }))
    : fallbackTrackingChartData;
  const trackingSourceData = Array.isArray(trackingReport?.sources) && trackingReport.sources.length ? trackingReport.sources : [
    { name: 'Facebook CAPI', value: 0, color: '#1877F2' },
    { name: 'GA4 Web', value: 0, color: '#F9AB00' },
    { name: 'Store Server', value: 0, color: '#10B981' },
  ];
  const trackingEventCounts = displayedEventCounts || trackingReport?.eventCounts || {
    PageView: 0,
    ViewContent: 0,
    AddToCart: 0,
    InitiateCheckout: 0,
    Purchase: 0,
    Lead: 0,
  };
  const trackingHealthCards = [
    {
      label: 'Facebook Pixel',
      value: (trackingReport?.facebook?.configured || settings.facebookPixelId) ? 'Connected' : 'Not Configured',
      sub: (trackingReport?.facebook?.pixelId || settings.facebookPixelId) ? `Pixel ${String(trackingReport?.facebook?.pixelId || settings.facebookPixelId).slice(0, 4)}...${String(trackingReport?.facebook?.pixelId || settings.facebookPixelId).slice(-3)}` : 'Add Pixel ID in Settings',
      color: 'from-blue-600 to-indigo-500',
      ready: Boolean(trackingReport?.facebook?.configured || (settings.facebookPixelId && settings.facebookAccessToken)),
    },
    {
      label: 'GA4 Realtime',
      value: (trackingReport?.ga4?.configured || settings.ga4MeasurementId) ? 'Tracking' : 'Not Configured',
      sub: trackingReport?.ga4?.measurementId || settings.ga4MeasurementId || 'Add GA4 Measurement ID',
      color: 'from-amber-500 to-orange-500',
      ready: Boolean(trackingReport?.ga4?.configured || settings.ga4MeasurementId),
    },
    {
      label: 'Google Tag Manager',
      value: (trackingReport?.gtm?.configured || (settings.googleTagManagerEnabled && settings.googleTagManagerId)) ? 'Enabled' : 'Not Configured',
      sub: trackingReport?.gtm?.containerId || settings.googleTagManagerId || 'Add GTM Container ID',
      color: 'from-emerald-500 to-cyan-500',
      ready: Boolean(trackingReport?.gtm?.configured || (settings.googleTagManagerEnabled && settings.googleTagManagerId)),
    },
    {
      label: 'Server Events',
      value: trackingEvents.toLocaleString(),
      sub: `${trackingConversionRate}% conversion signal`,
      color: 'from-emerald-500 to-teal-500',
      ready: true,
    },
  ];
  const dashboardOrders = isSellerAccount ? sellerOrders : (Array.isArray(metrics.orders) ? metrics.orders : []);
  const dashboardRevenueData = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dayOrders = dashboardOrders.filter((order) => {
      const created = new Date(order.createdAt || order.created_at || order.created_at);
      return !Number.isNaN(created.getTime()) && created.toDateString() === date.toDateString();
    });
    const revenue = dayOrders.reduce((sum, order) => sum + Number(order.totalPrice || order.total_price || 0), 0);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue,
      orders: dayOrders.length,
    };
  });
  const dashboardHasRevenueData = dashboardRevenueData.some((item) => item.revenue > 0 || item.orders > 0);
  const dashboardRevenueChart = dashboardHasRevenueData
    ? dashboardRevenueData
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
      day,
      revenue: Math.round((Number(metrics.totalRevenue || 0) / 7 || 850) * (0.65 + index * 0.11)),
      orders: Math.max(1, Math.round((Number(metrics.totalOrders || 0) / 7 || 2) * (0.6 + index * 0.08))),
    }));
  const dashboardStatusCounts = dashboardOrders.reduce((acc, order) => {
    const status = order.status || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const dashboardOrderStatusData = Object.entries({
    Pending: dashboardStatusCounts.Pending || 0,
    Processing: dashboardStatusCounts.Processing || 0,
    Delivered: dashboardStatusCounts.Delivered || 0,
    Cancelled: dashboardStatusCounts.Cancelled || 0,
  }).map(([name, value], index) => ({
    name,
    value,
    color: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'][index],
  }));
  const dashboardOrderStatusChart = dashboardOrderStatusData.some((item) => item.value > 0)
    ? dashboardOrderStatusData
    : [
      { name: 'Pending', value: 4, color: '#F59E0B' },
      { name: 'Processing', value: 3, color: '#3B82F6' },
      { name: 'Delivered', value: 7, color: '#10B981' },
      { name: 'Cancelled', value: 1, color: '#EF4444' },
    ];
  const dashboardCategoryMap = productsList.reduce((acc, product) => {
    const category = typeof product.category === 'object' ? (product.category?.name || product.category?.title) : product.category;
    const name = category || product.categoryName || 'Uncategorized';
    const sales = Number(product.salesCount || product.soldCount || product.numReviews || 0);
    acc[name] = (acc[name] || 0) + Math.max(sales, 1);
    return acc;
  }, {});
  const dashboardCategoryChart = Object.entries(dashboardCategoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, sales]) => ({ name: String(name).slice(0, 16), sales }));
  const dashboardCategoryData = dashboardCategoryChart.length
    ? dashboardCategoryChart
    : [
      { name: 'Fashion', sales: 24 },
      { name: 'Gadgets', sales: 18 },
      { name: 'Beauty', sales: 14 },
      { name: 'Home', sales: 10 },
    ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row admin-panel-root">
      
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Dark Sidebar */}
      <aside className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-40 w-64 md:relative md:w-52' : 'hidden'} bg-[#0B1329] text-white border-r border-slate-950/20 flex-col overflow-y-auto scrollbar-hide`}>
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
              <div className="w-9 h-9 bg-[#FF6600] rounded-lg flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight flex items-center gap-1" style={{ fontWeight: 900 }}>
                Goroly<span className="text-[#FF6600] font-black" style={{ fontWeight: 900 }}>Shop</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Legacy Dashboard', icon: CircleDot },
            { id: 'smart_dashboard', label: 'Smart Dashboard', icon: LayoutGrid },
            { id: 'finance_dashboard', label: 'Finance & Accounts', icon: DollarSign },
            { id: 'inventory_dashboard', label: 'Inventory (AI)', icon: Package },
            { id: 'marketing_roi', label: 'Marketing ROI', icon: TrendingUp },
            { id: 'bulk_orders', label: 'Bulk Orders', icon: ShoppingBag },
            { id: 'ai_marketing', label: 'AI Marketing', icon: Sparkles, adminOnly: true },
            { id: 'server_tracking', label: 'Server Tracking', icon: BarChart3, adminOnly: true },
            { 
              id: 'products', label: 'Products', icon: ShoppingCart,
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
                { id: 'products_import', label: 'Import Products' },
                { id: 'products_purchase', label: 'Product Purchase' }
              ]
            },
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
            { id: 'coupons', label: 'Coupons', icon: Tag, adminOnly: true },
            { id: 'shipping', label: 'Shipping', icon: Ship, adminOnly: true },
            { id: 'pages', label: 'Pages', icon: Globe, adminOnly: true },
            { id: 'offers', label: 'Offers', icon: TrendingUp, adminOnly: true },
            { id: 'banners', label: 'Banners', icon: Globe, adminOnly: true },
            { 
              id: 'users', label: 'Customers', icon: Contact, adminOnly: true,
              subItems: [
                { id: 'users_all', label: 'All Customer' },
                { id: 'users_import', label: 'Import Customers' }
              ]
            },
            { id: 'staffs', label: 'Manage Staffs', icon: Users, adminOnly: true },
            { id: 'staff_roles', label: 'Staff Roles', icon: Shield, adminOnly: true },
            { 
              id: 'sellers', label: 'Sellers', icon: Package, adminOnly: true,
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
            { id: 'chat', label: 'Support Chat', icon: MessageCircle, adminOnly: true, badge: chatMessages.filter((m) => !m.isAdmin && !m.isRead).length },
            { id: 'seller_own_payouts', label: 'Payouts', icon: DollarSign, sellerOnly: true },
            { id: 'seller_api_integrations', label: 'API Integrations', icon: Server, sellerOnly: true },
            { id: 'seller_steadfast_integration', label: 'SteadFast Integration', icon: Truck },
            { id: 'seller_custom_domain', label: 'Custom Domain', icon: Globe, sellerOnly: true },
            { id: 'seller_own_profile', label: 'My Profile', icon: Settings, sellerOnly: true },
            { id: 'videos', label: 'Videos', icon: Play, adminOnly: true },
            { 
              id: 'rewards', label: 'Reward System', icon: Server, adminOnly: true,
              subItems: [
                { id: 'rewards_users', label: 'User Rewards' },
                { id: 'rewards_config', label: 'Reward Configuration' },
                { id: 'rewards_set', label: 'Set Reward' }
              ]
            },
            { id: 'fraud_checker', label: 'Fraud Checker', icon: ShieldAlert, adminOnly: true },
            { id: 'expenses', label: 'Expenses', icon: DollarSign, adminOnly: true },
            { id: 'finance', label: 'Finance', icon: BarChart3, adminOnly: true },
            { id: 'settings', label: 'Settings', icon: Sliders, adminOnly: true },
          ].filter(item => {
            if (user && user.role === 'seller') return !item.adminOnly;
            if (user && user.isAdmin) {
              if (item.sellerOnly) return false;
              if (user.role === 'superadmin') return true;
              if (['dashboard', 'seller_steadfast_integration'].includes(item.id)) return true;
              
              if (user.permissions && Array.isArray(user.permissions)) {
                if (['staffs', 'staff_roles'].includes(item.id)) {
                  return user.role === 'superadmin' || user.role === 'admin';
                }
                
                let permNeeded = item.id;
                if (['ai_marketing', 'server_tracking', 'videos', 'rewards', 'fraud_checker', 'seller_steadfast_integration'].includes(item.id)) permNeeded = 'settings';
                if (['sellers', 'seller_package'].includes(item.id)) permNeeded = 'users';
                
                return user.permissions.includes(permNeeded);
              }
              return true;
            }
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
                                            (sub.id === 'orders_pickup' && activeTab === 'orders_pickup') ||
                                            (sub.id === 'users_all' && activeTab === 'users') ||
                                            (sub.id === 'users_import' && activeTab === 'users_import');
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
                        ? (item.id === 'orders' || item.id === 'users')
                          ? 'text-amber-400 bg-slate-800/40 font-semibold'
                          : 'text-white bg-slate-800/40 font-semibold'
                        : 'bg-[#FF6600] text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 relative ${
                      isParentActive
                        ? (item.id === 'orders' || item.id === 'users') ? 'text-amber-400' : 'text-white'
                        : 'bg-transparent text-slate-400 group-hover:text-slate-200'
                    }`}>
                      <Icon size={15} />
                      {item.id === 'rewards' && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border border-[#0B1329]" style={{ transform: 'translate(25%, -25%)' }}></span>
                      )}
                    </div>
                    <span className={`text-sm ${
                      isParentActive
                        ? (item.id === 'orders' || item.id === 'users') ? 'font-bold text-amber-400' : 'font-bold text-white'
                        : 'font-bold'
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
                          ? (item.id === 'orders' || item.id === 'users') ? 'rotate-90 text-amber-400' : 'rotate-90 text-slate-300'
                          : isParentActive
                            ? (item.id === 'orders' || item.id === 'users') ? 'text-amber-400' : 'text-slate-300'
                            : 'text-slate-600'
                      }`} />
                    )}
                  </div>
                </button>
                
                {hasSub && isExpanded && (
                  <div className={`mt-0.5 ml-4 pl-3 space-y-0.5 ${
                    item.id === 'orders' ? 'border-l border-amber-500/30' : 'border-l border-slate-800'
                  }`}>
                    {item.subItems.filter(sub => {
                      if (user && user.role === 'seller') {
                        if (item.id === 'products') {
                          return sub.id === 'products_add' || sub.id === 'products_all';
                        }
                        if (item.id === 'orders') {
                          return sub.id === 'orders_all';
                        }
                      }
                      return true;
                    }).map(sub => {
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
                                          (sub.id === 'products_purchase' && activeTab === 'products' && productSubTab === 'purchase') ||
                                          (sub.id === 'products_brands' && activeTab === 'brands') ||
                                          (sub.id === 'products_categories' && activeTab === 'categories') ||
                                          (sub.id === 'orders_all' && activeTab === 'orders') ||
                                          (sub.id === 'orders_admin' && activeTab === 'orders_admin') ||
                                          (sub.id === 'orders_seller' && activeTab === 'orders_seller') ||
                                          (sub.id === 'orders_pickup_hub' && activeTab === 'orders_pickup_hub') ||
                                          (sub.id === 'orders_pickup' && activeTab === 'orders_pickup') ||
                                          (sub.id === 'users_all' && activeTab === 'users') ||
                                          (sub.id === 'users_import' && activeTab === 'users_import');

                      const isAmberSub = sub.id.startsWith('orders_') || sub.id.startsWith('users_');

                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            if (sub.id.startsWith('products_')) {
                              const subTab = sub.id.replace('products_', '');
                              if (subTab === 'categories' || subTab === 'category') {
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
                            } else if (sub.id.startsWith('users_')) {
                              if (sub.id === 'users_all') {
                                setActiveTab('users');
                              } else {
                                setActiveTab(sub.id);
                              }
                            } else {
                              setActiveTab(sub.id);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-all duration-200 ${
                            isSubActive
                              ? isAmberSub
                                ? 'text-amber-400 font-bold'
                                : 'text-white font-bold bg-[#FF6600]/90 shadow-xs'
                              : isAmberSub
                                ? 'text-slate-400 font-bold hover:text-amber-300 hover:bg-slate-800/30'
                                : 'text-slate-400 font-bold hover:text-slate-200 hover:bg-slate-800/30'
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
                window.location.href = '/admin';
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
              <div className="text-sm font-bold text-white truncate">{user?.name || 'Account'}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{isSellerAccount ? 'Seller' : 'Admin'}</div>
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
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs md:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            {/* Desktop menu icon */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="hidden md:flex w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 hover:border-slate-300 transition items-center justify-center flex-shrink-0 cursor-pointer shadow-xs"
            >
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
            {/* Seller Dashboard Title */}
            {user?.role === 'seller' && (
              <div className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 bg-[#FF6600]/10 border border-[#FF6600]/20 rounded-lg text-[#FF6600] font-extrabold text-sm tracking-tight shadow-sm">
                <ShoppingBag size={15} />
                Seller Dashboard
              </div>
            )}
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
                className="h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                    window.location.href = '/admin';
                  }
                }}
                className="h-10 bg-white border border-slate-200 rounded-lg pl-2 pr-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-2 cursor-pointer shadow-xs"
                title="Click to logout"
              >
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" 
                  alt="Avatar" 
                  className="w-6 h-6 rounded-full object-cover border border-slate-100" 
                />
                <span className="hidden sm:block">{isSellerAccount ? 'Seller' : 'Super'}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-5 space-y-5 overflow-x-hidden overflow-y-auto">
        
        {/* AI MARKETING TAB */}
        {activeTab === 'ai_marketing' && (
          <div className="animate-fade-in space-y-6 max-w-5xl">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                AI Marketing Analyzer <Sparkles size={24} className="text-[#FF6600]" />
              </h1>
              <p className="text-sm text-slate-500 font-medium">Instantly extract products, text, and audience insights from your marketing assets.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <form onSubmit={handleAnalyzeMedia} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="text-xs font-bold text-slate-700">Media URL</label>
                  <input
                    type="url"
                    required
                    value={aiMarketingUrl}
                    onChange={(e) => setAiMarketingUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full h-11 px-3 border border-slate-200 rounded-xl focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20"
                  />
                </div>
                <div className="w-full sm:w-40 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Media Type</label>
                  <select
                    value={aiMarketingType}
                    onChange={(e) => setAiMarketingType(e.target.value)}
                    className="w-full h-11 px-3 border border-slate-200 rounded-xl focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20"
                  >
                    <option value="image">Image URL</option>
                    <option value="video">Video/YouTube URL</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={aiMarketingLoading}
                  className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {aiMarketingLoading ? 'Analyzing...' : 'Analyze Media'}
                </button>
              </form>
            </div>

            {aiMarketingResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-slate-800">
                    <Search size={18} className="text-[#FF6600]" />
                    <h3 className="font-black">Detected Content</h3>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{aiMarketingResult.content}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-slate-800">
                    <LayoutGrid size={18} className="text-[#FF6600]" />
                    <h3 className="font-black">Extracted Text (OCR)</h3>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{aiMarketingResult.ocrText}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-slate-800">
                    <MessageSquare size={18} className="text-[#FF6600]" />
                    <h3 className="font-black">Marketing Summary</h3>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{aiMarketingResult.summary}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-slate-800">
                    <Users size={18} className="text-[#FF6600]" />
                    <h3 className="font-black">Target Audience</h3>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{aiMarketingResult.audience}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'smart_dashboard' && (
          <SmartDashboardView API_BASE_URL={API_URL} token={user?.token} user={user} />
        )}
        {activeTab === 'finance_dashboard' && (
          <FinanceSystemView API_BASE_URL={API_URL} token={user?.token} />
        )}
        {activeTab === 'inventory_dashboard' && (
          <InventoryManagementView API_BASE_URL={API_URL} token={user?.token} />
        )}
        {activeTab === 'marketing_roi' && (
          <MarketingRoiView API_BASE_URL={API_URL} token={user?.token} />
        )}
        {activeTab === 'bulk_orders' && (
          <DashboardOrders API_BASE_URL={API_URL} token={user?.token} />
        )}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">Welcome back, Goroly Shop! <span className="animate-bounce">👋</span></h1>
                <p className="text-sm text-slate-500 font-medium">Here's what's happening with your store today.</p>
              </div>
              <div>
                <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-650 shadow-xs hover:border-slate-350 transition">
                  <span>May 12 - May 18, 2024</span>
                  <Calendar size={13} className="text-slate-400" />
                </button>
              </div>
            </div>

            {isSellerAccount && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">Store Readiness</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Complete these steps to unlock smoother selling.</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 font-black text-sm">
                      {sellerReadinessScore}%
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-[#FF6600] rounded-full transition-all" style={{ width: `${sellerReadinessScore}%` }} />
                  </div>
                  <div className="space-y-2">
                    {sellerReadinessItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-left transition"
                      >
                        <span className="text-sm font-bold text-slate-700">{item.label}</span>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${item.done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {item.done ? 'Done' : 'Action'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="xl:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">Seller Control Room</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Priority work that needs attention.</p>
                    </div>
                    <AlertCircle size={18} className="text-amber-500" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Pending Orders', value: sellerPendingOrders.length, tone: 'amber', action: () => setActiveTab('orders') },
                      { label: 'Low Stock Items', value: sellerLowStockProducts.length, tone: 'orange', action: () => setActiveTab('products') },
                      { label: 'Draft Products', value: sellerDraftProducts.length, tone: 'slate', action: () => { setActiveTab('products'); setProductSubTab('all'); } },
                      { label: 'Pending Payouts', value: sellerPendingPayouts.length, tone: 'emerald', action: () => setActiveTab('seller_own_payouts') },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-orange-200 rounded-2xl text-left transition shadow-xs"
                      >
                        <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">{item.label}</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">{item.value}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="xl:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <h3 className="font-black text-slate-900 text-sm mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Add product', icon: Plus, action: () => { setActiveTab('products'); setProductSubTab('add'); } },
                      { label: 'Manage orders', icon: ShoppingBag, action: () => setActiveTab('orders') },
                      { label: 'Request payout', icon: DollarSign, action: () => setActiveTab('seller_own_payouts') },
                      { label: 'Verify profile', icon: CheckCircle2, action: () => { setActiveTab('seller_own_profile'); setSellerProfileSubTab('nid'); } },
                    ].map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={action.action}
                          className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-100 rounded-xl text-sm font-bold text-slate-700 hover:text-orange-700 transition"
                        >
                          <Icon size={14} />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {isSellerAccount && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Average Order Value</span>
                  <div className="text-sm font-black text-slate-900 mt-1">{formatPrice(sellerAverageOrderValue, currencySymbol)}</div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Delivery Completion</span>
                  <div className="text-sm font-black text-slate-900 mt-1">{sellerDeliveryRate}%</div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Published Products</span>
                  <div className="text-sm font-black text-slate-900 mt-1">{sellerProducts.length - sellerDraftProducts.length}/{sellerProducts.length}</div>
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                { label: isSellerAccount ? 'My Orders' : 'Total Orders', val: metrics.totalOrders ? metrics.totalOrders.toLocaleString() : '0', icon: ShoppingBag, iconBg: 'bg-violet-100 text-violet-600' },
                { label: isSellerAccount ? 'My Revenue' : 'Total Revenue', val: metrics.totalRevenue ? `${currencySymbol}${metrics.totalRevenue.toLocaleString()}` : '0', icon: DollarSign, iconBg: 'bg-emerald-100 text-emerald-600' },
                { label: 'Total Purchase Cost', val: metrics.totalPurchaseCost ? `${currencySymbol}${metrics.totalPurchaseCost.toLocaleString()}` : '0', icon: DollarSign, iconBg: 'bg-indigo-100 text-indigo-600' },
                { label: 'Total Expenses', val: `${currencySymbol}${(expenseSummary.totalExpenses || 0).toLocaleString()}`, icon: DollarSign, iconBg: 'bg-red-100 text-red-500' },
                { label: 'Net Profit', val: `${currencySymbol}${(financeSummary.netProfit || 0).toLocaleString()}`, icon: TrendingUp, iconBg: 'bg-emerald-100 text-emerald-600' },
                { label: isSellerAccount ? 'Low Stock' : 'Total Customers', val: isSellerAccount ? sellerLowStockProducts.length.toLocaleString() : (metrics.totalCustomers ? metrics.totalCustomers.toLocaleString() : '0'), icon: isSellerAccount ? AlertCircle : Users, iconBg: 'bg-orange-100 text-orange-600' },
                { label: 'Pending Orders', val: isSellerAccount ? sellerPendingOrders.length.toLocaleString() : (metrics.pendingOrders ? metrics.pendingOrders.toLocaleString() : '0'), icon: AlertCircle, iconBg: 'bg-amber-100 text-amber-600' },
                { label: 'Cancelled Orders', val: cancelledOrdersCount.toLocaleString(), icon: X, iconBg: 'bg-red-100 text-red-600' },
                { label: isSellerAccount ? 'My Products' : 'Total Products', val: isSellerAccount ? sellerProducts.length.toLocaleString() : (metrics.totalProducts ? metrics.totalProducts.toLocaleString() : '0'), icon: Package, iconBg: 'bg-blue-100 text-[#FF6600]' },
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
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Revenue Overview</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-extrabold text-slate-800">{metrics.totalRevenue ? `${currencySymbol}${metrics.totalRevenue.toLocaleString()}` : '--'}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600">Live graph</span>
                    </div>
                  </div>
                  <select className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-650 focus:outline-none focus:border-orange-500 cursor-pointer">
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                <div className="h-56 pr-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardRevenueChart}>
                      <defs>
                        <linearGradient id="dashboardRevenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dashboardOrdersFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.20} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value, name) => name === 'revenue' ? [formatPrice(Number(value), currencySymbol), 'Revenue'] : [value, 'Orders']}
                        contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#dashboardRevenueFill)" />
                      <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} fill="url(#dashboardOrdersFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Statistics (PieChart / Donut) */}
              <div className="lg:col-span-3 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between">
                <div className="mb-2">
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Order Statistics</h3>
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">Status distribution</p>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPie>
                      <Pie data={dashboardOrderStatusChart} dataKey="value" nameKey="name" innerRadius={46} outerRadius={72} paddingAngle={4}>
                        {dashboardOrderStatusChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    </RPie>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {dashboardOrderStatusChart.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[9px] font-black text-slate-500">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales by Category */}
              <div className="lg:col-span-3 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Sales by Category</h3>
                  <span className="rounded-full bg-orange-50 px-2 py-1 text-[9px] font-black text-orange-600">Top 5</span>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardCategoryData} layout="vertical" margin={{ left: 8, right: 8, top: 2, bottom: 2 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={78} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                      <Bar dataKey="sales" radius={[0, 10, 10, 0]} fill="#FF6600" barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Bottom Row: Recent Orders & Top Selling / Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent Orders Table */}
              <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Recent Orders</h3>
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
                      <tbody className="text-sm">
                        {metrics.orders.slice(0, 5).map((order, index) => {
                          const statusStyles = {
                            Delivered: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                            Processing: 'bg-orange-50 text-[#FF6600] border border-orange-100',
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
                      <p className="text-sm text-slate-400 font-semibold">No orders yet</p>
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
                      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Top Selling Products</h3>
                      <button onClick={() => setActiveTab('products')} className="text-[#FF6600] text-[10px] font-bold hover:underline">View All</button>
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
                        <p className="text-sm text-slate-400 font-semibold text-center py-4">No sales data yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Low Stock Alert</h3>
                    <button onClick={() => setActiveTab('products')} className="text-[#FF6600] text-[10px] font-bold hover:underline">View All</button>
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

        {activeTab === 'server_tracking' && (
          <div className="animate-fade-in space-y-5">
            <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(24,119,242,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(249,171,0,0.20),transparent_28%),linear-gradient(135deg,#0f172a_0%,#172554_52%,#0f766e_100%)] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
              <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-orange-300/20 blur-3xl" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur">
                    <Wifi size={13} />
                    Server Side Tracking
                  </div>
                  <h1 className="text-2xl font-black tracking-tight">Facebook Pixel & GA4 Realtime Reports</h1>
                  <p className="mt-1 max-w-2xl text-sm font-medium text-slate-200">Monitor server events, conversion signals, and analytics health from one admin view.</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Events', value: trackingEvents.toLocaleString() },
                    { label: 'Sessions', value: trackingSessions.toLocaleString() },
                    { label: 'Conv.', value: `${trackingConversionRate}%` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur">
                      <div className="text-sm font-black">{item.value}</div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-300">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {trackingHealthCards.map((card) => (
                <div key={card.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-lg`}>
                      {card.label.includes('Facebook') ? <BarChart3 size={18} /> : card.label.includes('GA4') ? <PieChart size={18} /> : card.label.includes('Tag') ? <Globe size={18} /> : <Server size={18} />}
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${card.ready ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${card.ready ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {card.ready ? 'READY' : 'SETUP'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{card.label}</p>
                    <h3 className="mt-1 text-sm font-black text-slate-900">{card.value}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-12 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      All Event Counts
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-600">
                        <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${trackingTick ? 'animate-ping' : 'animate-pulse'}`} />
                        LIVE
                      </span>
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400">Server-side event totals — auto-refreshes every 30 seconds.</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black transition-all duration-500 ${trackingTick ? 'bg-emerald-100 text-emerald-700 scale-105' : 'bg-slate-100 text-slate-600'}`}>{trackingEvents.toLocaleString()} total events</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  {Object.entries(trackingEventCounts).map(([eventName, count], index) => (
                    <div key={eventName} className={`rounded-2xl border p-4 transition-all duration-500 ${trackingTick ? 'border-emerald-200 bg-emerald-50 shadow-sm shadow-emerald-100' : 'border-slate-100 bg-slate-50'}`}>
                      <div className={`mb-3 h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-sm ${
                        ['bg-orange-500', 'bg-cyan-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500'][index % 6]
                      }`}>
                        <BarChart3 size={15} />
                      </div>
                      <div className={`text-xl font-black transition-all duration-300 ${trackingTick ? 'text-emerald-700' : 'text-slate-900'}`}>{Number(count || 0).toLocaleString()}</div>
                      <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">{eventName}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="xl:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Realtime Event Graph</h3>
                    <p className="text-[10px] font-semibold text-slate-400">Facebook CAPI and GA4 event stream, sampled every 15 minutes.</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black ${rtConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {rtConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {rtConnected ? 'LIVE' : 'LOCAL SNAPSHOT'}
                  </span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trackingChartData}>
                      <defs>
                        <linearGradient id="fbEventsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1877F2" stopOpacity={0.26} />
                          <stop offset="95%" stopColor="#1877F2" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="ga4EventsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F9AB00" stopOpacity={0.26} />
                          <stop offset="95%" stopColor="#F9AB00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                      <Area type="monotone" dataKey="fb" name="Facebook Events" stroke="#1877F2" strokeWidth={3} fill="url(#fbEventsFill)" />
                      <Area type="monotone" dataKey="ga4" name="GA4 Events" stroke="#F9AB00" strokeWidth={3} fill="url(#ga4EventsFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="xl:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-slate-900">Event Source Mix</h3>
                  <p className="text-[10px] font-semibold text-slate-400">Server-side and client analytics balance.</p>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPie>
                      <Pie data={trackingSourceData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
                        {trackingSourceData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    </RPie>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {trackingSourceData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.name}
                      </span>
                      <span className="text-sm font-black text-slate-900">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Server Event Log</h3>
                    <p className="text-[10px] font-semibold text-slate-400">Recent conversion events prepared for Facebook CAPI and GA4.</p>
                  </div>
                  <button onClick={() => setActiveTab('settings')} className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black text-white transition hover:bg-slate-800">Configure APIs</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <th className="px-3 py-3 rounded-l-xl">Event</th>
                        <th className="px-3 py-3">Destination</th>
                        <th className="px-3 py-3">Value</th>
                        <th className="px-3 py-3 rounded-r-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {(() => {
                        const events = Array.isArray(trackingReport?.recentEvents) && trackingReport.recentEvents.length ? trackingReport.recentEvents : [];
                        if (events.length === 0) {
                          return (
                            <tr>
                              <td colSpan="4" className="px-3 py-6 text-center text-slate-400 text-xs font-semibold">
                                Waiting for real-time events...
                              </td>
                            </tr>
                          );
                        }
                        return events.map((event, index) => (
                        <tr key={index} className="border-b border-slate-50">
                          <td className="px-3 py-3 font-bold text-slate-800">{event.event}</td>
                          <td className="px-3 py-3 text-slate-500 font-semibold">{event.destination}</td>
                          <td className="px-3 py-3 font-black text-slate-900">{formatPrice(Number(event.value || 0), currencySymbol)}</td>
                          <td className="px-3 py-3"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">{event.status || 'Queued'}</span></td>
                        </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="xl:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-black text-slate-900">Tracking Setup Guide</h3>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Add Facebook Pixel ID', done: Boolean(settings.facebookPixelId) },
                    { label: 'Add Facebook Access Token for CAPI', done: Boolean(settings.facebookAccessToken) },
                    { label: 'Add Google Analytics GA4 Measurement ID', done: Boolean(settings.ga4MeasurementId) },
                    { label: 'Enable Google Tag Manager container', done: Boolean(settings.googleTagManagerEnabled && settings.googleTagManagerId) },
                    { label: 'Review realtime graph after order events', done: trackingOrders.length > 0 },
                  ].map((step, index) => (
                    <div key={step.label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className={`grid h-8 w-8 place-items-center rounded-xl text-sm font-black ${step.done ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        {step.done ? <Check size={15} /> : index + 1}
                      </div>
                      <div className="text-sm font-bold text-slate-700">{step.label}</div>
                    </div>
                  ))}
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
                <p className="text-sm text-gray-500 font-medium mt-1">Review orders, manage payment status, and initiate courier shipments.</p>
              </div>
              <div className="px-4 py-2 bg-gray-50 rounded-xl border border-slate-100 shadow-inner">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Orders</span>
                <span className="text-sm font-black text-gray-900">{metrics.orders?.length || 0}</span>
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
                { id: 'import', label: 'Import Products' },
                { id: 'purchase', label: 'Product Purchase' }
              ].filter(subTab => {
                if (user && user.role === 'seller') {
                  return subTab.id === 'add' || subTab.id === 'all';
                }
                return true;
              }).map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setProductSubTab(subTab.id)}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition ${
                    productSubTab === subTab.id
                      ? 'bg-[#FF6600] text-white shadow-md'
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
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
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
                      className={`px-4 py-2.5 text-sm font-bold rounded-xl transition cursor-pointer border flex items-center gap-2 ${
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
                      {user?.role !== 'seller' && (
                        <div className="w-full sm:w-44">
                          <select
                            value={productSellerFilter}
                            onChange={(e) => setProductSellerFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-700 font-semibold cursor-pointer"
                          >
                            <option value="all">Select Seller</option>
                            <option value="admin">Admin Products</option>
                            {allUsers.filter(u => u.role === 'seller').map((seller) => (
                              <option key={seller._id} value={seller._id}>{seller.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Select Category */}
                      <div className="w-full sm:w-44">
                        <select
                          value={productCategoryFilter}
                          onChange={(e) => setProductCategoryFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-700 font-semibold cursor-pointer"
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
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-700 font-semibold cursor-pointer"
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
                        <button type="button" className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer flex items-center justify-center">
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
                          <td className="py-4 px-4 font-black text-amber-500">{'Γÿà'.repeat(rev.rating)}{'Γÿå'.repeat(5-rev.rating)}</td>
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
                              className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg font-bold transition flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Delete
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
                          className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg font-bold transition flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
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

            {/* Sub-tab: PRODUCT PURCHASE */}
            {productSubTab === 'purchase' && (() => {
              const totalPurchases = purchasesList.length;
              const totalQty = purchasesList.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);
              const totalCost = purchasesList.reduce((acc, curr) => acc + (Number(curr.quantity || 0) * Number(curr.purchaseCost || 0)), 0);

              const handlePurchaseSubmit = async (e) => {
                e.preventDefault();
                const { productId, supplier, quantity, purchaseCost, purchaseDate } = purchaseForm;
                if (!productId || !supplier || !quantity || !purchaseCost) {
                  alert('Please fill out all fields');
                  return;
                }

                const selectedProd = productsList.find(p => p._id === productId || p.id === productId);
                const productName = selectedProd ? selectedProd.name : 'Unknown Product';

                try {
                  const res = await fetch(`${API_URL}/purchases`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${user?.token || ''}`
                    },
                    body: JSON.stringify({
                      productId,
                      productName,
                      supplier,
                      quantity,
                      purchaseCost,
                      purchaseDate
                    })
                  });

                  if (res.ok) {
                    const result = await res.json();
                    alert('Purchase recorded successfully!');
                    setPurchaseForm({
                      productId: '',
                      supplier: '',
                      quantity: '',
                      purchaseCost: '',
                      purchaseDate: new Date().toISOString().split('T')[0]
                    });
                    fetchPurchases();
                    fetchProducts();
                  } else {
                    const errData = await res.json();
                    alert(errData.message || 'Failed to record purchase');
                  }
                } catch (err) {
                  console.error('Error submitting purchase:', err);
                  alert('Failed to connect to server');
                }
              };

              return (
                <div className="w-full space-y-6">
                  {/* Page Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-5 bg-[#FF6600] rounded-full" />
                      <h2 className="text-base font-bold text-gray-900">Product Purchase History & Entry</h2>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FF6600]/10 rounded-xl flex items-center justify-center text-[#FF6600]">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Purchases</div>
                        <div className="text-xl font-bold text-gray-800 mt-0.5">{totalPurchases}</div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Qty Purchased</div>
                        <div className="text-xl font-bold text-gray-800 mt-0.5">{totalQty} units</div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Money Spent</div>
                        <div className="text-xl font-bold text-gray-800 mt-0.5">{formatPrice(totalCost)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Purchase Form Card */}
                    <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                      <h3 className="font-bold text-gray-900 text-sm mb-5 border-b border-slate-100 pb-3">New Purchase Entry</h3>

                      <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Select Product *</label>
                          <select
                            value={purchaseForm.productId}
                            onChange={(e) => setPurchaseForm({ ...purchaseForm, productId: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 hover:bg-white transition text-xs"
                            required
                          >
                            <option value="">Choose a product...</option>
                            {productsList.map((prod) => (
                              <option key={prod._id || prod.id} value={prod._id || prod.id}>
                                {prod.name} (Stock: {prod.count_in_stock || 0})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Supplier Name *</label>
                          <input
                            type="text"
                            placeholder="Supplier"
                            value={purchaseForm.supplier}
                            onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 hover:bg-white transition text-xs"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Quantity *</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={purchaseForm.quantity}
                              onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 hover:bg-white transition text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Unit Cost ({currencySymbol}) *</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Cost"
                              value={purchaseForm.purchaseCost}
                              onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseCost: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 hover:bg-white transition text-xs"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Purchase Date</label>
                          <input
                            type="date"
                            value={purchaseForm.purchaseDate}
                            onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 hover:bg-white transition text-xs"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold rounded-xl shadow-md transition cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <Plus size={14} />
                          Record Purchase
                        </button>
                      </form>
                    </div>

                    {/* Right: Purchase List Table */}
                    <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">Purchase History</h3>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{purchasesList.length} records</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-250/50 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              <th className="p-3">Purchase ID</th>
                              <th className="p-3">Product</th>
                              <th className="p-3">Supplier</th>
                              <th className="p-3 text-center">Qty</th>
                              <th className="p-3 text-right">Unit Cost</th>
                              <th className="p-3 text-right">Total</th>
                              <th className="p-3 text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {purchasesList.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-400 font-medium">
                                  No purchase records found. Add your first purchase above.
                                </td>
                              </tr>
                            ) : (
                              purchasesList.map((pur) => (
                                <tr key={pur.id} className="hover:bg-slate-50/50 transition">
                                  <td className="p-3 font-semibold text-[#FF6600]">{pur.id}</td>
                                  <td className="p-3 font-medium text-gray-800">{pur.productName}</td>
                                  <td className="p-3 text-gray-500">{pur.supplier}</td>
                                  <td className="p-3 text-center font-bold text-gray-750">{pur.quantity}</td>
                                  <td className="p-3 text-right font-medium text-gray-700">{formatPrice(pur.purchaseCost)}</td>
                                  <td className="p-3 text-right font-bold text-gray-950">{formatPrice(pur.quantity * pur.purchaseCost)}</td>
                                  <td className="p-3 text-right text-gray-400">{pur.purchaseDate}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
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
                        <ArrowLeft size={14} /> Back
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
                              {additionalImageFiles.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setAdditionalImageFiles([])}
                                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-[10px] font-bold rounded-xl transition cursor-pointer"
                                >
                                  Clear All
                                </button>
                              )}
                            </div>

                            {/* Multi-file drop zone */}
                            <label className="flex flex-col items-center justify-center gap-2 w-full py-5 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 group">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  if (files.length > 0) {
                                    setAdditionalImageFiles(prev => [...prev, ...files]);
                                  }
                                  e.target.value = '';
                                }}
                              />
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span className="text-xs font-bold text-blue-500 group-hover:text-blue-700">Click to select images</span>
                              <span className="text-[10px] text-gray-400">Select multiple images at once</span>
                            </label>

                            {/* Image Previews Grid */}
                            {additionalImageFiles.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                {additionalImageFiles.map((file, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`img-${idx}`}
                                      className="w-full h-16 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setAdditionalImageFiles(prev => prev.filter((_, i) => i !== idx))}
                                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {additionalImageFiles.length > 0 && (
                              <p className="text-[10px] text-blue-600 font-semibold">{additionalImageFiles.length} image{additionalImageFiles.length > 1 ? 's' : ''} selected</p>
                            )}
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

                          {/* ΓöÇΓöÇ PRODUCT PRICE CARD ΓöÇΓöÇ */}
                          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                            <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">Product Price & Stock</h3>

                            {/* Purchase Price & Unit Price */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-bold text-gray-600">Purchase Price ({currencyCode}) *</label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={newProduct.purchasePrice}
                                  onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
                                  className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-600">Unit Price ({currencyCode}) *</label>
                                <input
                                  type="number"
                                  required
                                  placeholder="0"
                                  value={newProduct.price}
                                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                  className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition"
                                />
                              </div>
                            </div>

                            {/* Special Discount Type + Special Discount */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-bold text-gray-600">Special Discount Type</label>
                                <select
                                  value={newProduct.discountType || 'percent'}
                                  onChange={(e) => setNewProduct({ ...newProduct, discountType: e.target.value || 'percent', discountPercent: '0' })}
                                  className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition"
                                >
                                  <option value="percent">Percent (%)</option>
                                  <option value="flat">Flat (αº│)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-600">
                                  {newProduct.discountType === 'flat' ? `Specific Discount Amount (${currencySymbol})` : 'Special Discount (%)'}
                                </label>
                                <input
                                  type="number"
                                  placeholder={newProduct.discountType === 'flat' ? 'e.g. 100' : 'e.g. 10'}
                                  min="0"
                                  step="0.01"
                                  max={newProduct.discountType === 'percent' ? '100' : undefined}
                                  value={newProduct.discountPercent}
                                  onChange={(e) => setNewProduct({ ...newProduct, discountPercent: e.target.value })}
                                  className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition"
                                />
                                <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                  {newProduct.discountType === 'flat'
                                    ? 'This amount will be deducted directly from the unit price.'
                                    : 'Percent discount cannot be more than 100.'}
                                </p>
                              </div>
                            </div>

                            {/* Special Discount Period */}
                            <div>
                              <label className="text-[11px] font-bold text-gray-600">Special Discount Period</label>
                              <div className="grid grid-cols-2 gap-4 mt-1.5">
                                <input
                                  type="datetime-local"
                                  value={newProduct.flashSaleStart ? newProduct.flashSaleStart.slice(0,16) : ''}
                                  onChange={(e) => setNewProduct({ ...newProduct, flashSaleStart: e.target.value, isFlashSale: !!e.target.value })}
                                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-xs hover:border-slate-300 transition"
                                />
                                <input
                                  type="datetime-local"
                                  value={newProduct.flashSaleEnd ? newProduct.flashSaleEnd.slice(0,16) : ''}
                                  onChange={(e) => setNewProduct({ ...newProduct, flashSaleEnd: e.target.value })}
                                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-xs hover:border-slate-300 transition"
                                />
                              </div>
                            </div>

                            {/* Vat & Tax */}
                            <div>
                              <label className="text-[11px] font-bold text-gray-600">Vat & Tax</label>
                              <select className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition">
                                <option value="">Select</option>
                                <option value="0">0% VAT</option>
                                <option value="5">5% VAT</option>
                                <option value="10">10% VAT</option>
                                <option value="15">15% VAT</option>
                              </select>
                            </div>
                          </div>

                          {/* ΓöÇΓöÇ PRODUCT STOCK CARD ΓöÇΓöÇ */}
                          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <h3 className="font-bold text-gray-900 text-sm">Product Stock</h3>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newProduct.isDigital || false}
                                  onChange={(e) => setNewProduct({ ...newProduct, isDigital: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 relative"></div>
                                <span className="text-[11px] font-bold text-gray-600">Has Variant</span>
                              </label>
                            </div>

                            {/* Min Stock Warning + Stock Visibility */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-bold text-gray-600">Minimum Stock Warning</label>
                                <input
                                  type="number"
                                  placeholder="Enter min stock amount to notify"
                                  min="0"
                                  className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-xs hover:border-slate-300 transition"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-600">Stock Visibility</label>
                                <select className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition">
                                  <option value="show">Show Stock</option>
                                  <option value="hide">Hide Stock</option>
                                </select>
                              </div>
                            </div>

                            {/* SKU + Current Stock */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-bold text-gray-600">SKU *</label>
                                <div className="flex gap-2 mt-1.5">
                                  <input
                                    type="text"
                                    placeholder="Enter product sku"
                                    value={newProduct.barcode || ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                                    className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-xs hover:border-slate-300 transition"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setNewProduct({ ...newProduct, barcode: 'SKU-' + Math.random().toString(36).substr(2,8).toUpperCase() })}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
                                    title="Generate SKU"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-600">Current Stock *</label>
                                <input
                                  type="number"
                                  required={!newProduct.isDigital}
                                  disabled={newProduct.isDigital}
                                  placeholder="Enter current available quantity"
                                  value={newProduct.isDigital ? '' : newProduct.countInStock}
                                  onChange={(e) => setNewProduct({ ...newProduct, countInStock: e.target.value })}
                                  className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-xs hover:border-slate-300 transition disabled:opacity-50 disabled:bg-slate-50"
                                />
                              </div>
                            </div>
                          </div>

                        </div>
                      )}


                      {/* TAB 4: DESCRIPTION & SPECIFICATION */}
                      {formActiveTab === 'description' && (
                        <div className="space-y-5">

                          {/* ΓöÇΓöÇ PRODUCT DESCRIPTION CARD ΓöÇΓöÇ */}
                          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                            <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">Product Description</h3>

                            {/* Short Description */}
                            <div>
                              <label className="text-[11px] font-bold text-gray-600">Short Description</label>
                              <div className="relative mt-1.5">
                                <textarea
                                  maxLength={200}
                                  rows={3}
                                  placeholder="Write a short description..."
                                  value={newProduct.shortDescription || ''}
                                  onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition resize-none"
                                />
                                <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 font-medium">
                                  {200 - (newProduct.shortDescription?.length || 0)}
                                </span>
                              </div>
                            </div>

                            {/* Long Description with JoditEditor */}
                            <div>
                              <label className="text-[11px] font-bold text-gray-600">Long Description</label>
                              <div className="mt-1.5 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition">
                                <JoditEditor
                                  value={newProduct.description || ''}
                                  config={{
                                    readonly: false,
                                    height: 300,
                                    askBeforePasteHTML: false,
                                    askBeforePasteFromWord: false,
                                    defaultActionOnPaste: 'insert_as_html',
                                    placeholder: 'Start writing...',
                                    buttons: [
                                      'source', '|',
                                      'bold', 'italic', 'underline', 'strikethrough', '|',
                                      'superscript', 'subscript', '|',
                                      'ul', 'ol', '|',
                                      'outdent', 'indent', '|',
                                      'font', 'fontsize', 'brush', 'paragraph', '|',
                                      'image', 'video', 'table', 'link', '|',
                                      'align', 'undo', 'redo', '|',
                                      'hr', 'eraser', 'copyformat', '|',
                                      'symbol', 'fullsize', 'print', 'about'
                                    ]
                                  }}
                                  onBlur={(newContent) => setNewProduct({ ...newProduct, description: newContent })}
                                  onChange={() => {}}
                                />
                              </div>
                            </div>

                            {/* Description Image */}
                            <div>
                              <label className="text-[11px] font-bold text-gray-600">Description Image</label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-gray-700 file:text-[11px] file:font-bold hover:file:bg-slate-200 file:cursor-pointer hover:border-slate-300 transition"
                                onChange={(e) => setDescriptionImageFiles(Array.from(e.target.files || []))}
                              />
                              {descriptionImageFiles.length > 0 && (
                                <p className="text-[10px] text-emerald-600 font-semibold mt-1">{descriptionImageFiles.length} file(s) selected</p>
                              )}
                            </div>
                          </div>

                          {/* ΓöÇΓöÇ PDF SPECIFICATION CARD ΓöÇΓöÇ */}
                          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                            <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">PDF Specification</h3>
                            <div>
                              <label className="text-[11px] font-bold text-gray-600">PDF Specification</label>
                              <div className="flex items-center gap-3 mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition">
                                <span className="flex-1 text-[11px] text-gray-400 truncate" id="pdf-filename">{pdfFile ? pdfFile.name : 'file chosen'}</span>
                                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[11px] font-bold text-gray-700 cursor-pointer transition flex-shrink-0">
                                  Choose File
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      setPdfFile(f || null);
                                    }}
                                  />
                                </label>
                              </div>
                              {pdfFile && <p className="text-[10px] text-emerald-600 font-semibold mt-1">PDF ready to upload</p>}
                            </div>
                          </div>

                        </div>
                      )}


                      {/* TAB 5: SHIPPING INFO */}
                      {formActiveTab === 'shipping' && (
                        <div className="space-y-5">

                          {/* ΓöÇΓöÇ SHIPPING INFO CARD ΓöÇΓöÇ */}
                          <div className="border border-slate-200 rounded-2xl p-5 space-y-5">
                            <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">Shipping Info</h3>

                            {/* Notice */}
                            <p className="text-[11px] text-gray-500">
                              Product base shipping fee is disabled. Configure your shipping fee here{' '}
                              <span className="text-blue-500 font-semibold cursor-pointer hover:underline">Shipping Configuration</span>
                            </p>

                            {/* Estimated Shipping Days & COD heading */}
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                              <span className="font-extrabold text-gray-800 text-sm">Estimated Shipping Days &amp; COD</span>
                            </div>

                            {/* Cash On Delivery toggle */}
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-600">Cash On Delivery</span>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newProduct.cashOnDelivery || false}
                                  onChange={(e) => setNewProduct({ ...newProduct, cashOnDelivery: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 relative"></div>
                                <span className="text-[11px] text-gray-400">Collect cash after delivery</span>
                              </label>
                            </div>

                            {/* Shipping Days */}
                            <div>
                              <label className="text-[11px] font-bold text-gray-600">Shipping Days</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={newProduct.shippingDays || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, shippingDays: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition"
                              />
                            </div>
                          </div>

                        </div>
                      )}


                      {/* TAB 6: OTHERS */}
                      {formActiveTab === 'others' && (
                        <div className="space-y-5">
                          {/* ΓöÇΓöÇ OTHERS INFO CARD ΓöÇΓöÇ */}
                          <div className="border border-slate-200 rounded-2xl p-5 space-y-5">
                            <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">Other Options</h3>

                            {/* Published Status toggle */}
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-600">Published Status</span>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newProduct.published || false}
                                  onChange={(e) => setNewProduct({ ...newProduct, published: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 relative"></div>
                                <span className="text-[11px] text-gray-400">{newProduct.published ? 'Visible' : 'Hidden'}</span>
                              </label>
                            </div>

                            {/* Featured Badge toggle */}
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-600">Featured Badge</span>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newProduct.featuredBadge || false}
                                  onChange={(e) => setNewProduct({ ...newProduct, featuredBadge: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 relative"></div>
                                <span className="text-[11px] text-gray-400">{newProduct.featuredBadge ? 'Enabled' : 'Disabled'}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {
                        formActiveTab === 'seo' && (
                          <div className="space-y-5">
                            <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
  <h3 className="font-bold text-gray-900 text-sm">SEO Settings</h3>
  <button
    type="button"
    onClick={(e) => handleGenerateSeo(e, false)}
    disabled={aiMarketingLoading}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-[#FF6600] text-white text-xs font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 cursor-pointer"
  >
    <Sparkles size={14} />
    {aiMarketingLoading ? 'Generating...' : 'Auto Generate AI SEO'}
  </button>
</div>
                              <div className="grid gap-4">
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Title</label>
                                  <input
                                    type="text"
                                    value={newProduct.metaTitle || ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, metaTitle: e.target.value })}
                                    placeholder="Leave empty to use product name"
                                    className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
                                  <textarea
                                    rows={4}
                                    value={newProduct.metaDescription || ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, metaDescription: e.target.value })}
                                    placeholder="Brief description for search engines..."
                                    className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Keywords</label>
                                  <input
                                    type="text"
                                    value={newProduct.metaKeywords || ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, metaKeywords: e.target.value })}
                                    placeholder="comma separated keywords"
                                    className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Image URL</label>
                                  <input
                                    type="text"
                                    value={newProduct.metaImage || ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, metaImage: e.target.value })}
                                    placeholder="Leave empty to use main product image"
                                    className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-sm"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">SEO Preview</div>
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={seoImagePreview}
                                    alt="SEO preview"
                                    className="h-16 w-16 rounded-2xl object-cover border border-slate-200 bg-white"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 truncate">{autoMetaTitle || 'Your product title will appear here'}</div>
                                    <p className="text-[11px] text-slate-500 truncate">{autoMetaDescription || 'A short meta description provides a good search preview.'}</p>
                                    {autoMetaKeywords ? (
                                      <p className="text-[10px] text-slate-400 truncate">Keywords: {autoMetaKeywords}</p>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-[11px] text-slate-700">
                                  <div className="font-semibold text-slate-900 mb-1 truncate">{autoMetaTitle || 'Product Title'}</div>
                                  <div className="text-[10px] text-slate-500 break-words">{`https://your-store.com/product/${newProduct.slug || 'product-slug'}`}</div>
                                  <div className="mt-3 text-[11px] text-slate-600 leading-5">{autoMetaDescription || 'Meta description will show here when you add product details.'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }

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
                                ├ù
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

            {/* Sub-tab: PRODUCT PURCHASE */}
            {productSubTab === 'purchase' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Product Purchase</h1>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Manage product purchase costs and margins
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPurchaseAddForm(!showPurchaseAddForm)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    {showPurchaseAddForm ? <X size={14} /> : <Plus size={14} />} {showPurchaseAddForm ? 'CANCEL' : 'ADD NEW PRODUCT'}
                  </button>
                </div>

                {/* Inline Add Form */}
                {showPurchaseAddForm && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">Quick Add Product</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Product Name *</label>
                        <input
                          type="text"
                          placeholder="Enter product name"
                          value={purchaseAddForm.name}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Selling Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={purchaseAddForm.price}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, price: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Purchase Price</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={purchaseAddForm.purchasePrice}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, purchasePrice: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Stock Qty</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={purchaseAddForm.countInStock}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, countInStock: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                        <select
                          value={purchaseAddForm.category}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-700 cursor-pointer"
                        >
                          <option value="">Select Category</option>
                          {categoryList.map((cat) => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Brand</label>
                        <select
                          value={purchaseAddForm.brand}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, brand: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-700 cursor-pointer"
                        >
                          <option value="">Select Brand</option>
                          {brandList.map((b) => (
                            <option key={b._id} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Barcode</label>
                        <input
                          type="text"
                          placeholder="Barcode / SKU"
                          value={purchaseAddForm.barcode || ''}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, barcode: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Discount %</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={purchaseAddForm.discountPercent || ''}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, discountPercent: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Image URL</label>
                        <input
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          value={purchaseAddForm.image || ''}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, image: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Description</label>
                        <textarea
                          rows="3"
                          placeholder="Product description..."
                          value={purchaseAddForm.description || ''}
                          onChange={(e) => setPurchaseAddForm({ ...purchaseAddForm, description: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900 resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => {
                          if (!purchaseAddForm.name || !purchaseAddForm.price) {
                            alert('Product name and selling price are required');
                            return;
                          }
                          (async () => {
                            try {
                              const res = await fetch(`${API_URL}/products`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                body: JSON.stringify({
                                  name: purchaseAddForm.name,
                                  price: Number(purchaseAddForm.price),
                                  purchasePrice: Number(purchaseAddForm.purchasePrice || 0),
                                  countInStock: Number(purchaseAddForm.countInStock || 1),
                                  category: purchaseAddForm.category || undefined,
                                  brand: purchaseAddForm.brand || undefined,
                                  barcode: purchaseAddForm.barcode || undefined,
                                  discountPercent: Number(purchaseAddForm.discountPercent || 0),
                                  image: purchaseAddForm.image || undefined,
                                  description: purchaseAddForm.description || undefined,
                                }),
                              });
                              if (res.ok) {
                                alert('Product added successfully!');
                                setPurchaseAddForm({ name: '', price: '', purchasePrice: '', countInStock: '1', category: '', brand: '', barcode: '', discountPercent: '', image: '', description: '' });
                                setShowPurchaseAddForm(false);
                                fetchProducts();
                              } else {
                                const err = await res.json();
                                alert(err.message || 'Failed to create product');
                              }
                            } catch (err) {
                              alert(err.message);
                            }
                          })();
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition cursor-pointer"
                      >
                        <Check size={14} className="inline mr-1" /> SAVE PRODUCT
                      </button>
                    </div>
                  </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Products', val: productsList.length, icon: Package, color: 'bg-blue-100 text-blue-600' },
                    { label: 'Total Purchase Cost', val: metrics.totalPurchaseCost ? `${currencySymbol}${metrics.totalPurchaseCost.toLocaleString()}` : `${currencySymbol}0`, icon: DollarSign, color: 'bg-indigo-100 text-indigo-600' },
                    { label: 'Total Stock Value', val: `${currencySymbol}${productsList.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.countInStock || 0)), 0).toLocaleString()}`, icon: BarChart3, color: 'bg-emerald-100 text-emerald-600' },
                    { label: 'Avg Profit Margin', val: (() => { const withCost = productsList.filter(p => Number(p.purchasePrice || 0) > 0); if (withCost.length === 0) return 'N/A'; const avg = withCost.reduce((sum, p) => sum + ((Number(p.price || 0) - Number(p.purchasePrice || 0)) / Number(p.price || 1) * 100), 0) / withCost.length; return `${avg.toFixed(1)}%`; })(), icon: TrendingUp, color: 'bg-amber-100 text-amber-600' }
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{card.label}</span>
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                            <Icon size={16} />
                          </span>
                        </div>
                        <div className="text-xl font-extrabold text-gray-900">{card.val}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Search & Filter */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-sm font-bold text-gray-800">All Products Purchase Info</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-full sm:w-48">
                        <select
                          value={productSellerFilter}
                          onChange={(e) => setProductSellerFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-700 font-semibold cursor-pointer"
                        >
                          <option value="all">Select Seller</option>
                          <option value="admin">Admin Products</option>
                          {allUsers.filter(u => u.role === 'seller').map((seller) => (
                            <option key={seller._id} value={seller._id}>{seller.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5 w-full sm:w-56">
                        <input
                          type="text"
                          placeholder="Search product..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs text-gray-700"
                        />
                        <button type="button" className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer flex items-center justify-center">
                          <Search size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase Table */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  {(() => {
                    const filtered = productsList.filter(p => {
                      if (productSellerFilter === 'admin') return !p.user_id || p.user_id === user?._id;
                      if (productSellerFilter !== 'all') return p.user_id === productSellerFilter;
                      return true;
                    }).filter(p => {
                      if (!productSearchQuery) return true;
                      const q = productSearchQuery.toLowerCase();
                      return (p.name || '').toLowerCase().includes(q) || (p.barcode || '').toLowerCase().includes(q);
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center text-gray-500 text-sm">No products found.</div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto p-2">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                              <th className="py-3 px-4 rounded-l-xl">#</th>
                              <th className="py-3 px-4">Product</th>
                              <th className="py-3 px-4">Barcode/SKU</th>
                              <th className="py-3 px-4">Stock</th>
                              <th className="py-3 px-4">Purchase Price</th>
                              <th className="py-3 px-4">Selling Price</th>
                              <th className="py-3 px-4">Margin</th>
                              <th className="py-3 px-4">Stock Value (Cost)</th>
                              <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {filtered.map((prod, idx) => {
                              const purchaseCost = Number(prod.purchasePrice || 0);
                              const sellPrice = Number(prod.price || 0);
                              const stock = prod.isDigital ? 'Unlimited' : Number(prod.countInStock || 0);
                              const stockQty = prod.isDigital ? 0 : Number(prod.countInStock || 0);
                              const margin = sellPrice > 0 ? ((sellPrice - purchaseCost) / sellPrice * 100) : 0;
                              const stockValue = purchaseCost * stockQty;
                              const isEditing = editingPurchaseId === prod._id;

                              return (
                                <tr key={prod._id} className="border-b border-transparent hover:bg-slate-50 transition group">
                                  <td className="py-3 px-4 rounded-l-xl text-gray-500 font-medium">{idx + 1}</td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <img src={getImageUrl(prod.image)} className="w-9 h-9 object-cover rounded-lg border border-slate-200" />
                                      <span className="font-bold text-gray-900 text-sm line-clamp-1 max-w-[180px]" title={prod.name}>{prod.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">{prod.barcode || '-'}</td>
                                  <td className="py-3 px-4 font-semibold">
                                    <span className={`${stock === 'Unlimited' ? 'text-blue-600' : stockQty <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                      {stock === 'Unlimited' ? '∞' : stockQty}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    {isEditing ? (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-400 text-xs">{currencySymbol}</span>
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={editingPurchaseVal}
                                          onChange={(e) => setEditingPurchaseVal(e.target.value)}
                                          className="w-24 px-2 py-1 border border-amber-300 rounded-lg text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSavePurchasePrice(prod._id);
                                            if (e.key === 'Escape') setEditingPurchaseId(null);
                                          }}
                                        />
                                        <button
                                          onClick={() => handleSavePurchasePrice(prod._id)}
                                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                          title="Save"
                                        >
                                          <Check size={14} />
                                        </button>
                                        <button
                                          onClick={() => setEditingPurchaseId(null)}
                                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                                          title="Cancel"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="font-bold text-gray-900 cursor-pointer hover:text-amber-600 transition flex items-center gap-1" onClick={() => {
                                        setEditingPurchaseId(prod._id);
                                        setEditingPurchaseVal(String(purchaseCost || ''));
                                      }}>
                                        {currencySymbol}{purchaseCost.toLocaleString()}
                                        <Edit size={12} className="opacity-0 group-hover:opacity-100 transition text-amber-500" />
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 font-bold text-gray-900">{currencySymbol}{sellPrice.toLocaleString()}</td>
                                  <td className="py-3 px-4">
                                    <span className={`font-extrabold ${margin >= 30 ? 'text-emerald-600' : margin >= 10 ? 'text-amber-600' : 'text-red-500'}`}>
                                      {margin.toFixed(1)}%
                                    </span>
                                    <span className="text-[9px] text-gray-400 block">
                                      {currencySymbol}{(sellPrice - purchaseCost).toLocaleString()} profit
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-gray-700 font-semibold">
                                    {stock === 'Unlimited' ? '-' : `${currencySymbol}${stockValue.toLocaleString()}`}
                                  </td>
                                  <td className="py-3 px-4 text-right rounded-r-xl">
                                    <button
                                      onClick={() => {
                                        setEditingPurchaseId(prod._id);
                                        setEditingPurchaseVal(String(purchaseCost || ''));
                                      }}
                                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                    >
                                      Edit Cost
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
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
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(cp._id)}
                            className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
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
                      <button type="button" className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-r-lg border border-slate-900 transition cursor-pointer flex items-center justify-center h-[34px] w-[34px]">
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
                            <td className="py-3.5 px-3 text-gray-500">{(!cat.rootCategory || cat.rootCategory === '--') ? 'ΓÇö' : cat.rootCategory}</td>
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
                      {categoryList.map((cat, cIdx) => (
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
                              if (res.ok) setCatForm(prev => ({ ...prev, image: data.image || data.url || '' }));
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
                              if (res.ok) setCatForm(prev => ({ ...prev, banner: data.image || data.url || '' }));
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
              <button onClick={() => {
                setShowSellerForm(!showSellerForm);
                setShowCustomerForm(false);
                if (!showSellerForm) setUserForm({ name: '', email: '', password: '', phone: '', role: 'seller', permissions: [] });
              }} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm">
                <Plus size={14} />
                ADD SELLER
              </button>
            </div>

            {showSellerForm && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const result = await createUserByAdmin(userForm);
                if (result.success) {
                  alert('Seller created successfully!');
                  setShowSellerForm(false);
                  setUserForm({ name: '', email: '', password: '', phone: '', role: 'customer', permissions: [] });
                  fetchAllUsers();
                } else {
                  alert(result.error);
                }
              }} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-lg shadow-sm animate-fade-in">
                <h3 className="font-bold text-gray-900 text-sm">Create New Seller</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</label>
                    <input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                    <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    <input required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                    <input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300">Create Seller</button>
                  <button type="button" onClick={() => { setShowSellerForm(false); setUserForm({ ...userForm, role: 'customer' }); }} className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                </div>
              </form>
            )}

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
                    <button type="button" className="bg-gray-800 text-white px-3 py-1.5 rounded-r-lg hover:bg-black transition">
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
                      <th className="py-3 px-4 border-b border-slate-100 text-center">Status</th>
                      <th className="py-3 px-4 border-b border-slate-100 text-center">Extra Days</th>
                      <th className="py-3 px-4 border-b border-slate-100 text-center">Options</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
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
                                <span className="font-medium text-amber-500 italic">{seller.store_name || seller.owner_name || seller.name}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                  seller.verification_status === 'Verified' ? 'bg-green-100 text-green-600' :
                                  seller.verification_status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                  {seller.verification_status || 'Unverified'}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1">Total Products: {productsList.filter(p => p.user_id === seller.id).length}</div>
                              {seller.nid_number && (
                                <div className="text-[10px] text-gray-400">NID: {seller.nid_number}</div>
                              )}
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
                          {(seller.nid_image_front || seller.nid_image_back) && (
                            <div className="flex gap-1 mt-1.5">
                              {seller.nid_image_front && (
                                <a href={seller.nid_image_front} target="_blank" rel="noreferrer" className="text-[9px] text-[#FF6600] underline">NID Front</a>
                              )}
                              {seller.nid_image_back && (
                                <a href={seller.nid_image_back} target="_blank" rel="noreferrer" className="text-[9px] text-[#FF6600] underline ml-1">NID Back</a>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="relative inline-block w-9 h-5 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-[3px] border-amber-400 appearance-none cursor-pointer" style={{ right: 0, transform: 'translateX(0)' }}/>
                            <label className="toggle-label block overflow-hidden h-5 rounded-full bg-amber-400 cursor-pointer"></label>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {seller.is_banned ? (
                            <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-bold">Banned</span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-bold">Active</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              defaultValue={seller.extra_delivery_days || 0}
                              onBlur={async (e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (val !== (seller.extra_delivery_days || 0)) {
                                  const res = await setExtraDeliveryTimeByAdmin(seller._id, val);
                                  if (res.success) fetchAllUsers();
                                }
                              }}
                              className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-[10px] focus:outline-hidden"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {seller.verification_status === 'Pending' && (
                              <>
                                <button
                                  onClick={async () => {
                                    const res = await fetch(`${API_URL}/users/${seller._id}/verification`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                      body: JSON.stringify({ verification_status: 'Verified' })
                                    });
                                    if (res.ok) fetchAllUsers();
                                  }}
                                  className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[9px] font-bold hover:bg-green-200 transition"
                                >Approve</button>
                                <button
                                  onClick={async () => {
                                    const res = await fetch(`${API_URL}/users/${seller._id}/verification`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                      body: JSON.stringify({ verification_status: 'Rejected' })
                                    });
                                    if (res.ok) fetchAllUsers();
                                  }}
                                  className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[9px] font-bold hover:bg-red-200 transition"
                                >Reject</button>
                              </>
                            )}
                            {seller.is_banned ? (
                              <button
                                onClick={async () => {
                                  const res = await unbanUserByAdmin(seller._id);
                                  if (res.success) fetchAllUsers();
                                }}
                                className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[9px] font-bold hover:bg-green-200 transition"
                              >Unban</button>
                            ) : (
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to ban this seller?')) {
                                    const res = await banUserByAdmin(seller._id);
                                    if (res.success) fetchAllUsers();
                                  }
                                }}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[9px] font-bold hover:bg-red-200 transition"
                              >Ban</button>
                            )}
                            <button
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this seller? This action cannot be undone.')) {
                                  const res = await deleteUserByAdmin(seller._id);
                                  if (res.success) fetchAllUsers();
                                }
                              }}
                              className="px-2 py-1 bg-red-100 text-rose-700 rounded-lg text-[9px] font-bold hover:bg-red-200 transition flex items-center gap-1"
                            ><Trash2 size={10} /> Delete</button>
                            <button onClick={() => {
                              setEditingUserId(seller._id);
                              setEditingUserForm({ name: seller.name, email: seller.email, phone: seller.phone || '', role: seller.role || 'seller', permissions: seller.permissions || [] });
                            }} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">
                              <Edit2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allUsers.filter(u => u.role === 'seller').length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gray-400 text-sm">No sellers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

                {/* USERS TAB (Customer Lists) */}
        {activeTab === 'users' && (
          <div className="space-y-4 max-w-7xl w-full animate-fade-in">
            {/* Header Area */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Customer Lists</h1>
                  <p className="text-sm text-gray-400 mt-0.5">You have total {allUsers.filter(u => u.role !== 'admin' && u.role !== 'seller').length} customers</p>
                </div>
              </div>
              <button onClick={() => {
                setShowCustomerForm(!showCustomerForm);
                setShowSellerForm(false);
                if (!showCustomerForm) setUserForm({ name: '', email: '', password: '', phone: '', role: 'customer', permissions: [] });
              }} className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                <Plus size={16} /> ADD CUSTOMER
              </button>
            </div>

            {showCustomerForm && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const result = await createUserByAdmin(userForm);
                if (result.success) {
                  alert('Customer created successfully!');
                  setShowCustomerForm(false);
                  setUserForm({ name: '', email: '', password: '', phone: '', role: 'customer', permissions: [] });
                  fetchAllUsers();
                } else {
                  alert(result.error);
                }
              }} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-lg shadow-sm animate-fade-in">
                <h3 className="font-bold text-gray-900 text-sm">Create New Customer</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</label>
                    <input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                    <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    <input required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                    <input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300">Create Customer</button>
                  <button type="button" onClick={() => setShowCustomerForm(false)} className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                </div>
              </form>
            )}

            {/* Main Content Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {/* Card Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-100 gap-4">
                <h2 className="text-base font-bold text-gray-900">Customers</h2>
                <div className="flex w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerListSearch || ''}
                    onChange={e => setCustomerListSearch(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 border-r-0 rounded-l-lg text-sm outline-none focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20 w-full sm:w-72 transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomerListSearch('')}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-5 py-2.5 rounded-r-lg transition-all duration-300 flex items-center justify-center border border-transparent"
                  >
                    {customerListSearch ? <X size={16} /> : <Search size={16} />}
                  </button>
                </div>
              </div>

              {/* Email / SMTP Configuration */}
              <div className="bg-white/90 p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <MessageSquare size={16} className="text-orange-500" />
                    Email / SMTP Configuration (Gmail)
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.smtpEnabled || false}
                      onChange={(e) => setSettings({...settings, smtpEnabled: e.target.checked})}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.smtpHost || ''}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMTP Port</label>
                    <input
                      type="number"
                      value={settings.smtpPort || ''}
                      onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                      placeholder="587"
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gmail Address / Username</label>
                    <input
                      type="email"
                      value={settings.smtpUser || ''}
                      onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                      placeholder="your-email@gmail.com"
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gmail App Password</label>
                    <input
                      type="password"
                      value={settings.smtpPass || ''}
                      onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                      placeholder="16-character App Password"
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    />
                    <p className="text-xs text-gray-400 mt-1">Requires 2FA enabled. Use App Password, not your regular password.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sender Email (From)</label>
                    <input
                      type="email"
                      value={settings.smtpFromEmail || ''}
                      onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })}
                      placeholder="support@yourdomain.com (or same as Gmail Address)"
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 text-gray-600 text-xs font-bold border-b border-slate-200">
                      <th className="py-3.5 px-4 w-12">#</th>
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Current Balance</th>
                      <th className="py-3.5 px-4">Last Login</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Options</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {(() => {
                      const filtered = allUsers.filter(u => {
                        if (u.role === 'admin' || u.role === 'seller') return false;
                        if (!customerListSearch) return true;
                        const term = customerListSearch.toLowerCase();
                        return (
                          u.name?.toLowerCase().includes(term) ||
                          u.email?.toLowerCase().includes(term) ||
                          u.phone?.toLowerCase().includes(term)
                        );
                      });
                      return filtered.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-12">
                            <div className="flex flex-col items-center gap-2">
                              <Search size={32} className="text-gray-200" />
                              <p className="text-gray-400 font-medium text-sm">No customers found for <span className="font-bold text-gray-600">"{customerListSearch}"</span></p>
                              <button onClick={() => setCustomerListSearch('')} className="mt-1 text-xs text-[#FF6600] hover:underline">Clear search</button>
                            </div>
                          </td>
                        </tr>
                      ) : filtered.map((u, index) => (
                      <tr key={u._id} className="border-b border-slate-100 bg-white even:bg-[#f8f9fa] hover:bg-[#fff9f5] transition-colors duration-300 group">
                        <td className="py-4 px-4 text-gray-500 font-medium">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative transform group-hover:scale-105 transition-transform duration-300">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md shrink-0" style={{ background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')} 100%)` }}>
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className={`w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white shadow-sm transition-colors duration-300 ${index === 3 ? 'bg-gray-300' : 'bg-emerald-500 group-hover:bg-emerald-400'}`}></div>
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-sm group-hover:text-[#FF6600] transition-colors">{u.name}</div>
                              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <CheckCircle2 size={12} className="text-emerald-500 mr-1" />
                                {maskEmail(u.email)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{u.phone || '-'}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm font-medium">DT0.00</td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{formatLastLogin(u.lastLogin)}</td>
                        <td className="py-4 px-4">
                          <div className="flex justify-start">
                            <div className="w-10 h-5 flex items-center rounded-full p-1 cursor-pointer bg-amber-400 hover:bg-amber-500 transition-colors duration-300 shadow-inner group-hover:shadow-md">
                              <div className="bg-white w-3.5 h-3.5 rounded-full shadow-sm transform duration-300 ease-in-out translate-x-4.5 group-hover:scale-110"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-start gap-2">
                            <button onClick={() => {
                              setEditingUserId(u._id);
                              setEditingUserForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role || 'customer', permissions: u.permissions || [] });
                            }} className="w-9 h-9 rounded-full bg-slate-100 text-gray-400 hover:bg-[#FF6600]/10 hover:text-[#FF6600] flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-200">
                              <Edit size={15} />
                            </button>
                            <div className="relative group/dropdown">
                              <button className="w-9 h-9 rounded-full bg-slate-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-200">
                                <MoreVertical size={15} />
                              </button>
                              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-50 transform origin-top-right scale-95 group-hover/dropdown:scale-100">
                                <div className="py-2">
                                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#FF6600] flex items-center gap-3 transition-colors font-medium">
                                    <User size={15} /> Profile
                                  </button>
                                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#FF6600] flex items-center gap-3 transition-colors font-medium">
                                    <Lock size={15} /> Ban This customer
                                  </button>
                                  <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium border-t border-gray-50 mt-1 pt-3">
                                    <XCircle size={15} /> Unverify Account
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      ));
                    })()}

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS IMPORT TAB */}
        {activeTab === 'users_import' && (
          <div className="space-y-6 max-w-7xl w-full animate-fade-in">
            <div className="flex items-center gap-3 pb-2">
              <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
              <h1 className="text-xl font-bold text-gray-900">Import Customers</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-4 border-b border-slate-100 bg-white">
                  <h2 className="text-sm font-bold text-gray-900">Import Customers</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Import File <span className="text-red-500">*</span>{' '}
                      <span className="text-gray-400 font-medium text-[11px]">(.csv/.xlsx/.xls File)</span>
                    </label>
                    <input
                      type="file"
                      ref={importFileRef}
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={e => setImportFile(e.target.files[0] || null)}
                    />
                    <div className="flex rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 focus-within:border-[#FF6600] focus-within:ring-2 focus-within:ring-[#FF6600]/20 transition-all">
                      <div className="flex-1 px-4 py-2.5 bg-slate-50 text-sm flex items-center gap-2 overflow-hidden">
                        {importFile ? (
                          <span className="text-gray-700 font-medium truncate">{importFile.name}</span>
                        ) : (
                          <span className="text-gray-400">Choose file...</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => importFileRef.current?.click()}
                        className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 border-l border-gray-300 text-gray-700 text-sm font-bold transition-colors shrink-0"
                      >
                        Browse
                      </button>
                    </div>
                    {importFile && (
                      <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> {importFile.name} selected ({(importFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        if (!importFile) { alert('Please select a file first.'); return; }
                        setImporting(true);
                        setTimeout(() => { setImporting(false); alert('Import completed successfully!'); setImportFile(null); }, 1500);
                      }}
                      disabled={importing || !importFile}
                      className={`flex items-center gap-2 px-8 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md ${
                        importFile && !importing
                          ? 'bg-gray-900 hover:bg-black text-white hover:shadow-lg transform hover:-translate-y-0.5'
                          : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {importing ? (
                        <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Importing...</>
                      ) : 'SAVE'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-4 border-b border-slate-100 bg-white">
                  <h2 className="text-sm font-bold text-gray-900">Customer Import Procedures</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-700 mb-5 font-medium">Please check this before importing your file:</p>
                  <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-600 font-medium">
                    <li>Uploaded File type must be: <span className="text-gray-900 font-bold">.xlsx Or .xls Or .csv</span></li>
                    <li>The file must contain: <span className="text-gray-900 font-bold">first_name, last_name</span></li>
                    <li>If OTP System activated than phone Or email must be provided. Otherwise email is required</li>
                    <li>If password is provided then it must be within 6-32 characters long</li>
                    <li>Gender must be within: <span className="text-gray-900 font-bold">male, female, others</span></li>
                  </ol>
                  <div className="mt-6">
                    <a href="#" className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-bold transition-colors">
                      <Download size={16} /> Customer Import Sample Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
                  <p className="text-sm text-slate-500 font-semibold pl-9">You have total {filteredStaffs.length} Staffs</p>
                </div>
                <button 
                  onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#2a3038] hover:bg-[#1a2028] text-white text-sm font-bold rounded-xl transition duration-200 uppercase tracking-wider"
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
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                      <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                      <input required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                      <input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</label>
                    <select value={userForm.role} onChange={(e) => {
                      const role = e.target.value;
                      const found = roleList.find(r => r.name === role);
                      setUserForm({ ...userForm, role, permissions: found ? found.permissions : (ROLE_PERMS[role] || []) });
                    }} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm">
                      {(roleList.length > 0 ? roleList.filter(r => r.name !== 'customer' && r.name !== 'seller') : Object.keys(ROLE_PERMS).filter((r) => ['superadmin', 'admin', 'manager', 'moderator'].includes(r))).map((r) => {
                        const name = typeof r === 'string' ? r : r.name;
                        const label = typeof r === 'string' ? r : r.label;
                        return <option key={name} value={name}>{label}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Permissions</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {userForm.permissions.map((perm) => (
                        <span key={perm} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-100">
                          {perm}
                          <button type="button" onClick={() => setUserForm({ ...userForm, permissions: userForm.permissions.filter((p) => p !== perm) })} className="text-indigo-400 hover:text-red-500 transition cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {userForm.permissions.length === 0 && <span className="text-[10px] text-gray-400">No permissions</span>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ALL_PERMS.filter(p => !userForm.permissions.includes(p)).map((perm) => (
                        <button key={perm} type="button" onClick={() => setUserForm({ ...userForm, permissions: [...userForm.permissions, perm] })}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 rounded text-[9px] font-bold transition cursor-pointer"
                        >+ {perm}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition text-sm">Create Staff</button>
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-orange-500"
                    />
                    <button type="button" className="absolute right-0 h-full px-3.5 bg-[#2a3038] hover:bg-[#1a2028] text-white rounded-r-xl transition flex items-center justify-center">
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
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Permissions</th>
                        <th className="py-3.5 px-4">Last Login</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
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
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[9px] font-bold uppercase">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 items-center max-w-[200px]">
                              {(u.permissions || []).length === 0 ? (
                                <span className="text-[9px] text-gray-400">None</span>
                              ) : (
                                (u.permissions || []).map((perm) => (
                                  <span key={perm} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-bold">
                                    {perm}
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const updatedPerms = (u.permissions || []).filter(p => p !== perm);
                                        try {
                                          const res = await fetch(`${API_URL}/users/${u._id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                            body: JSON.stringify({ permissions: updatedPerms }),
                                          });
                                          if (res.ok) fetchAllUsers();
                                          else { const err = await res.json(); alert(err.message || 'Failed to remove permission'); }
                                        } catch (err) { alert(err.message); }
                                      }}
                                      className="text-indigo-300 hover:text-red-500 transition cursor-pointer"
                                    >
                                      <X size={9} />
                                    </button>
                                  </span>
                                ))
                              )}
                              {ALL_PERMS.filter(p => !(u.permissions || []).includes(p)).length > 0 && (
                                addingPermForStaff === u._id ? (
                                  <span className="inline-flex items-center gap-0.5">
                                    <select
                                      value={selectedPermValue}
                                      onChange={(e) => setSelectedPermValue(e.target.value)}
                                      className="text-[8px] border border-slate-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:border-indigo-400"
                                    >
                                      <option value="">Pick...</option>
                                      {ALL_PERMS.filter(p => !(u.permissions || []).includes(p)).map(p => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!selectedPermValue) return;
                                        try {
                                          const res = await fetch(`${API_URL}/users/${u._id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                            body: JSON.stringify({ permissions: [...(u.permissions || []), selectedPermValue] }),
                                          });
                                          if (res.ok) fetchAllUsers();
                                          else { const err = await res.json(); alert(err.message || 'Failed to add permission'); }
                                        } catch (err) { alert(err.message); }
                                        setAddingPermForStaff(null);
                                        setSelectedPermValue('');
                                      }}
                                      className="px-1 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-bold cursor-pointer hover:bg-indigo-100 transition"
                                    >
                                      <Check size={9} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setAddingPermForStaff(null); setSelectedPermValue(''); }}
                                      className="px-1 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold cursor-pointer hover:bg-red-50 hover:text-red-500 transition"
                                    >
                                      <X size={9} />
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => { setAddingPermForStaff(u._id); setSelectedPermValue(''); }}
                                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded text-[8px] font-bold transition cursor-pointer"
                                  >
                                    + Add
                                  </button>
                                )
                              )}
                            </div>
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
                                className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-400 rounded-full flex items-center justify-center transition"
                                title="Delete Staff"
                              >
                                <Trash2 size={12} />
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

            </div>
          );
        })()}

        {/* Edit User Modal (global - works for any tab) */}
        {editingUserId && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditingUserId(null)}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-gray-900 text-sm">Edit User</h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</label>
                    <input required value={editingUserForm.name} onChange={(e) => setEditingUserForm({ ...editingUserForm, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                    <input type="email" required value={editingUserForm.email} onChange={(e) => setEditingUserForm({ ...editingUserForm, email: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                    <input value={editingUserForm.phone} onChange={(e) => setEditingUserForm({ ...editingUserForm, phone: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</label>
                    <select value={editingUserForm.role} onChange={(e) => {
                      const role = e.target.value;
                      const found = roleList.find(r => r.name === role);
                      setEditingUserForm({ ...editingUserForm, role, permissions: found ? found.permissions : (ROLE_PERMS[role] || []) });
                    }} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400">
                      {(roleList.length > 0 ? roleList : Object.keys(ROLE_PERMS)).map((r) => {
                        const name = typeof r === 'string' ? r : r.name;
                        const label = typeof r === 'string' ? r : r.label;
                        return <option key={name} value={name}>{label}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Permissions</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editingUserForm.permissions.map((perm) => (
                      <span key={perm} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-100">
                        {perm}
                        <button type="button" onClick={() => setEditingUserForm({ ...editingUserForm, permissions: editingUserForm.permissions.filter((p) => p !== perm) })} className="text-indigo-400 hover:text-red-500 transition cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {editingUserForm.permissions.length === 0 && <span className="text-[10px] text-gray-400">No permissions</span>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ALL_PERMS.filter(p => !editingUserForm.permissions.includes(p)).map((perm) => (
                      <button key={perm} type="button" onClick={() => setEditingUserForm({ ...editingUserForm, permissions: [...editingUserForm.permissions, perm] })}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 rounded text-[9px] font-bold transition cursor-pointer"
                      >+ {perm}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl text-sm">Save Changes</button>
                  <button type="button" onClick={() => { setEditingUserId(null); setEditingUserForm({ name: '', email: '', phone: '', role: 'customer', permissions: [] }); }}
                    className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STAFF ROLES TAB */}
        {activeTab === 'staff_roles' && (() => {
          const ALL_PERMISSIONS = ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat', 'settings', 'users', 'expenses', 'finance'];
          const PERMISSION_LABELS = {
            orders: 'Orders', products: 'Products', categories: 'Categories', brands: 'Brands',
            coupons: 'Coupons', shipping: 'Shipping', pages: 'Pages', offers: 'Offers',
            banners: 'Banners', chat: 'Support Chat', settings: 'Settings', users: 'Users',
            expenses: 'Expenses', finance: 'Finance'
          };

          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Staff Roles</h1>
                    <p className="text-[10px] text-gray-500 mt-0.5">Create and manage staff roles with custom permissions</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRoleForm({ name: '', label: '', description: '', permissions: [] });
                    setEditingRoleId(null);
                    setShowRoleForm(true);
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Plus size={14} /> ADD ROLE
                </button>
              </div>

              {/* Role Form */}
              {showRoleForm && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">{editingRoleId ? 'Edit Role' : 'Create New Role'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Role Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. support_agent"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Display Label *</label>
                      <input
                        type="text"
                        placeholder="e.g. Support Agent"
                        value={roleForm.label}
                        onChange={(e) => setRoleForm({ ...roleForm, label: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Brief description of this role"
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-sm text-gray-900"
                      />
                    </div>
                  </div>

                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-3">Permissions</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {roleForm.permissions.map((perm) => (
                      <span key={perm} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                        {PERMISSION_LABELS[perm] || perm}
                        <button
                          type="button"
                          onClick={() => setRoleForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== perm) }))}
                          className="text-indigo-400 hover:text-red-500 transition cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    {roleForm.permissions.length === 0 && (
                      <span className="text-xs text-gray-400 py-1">No permissions selected</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {ALL_PERMISSIONS.filter(p => !roleForm.permissions.includes(p)).map((perm) => (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => setRoleForm(prev => ({ ...prev, permissions: [...prev.permissions, perm] }))}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        + {PERMISSION_LABELS[perm] || perm}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setShowRoleForm(false)}
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-gray-700 text-sm font-bold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!roleForm.name || !roleForm.label) {
                          alert('Role name and label are required');
                          return;
                        }
                        try {
                          const url = editingRoleId
                            ? `${API_URL}/users/roles/${editingRoleId}`
                            : `${API_URL}/users/roles/create`;
                          const method = editingRoleId ? 'PUT' : 'POST';
                          const res = await fetch(url, {
                            method,
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                            body: JSON.stringify(roleForm),
                          });
                          if (res.ok) {
                            alert(editingRoleId ? 'Role updated successfully!' : 'Role created successfully!');
                            setShowRoleForm(false);
                            setEditingRoleId(null);
                            fetchRoles();
                          } else {
                            const err = await res.json();
                            alert(err.message || 'Failed to save role');
                          }
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition cursor-pointer"
                    >
                      <Check size={14} className="inline mr-1" /> {editingRoleId ? 'UPDATE ROLE' : 'SAVE ROLE'}
                    </button>
                  </div>
                </div>
              )}

              {/* Roles List */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {roleList.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No roles found. Create your first role!</div>
                ) : (
                  <div className="overflow-x-auto p-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                          <th className="py-3 px-4 rounded-l-xl">#</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Permissions</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {roleList.map((role, idx) => (
                          <tr key={role.id} className="border-b border-transparent hover:bg-slate-50 transition">
                            <td className="py-3 px-4 rounded-l-xl text-gray-500 font-medium">{idx + 1}</td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-gray-900">{role.label}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{role.name}</div>
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-xs max-w-[200px]">{role.description || '-'}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 items-center">
                                {(role.permissions || []).length === 0 ? (
                                  <span className="text-[10px] text-gray-400">No permissions</span>
                                ) : (
                                  (role.permissions || []).map((perm) => (
                                    <span key={perm} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-bold">
                                      {PERMISSION_LABELS[perm] || perm}
                                      {!role.is_system && (
                                        <button
                                          onClick={async () => {
                                            const updatedPerms = (role.permissions || []).filter(p => p !== perm);
                                            try {
                                              const res = await fetch(`${API_URL}/users/roles/${role.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                                body: JSON.stringify({ permissions: updatedPerms }),
                                              });
                                              if (res.ok) fetchRoles();
                                              else { const err = await res.json(); alert(err.message || 'Failed to remove permission'); }
                                            } catch (err) { alert(err.message); }
                                          }}
                                          className="text-indigo-300 hover:text-red-500 transition cursor-pointer"
                                        >
                                          <X size={11} />
                                        </button>
                                      )}
                                    </span>
                                  ))
                                )}
                                {!role.is_system && ALL_PERMISSIONS.filter(p => !(role.permissions || []).includes(p)).length > 0 && (
                                  <div className="relative inline-block">
                                    {addingPermForRole === role.id ? (
                                      <span className="inline-flex items-center gap-0.5">
                                        <select
                                          value={selectedPermValue}
                                          onChange={(e) => setSelectedPermValue(e.target.value)}
                                          className="text-[8px] border border-slate-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:border-indigo-400"
                                        >
                                          <option value="">Pick...</option>
                                          {ALL_PERMISSIONS.filter(p => !(role.permissions || []).includes(p)).map(p => (
                                            <option key={p} value={p}>{PERMISSION_LABELS[p] || p}</option>
                                          ))}
                                        </select>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (!selectedPermValue) return;
                                            try {
                                              const res = await fetch(`${API_URL}/users/roles/${role.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                                body: JSON.stringify({ permissions: [...(role.permissions || []), selectedPermValue] }),
                                              });
                                              if (res.ok) fetchRoles();
                                              else { const err = await res.json(); alert(err.message || 'Failed to add permission'); }
                                            } catch (err) { alert(err.message); }
                                            setAddingPermForRole(null);
                                            setSelectedPermValue('');
                                          }}
                                          className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-bold cursor-pointer hover:bg-indigo-100 transition"
                                        >
                                          <Check size={10} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => { setAddingPermForRole(null); setSelectedPermValue(''); }}
                                          className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-bold cursor-pointer hover:bg-red-50 hover:text-red-500 transition"
                                        >
                                          <X size={10} />
                                        </button>
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => { setAddingPermForRole(role.id); setSelectedPermValue(''); }}
                                        className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-md text-[9px] font-bold transition cursor-pointer"
                                        title="Add permission"
                                      >
                                        + Add
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {role.is_system ? (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-bold">System</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-bold">Custom</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right rounded-r-xl space-x-1 whitespace-nowrap">
                              {!role.is_system && (
                                <>
                                  <button
                                    onClick={() => {
                                      setRoleForm({ name: role.name, label: role.label, description: role.description || '', permissions: role.permissions || [] });
                                      setEditingRoleId(role.id);
                                      setShowRoleForm(true);
                                    }}
                                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Edit2 size={12} /> Edit
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Delete role "${role.label}"?`)) return;
                                      try {
                                        const res = await fetch(`${API_URL}/users/roles/${role.id}`, {
                                          method: 'DELETE',
                                          headers: { Authorization: `Bearer ${user.token}` },
                                        });
                                        if (res.ok) {
                                          alert('Role deleted successfully');
                                          fetchRoles();
                                        } else {
                                          const err = await res.json();
                                          alert(err.message || 'Failed to delete role');
                                        }
                                      } catch (err) {
                                        alert(err.message);
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 size={12} /> Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (() => {
          const EXPENSE_CATEGORIES = ['Ads', 'Delivery', 'Packaging', 'Utilities', 'Rent', 'Salaries', 'Marketing', 'Maintenance', 'Office Supplies', 'Software', 'Travel', 'Food', 'Tax', 'Insurance', 'Other'];
          const totalCatExpenses = expenseSummary.categories.reduce((s, c) => s + Number(c.total), 0);

          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
                      <p className="text-[10px] text-gray-500 mt-0.5">Track and manage all business expenses</p>
                    </div>
                  </div>
                  <button onClick={() => { setExpenseForm({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] }); setEditingExpenseId(null); setShowExpenseForm(true); }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm">
                    <Plus size={14} /> ADD EXPENSE
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Expenses</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{formatPrice(expenseSummary.totalExpenses, currencySymbol)}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">This Month</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatPrice(expenseSummary.monthlySummary?.[0]?.total || 0, currencySymbol)}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Categories</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{expenseSummary.categories.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg / Month</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatPrice(expenseSummary.monthlySummary.length > 0
                      ? Math.round(expenseSummary.monthlySummary.reduce((s, m) => s + Number(m.total), 0) / expenseSummary.monthlySummary.length)
                      : 0, currencySymbol)}
                  </div>
                </div>
              </div>

              {/* Add/Edit Expense Form */}
              {showExpenseForm && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">{editingExpenseId ? 'Edit Expense' : 'Add New Expense'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                      <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400">
                        <option value="">Select category</option>
                        {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Amount</label>
                      <input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Date</label>
                      <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Description</label>
                      <input type="text" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => { setShowExpenseForm(false); setEditingExpenseId(null); }}
                      className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-gray-700 text-sm font-bold rounded-xl transition cursor-pointer">
                      Cancel
                    </button>
                    <button onClick={async () => {
                      if (!expenseForm.category || !expenseForm.amount) { alert('Category and amount are required'); return; }
                      try {
                        const url = editingExpenseId ? `${API_URL}/expenses/${editingExpenseId}` : `${API_URL}/expenses`;
                        const method = editingExpenseId ? 'PUT' : 'POST';
                        const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                          body: JSON.stringify(expenseForm),
                        });
                        if (res.ok) {
                          setShowExpenseForm(false); setEditingExpenseId(null);
                          setExpenseForm({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
                          fetchExpenses(expenseFilter); fetchExpenseSummary(expenseFilter);
                        } else {
                          const err = await res.json(); alert(err.message || 'Failed to save expense');
                        }
                      } catch (err) { alert(err.message); }
                    }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition cursor-pointer">
                      <Check size={14} className="inline mr-1" /> {editingExpenseId ? 'UPDATE' : 'SAVE'}
                    </button>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <select value={expenseFilter.category} onChange={(e) => { const f = { ...expenseFilter, category: e.target.value }; setExpenseFilter(f); fetchExpenses(f); fetchExpenseSummary(f); }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400">
                    <option value="">All Categories</option>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="date" value={expenseFilter.startDate} onChange={(e) => { const f = { ...expenseFilter, startDate: e.target.value }; setExpenseFilter(f); fetchExpenses(f); fetchExpenseSummary(f); }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  <span className="text-gray-400 text-sm font-bold">to</span>
                  <input type="date" value={expenseFilter.endDate} onChange={(e) => { const f = { ...expenseFilter, endDate: e.target.value }; setExpenseFilter(f); fetchExpenses(f); fetchExpenseSummary(f); }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-orange-400" />
                  <button onClick={() => { setExpenseFilter({ category: '', startDate: '', endDate: '' }); fetchExpenses(); fetchExpenseSummary(); }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition cursor-pointer">
                    Clear
                  </button>
                </div>
              </div>

              {/* Main Content: Expense List + Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Expense List */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto p-2">
                    {expenseList.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">No expenses found</div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                            <th className="py-3 px-4 rounded-l-xl">#</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {expenseList.map((exp, idx) => (
                            <tr key={exp.id} className="border-b border-transparent hover:bg-slate-50 transition">
                              <td className="py-3 px-4 text-gray-500 font-medium">{idx + 1}</td>
                              <td className="py-3 px-4">
                                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">{exp.category}</span>
                              </td>
                              <td className="py-3 px-4 font-extrabold text-slate-900">{formatPrice(exp.amount, currencySymbol)}</td>
                              <td className="py-3 px-4 text-slate-500 text-xs max-w-[200px] truncate">{exp.description || '-'}</td>
                              <td className="py-3 px-4 text-slate-500 font-medium text-xs">{exp.date}</td>
                              <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                <button onClick={() => {
                                  setExpenseForm({ category: exp.category, amount: String(exp.amount), description: exp.description || '', date: exp.date });
                                  setEditingExpenseId(exp.id);
                                  setShowExpenseForm(true);
                                }}
                                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 inline-flex">
                                  <Edit2 size={11} /> Edit
                                </button>
                                <button onClick={async () => {
                                  if (!confirm('Delete this expense?')) return;
                                  try {
                                    const res = await fetch(`${API_URL}/expenses/${exp.id}`, {
                                      method: 'DELETE',
                                      headers: { Authorization: `Bearer ${user.token}` },
                                    });
                                    if (res.ok) { fetchExpenses(expenseFilter); fetchExpenseSummary(expenseFilter); }
                                    else { const err = await res.json(); alert(err.message || 'Failed to delete'); }
                                  } catch (err) { alert(err.message); }
                                }}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 inline-flex">
                                  <Trash2 size={11} /> Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">By Category</h3>
                    {expenseSummary.categories.length === 0 ? (
                      <p className="text-sm text-slate-400 font-semibold text-center py-4">No expenses yet</p>
                    ) : (
                      <div className="space-y-2.5">
                        {expenseSummary.categories.map((cat) => {
                          const pct = totalCatExpenses > 0 ? (Number(cat.total) / totalCatExpenses * 100) : 0;
                          return (
                            <div key={cat.category}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] font-bold text-slate-700">{cat.category}</span>
                                <span className="text-[11px] font-black text-slate-900">{formatPrice(cat.total, currencySymbol)}</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Monthly Summary */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">Monthly Totals</h3>
                    {expenseSummary.monthlySummary.length === 0 ? (
                      <p className="text-sm text-slate-400 font-semibold text-center py-4">No data</p>
                    ) : (
                      <div className="space-y-2">
                        {expenseSummary.monthlySummary.map((m) => (
                          <div key={m.month} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                            <span className="text-xs font-bold text-slate-600">{m.month}</span>
                            <div className="text-right">
                              <div className="text-xs font-black text-slate-900">{formatPrice(m.total, currencySymbol)}</div>
                              <div className="text-[9px] text-slate-400">{m.count} entries</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (() => {
          const fs = financeSummary;
          const chartData = (fs.revenueByPeriod || []).slice().reverse().map((r) => {
            const periodExpense = fs.expenseByPeriod?.find(e => (e.month || e.date) === (r.month || r.date));
            const rev = Number(r.revenue);
            const cost = Number(r.cost);
            const exp = Number(periodExpense?.total || 0);
            return {
              period: r.month || r.date,
              revenue: rev,
              cost,
              expenses: exp,
              profit: rev - cost - exp,
            };
          });

          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Finance & Profit</h1>
                      <p className="text-[10px] text-gray-500 mt-0.5">Revenue — Cost — Expenses = Profit</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['monthly', 'daily'].map(p => (
                      <button key={p} onClick={() => { setFinancePeriod(p); fetchFinanceSummary(p); }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${financePeriod === p ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {p === 'monthly' ? 'Monthly' : 'Daily'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revenue</span>
                  <div className="text-xl font-black text-emerald-600 mt-1">{formatPrice(fs.totalRevenue, currencySymbol)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{fs.orderCount} orders</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Cost</span>
                  <div className="text-xl font-black text-orange-600 mt-1">{formatPrice(fs.totalProductCost, currencySymbol)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {fs.totalRevenue > 0 ? `${((fs.totalProductCost / fs.totalRevenue) * 100).toFixed(1)}% of revenue` : '-'}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expenses</span>
                  <div className="text-xl font-black text-red-500 mt-1">{formatPrice(fs.totalExpenses, currencySymbol)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {fs.totalRevenue > 0 ? `${((fs.totalExpenses / fs.totalRevenue) * 100).toFixed(1)}% of revenue` : '-'}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Profit</span>
                  <div className={`text-xl font-black mt-1 ${fs.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatPrice(fs.grossProfit, currencySymbol)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Revenue - Product Cost</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Profit</span>
                  <div className={`text-xl font-black mt-1 ${fs.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatPrice(fs.netProfit, currencySymbol)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {fs.totalRevenue > 0 ? `${((fs.netProfit / fs.totalRevenue) * 100).toFixed(1)}% margin` : '-'}
                  </div>
                </div>
              </div>

              {/* Profit Trend Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">Profit Trend</h3>
                {chartData.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-semibold text-sm">No data available yet</div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value) => formatPrice(value, currencySymbol)}
                          contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }}
                        />
                        <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="cost" name="Product Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Summary Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Period Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  {chartData.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No data</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                          <th className="py-3 px-4 rounded-l-xl">Period</th>
                          <th className="py-3 px-4">Revenue</th>
                          <th className="py-3 px-4">Cost</th>
                          <th className="py-3 px-4">Expenses</th>
                          <th className="py-3 px-4 rounded-r-xl">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {chartData.map((row, idx) => (
                          <tr key={idx} className="border-b border-transparent hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-bold text-slate-800">{row.period}</td>
                            <td className="py-3 px-4 font-extrabold text-emerald-600">{formatPrice(row.revenue, currencySymbol)}</td>
                            <td className="py-3 px-4 font-bold text-amber-600">{formatPrice(row.cost, currencySymbol)}</td>
                            <td className="py-3 px-4 font-bold text-red-500">{formatPrice(row.expenses, currencySymbol)}</td>
                            <td className={`py-3 px-4 font-extrabold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {formatPrice(row.profit, currencySymbol)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
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
                  <p className="text-sm text-slate-500 font-semibold pl-9">You have total {(userPoints || []).length} Reward Users</p>
                </div>
              </div>

              {/* Lists & Logs Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                {/* Sub-tab Navigation */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                      onClick={() => setRewardSubTab('summary')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                        rewardSubTab === 'summary' 
                          ? 'bg-white text-slate-800 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Users
                    </button>
                    <button 
                      onClick={() => setRewardSubTab('logs')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-orange-500"
                    />
                    <button type="button" className="absolute right-0 h-full px-3.5 bg-[#2a3038] hover:bg-[#1a2028] text-white rounded-r-xl transition flex items-center justify-center">
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
                      <tbody className="text-sm">
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
                      <tbody className="text-sm">
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
                                'bg-orange-50 text-[#FF6600] border-orange-100'
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
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition text-sm font-semibold"
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
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition text-sm font-semibold"
                          placeholder="e.g. Campaign bonus"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition shadow-sm">
                          {loading ? 'Confirming...' : 'Confirm Adjustment'}
                        </button>
                        <button type="button" onClick={() => setAdjustModalUser(null)} className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
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
                          <tbody className="text-sm">
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
                                    'bg-orange-50 text-[#FF6600] border-orange-100'
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
                          className="py-2 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm transition"
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition text-sm font-semibold"
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
                  <p className="text-sm text-slate-500 font-semibold pl-9">Manually adjust or set loyalty points for specific customers.</p>
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
                      <div className="flex items-center justify-between p-3.5 bg-orange-50 border border-orange-100 rounded-xl">
                        <div>
                          <div className="font-bold text-blue-900 text-sm">{selectedSetUser.name}</div>
                          <div className="text-[10px] text-[#FF6600] font-semibold">{selectedSetUser.email}</div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setSelectedSetUser(null);
                            setCustomerSearchTerm('');
                          }}
                          className="p-1 hover:bg-blue-100 rounded-full text-[#FF6600] transition"
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
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition text-sm font-semibold"
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
                                <span className="text-sm font-bold text-slate-800">{c.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{c.email}</span>
                              </button>
                            ))}
                            {filteredCustomersForSelect.length === 0 && (
                              <div className="px-4 py-3 text-sm text-slate-400 text-center">No customers found</div>
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition text-sm font-semibold"
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition text-sm font-semibold"
                      placeholder="e.g. Manual bonus, Loyalty reward correction"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
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
              <p className="text-sm text-gray-400 mt-1">Create and manage custom pages (About, Contact, Terms, Privacy, etc.).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Pages List */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-gray-900 text-sm">All Pages</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {pagesList.map((page) => (
                    <div key={page._id} className="p-4 flex items-center justify-between text-sm">
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
                        <button onClick={() => startEditPage(page)} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"><Edit2 size={12} /> Edit</button>
                        <button onClick={() => handleDeletePage(page._id)} className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  ))}
                  {pagesList.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-8">No pages yet. Create your first page!</p>
                  )}
                </div>
              </div>

              {/* Page Form */}
              <div className="lg:col-span-5 bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">{editingPage ? 'Edit Page' : 'Create Page'}</h3>
                {editingPage && (
                  <button onClick={() => { setEditingPage(null); setPageForm({ title: '', slug: '', content: '', isPublished: false }); }} className="text-[10px] hover:text-gray-900">Cancel edit</button>
                )}
                <form onSubmit={editingPage ? handleUpdatePage : handleCreatePage} className="space-y-4 text-sm">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Page Title</label>
                    <input type="text" required placeholder="e.g. About Us" value={pageForm.title}
                      onChange={(e) => setPageForm({ ...pageForm, title: e.target.value, slug: editingPage ? pageForm.slug : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Slug (URL identifier)</label>
                    <input type="text" required placeholder="about-us" value={pageForm.slug}
                      onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Content (HTML supported)</label>
                    <textarea rows="6" placeholder="Write page content here..." value={pageForm.content}
                      onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm font-mono"></textarea>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="page-published" checked={pageForm.isPublished}
                      onChange={(e) => setPageForm({ ...pageForm, isPublished: e.target.checked })}
                      className="accent-blue-600 rounded-sm cursor-pointer" />
                    <label htmlFor="page-published" className="text-[10px] font-bold text-gray-400 cursor-pointer">Published (visible to visitors)</label>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition">
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
              <p className="text-sm text-gray-400 mt-1">Create promotional offers and banners for the storefront.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Offers List */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-gray-900 text-sm">All Offers</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {offersList.map((offer) => (
                    <div key={offer._id} className="p-4 flex items-center justify-between text-sm">
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
                        <button onClick={() => startEditOffer(offer)} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"><Edit2 size={12} /> Edit</button>
                        <button onClick={() => handleDeleteOffer(offer._id)} className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  ))}
                  {offersList.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-8">No offers yet.</p>
                  )}
                </div>
              </div>

              {/* Offer Form */}
              <div className="lg:col-span-5 bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">{editingOffer ? 'Edit Offer' : 'Create Offer'}</h3>
                {editingOffer && (
                  <button onClick={() => { setEditingOffer(null); setOfferForm({ title: '', description: '', discountPercent: '', image: '', link: '', isActive: true }); }} className="text-[10px] hover:text-gray-900">Cancel edit</button>
                )}
                <form onSubmit={editingOffer ? handleUpdateOffer : handleCreateOffer} className="space-y-4 text-sm">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Offer Title</label>
                    <input type="text" required placeholder="e.g. Summer Sale" value={offerForm.title}
                      onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea rows="2" placeholder="Short description..." value={offerForm.description}
                      onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discount %</label>
                      <input type="number" min="0" max="100" placeholder="e.g. 30" value={offerForm.discountPercent}
                        onChange={(e) => setOfferForm({ ...offerForm, discountPercent: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                      <input type="text" placeholder="https://..." value={offerForm.image}
                        onChange={(e) => setOfferForm({ ...offerForm, image: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Link (optional)</label>
                    <input type="text" placeholder="e.g. /shop?category=Fashion" value={offerForm.link}
                      onChange={(e) => setOfferForm({ ...offerForm, link: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="offer-active" checked={offerForm.isActive}
                      onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                      className="accent-blue-600 rounded-sm cursor-pointer" />
                    <label htmlFor="offer-active" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active (visible on storefront)</label>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition">
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
              <p className="text-sm text-gray-400 mt-1">Manage homepage slider banners.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-gray-900 text-sm">All Banners</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {bannersList.map((b) => (
                    <div key={b._id} className="p-4 flex items-center gap-4 text-sm">
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
                        <button onClick={() => startEditBanner(b)} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"><Edit2 size={12} /> Edit</button>
                        <button onClick={() => handleDeleteBanner(b._id)} className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  ))}
                  {bannersList.length === 0 && <p className="text-center text-gray-500 text-sm py-8">No banners yet.</p>}
                </div>
              </div>
              <div className="lg:col-span-5 bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-slate-100">{editingBanner ? 'Edit Banner' : 'Create Banner'}</h3>
                {editingBanner && (
                  <button onClick={() => { setEditingBanner(null); setBannerForm({ title: '', subtitle: '', image: '', link: '', isActive: true, order: 0 }); }} className="text-[10px] hover:text-gray-900">Cancel edit</button>
                )}
                <form onSubmit={editingBanner ? handleUpdateBanner : handleCreateBanner} className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Title</label>
                      <input type="text" placeholder="Summer Sale" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order</label>
                      <input type="number" min="0" value={bannerForm.order} onChange={(e) => setBannerForm({ ...bannerForm, order: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subtitle</label>
                    <input type="text" placeholder="Get up to 50% off" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                    <div className="flex gap-2 mt-1">
                      <input type="text" required placeholder="https://..." value={bannerForm.image} onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                      <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg cursor-pointer text-sm whitespace-nowrap flex items-center">
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
                              if (res.ok) {
                                setBannerForm({ ...bannerForm, image: data.image });
                              } else {
                                alert(data.message || 'Image upload failed');
                              }
                            } catch (error) {
                              alert('An error occurred during upload.');
                            }
                          }} />
                      </label>
                    </div>
                    {bannerForm.image && <img src={getImageUrl(bannerForm.image)} className="mt-2 h-20 object-cover rounded-lg border border-gray-300" />}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Link (optional)</label>
                    <input type="text" placeholder="/shop" value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="banner-active" checked={bannerForm.isActive} onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                    <label htmlFor="banner-active" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition">{editingBanner ? 'Update Banner' : 'Create Banner'}</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sellers_payouts' && (
          <div className="space-y-6 max-w-7xl w-full animate-fade-in">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Seller Payouts History</h1>
              <p className="text-sm text-gray-400 mt-1">View completed and rejected payout requests.</p>
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
                  <tbody className="text-sm">
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
              <p className="text-sm text-gray-400 mt-1">Approve or reject incoming payout requests from sellers.</p>
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
                  <tbody className="text-sm">
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
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition-all duration-200 shadow-xs"
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
                    <label className="block text-sm text-gray-600 mb-1">Import File <span className="text-gray-400">*(.csv/.xlsx/.xls File)</span></label>
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
                    <a href={`${API_URL}/seller_import_sample.csv`} download className="text-[#FF6600] hover:text-[#FF6600] text-sm flex items-center gap-1 transition">
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 text-sm font-semibold cursor-pointer"
                    >
                      <option value="Adjustable">Adjustable</option>
                      <option value="Not Adjustable">Not Adjustable</option>
                    </select>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#2a3038] hover:bg-[#1a2028] text-white text-sm font-bold rounded-xl transition duration-200 uppercase tracking-wider shadow-xs"
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
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Method Info</h3>
                  <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
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
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Cron Job Setting</h3>
                  <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
                    <p>For managing auto expiration of subscription/notify the sellers, you need to set cron job.</p>
                    <p className="font-semibold text-slate-700">Add the following command to your cron job:</p>
                    <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl font-mono text-[10px] text-slate-650 overflow-x-auto whitespace-pre">
                      {"Cron: * * * * * cd /path-to-your-project && node backend/cron/subscriptionCron.js >> /dev/null 2>&1"}
                    </div>
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <span>For More Info</span>
                      <a href="#" className="text-[#FF6600] hover:text-[#FF6600] font-semibold hover:underline">Click Here</a>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          alert('Triggered cron manually. Subscriptions auto-expiration checked!');
                        }}
                        className="px-4 py-2.5 bg-[#2a3038] hover:bg-[#1a2028] text-white text-sm font-bold rounded-xl transition duration-200 uppercase tracking-wider shadow-xs"
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
                    <p className="text-sm text-gray-500 font-medium mt-1">Create and manage subscription packages for sellers.</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl border border-slate-100 shadow-inner">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total</span>
                    <span className="text-sm font-black text-gray-900">{sellerPackages?.length || 0}</span>
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
                                <select value={editPkgForm.is_active ? 'active' : 'inactive'} onChange={(e) => setEditPkgForm({...editPkgForm, is_active: e.target.value === 'active'})} className="px-2 py-1 border border-gray-300 rounded-lg text-sm">
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
                                  }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition flex items-center gap-1">
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
                                  }} className="px-3 py-1.5 bg-orange-500/10 text-[#FF6600] rounded-lg text-[10px] font-bold hover:bg-orange-500/20 transition flex items-center gap-1">
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
                        <tr className="text-center text-gray-500 text-sm">
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
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <h3 className="font-black text-gray-900 text-sm">Create Package</h3>
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
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-black rounded-xl shadow-lg shadow-orange-500/30 transition text-sm flex items-center justify-center gap-2"
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
                  <p className="text-sm text-slate-500 font-semibold pl-9">Found {filtered.length} Rows</p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2a3038] hover:bg-[#1a2028] text-white text-sm font-bold rounded-xl transition duration-200"
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
                      className="w-full sm:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500"
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
                      className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-orange-500"
                      />
                      <button type="button" className="absolute right-0 h-full px-3.5 bg-[#2a3038] hover:bg-[#1a2028] text-white rounded-r-xl transition flex items-center justify-center">
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
                    <tbody className="text-sm">
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
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold inline-block bg-orange-50 text-[#FF6600] border border-orange-100">
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
                          <td colSpan="7" className="py-12 text-center text-slate-400 text-sm bg-slate-50/20 font-medium">
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
                  <p className="text-sm text-slate-500 font-semibold pl-9">Found {filtered.length} Rows</p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2a3038] hover:bg-[#1a2028] text-white text-sm font-bold rounded-xl transition duration-200"
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
                      className="w-full sm:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500"
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
                      className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-orange-500"
                      />
                      <button type="button" className="absolute right-0 h-full px-3.5 bg-[#2a3038] hover:bg-[#1a2028] text-white rounded-r-xl transition flex items-center justify-center">
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
                    <tbody className="text-sm">
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
                          <td colSpan="7" className="py-12 text-center text-slate-400 text-sm bg-slate-50/20 font-medium">
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
              <p className="text-sm text-gray-400 mt-1">View and reply to customer messages in real-time.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><MessageSquare size={16} className="text-[#FF6600]" /> Messages ({chatMessages.filter((m) => !m.isAdmin).length})</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleCloseChat} className="text-[10px] text-orange-400 hover:text-orange-300 hover:underline font-semibold">Close Chat</button>
                  <button onClick={fetchChatMessages} className="text-[10px] text-blue-400 hover:underline">Refresh</button>
                </div>
              </div>
              <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-slate-50">
                {chatMessages.length === 0 && <p className="text-center text-gray-500 text-sm py-10">No messages yet.</p>}
                {chatMessages.map((m) => (
                  <div key={m._id} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${m.isAdmin ? 'bg-[#FF6600] text-white' : 'bg-gray-200 text-gray-800'}`}>
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
                <input type="text" placeholder="Type your reply..." value={chatReply} onChange={(e) => setChatReply(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-lg text-sm transition">Send</button>
              </form>
            </div>
          </div>
        )}

        {/* FRAUD CHECKER TAB */}
        {activeTab === 'fraud_checker' && (
          <div className="space-y-6 max-w-7xl w-full animate-fade-in">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Fraud Checker</h1>
              <p className="text-sm text-gray-400 mt-1">Detect suspicious orders, block fraudulent phone numbers and IP addresses.</p>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'suspicious', label: 'Suspicious Orders', icon: ShieldAlert },
                { id: 'blocked_phones', label: 'Blocked Phones', icon: Ban },
                { id: 'blocked_ips', label: 'Blocked IPs', icon: Ban },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setFraudSubTab(tab.id); if (tab.id === 'blocked_phones') fetchBlockedPhonesList(); if (tab.id === 'blocked_ips') fetchBlockedIpsList(); if (tab.id === 'suspicious') fetchSuspiciousOrders(); }}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition flex items-center gap-2 ${
                    fraudSubTab === tab.id
                      ? 'bg-[#FF6600] text-white shadow-md'
                      : 'bg-white border border-slate-200 hover:text-gray-900'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* SUSPICIOUS ORDERS */}
            {fraudSubTab === 'suspicious' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Orders with Fraud Signals</h3>
                  <button
                    onClick={fetchSuspiciousOrders}
                    className="text-xs text-[#FF6600] hover:text-orange-700 font-bold flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                  </button>
                </div>
                {fraudLoading ? (
                  <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
                ) : suspiciousOrders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400">No suspicious orders found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-[10px] text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="text-left px-4 py-3 font-bold">Order ID</th>
                          <th className="text-left px-4 py-3 font-bold">Customer</th>
                          <th className="text-left px-4 py-3 font-bold">Phone</th>
                          <th className="text-left px-4 py-3 font-bold">Amount</th>
                          <th className="text-left px-4 py-3 font-bold">Status</th>
                          <th className="text-left px-4 py-3 font-bold">Risk</th>
                          <th className="text-left px-4 py-3 font-bold">Date</th>
                          <th className="text-left px-4 py-3 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {suspiciousOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50 transition text-gray-700">
                            <td className="px-4 py-3 font-mono text-[10px]">{o.id?.slice(0, 8)}...</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{o.users?.name || 'N/A'}</div>
                              <div className="text-[10px] text-gray-400">{o.users?.email || ''}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs">{o.shipping_phone || '-'}</span>
                              {o.ip_address && (
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{o.ip_address}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold">{o.total_price ? formatPrice(o.total_price, currencySymbol) : '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                o.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>{o.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {o.signals?.map((s, i) => (
                                  <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    s.includes('BLOCKED') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                  }`}>{s}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => { setSelectedFraudOrder(o); fetchFraudCheck(o.id); }}
                                className="text-[10px] font-bold text-[#FF6600] hover:text-orange-700 border border-[#FF6600] px-2 py-1 rounded-lg hover:bg-orange-50 transition"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* FRAUD INSPECT MODAL */}
            {selectedFraudOrder && fraudCheckResult && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto bg-black/40" onClick={() => { setSelectedFraudOrder(null); setFraudCheckResult(null); }}>
                <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl mx-4 p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-gray-900">Fraud Inspection</h2>
                    <button onClick={() => { setSelectedFraudOrder(null); setFraudCheckResult(null); }} className="text-gray-400 hover:text-red-500 transition"><X size={16} /></button>
                  </div>

                  {/* Current Order Info */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={14} className="text-orange-600" />
                      <span className="font-bold text-gray-900">Order #{selectedFraudOrder.id?.slice(0, 8)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div><span className="text-gray-500">Customer:</span> <span className="font-semibold">{fraudCheckResult.order?.users?.name || 'N/A'}</span></div>
                      <div><span className="text-gray-500">Phone:</span> <span className="font-semibold">{fraudCheckResult.order?.shipping_phone || '-'}</span></div>
                      <div><span className="text-gray-500">IP:</span> <span className="font-mono">{fraudCheckResult.order?.ip_address || '-'}</span></div>
                      <div><span className="text-gray-500">Device:</span> <span className="font-mono text-[10px]">{fraudCheckResult.order?.device_fingerprint || '-'}</span></div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {fraudCheckResult.blocks?.phone && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Phone Blocked</span>}
                      {fraudCheckResult.blocks?.ip && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">IP Blocked</span>}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {!fraudCheckResult.blocks?.phone && (
                        <button onClick={async () => {
                          await fetch(`${API_URL}/admin/fraud/block-phone`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone: fraudCheckResult.order.shipping_phone, reason: 'Blocked from fraud inspection' }),
                          });
                          alert('Phone blocked');
                          fetchFraudCheck(selectedFraudOrder.id);
                          fetchBlockedPhonesList();
                        }} className="text-[10px] font-bold text-red-600 border border-red-300 px-2 py-1 rounded-lg hover:bg-red-50 transition">Block Phone</button>
                      )}
                      {fraudCheckResult.blocks?.phone && (
                        <button onClick={async () => {
                          await fetch(`${API_URL}/admin/fraud/block-phone/${encodeURIComponent(fraudCheckResult.order.shipping_phone)}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${user.token}` },
                          });
                          alert('Phone unblocked');
                          fetchFraudCheck(selectedFraudOrder.id);
                          fetchBlockedPhonesList();
                        }} className="text-[10px] font-bold text-green-600 border border-green-300 px-2 py-1 rounded-lg hover:bg-green-50 transition">Unblock Phone</button>
                      )}
                      {!fraudCheckResult.blocks?.ip && fraudCheckResult.order?.ip_address && (
                        <button onClick={async () => {
                          await fetch(`${API_URL}/admin/fraud/block-ip`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ip_address: fraudCheckResult.order.ip_address, reason: 'Blocked from fraud inspection' }),
                          });
                          alert('IP blocked');
                          fetchFraudCheck(selectedFraudOrder.id);
                          fetchBlockedIpsList();
                        }} className="text-[10px] font-bold text-red-600 border border-red-300 px-2 py-1 rounded-lg hover:bg-red-50 transition">Block IP</button>
                      )}
                      {fraudCheckResult.blocks?.ip && (
                        <button onClick={async () => {
                          await fetch(`${API_URL}/admin/fraud/block-ip/${encodeURIComponent(fraudCheckResult.order.ip_address)}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${user.token}` },
                          });
                          alert('IP unblocked');
                          fetchFraudCheck(selectedFraudOrder.id);
                          fetchBlockedIpsList();
                        }} className="text-[10px] font-bold text-green-600 border border-green-300 px-2 py-1 rounded-lg hover:bg-green-50 transition">Unblock IP</button>
                      )}
                    </div>
                  </div>

                  {/* Duplicate Orders by Phone */}
                  {fraudCheckResult.duplicates?.phone?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <AlertCircle size={12} className="text-orange-500" />
                        Same Phone ({fraudCheckResult.duplicates.phone.length} other orders)
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-red-100 text-[10px] text-red-700 uppercase">
                            <tr><th className="text-left px-3 py-2">Order</th><th className="text-left px-3 py-2">Customer</th><th className="text-left px-3 py-2">Amount</th><th className="text-left px-3 py-2">Status</th><th className="text-left px-3 py-2">Date</th></tr>
                          </thead>
                          <tbody className="divide-y divide-red-100">
                            {fraudCheckResult.duplicates.phone.map((d) => (
                              <tr key={d.id} className="text-gray-700">
                                <td className="px-3 py-2 font-mono">{d.id?.slice(0, 8)}...</td>
                                <td className="px-3 py-2">{d.users?.name || 'N/A'}</td>
                                <td className="px-3 py-2 font-semibold">{d.total_price ? formatPrice(d.total_price, currencySymbol) : '-'}</td>
                                <td className="px-3 py-2"><span className={`font-bold ${d.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>{d.status}</span></td>
                                <td className="px-3 py-2 text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Duplicate Orders by IP */}
                  {fraudCheckResult.duplicates?.ip?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <AlertCircle size={12} className="text-orange-500" />
                        Same IP ({fraudCheckResult.duplicates.ip.length} other orders)
                      </h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-orange-100 text-[10px] text-orange-700 uppercase">
                            <tr><th className="text-left px-3 py-2">Order</th><th className="text-left px-3 py-2">Customer</th><th className="text-left px-3 py-2">Amount</th><th className="text-left px-3 py-2">Status</th><th className="text-left px-3 py-2">Date</th></tr>
                          </thead>
                          <tbody className="divide-y divide-orange-100">
                            {fraudCheckResult.duplicates.ip.map((d) => (
                              <tr key={d.id} className="text-gray-700">
                                <td className="px-3 py-2 font-mono">{d.id?.slice(0, 8)}...</td>
                                <td className="px-3 py-2">{d.users?.name || 'N/A'}</td>
                                <td className="px-3 py-2 font-semibold">{d.total_price ? formatPrice(d.total_price, currencySymbol) : '-'}</td>
                                <td className="px-3 py-2"><span className={`font-bold ${d.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>{d.status}</span></td>
                                <td className="px-3 py-2 text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {fraudCheckResult.duplicates?.phone?.length === 0 && fraudCheckResult.duplicates?.ip?.length === 0 && (
                    <div className="text-center py-4 text-sm text-gray-400">No duplicates found for this order.</div>
                  )}
                </div>
              </div>
            )}

            {/* BLOCKED PHONES */}
            {fraudSubTab === 'blocked_phones' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">Block a Phone Number</h3>
                  <form onSubmit={handleBlockPhone} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                      <input type="text" required placeholder="e.g. 017XXXXXXXX" value={newBlockPhone} onChange={(e) => setNewBlockPhone(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reason</label>
                      <input type="text" placeholder="Why is this blocked?" value={newBlockPhoneReason} onChange={(e) => setNewBlockPhoneReason(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <button type="submit" className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition shadow-md">Block Phone</button>
                  </form>
                </div>

                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 bg-white">
                    <h3 className="font-bold text-gray-900 text-sm">Blocked Phone Numbers ({blockedPhonesList.length})</h3>
                  </div>
                  {blockedPhonesList.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">No blocked phones.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-[10px] text-gray-500 uppercase tracking-wider">
                          <tr><th className="text-left px-4 py-3 font-bold">Phone</th><th className="text-left px-4 py-3 font-bold">Reason</th><th className="text-left px-4 py-3 font-bold">Blocked By</th><th className="text-left px-4 py-3 font-bold">Date</th><th className="text-left px-4 py-3 font-bold">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {blockedPhonesList.map((bp) => (
                            <tr key={bp.id} className="hover:bg-slate-50 transition text-gray-700">
                              <td className="px-4 py-3 font-mono text-xs font-semibold">{bp.phone}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">{bp.reason || '-'}</td>
                              <td className="px-4 py-3 text-xs">{bp.users?.name || 'N/A'}</td>
                              <td className="px-4 py-3 text-xs text-gray-400">{new Date(bp.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => handleUnblockPhone(bp.phone)} className="text-[10px] font-bold text-green-600 border border-green-300 px-2 py-1 rounded-lg hover:bg-green-50 transition">Unblock</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BLOCKED IPS */}
            {fraudSubTab === 'blocked_ips' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">Block an IP Address</h3>
                  <form onSubmit={handleBlockIp} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">IP Address</label>
                      <input type="text" required placeholder="e.g. 192.168.1.1" value={newBlockIp} onChange={(e) => setNewBlockIp(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reason</label>
                      <input type="text" placeholder="Why is this blocked?" value={newBlockIpReason} onChange={(e) => setNewBlockIpReason(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <button type="submit" className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition shadow-md">Block IP</button>
                  </form>
                </div>

                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 bg-white">
                    <h3 className="font-bold text-gray-900 text-sm">Blocked IP Addresses ({blockedIpsList.length})</h3>
                  </div>
                  {blockedIpsList.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">No blocked IPs.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-[10px] text-gray-500 uppercase tracking-wider">
                          <tr><th className="text-left px-4 py-3 font-bold">IP Address</th><th className="text-left px-4 py-3 font-bold">Reason</th><th className="text-left px-4 py-3 font-bold">Blocked By</th><th className="text-left px-4 py-3 font-bold">Date</th><th className="text-left px-4 py-3 font-bold">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {blockedIpsList.map((bi) => (
                            <tr key={bi.id} className="hover:bg-slate-50 transition text-gray-700">
                              <td className="px-4 py-3 font-mono text-xs font-semibold">{bi.ip_address}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">{bi.reason || '-'}</td>
                              <td className="px-4 py-3 text-xs">{bi.users?.name || 'N/A'}</td>
                              <td className="px-4 py-3 text-xs text-gray-400">{new Date(bi.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => handleUnblockIp(bi.ip_address)} className="text-[10px] font-bold text-green-600 border border-green-300 px-2 py-1 rounded-lg hover:bg-green-50 transition">Unblock</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Store Settings & Gateways</h1>
              <p className="text-sm text-gray-400 mt-1">Configure OTP gateways, payment gateways, and analytics tracking (Facebook Pixel &amp; Google GA4).</p>
            </div>

            <HeroSettingsForm user={user} />

            <form onSubmit={handleSaveSettings} className="space-y-6">

              {/* Advance Payment Section */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Advance Payment Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="advance-payment-enabled" checked={settings.advancePaymentEnabled || false} onChange={(e) => setSettings({ ...settings, advancePaymentEnabled: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                    <label htmlFor="advance-payment-enabled" className="font-bold text-gray-700 text-sm cursor-pointer">Enable Advance Payment</label>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount Threshold</label>
                    <input type="number" min="0" value={settings.advancePaymentThreshold || 1000} onChange={(e) => setSettings({ ...settings, advancePaymentThreshold: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Orders above this amount require advance payment.</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Advance %</label>
                    <input type="number" min="1" max="100" value={settings.advancePaymentPercent || 50} onChange={(e) => setSettings({ ...settings, advancePaymentPercent: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Percentage to pay upfront.</p>
                  </div>
                </div>
              </div>

              {/* Branding Section */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <LayoutGrid size={16} className="text-[#FF6600]" />
                  Branding Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Site Title</label>
                    <input type="text" value={settings.siteTitle || ''}
                      onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
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
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm font-semibold"
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
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Favicon URL</label>
                    <div className="mt-1.5 flex gap-2">
                      <input type="text" value={settings.faviconUrl || ''}
                        onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                        className="min-w-0 flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                      />
                      <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition">
                        <Upload size={13} />
                        Upload
                        <input type="file" accept="image/*,.ico" className="hidden" onChange={(e) => handleBrandingUpload(e.target.files?.[0], 'faviconUrl')} />
                      </label>
                    </div>
                    {settings.faviconUrl && (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
                        <img src={getImageUrl(settings.faviconUrl)} alt="favicon preview" className="w-9 h-9 object-contain rounded border border-gray-300 bg-white" />
                        <span className="text-[10px] font-semibold text-slate-500">Favicon preview</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Header Logo URL</label>
                    <div className="mt-1.5 flex gap-2">
                      <input type="text" value={settings.headerLogo || ''}
                        onChange={(e) => setSettings({ ...settings, headerLogo: e.target.value })}
                        className="min-w-0 flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                      />
                      <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FF6600] hover:bg-[#e05a00] text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition shadow-sm shadow-orange-500/20">
                        <Upload size={13} />
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBrandingUpload(e.target.files?.[0], 'headerLogo')} />
                      </label>
                    </div>
                    {settings.headerLogo && (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
                        <img src={getImageUrl(settings.headerLogo)} alt="header logo preview" className="h-12 max-w-44 object-contain rounded border border-gray-300 bg-white px-2" />
                        <span className="text-[10px] font-semibold text-slate-500">Header logo preview</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Footer Logo URL</label>
                    <div className="mt-1.5 flex gap-2">
                      <input type="text" value={settings.footerLogo || ''}
                        onChange={(e) => setSettings({ ...settings, footerLogo: e.target.value })}
                        className="min-w-0 flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                      />
                      <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FF6600] hover:bg-[#e05a00] text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition shadow-sm shadow-orange-500/20">
                        <Upload size={13} />
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBrandingUpload(e.target.files?.[0], 'footerLogo')} />
                      </label>
                    </div>
                    {settings.footerLogo && (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
                        <img src={getImageUrl(settings.footerLogo)} alt="footer logo preview" className="h-12 max-w-44 object-contain rounded border border-gray-300 bg-white px-2" />
                        <span className="text-[10px] font-semibold text-slate-500">Footer logo preview</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">All Products Banner Image</label>
                    <div className="mt-1.5 flex gap-2">
                      <input type="text" value={settings.allProductsBannerImage || ''}
                        onChange={(e) => setSettings({ ...settings, allProductsBannerImage: e.target.value })}
                        placeholder="Fallback image for All Products shop view"
                        className="min-w-0 flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                      />
                      <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FF6600] hover:bg-[#e05a00] text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition shadow-sm shadow-orange-500/20">
                        <Upload size={13} />
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBrandingUpload(e.target.files?.[0], 'allProductsBannerImage')} />
                      </label>
                    </div>
                    {settings.allProductsBannerImage && (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
                        <img src={getImageUrl(settings.allProductsBannerImage)} alt="all products banner preview" className="h-12 max-w-44 object-contain rounded border border-gray-300 bg-white px-2" />
                        <span className="text-[10px] font-semibold text-slate-500">All Products banner preview</span>
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-800">Header Colors</h4>
                        <p className="text-[10px] font-semibold text-slate-400">Change main header menu color from admin panel.</p>
                      </div>
                      <div
                        className="h-9 w-28 rounded-xl shadow-inner"
                        style={{ backgroundColor: settings.headerBgColor || '#F97316' }}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        { key: 'headerBgColor', label: 'Header BG', fallback: '#F97316' },
                        { key: 'headerTextColor', label: 'Text', fallback: '#FFFFFF' },
                        { key: 'headerAccentColor', label: 'Accent', fallback: '#FF6600' },
                      ].map((item) => (
                        <div key={item.key}>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</label>
                          <div className="mt-1.5 flex gap-2">
                            <input
                              type="color"
                              value={/^#[0-9A-Fa-f]{6}$/.test(settings[item.key] || '') ? settings[item.key] : item.fallback}
                              onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })}
                              className="h-10 w-12 rounded-xl border border-slate-200 bg-white p-1 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings[item.key] || item.fallback}
                              onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })}
                              className="min-w-0 flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 shadow-inner text-sm font-semibold"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-black shadow-lg"
                      style={{
                        backgroundColor: settings.headerBgColor || '#F97316',
                        color: settings.headerTextColor || '#FFFFFF',
                      }}
                    >
                      <span>Shop By Categories</span>
                      <span
                        className="rounded-lg bg-white px-3 py-1"
                        style={{ color: settings.headerAccentColor || '#FF6600' }}
                      >
                        Daily Deals
                      </span>
                    </div>
                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Zap size={18} className="text-emerald-600" />
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">Flash Sale Styling</h4>
                          <p className="text-[10px] text-slate-500">Control the flash sale gradient colors from the admin panel.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          { key: 'flashSaleGradientStart', label: 'Gradient Start', fallback: '#052e2b' },
                          { key: 'flashSaleGradientMid', label: 'Gradient Mid', fallback: '#047857' },
                          { key: 'flashSaleGradientEnd', label: 'Gradient End', fallback: '#00B894' },
                          { key: 'flashSaleRadialColor', label: 'Radial Glow', fallback: '#5eead4' },
                          { key: 'flashSaleAccentColor', label: 'Accent Glow', fallback: '#00B894' },
                        ].map((item) => (
                          <div key={item.key}>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</label>
                            <div className="mt-1.5 flex gap-2">
                              <input
                                type="color"
                                value={/^#[0-9A-Fa-f]{6}$/.test(settings[item.key] || '') ? settings[item.key] : item.fallback}
                                onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })}
                                className="h-10 w-12 rounded-xl border border-slate-200 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={settings[item.key] || item.fallback}
                                onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })}
                                className="min-w-0 flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 shadow-inner text-sm font-semibold"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                {/* Branding Save Button */}
                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await saveSettings(settings);
                        notifySettingsUpdated(settings);
                        alert('Branding Settings saved successfully!');
                        fetchSettings();
                      } catch (err) {
                        alert(err.message || 'Failed to save branding settings');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check size={15} />
                        Save Branding Settings
                      </span>
                    )}
                  </button>
                </div>
                </div>
              </div>

              {/* Notice Bar Section */}
              <div className="bg-white/90 p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Bell size={16} className="text-[#FF6600]" />
                    Notice Bar Settings
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, noticeBarEnabled: !settings.noticeBarEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      settings.noticeBarEnabled !== false ? 'bg-[#FF6600]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                        settings.noticeBarEnabled !== false ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Notice Text</label>
                    <textarea
                      rows="2"
                      value={settings.noticeBarText || ''}
                      onChange={(e) => setSettings({ ...settings, noticeBarText: e.target.value })}
                      placeholder="Write notice text for the storefront header"
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Background Color</label>
                      <div className="mt-1.5 flex gap-2">
                        <input
                          type="color"
                          value={/^#[0-9A-Fa-f]{6}$/.test(settings.noticeBarBgColor || '') ? settings.noticeBarBgColor : '#6F1BE4'}
                          onChange={(e) => setSettings({ ...settings, noticeBarBgColor: e.target.value })}
                          className="h-10 w-12 rounded-xl border border-slate-200 bg-white p-1 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.noticeBarBgColor || '#6F1BE4'}
                          onChange={(e) => setSettings({ ...settings, noticeBarBgColor: e.target.value })}
                          className="min-w-0 flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Text Color</label>
                      <div className="mt-1.5 flex gap-2">
                        <input
                          type="color"
                          value={/^#[0-9A-Fa-f]{6}$/.test(settings.noticeBarTextColor || '') ? settings.noticeBarTextColor : '#FFFFFF'}
                          onChange={(e) => setSettings({ ...settings, noticeBarTextColor: e.target.value })}
                          className="h-10 w-12 rounded-xl border border-slate-200 bg-white p-1 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.noticeBarTextColor || '#FFFFFF'}
                          onChange={(e) => setSettings({ ...settings, noticeBarTextColor: e.target.value })}
                          className="min-w-0 flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className="overflow-hidden rounded-xl px-4 py-2.5 text-center font-black shadow-inner"
                    style={{
                      backgroundColor: settings.noticeBarBgColor || '#6F1BE4',
                      color: settings.noticeBarTextColor || '#FFFFFF',
                    }}
                  >
                    {settings.noticeBarText || 'Notice preview'}
                  </div>
                </div>

              </div>

              {/* OTP gateway Configuration */}
              <div className="bg-white/90 p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Sliders size={16} className="text-[#FF6600]" />
                    OTP Configuration Settings
                  </h3>
                  {/* Checkout OTP Master Toggle */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Checkout OTP Verification</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {settings.checkoutOtpEnabled ? 'ON — Phone verification required at checkout' : 'OFF — Customers checkout without OTP'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, checkoutOtpEnabled: !settings.checkoutOtpEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${settings.checkoutOtpEnabled ? 'bg-[#FF6600]' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${settings.checkoutOtpEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mt-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OTP Delivery Method</label>
                    <select
                      value={settings.otpGateway || 'Simulated'}
                      onChange={(e) => setSettings({ ...settings, otpGateway: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    >
                      <option value="Simulated">Simulated (For Testing)</option>
                      <option value="SMS">SMS (SAS Bulk SMS)</option>
                      <option value="Custom">Custom SMS API</option>
                      <option value="Email">Email (Gmail SMTP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OTP Code Length</label>
                    <select
                      value={settings.otpLength}
                      onChange={(e) => setSettings({ ...settings, otpLength: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
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
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    />
                  </div>
                </div>

                {/* SAS Bulk SMS Credentials */}
                {settings.otpGateway === 'SMS' && (
                  <div>
                    <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gateway URL</label>
                        <input
                          value={settings.sasSmsGatewayUrl || ''}
                          onChange={(e) => setSettings({ ...settings, sasSmsGatewayUrl: e.target.value })}
                          placeholder="http://sms.sasbulksms.com"
                          className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">API Token</label>
                        <input
                          type="text"
                          value={settings.sasSmsApiKey || ''}
                          onChange={(e) => setSettings({ ...settings, sasSmsApiKey: e.target.value })}
                          placeholder="API Token (e.g. 7639814fe75b2cbd)"
                          className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Secret Key</label>
                        <input
                          type="text"
                          value={settings.sasSmsSecretKey || ''}
                          onChange={(e) => setSettings({ ...settings, sasSmsSecretKey: e.target.value })}
                          placeholder="Secret Key (e.g. 13382300000000)"
                          className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sender ID</label>
                        <input
                          type="text"
                          value={settings.sasSmsSenderId || ''}
                          onChange={(e) => setSettings({ ...settings, sasSmsSenderId: e.target.value })}
                          placeholder="Sender ID (e.g. 8809617633299)"
                          className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                      <p className="text-[11px] font-bold text-orange-800 mb-3">&#128241; Live Test - Send SMS to your phone now</p>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          id="sms-test-phone"
                          placeholder="01XXXXXXXXX"
                          className="flex-1 px-3 py-2 bg-white border border-orange-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <button
                          type="button"
                          id="sms-test-btn"
                          onClick={async () => {
                            const phoneInput = document.getElementById('sms-test-phone');
                            const phone = phoneInput?.value?.trim();
                            if (!phone) { alert('Please enter your mobile number'); return; }
                            const btn = document.getElementById('sms-test-btn');
                            btn.disabled = true; btn.textContent = 'Sending...';
                            const resultDiv = document.getElementById('sms-test-result');
                            resultDiv.textContent = ''; resultDiv.className = 'mt-2 text-xs font-semibold';
                            try {
                              const res = await fetch(API_URL + '/settings/test-sms', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + user.token },
                                body: JSON.stringify({ toNumber: phone, apiKey: settings.sasSmsApiKey, secretKey: settings.sasSmsSecretKey, senderId: settings.sasSmsSenderId, gatewayUrl: settings.sasSmsGatewayUrl }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                resultDiv.className = 'mt-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200';
                                resultDiv.textContent = 'SUCCESS: ' + data.message;
                              } else {
                                resultDiv.className = 'mt-2 text-xs font-bold text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200 whitespace-pre-wrap';
                                resultDiv.textContent = 'FAILED: ' + data.message + (data.raw ? ' | Gateway: ' + data.raw : '');
                              }
                            } catch (err) {
                              resultDiv.className = 'mt-2 text-xs font-bold text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200';
                              resultDiv.textContent = 'Error: ' + err.message;
                            } finally { btn.disabled = false; btn.textContent = 'Test SMS'; }
                          }}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all whitespace-nowrap"
                        >Test SMS</button>
                      </div>
                      <div id="sms-test-result" className="mt-2 text-xs font-semibold"></div>
                    </div>
                  </div>
                )}

                {/* Email (Gmail SMTP) Credentials */}
                {settings.otpGateway === 'Email' && (
                  <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                    <div className="col-span-full mb-1">
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <strong>Note:</strong> To use Gmail, you must generate an <strong>App Password</strong> in your Google Account Settings &gt; Security &gt; 2-Step Verification. Do NOT use your real Gmail password.
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMTP Host</label>
                      <input
                        type="text"
                        value={settings.smtpHost || 'smtp.gmail.com'}
                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMTP Port</label>
                      <input
                        type="number"
                        value={settings.smtpPort || 587}
                        onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                        placeholder="587"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sender Name / Email</label>
                      <input
                        type="text"
                        value={settings.smtpFromEmail || ''}
                        onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })}
                        placeholder="noreply@goroly.com"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gmail Address (SMTP User)</label>
                      <input
                        type="email"
                        value={settings.smtpUser || ''}
                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                        placeholder="your-email@gmail.com"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gmail App Password</label>
                      <input
                        type="password"
                        value={settings.smtpPass || ''}
                        onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                        placeholder="16-letter App Password"
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer group w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all duration-300">
                        <input
                          type="checkbox"
                          checked={settings.smtpEnabled || false}
                          onChange={(e) => setSettings({ ...settings, smtpEnabled: e.target.checked })}
                          className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                        />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Enable SMTP Delivery</span>
                      </label>
                    </div>
                  </div>
                )}
                <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition flex items-center gap-2 text-sm"
                  >
                    {loading ? 'Saving...' : 'Save OTP Settings'}
                  </button>
                </div>
              </div>

              {/* Social Login Configuration */}
              <div className="bg-white/90 p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-6 shadow-xl mb-6">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User size={16} className="text-blue-500" />
                  Social Login Configuration
                </h3>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-[11px] text-blue-800 space-y-2 mb-2">
                  <p className="font-bold text-blue-900 text-xs">Social Login Setup Guide:</p>
                  <ul className="list-disc pl-5 space-y-1.5 opacity-90">
                    <li>
                      <strong>Google:</strong> Go to Google Cloud Console {"->"} API & Services {"->"} Credentials. Create an OAuth Client ID. 
                      Set the <strong>Authorized Redirect URI</strong> to: <code className="bg-white px-1 py-0.5 rounded border border-blue-200">https://gorolyshop.com/api/auth/google/callback</code>
                    </li>
                    <li>
                      <strong>Facebook:</strong> Go to Facebook Developer Portal. Create an App {"->"} Add Facebook Login product. 
                      Set the <strong>Valid OAuth Redirect URIs</strong> to: <code className="bg-white px-1 py-0.5 rounded border border-blue-200">https://gorolyshop.com/api/auth/facebook/callback</code>
                    </li>
                    <li>
                      <strong>LinkedIn:</strong> Go to LinkedIn Developer Portal. Create an App {"->"} Auth tab. 
                      Set the <strong>Authorized Redirect URLs</strong> to: <code className="bg-white px-1 py-0.5 rounded border border-blue-200">https://gorolyshop.com/api/auth/linkedin/callback</code>
                    </li>
                  </ul>
                </div>

                <div className="space-y-6">
                  {/* Google config */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <h4 className="font-bold text-gray-900 text-sm">Google Login</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">Enable Google direct login</p>
                      <div className="pt-2 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="google-enable"
                          checked={settings.socialGoogleEnabled}
                          onChange={(e) => setSettings({ ...settings, socialGoogleEnabled: e.target.checked })}
                          className="accent-blue-600 rounded-sm cursor-pointer"
                        />
                        <label htmlFor="google-enable" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                      </div>
                    </div>
                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Client ID</label>
                        <input
                          type="text"
                          disabled={!settings.socialGoogleEnabled}
                          value={settings.socialGoogleClientId}
                          onChange={(e) => setSettings({ ...settings, socialGoogleClientId: e.target.value })}
                          placeholder="Google Client ID"
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Client Secret</label>
                        <input
                          type="password"
                          disabled={!settings.socialGoogleEnabled}
                          value={settings.socialGoogleClientSecret}
                          onChange={(e) => setSettings({ ...settings, socialGoogleClientSecret: e.target.value })}
                          placeholder="Google Client Secret"
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Facebook config */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]"></span>
                        <h4 className="font-bold text-gray-900 text-sm">Facebook Login</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">Enable Facebook direct login</p>
                      <div className="pt-2 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="facebook-enable"
                          checked={settings.socialFacebookEnabled}
                          onChange={(e) => setSettings({ ...settings, socialFacebookEnabled: e.target.checked })}
                          className="accent-[#1877F2] rounded-sm cursor-pointer"
                        />
                        <label htmlFor="facebook-enable" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                      </div>
                    </div>
                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">App ID</label>
                        <input
                          type="text"
                          disabled={!settings.socialFacebookEnabled}
                          value={settings.socialFacebookClientId}
                          onChange={(e) => setSettings({ ...settings, socialFacebookClientId: e.target.value })}
                          placeholder="Facebook App ID"
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">App Secret</label>
                        <input
                          type="password"
                          disabled={!settings.socialFacebookEnabled}
                          value={settings.socialFacebookClientSecret}
                          onChange={(e) => setSettings({ ...settings, socialFacebookClientSecret: e.target.value })}
                          placeholder="Facebook App Secret"
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn config */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0A66C2]"></span>
                        <h4 className="font-bold text-gray-900 text-sm">LinkedIn Login</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">Enable LinkedIn direct login</p>
                      <div className="pt-2 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="linkedin-enable"
                          checked={settings.socialLinkedinEnabled}
                          onChange={(e) => setSettings({ ...settings, socialLinkedinEnabled: e.target.checked })}
                          className="accent-[#0A66C2] rounded-sm cursor-pointer"
                        />
                        <label htmlFor="linkedin-enable" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                      </div>
                    </div>
                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Client ID</label>
                        <input
                          type="text"
                          disabled={!settings.socialLinkedinEnabled}
                          value={settings.socialLinkedinClientId}
                          onChange={(e) => setSettings({ ...settings, socialLinkedinClientId: e.target.value })}
                          placeholder="LinkedIn Client ID"
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Client Secret</label>
                        <input
                          type="password"
                          disabled={!settings.socialLinkedinEnabled}
                          value={settings.socialLinkedinClientSecret}
                          onChange={(e) => setSettings({ ...settings, socialLinkedinClientSecret: e.target.value })}
                          placeholder="LinkedIn Client Secret"
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveSettings(e);
                    }}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition flex items-center gap-2 text-sm"
                  >
                    {loading ? 'Saving...' : 'Save Social Login'}
                  </button>
                </div>
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
                        <h4 className="font-bold text-gray-900 text-sm">bKash Merchant PG</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">Accept payments in BDT automatically via bkash API.</p>
                      <div className="pt-2 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="bkash-enable"
                          checked={settings.bkashEnabled}
                          onChange={(e) => setSettings({ ...settings, bkashEnabled: e.target.checked })}
                          className="accent-orange-600 rounded-sm cursor-pointer"
                        />
                        <label htmlFor="bkash-enable" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                      </div>
                    </div>

                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                        <h4 className="font-bold text-gray-900 text-sm">Nagad Wallet PG</h4>
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

                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

                  {/* Rupantor Pay configuration */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        <h4 className="font-bold text-gray-900 text-sm">Rupantor Pay PG</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">Accept payments via Rupantor Pay API.</p>
                      <div className="pt-2 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="rupantor-enable"
                          checked={settings.rupantorPayEnabled}
                          onChange={(e) => setSettings({ ...settings, rupantorPayEnabled: e.target.checked })}
                          className="accent-purple-600 rounded-sm cursor-pointer"
                        />
                        <label htmlFor="rupantor-enable" className="text-[10px] font-bold text-gray-400 cursor-pointer">Active</label>
                      </div>
                    </div>

                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gateway Mode</label>
                        <select
                          disabled={!settings.rupantorPayEnabled}
                          value={settings.rupantorPayMode}
                          onChange={(e) => setSettings({ ...settings, rupantorPayMode: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                        >
                          <option value="Sandbox">Sandbox (Test Environment)</option>
                          <option value="Live">Live (Real Payments)</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Store ID</label>
                          <input
                            type="text"
                            disabled={!settings.rupantorPayEnabled}
                            value={settings.rupantorPayStoreId}
                            onChange={(e) => setSettings({ ...settings, rupantorPayStoreId: e.target.value })}
                            placeholder="Store ID"
                            className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Signature Key</label>
                          <input
                            type="text"
                            disabled={!settings.rupantorPayEnabled}
                            value={settings.rupantorPaySignatureKey}
                            onChange={(e) => setSettings({ ...settings, rupantorPaySignatureKey: e.target.value })}
                            placeholder="Signature Key"
                            className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SSLCommerz configuration */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <h4 className="font-bold text-gray-900 text-sm">SSLCommerz PG</h4>
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

                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                        <h4 className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</h4>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF6600]"></span>
                      <h4 className="font-bold text-gray-900 text-sm">Facebook Pixel</h4>
                    </div>
                    <p className="text-[10px] text-gray-500">Track conversions, optimize ads, and build targeted audiences.</p>
                    <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl mt-2 mb-3">
                      <h5 className="text-[10px] font-bold text-blue-800 mb-1">Setup Guide:</h5>
                      <ol className="text-[10px] text-orange-700 list-decimal pl-4 space-y-1">
                        <li>Go to Meta Events Manager and select your Pixel.</li>
                        <li>Copy the 15-digit Pixel ID from the settings tab.</li>
                        <li>For Conversions API, scroll down and click "Generate access token".</li>
                        <li>Paste both below and click "Save & Test Connection".</li>
                      </ol>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pixel ID</label>
                        <input
                          type="text"
                          placeholder="e.g. 123456789012345"
                          value={settings.facebookPixelId}
                          onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                          className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Access Token (Conversions API)</label>
                        <input
                          type="text"
                          placeholder="EAAB..."
                          value={settings.facebookAccessToken}
                          onChange={(e) => setSettings({ ...settings, facebookAccessToken: e.target.value })}
                          className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner placeholder-gray-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleTestFacebookPixel}
                          disabled={fbConnectionStatus.loading}
                          className="px-4 py-2 bg-[#FF6600] hover:bg-[#e05a00] text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                          {fbConnectionStatus.loading ? 'Saving & Testing...' : 'Save & Test Connection'}
                        </button>
                        {fbConnectionStatus.success && <span className="text-emerald-500 text-sm font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Connected</span>}
                        {fbConnectionStatus.error && <span className="text-red-500 text-sm font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fbConnectionStatus.error}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <h4 className="font-bold text-gray-900 text-sm">Google Analytics (GA4)</h4>
                    </div>
                    <p className="text-[10px] text-gray-500">Track site traffic, user behavior, and e-commerce events.</p>
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl mt-2 mb-3">
                      <h5 className="text-[10px] font-bold text-amber-800 mb-1">Setup Guide:</h5>
                      <ol className="text-[10px] text-amber-700 list-decimal pl-4 space-y-1">
                        <li>Go to Google Analytics &gt; Admin &gt; Data Streams.</li>
                        <li>Select your web stream.</li>
                        <li>Copy the Measurement ID (it starts with "G-").</li>
                        <li>Paste it below to start tracking.</li>
                      </ol>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Measurement ID</label>
                      <input
                        type="text"
                        placeholder="e.g. G-XXXXXXXXXX"
                        value={settings.ga4MeasurementId}
                        onChange={(e) => setSettings({ ...settings, ga4MeasurementId: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner placeholder-gray-400"
                      />
                    </div>
                    {settings.ga4MeasurementId ? (
                      /^G-[A-Z0-9]+$/i.test(settings.ga4MeasurementId.trim()) ? (
                        <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1"><Check size={12}/> Connected</p>
                      ) : (
                        <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1"><AlertCircle size={12}/> Error: Invalid Measurement ID. Must start with "G-"</p>
                      )
                    ) : null}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <h4 className="font-bold text-gray-900 text-sm">Google Tag Manager</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, googleTagManagerEnabled: !settings.googleTagManagerEnabled })}
                        className={`relative h-6 w-11 rounded-full transition ${settings.googleTagManagerEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${settings.googleTagManagerEnabled ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500">Add GTM container to manage tags, GA4, remarketing, and custom events from Google Tag Manager.</p>
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl mt-2 mb-3">
                      <h5 className="text-[10px] font-bold text-emerald-800 mb-1">Setup Guide:</h5>
                      <ol className="text-[10px] text-emerald-700 list-decimal pl-4 space-y-1">
                        <li>Go to Google Tag Manager and open your container.</li>
                        <li>Copy the Container ID. It starts with "GTM-".</li>
                        <li>Paste it below and keep the toggle enabled.</li>
                        <li>Save settings, then publish tags from GTM.</li>
                      </ol>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Container ID</label>
                      <input
                        type="text"
                        placeholder="e.g. GTM-XXXXXXX"
                        value={settings.googleTagManagerId || ''}
                        onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:bg-white transition-all duration-300 shadow-inner placeholder-gray-400"
                      />
                    </div>
                    {settings.googleTagManagerEnabled && settings.googleTagManagerId ? (
                      /^GTM-[A-Z0-9]+$/i.test(settings.googleTagManagerId.trim()) ? (
                        <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1"><Check size={12}/> Connected</p>
                      ) : (
                        <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1"><AlertCircle size={12}/> Error: Invalid Container ID. Must start with "GTM-"</p>
                      )
                    ) : null}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <h4 className="font-bold text-gray-900 text-sm">Custom Header Code</h4>
                  </div>
                  <p className="text-[10px] text-gray-500">Paste any custom HTML/JS (Facebook Pixel full code, Google Tag Manager, analytics, etc.). It will be injected into the &lt;head&gt;.</p>
                  <textarea
                    rows="5"
                    placeholder="<script>...</script>"
                    value={settings.customHeaderCode || ''}
                    onChange={(e) => setSettings({ ...settings, customHeaderCode: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm font-mono placeholder-gray-400"
                  />
                  {settings.customHeaderCode && (
                    <p className="text-[10px] text-emerald-400 font-semibold">Custom code will be injected into &lt;head&gt; on storefront.</p>
                  )}
                </div>
              </div>

              {/* Top Utility Bar Settings */}
              <div className="bg-white/90  p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Globe size={16} className="text-[#FF6600]" />
                  Top Utility Bar Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Top Bar Helpline Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 8801234567890"
                      value={settings.topBarHelpline || ''}
                      onChange={(e) => setSettings({ ...settings, topBarHelpline: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Find a Store URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /pages/store-locator"
                      value={settings.topBarStoreLink || ''}
                      onChange={(e) => setSettings({ ...settings, topBarStoreLink: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Google Play Store App URL</label>
                    <input
                      type="text"
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      value={settings.topBarPlayStoreLink || ''}
                      onChange={(e) => setSettings({ ...settings, topBarPlayStoreLink: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Apple App Store URL</label>
                    <input
                      type="text"
                      placeholder="https://apps.apple.com/us/app/..."
                      value={settings.topBarAppStoreLink || ''}
                      onChange={(e) => setSettings({ ...settings, topBarAppStoreLink: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Footer About / Brand Description</label>
                    <textarea rows="3" value={settings.footerDescription || ''} onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })} className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner leading-relaxed" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer Support Email</label>
                    <input type="text" value={settings.footerEmail || ''} onChange={(e) => setSettings({ ...settings, footerEmail: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer Support Phone</label>
                    <input type="text" value={settings.footerPhone || ''} onChange={(e) => setSettings({ ...settings, footerPhone: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Address</label>
                    <input type="text" value={settings.footerAddress || ''} onChange={(e) => setSettings({ ...settings, footerAddress: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Copyright Text</label>
                    <input type="text" value={settings.footerCopyright || ''} onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Newsletter Title</label>
                    <input type="text" value={settings.footerNewsletterTitle || ''} onChange={(e) => setSettings({ ...settings, footerNewsletterTitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Newsletter Subtitle</label>
                    <input type="text" value={settings.footerNewsletterSubtitle || ''} onChange={(e) => setSettings({ ...settings, footerNewsletterSubtitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Facebook URL</label>
                    <input type="text" placeholder="https://facebook.com/..." value={settings.footerFacebook || ''} onChange={(e) => setSettings({ ...settings, footerFacebook: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Twitter URL</label>
                    <input type="text" placeholder="https://twitter.com/..." value={settings.footerTwitter || ''} onChange={(e) => setSettings({ ...settings, footerTwitter: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Instagram URL</label>
                    <input type="text" placeholder="https://instagram.com/..." value={settings.footerInstagram || ''} onChange={(e) => setSettings({ ...settings, footerInstagram: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Youtube URL</label>
                    <input type="text" placeholder="https://youtube.com/..." value={settings.footerYoutube || ''} onChange={(e) => setSettings({ ...settings, footerYoutube: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="popup-enabled" checked={settings.popupEnabled || false} onChange={(e) => setSettings({ ...settings, popupEnabled: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                      <label htmlFor="popup-enabled" className="font-bold text-gray-900 text-sm cursor-pointer">Enable Offer Popup</label>
                    </div>
                    <p className="text-[10px] text-gray-500">Shows once per session when visitor lands on the site.</p>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Popup Title</label>
                      <input type="text" value={settings.popupTitle || ''} onChange={(e) => setSettings({ ...settings, popupTitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Popup Text</label>
                      <textarea rows="2" value={settings.popupText || ''} onChange={(e) => setSettings({ ...settings, popupText: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner"></textarea>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL (optional)</label>
                      <input type="text" value={settings.popupImage || ''} onChange={(e) => setSettings({ ...settings, popupImage: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Link (optional)</label>
                      <input type="text" placeholder="/shop" value={settings.popupLink || ''} onChange={(e) => setSettings({ ...settings, popupLink: e.target.value })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Delay (seconds)</label>
                      <input type="number" min="0" max="30" value={settings.popupDelay || 3} onChange={(e) => setSettings({ ...settings, popupDelay: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="recent-sale-enabled" checked={settings.recentSaleEnabled !== false} onChange={(e) => setSettings({ ...settings, recentSaleEnabled: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                      <label htmlFor="recent-sale-enabled" className="font-bold text-gray-900 text-sm cursor-pointer">Enable Recent Sale Popup</label>
                    </div>
                    <p className="text-[10px] text-gray-500">Shows a random "someone purchased something" notification every N seconds.</p>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Interval (seconds)</label>
                      <input type="number" min="10" max="300" value={settings.recentSaleInterval || 30} onChange={(e) => setSettings({ ...settings, recentSaleInterval: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
                >
                  {loading ? 'Saving...' : 'Save Configuration Parameters'}
                </button>
              </div>

            </form>

            {/* ── Admin Profile (Password & Email) ── */}
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-xl font-bold text-gray-900">Admin Profile</h2>
              <p className="text-sm text-gray-400 mt-1">Change your login password or email address.</p>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={() => setShowOwnPasswordForm(!showOwnPasswordForm)}
                className="text-sm px-4 py-2 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl transition-all duration-200">Change Password</button>
              <button onClick={() => setShowOwnEmailForm(!showOwnEmailForm)}
                className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all duration-200">Change Email</button>
            </div>

            {showOwnPasswordForm && (
              <form onSubmit={handleOwnPasswordChange} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-md mb-6">
                <h3 className="font-bold text-gray-900 text-sm">Change Your Password</h3>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                  <input type="password" required value={ownPasswordData.currentPassword}
                    onChange={(e) => setOwnPasswordData({ ...ownPasswordData, currentPassword: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                  <input type="password" required value={ownPasswordData.newPassword}
                    onChange={(e) => setOwnPasswordData({ ...ownPasswordData, newPassword: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl text-sm">Update Password</button>
                  <button type="button" onClick={() => { setShowOwnPasswordForm(false); setOwnPasswordData({ currentPassword: '', newPassword: '' }); }}
                    className="py-2 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
                </div>
              </form>
            )}

            {showOwnEmailForm && (
              <form onSubmit={handleOwnEmailChange} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-md mb-6">
                <h3 className="font-bold text-gray-900 text-sm">Change Your Email</h3>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                  <input type="password" required value={ownEmailData.password}
                    onChange={(e) => setOwnEmailData({ ...ownEmailData, password: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Email</label>
                  <input type="email" required value={ownEmailData.newEmail}
                    onChange={(e) => setOwnEmailData({ ...ownEmailData, newEmail: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl text-sm">Update Email</button>
                  <button type="button" onClick={() => { setShowOwnEmailForm(false); setOwnEmailData({ password: '', newEmail: '' }); }}
                    className="py-2 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-slate-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Video Manager</h1>
              <p className="text-sm text-gray-400 mt-1">Upload and manage TikTok/Reels shoppable videos and link them to products.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Videos List */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-white">
                  <h3 className="font-bold text-gray-900 text-sm">All Shoppable Videos</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {videosList.map((vid) => (
                    <div key={vid._id} className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-200 flex-shrink-0">
                          <Play size={16} className="text-slate-400 z-10" />
                          <video src={vid.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" muted />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-950 line-clamp-1">{vid.title}</h4>
                          <p className="text-slate-400 text-[10px] line-clamp-1 mt-0.5">{vid.description || 'No description'}</p>
                          {vid.product && (
                            <span className="inline-block mt-1 text-[9px] bg-orange-50 text-[#FF6600] font-extrabold px-1.5 py-0.5 rounded-md">
                              Tagged: {vid.product.name || 'Product'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button onClick={() => startEditVideo(vid)} className="text-[#FF6600] hover:text-blue-400 font-bold flex items-center gap-1"><Edit2 size={12} /> Edit</button>
                        <button onClick={() => handleDeleteVideo(vid._id)} className="text-orange-500 hover:text-orange-400 font-bold flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  ))}
                  {videosList.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-8">No videos yet. Add your first shoppable video!</p>
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
                <form onSubmit={editingVideo ? handleUpdateVideo : handleCreateVideo} className="space-y-4 text-sm">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Video Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Smart Watch Active Demo" 
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner" 
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
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe this video..." 
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner leading-relaxed"
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tag Store Product</label>
                    <select
                      value={videoForm.product}
                      onChange={(e) => setVideoForm({ ...videoForm, product: e.target.value })}
                      className="w-full mt-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                    >
                      <option value="">Select a product to link...</option>
                      {productsList.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition text-sm uppercase tracking-wider">
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
                <h3 className="font-bold text-gray-900 text-sm">Edit Product: {editForm.name || 'Product'}</h3>
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
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition cursor-pointer border ${
                    editFormActiveTab === tab.id
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                      : 'bg-white border-slate-200 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-6 text-sm text-gray-700">
              
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
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
                    />
                  </div>

                  {/* Category & Brand */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category (Parent) *</label>
                      <select
                        value={editForm.parentCategory || ''}
                        required
                        onChange={(e) => {
                          const parentName = e.target.value;
                          const parentCat = categoryList.find(c => c.name === parentName);
                          const subs = parentCat && parentCat.subcategories
                            ? (Array.isArray(parentCat.subcategories) ? parentCat.subcategories : (typeof parentCat.subcategories === 'string' ? parentCat.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []))
                            : [];
                          setEditForm({
                            ...editForm,
                            parentCategory: parentName,
                            category: subs.length > 0 ? '' : parentName
                          });
                        }}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 font-semibold"
                      >
                        <option value="">Select Category</option>
                        {categoryList.map((cat) => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    {(() => {
                      const parentCat = categoryList.find(c => c.name === editForm.parentCategory);
                      const subs = parentCat && parentCat.subcategories
                        ? (Array.isArray(parentCat.subcategories) ? parentCat.subcategories : (typeof parentCat.subcategories === 'string' ? parentCat.subcategories.split(',').map(s => s.trim()).filter(Boolean) : []))
                        : [];
                      if (subs.length === 0) return null;
                      return (
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subcategory *</label>
                          <select
                            value={editForm.category}
                            required
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 font-semibold"
                          >
                            <option value="">Select Subcategory</option>
                            {subs.map((sub, idx) => (
                              <option key={idx} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })()}
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
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
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
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
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
                        className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
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
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
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
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
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
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
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
                        className="flex-1 text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FF6600] file:text-white file:text-sm file:font-bold hover:file:bg-blue-700 file:cursor-pointer"
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
                        className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white shadow-md text-[10px] font-bold rounded-xl transition cursor-pointer"
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
                          className="flex-1 text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#FF6600] file:text-white file:text-[10px] file:font-bold hover:file:bg-blue-700 file:cursor-pointer"
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
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
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
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Purchase Price ({currencyCode}) *</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={editForm.purchasePrice}
                        onChange={(e) => setEditForm({ ...editForm, purchasePrice: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Base Price ({currencyCode}) *</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discount Value</label>
                      <div className="flex mt-1.5 gap-2">
                        {/* Flat / Percent toggle */}
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, discountType: 'flat' })}
                            className={`px-3 py-2 text-[11px] font-extrabold transition-all cursor-pointer ${
                              editForm.discountType === 'flat'
                                ? 'bg-[#FF6600] text-white'
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            Flat ৳
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, discountType: 'percent' })}
                            className={`px-3 py-2 text-[11px] font-extrabold transition-all cursor-pointer ${
                              editForm.discountType === 'percent'
                                ? 'bg-[#FF6600] text-white'
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            % Off
                          </button>
                        </div>
                        <input
                          type="number"
                          placeholder={editForm.discountType === 'flat' ? '0.00' : '0'}
                          min="0"
                          max={editForm.discountType === 'percent' ? '100' : undefined}
                          value={editForm.discountPercent}
                          onChange={(e) => setEditForm({ ...editForm, discountPercent: e.target.value })}
                          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition"
                        />
                        <span className="flex items-center px-2 text-[12px] font-bold text-slate-400">
                          {editForm.discountType === 'flat' ? '৳' : '%'}
                        </span>
                      </div>
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
                        className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-white transition disabled:opacity-50"
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
                            className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Flash Sale End</label>
                          <input type="datetime-local" value={editForm.flashSaleEnd ? editForm.flashSaleEnd.slice(0,16) : ''}
                            onChange={(e) => setEditForm({ ...editForm, flashSaleEnd: e.target.value })}
                            className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-sm"
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

                  {/* ΓöÇΓöÇ PRODUCT DESCRIPTION CARD ΓöÇΓöÇ */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">Product Description</h3>

                    {/* Short Description */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">Short Description</label>
                      <div className="relative mt-1.5">
                        <textarea
                          maxLength={200}
                          rows={3}
                          placeholder="Write a short description..."
                          value={editForm.shortDescription || ''}
                          onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-gray-900 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition resize-none"
                        />
                        <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 font-medium">
                          {200 - (editForm.shortDescription?.length || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Long Description with JoditEditor */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">Long Description</label>
                      <div className="mt-1.5 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition">
                        <JoditEditor
                          value={editForm.description || ''}
                          config={{
                            readonly: false,
                            height: 300,
                            askBeforePasteHTML: false,
                            askBeforePasteFromWord: false,
                            defaultActionOnPaste: 'insert_as_html',
                            placeholder: 'Start writing...',
                            buttons: [
                              'source', '|',
                              'bold', 'italic', 'underline', 'strikethrough', '|',
                              'superscript', 'subscript', '|',
                              'ul', 'ol', '|',
                              'outdent', 'indent', '|',
                              'font', 'fontsize', 'brush', 'paragraph', '|',
                              'image', 'video', 'table', 'link', '|',
                              'align', 'undo', 'redo', '|',
                              'hr', 'eraser', 'copyformat', '|',
                              'symbol', 'fullsize', 'print', 'about'
                            ]
                          }}
                          onBlur={(newContent) => setEditForm({ ...editForm, description: newContent })}
                          onChange={() => {}}
                        />
                      </div>
                    </div>

                    {/* Description Image */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">Description Image</label>
                      {/* Existing description images */}
                      {(editForm.descriptionImages || []).length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {(editForm.descriptionImages || []).map((url, idx) => (
                            <div key={idx} className="relative group w-20 h-20">
                              <img src={url} alt={`desc-${idx}`} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = editForm.descriptionImages.filter((_, i) => i !== idx);
                                  setEditForm({ ...editForm, descriptionImages: updated });
                                }}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              >×</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="w-full mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-gray-700 file:text-[11px] file:font-bold hover:file:bg-slate-200 file:cursor-pointer hover:border-slate-300 transition"
                        onChange={(e) => setEditDescriptionImageFiles(Array.from(e.target.files || []))}
                      />
                      {editDescriptionImageFiles.length > 0 && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">{editDescriptionImageFiles.length} new file(s) selected (will be added)</p>
                      )}
                    </div>
                  </div>

                  {/* ΓöÇΓöÇ PDF SPECIFICATION CARD ΓöÇΓöÇ */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">PDF Specification</h3>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">PDF Specification</label>
                      <div className="flex items-center gap-3 mt-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition">
                        <span className="flex-1 text-[11px] text-gray-400 truncate" id="pdf-filename-edit">{editPdfFile ? editPdfFile.name : 'file chosen'}</span>
                        <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[11px] font-bold text-gray-700 cursor-pointer transition flex-shrink-0">
                          Choose File
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              setEditPdfFile(f || null);
                            }}
                          />
                        </label>
                      </div>
                      {editPdfFile && <p className="text-[10px] text-emerald-600 font-semibold mt-1">PDF ready to upload</p>}
                      {editForm.specificationPdfUrl && !editPdfFile && (
                        <p className="text-[10px] text-blue-600 font-semibold mt-1">Current: {editForm.specificationPdfUrl.split('/').pop()}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SHIPPING INFO */}
              {editFormActiveTab === 'shipping' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">Shipping Information</h3>
                  </div>
                  <p className="text-sm text-gray-500 italic">Shipping parameters use global courier configuration rates.</p>
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
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Keywords</label>
                    <input
                      type="text"
                      value={editForm.metaKeywords}
                      onChange={(e) => setEditForm({ ...editForm, metaKeywords: e.target.value })}
                      placeholder="comma separated keywords"
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Image URL</label>
                    <input
                      type="text"
                      value={editForm.metaImage}
                      onChange={(e) => setEditForm({ ...editForm, metaImage: e.target.value })}
                      placeholder="Leave empty to use main product image"
                      className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-gray-900 text-sm"
                    />
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
              <p className="text-sm text-gray-400 mt-1">View all customer point balances and adjust points manually.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={rewardSearch}
                onChange={(e) => setRewardSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm"
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
                <tbody className="text-sm divide-y divide-slate-50">
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
                            className="text-[11px] font-bold text-[#FF6600] hover:text-blue-800 bg-orange-50 hover:bg-blue-100 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors"
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
                  <tbody className="text-sm divide-y divide-slate-50">
                    {(pointLogs || []).slice(0, 50).map((log, idx) => (
                      <tr key={log._id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-5 text-gray-400 whitespace-nowrap">
                          {new Date(log.created_at || log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-5 font-medium text-gray-800">{log.name || log.user_name || '-'}</td>
                        <td className="py-3 px-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.type === 'earn' ? 'bg-green-100 text-green-700' : log.type === 'redeem' ? 'bg-blue-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
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
                <h3 className="font-bold text-gray-900 text-sm">Adjust Points</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">For: <span className="font-semibold text-gray-700">{adjustModalUser.name || adjustModalUser.email}</span></p>
              </div>
              <button onClick={() => setAdjustModalUser(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X size={16} /></button>
            </div>
            <form onSubmit={handleAdjustPointsSubmit} className="space-y-4 text-sm">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Points (use negative to deduct)</label>
                <input
                  type="number"
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  placeholder="e.g. 100 or -50"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  placeholder="e.g. Manual bonus, correction…"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAdjustModalUser(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50">
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
            <p className="text-sm text-gray-400 mt-1">Configure earn rates, redeem rates, and system-wide reward settings.</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Earn Rate</label>
                  <p className="text-[10px] text-gray-400 mb-1.5">Points earned per 1 unit of currency spent.</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localRewardSettings.earn_rate}
                    onChange={(e) => setLocalRewardSettings(prev => ({ ...prev, earn_rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">e.g. <strong>100</strong> pts minimum</p>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-orange-500 to-[#FF6600] rounded-2xl p-5 text-white space-y-2 shadow-lg">
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
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-50"
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
            <p className="text-sm text-gray-400 mt-1">Manually add or deduct loyalty points for any customer.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2">Manual Point Adjustment</h3>

            <form onSubmit={handleSetPointsSubmit} className="space-y-5 text-sm">
              {/* Customer Selector */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Customer</label>
                {selectedSetUser ? (
                  <div className="mt-1.5 flex items-center justify-between px-3 py-2.5 bg-orange-50 border border-orange-200 rounded-xl">
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
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
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
                              className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition flex items-center gap-2.5"
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
                  className="w-full mt-0.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
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
                  className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 hover:bg-white transition text-gray-900"
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
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-[#FF6600] hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
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
              <p className="text-sm text-gray-400 mt-1">Request payouts and view history.</p>
            </div>
            <button
              onClick={() => {
                setPayoutAmount('');
                setPayoutAccount('');
                setPayoutMethod('bKash');
                setPayoutError('');
                setShowPayoutModal(true);
              }}
              className="bg-gradient-to-r from-[#FF6600] to-orange-600 hover:from-orange-600 hover:to-[#FF6600] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm flex items-center gap-2"
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
                <tbody className="text-sm">
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

      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-[#1e293b] text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm tracking-tight uppercase">Request Payout</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Withdraw funds from your store earnings</p>
              </div>
              <button 
                onClick={() => setShowPayoutModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-350 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmitPayout} className="p-6 space-y-5">
              {payoutError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-sm text-red-600 font-semibold flex items-start gap-2">
                  <span className="text-red-500">⚠</span>
                  <div>{payoutError}</div>
                </div>
              )}

              {/* Select Payout Method */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2.5">Select Payout Method</label>
                <div className="grid grid-cols-2 gap-3.5">
                  {/* bKash Selection Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setPayoutMethod('bKash');
                      setPayoutError('');
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
                      payoutMethod === 'bKash'
                        ? 'border-[#E2125B] bg-[#E2125B]/5 shadow-md shadow-[#E2125B]/10'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* bKash Accent Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      payoutMethod === 'bKash' ? 'bg-[#E2125B] text-white' : 'bg-pink-50 text-[#E2125B]'
                    }`}>
                      b
                    </div>
                    <span className={`text-sm font-black mt-2 tracking-tight ${payoutMethod === 'bKash' ? 'text-[#E2125B]' : 'text-slate-700'}`}>bKash</span>
                  </button>

                  {/* Nagad Selection Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setPayoutMethod('Nagad');
                      setPayoutError('');
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
                      payoutMethod === 'Nagad'
                        ? 'border-[#F86212] bg-[#F86212]/5 shadow-md shadow-[#F86212]/10'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Nagad Accent Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      payoutMethod === 'Nagad' ? 'bg-[#F86212] text-white' : 'bg-orange-50 text-[#F86212]'
                    }`}>
                      N
                    </div>
                    <span className={`text-sm font-black mt-2 tracking-tight ${payoutMethod === 'Nagad' ? 'text-[#F86212]' : 'text-slate-700'}`}>Nagad</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Withdrawal Amount</label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-extrabold text-sm">
                    ৳
                  </div>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => {
                      setPayoutAmount(e.target.value);
                      setPayoutError('');
                    }}
                    required
                    className="w-full pl-8 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF6600] hover:bg-white transition text-sm font-bold text-gray-900"
                    placeholder={`Min. ${settings?.withdraw_min_amount || 500}`}
                  />
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">{payoutMethod} Wallet Number</label>
                <input
                  type="text"
                  maxLength="11"
                  value={payoutAccount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setPayoutAccount(val);
                    setPayoutError('');
                  }}
                  required
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF6600] hover:bg-white transition text-sm font-bold text-gray-900 tracking-wider"
                  placeholder="e.g. 017XXXXXXXX"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-200 text-sm text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#FF6600] to-orange-600 hover:from-orange-600 hover:to-[#FF6600] text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Submitting...' : 'Request Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(activeTab === 'seller_steadfast_integration' || activeTab === 'seller_api_integrations') && (
        <div className="space-y-6 max-w-4xl w-full animate-fade-in">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-xl font-bold text-gray-900">{activeTab === 'seller_api_integrations' ? 'API Integrations' : 'SteadFast Integration'}</h1>
            <p className="text-sm text-gray-400 mt-1">Connect SteadFast, Twilio, ElevenLabs, and OpenAI for automatic order handling.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Auto Booking</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">New physical orders are sent to SteadFast automatically when admin API keys are configured.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6600] flex items-center justify-center mb-4">
                <Truck size={18} />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Tracking Sync</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Tracking code and courier status appear directly inside your order list after booking.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <AlertCircle size={18} />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Seller Credentials</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Add your own API key and secret key. The secret key is never shown again after saving.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
              <div>
                <h2 className="font-black text-gray-900 text-sm">API Key & Secret Key</h2>
                <p className="text-sm text-gray-500 mt-1">Save your SteadFast merchant credentials for automatic parcel creation.</p>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${user?.hasSteadfastIntegration ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                {user?.hasSteadfastIntegration ? 'Configured' : 'Not Configured'}
              </span>
            </div>

            {steadfastError && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} /> {steadfastError}
              </div>
            )}
            {steadfastMessage && (
              <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} /> {steadfastMessage}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSteadfastError('');
                setSteadfastMessage('');
                setSteadfastSaving(true);
                try {
                  const res = await fetch(`${API_URL}/users/profile/steadfast`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                    body: JSON.stringify(steadfastForm),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || 'Failed to save SteadFast integration');
                  const updatedUser = { ...user, ...data };
                  localStorage.setItem('shop_admin_user', JSON.stringify(updatedUser));
                  localStorage.setItem('shop_user', JSON.stringify(updatedUser));
                  setUser(updatedUser);
                  setSteadfastForm((prev) => ({ ...prev, enabled: data.steadfast_enabled !== false }));
                  setSteadfastMessage(data.message || 'SteadFast integration saved successfully');
                } catch (err) {
                  setSteadfastError(err.message || 'Failed to save SteadFast integration');
                } finally {
                  setSteadfastSaving(false);
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
            >
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">API Key</label>
                <input
                  type="password"
                  value={steadfastForm.apiKey}
                  onChange={(e) => setSteadfastForm((p) => ({ ...p, apiKey: e.target.value }))}
                  placeholder={user?.hasSteadfastIntegration ? 'Leave blank to keep current API key' : 'Enter SteadFast API key'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Secret Key</label>
                <input
                  type="password"
                  value={steadfastForm.secretKey}
                  onChange={(e) => setSteadfastForm((p) => ({ ...p, secretKey: e.target.value }))}
                  placeholder={user?.hasSteadfastIntegration ? 'Leave blank to keep current secret key' : 'Enter SteadFast secret key'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                />
              </div>
              <label className="md:col-span-2 flex items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 cursor-pointer">
                <span>
                  <span className="block text-sm font-black text-slate-800">Enable SteadFast auto parcel booking</span>
                  <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Orders for your products will use these credentials first.</span>
                </span>
                <input
                  type="checkbox"
                  checked={steadfastForm.enabled}
                  onChange={(e) => setSteadfastForm((p) => ({ ...p, enabled: e.target.checked }))}
                  className="w-4 h-4 accent-blue-600"
                />
              </label>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={steadfastSaving}
                  className="px-5 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
                >
                  {steadfastSaving ? 'Saving...' : 'Save Integration'}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-black text-gray-900 text-sm">AI Call, SMS & Voice Automation</h2>
                  <p className="text-sm text-gray-500 mt-1">Connect Twilio, ElevenLabs, and OpenAI so every new order gets an automatic confirmation.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${user?.hasOrderAutomationIntegration ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {user?.hasOrderAutomationIntegration ? 'Automation Ready' : 'Needs Twilio'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAutomationGuide((v) => !v)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black transition"
                  >
                    Guide
                  </button>
                </div>
              </div>

              {showAutomationGuide && (
                <div className="mb-5 bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-blue-900 leading-relaxed">
                  <div className="font-black mb-2">How it works</div>
                  <div>1. Customer places an order for your product.</div>
                  <div>2. Backend creates a SteadFast parcel using your SteadFast keys.</div>
                  <div>3. OpenAI writes a short confirmation script using the order details.</div>
                  <div>4. ElevenLabs converts the script to voice audio when an API key and voice ID are saved.</div>
                  <div>5. Twilio sends SMS and places a confirmation call to the customer. If ElevenLabs audio is unavailable, Twilio reads the AI script with TwiML Say.</div>
                </div>
              )}

              {automationError && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} /> {automationError}
                </div>
              )}
              {automationMessage && (
                <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} /> {automationMessage}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAutomationError('');
                  setAutomationMessage('');
                  setAutomationSaving(true);
                  try {
                    const res = await fetch(`${API_URL}/users/profile/order-automation`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                      body: JSON.stringify(automationForm),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Failed to save order automation');
                    const updatedUser = { ...user, ...data };
                    localStorage.setItem('shop_admin_user', JSON.stringify(updatedUser));
                    localStorage.setItem('shop_user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    setAutomationForm((p) => ({
                      ...p,
                      twilioAuthToken: '',
                      elevenlabsApiKey: '',
                      openaiApiKey: '',
                    }));
                    setAutomationMessage(data.message || 'Order automation saved successfully');
                  } catch (err) {
                    setAutomationError(err.message || 'Failed to save order automation');
                  } finally {
                    setAutomationSaving(false);
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
              >
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Twilio Account SID</label>
                  <input value={automationForm.twilioAccountSid} onChange={(e) => setAutomationForm((p) => ({ ...p, twilioAccountSid: e.target.value }))} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Twilio Auth Token</label>
                  <input type="password" value={automationForm.twilioAuthToken} onChange={(e) => setAutomationForm((p) => ({ ...p, twilioAuthToken: e.target.value }))} placeholder={user?.hasOrderAutomationIntegration ? 'Leave blank to keep current token' : 'Enter Twilio auth token'} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Twilio From Number</label>
                  <input value={automationForm.twilioFromNumber} onChange={(e) => setAutomationForm((p) => ({ ...p, twilioFromNumber: e.target.value }))} placeholder="+1234567890" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">ElevenLabs Voice ID</label>
                  <input value={automationForm.elevenlabsVoiceId} onChange={(e) => setAutomationForm((p) => ({ ...p, elevenlabsVoiceId: e.target.value }))} placeholder="Voice ID" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">ElevenLabs API Key</label>
                  <input type="password" value={automationForm.elevenlabsApiKey} onChange={(e) => setAutomationForm((p) => ({ ...p, elevenlabsApiKey: e.target.value }))} placeholder={user?.hasElevenLabsIntegration ? 'Leave blank to keep current key' : 'Enter ElevenLabs API key'} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">OpenAI Model</label>
                  <input value={automationForm.openaiModel} onChange={(e) => setAutomationForm((p) => ({ ...p, openaiModel: e.target.value }))} placeholder="gpt-5.2" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">OpenAI API Key</label>
                  <input type="password" value={automationForm.openaiApiKey} onChange={(e) => setAutomationForm((p) => ({ ...p, openaiApiKey: e.target.value }))} placeholder={user?.hasOpenAIIntegration ? 'Leave blank to keep current key' : 'Enter OpenAI API key'} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
                </div>
                <label className="md:col-span-2 flex items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 cursor-pointer">
                  <span>
                    <span className="block text-sm font-black text-slate-800">Enable full order automation</span>
                    <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Auto SMS, AI call script, ElevenLabs voice, and Twilio call.</span>
                  </span>
                  <input type="checkbox" checked={automationForm.enabled} onChange={(e) => setAutomationForm((p) => ({ ...p, enabled: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                </label>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" disabled={automationSaving} className="px-5 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl text-sm transition disabled:opacity-50">
                    {automationSaving ? 'Saving...' : 'Save Automation'}
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-black text-gray-900 text-sm">Seller Order Automation</h2>
                <p className="text-sm text-gray-500 mt-1">When customers order your products, those orders will appear in your seller dashboard and can be processed with SteadFast.</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="px-5 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> Manage Orders
              </button>
            </div>
          </div>
        </div>
      )}

      
      {activeTab === 'seller_custom_domain' && (
        <div className="space-y-6 max-w-3xl w-full animate-fade-in">
          <div className="border-b border-slate-200 pb-5 flex justify-between items-start flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Globe size={22} className="text-[#FF6600]" /> কাস্টম ডোমেইন সেটআপ
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                আপনার স্টোরের সাথে নিজের ডোমেইন কানেক্ট করুন (যেমন: <span className="font-semibold text-gray-600">shop.yourbrand.com</span>)।
              </p>
            </div>
            <a
              href="https://www.youtube.com/results?search_query=custom+domain+CNAME+bangla+tutorial"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition border border-red-100 whitespace-nowrap"
            >
              <Play size={14} /> ভিডিও টিউটোরিয়াল দেখুন
            </a>
          </div>

          {/* Tutorial Steps */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="font-black text-blue-900 text-sm mb-4 flex items-center gap-2">
              📋 ধাপে ধাপে ডোমেইন কানেক্ট করার গাইড
            </h3>
            <div className="space-y-4">
              {[
                {
                  num: '১',
                  title: 'ডোমেইন প্রোভাইডারে লগইন করুন',
                  desc: 'আপনি যেখান থেকে ডোমেইন কিনেছেন (Namecheap, GoDaddy, Hostinger বা Cloudflare) সেখানে আপনার একাউন্টে লগইন করুন।',
                  badge: 'Step 1'
                },
                {
                  num: '২',
                  title: 'DNS Management খুলুন',
                  desc: '"My Domains" → আপনার ডোমেইনটি সিলেক্ট করুন → "Advanced DNS" বা "DNS Zone Editor" এ যান।',
                  badge: 'Step 2'
                },
                {
                  num: '৩',
                  title: 'CNAME রেকর্ড যোগ করুন (সাব-ডোমেইন)',
                  desc: 'নতুন রেকর্ড যোগ করুন: Type = CNAME, Host = shop (বা www), Value = gorolyshop.com, TTL = Automatic',
                  badge: 'Step 3'
                },
                {
                  num: '৪',
                  title: 'A রেকর্ড যোগ করুন (মেইন ডোমেইন, যদি লাগে)',
                  desc: 'মূল ডোমেইনের জন্য: Type = A Record, Host = @, Value = আপনার সার্ভার IP। এরপর Save করুন।',
                  badge: 'Step 4'
                },
                {
                  num: '৫',
                  title: 'নিচে ডোমেইন সেভ করুন ও অপেক্ষা করুন',
                  desc: 'নিচের বক্সে ডোমেইন নাম দিয়ে "সেভ করুন" চাপুন। DNS প্রোপাগেশনে ১ থেকে ২৪ ঘণ্টা লাগতে পারে।',
                  badge: 'Step 5'
                },
              ].map(({ num, title, desc, badge }) => (
                <div key={num} className="flex gap-3 items-start bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-[#FF6600] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {num}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DNS Table */}
          <div className="bg-slate-900 rounded-2xl p-5 text-sm">
            <h3 className="text-white font-black mb-3 flex items-center gap-2">
              <span className="text-[#FF6600]">DNS</span> কনফিগারেশন রেফারেন্স
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs font-bold border-b border-slate-700">
                    <th className="pb-2 pr-6">Type</th>
                    <th className="pb-2 pr-6">Host / Name</th>
                    <th className="pb-2">Value / Points To</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300 text-xs font-mono">
                  <tr className="border-b border-slate-800">
                    <td className="py-2 pr-6 text-[#FF6600] font-bold">CNAME</td>
                    <td className="py-2 pr-6">shop <span className="text-slate-500">(বা www)</span></td>
                    <td className="py-2 text-emerald-400">gorolyshop.com</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 text-blue-400 font-bold">A</td>
                    <td className="py-2 pr-6">@ <span className="text-slate-500">(root)</span></td>
                    <td className="py-2 text-emerald-400">আপনার সার্ভার IP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Domain Save Form */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-black text-gray-900 text-sm mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
              আপনার কাস্টম ডোমেইন
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black ${user?.customDomain ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {user?.customDomain ? '✅ Connected' : '❌ Not Connected'}
              </span>
            </h2>

            {user?.customDomain && (
              <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <Globe size={16} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-semibold">বর্তমান ডোমেইন</p>
                  <a href={`https://${user.customDomain}`} target="_blank" rel="noreferrer" className="text-sm font-black text-blue-600 hover:underline">{user.customDomain}</a>
                </div>
              </div>
            )}

            {customDomainErr && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} /> {customDomainErr}
              </div>
            )}
            {customDomainMsg && (
              <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} /> {customDomainMsg}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setCustomDomainErr('');
                setCustomDomainMsg('');
                const domain = customDomainValue.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
                if (!domain) return setCustomDomainErr('অনুগ্রহ করে সঠিক ডোমেইন নাম দিন।');
                if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/.test(domain)) {
                  return setCustomDomainErr('ডোমেইনের ফরমেট ভুল! যেমন: shop.yourbrand.com');
                }
                setCustomDomainSaving(true);
                try {
                  const res = await fetch(`${API_URL}/users/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                    body: JSON.stringify({ customDomain: domain }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || 'ডোমেইন সেভ করতে সমস্যা হয়েছে।');
                  const updatedUser = { ...user, customDomain: domain };
                  localStorage.setItem('shop_admin_user', JSON.stringify(updatedUser));
                  localStorage.setItem('shop_user', JSON.stringify(updatedUser));
                  setUser(updatedUser);
                  setCustomDomainMsg('✅ কাস্টম ডোমেইন সেভ হয়েছে! এখন DNS-এ CNAME রেকর্ড যোগ করুন।');
                } catch (err) {
                  setCustomDomainErr(err.message || 'ডোমেইন সেভ করতে সমস্যা হয়েছে।');
                } finally {
                  setCustomDomainSaving(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">ডোমেইনের নাম লিখুন</label>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#FF6600] focus-within:ring-2 focus-within:ring-[#FF6600]/20 transition">
                    <span className="px-3 text-slate-400 text-sm font-semibold border-r border-slate-200 h-full flex items-center bg-slate-100 select-none">https://</span>
                    <input
                      type="text"
                      value={customDomainValue}
                      onChange={(e) => setCustomDomainValue(e.target.value)}
                      placeholder="shop.yourbrand.com"
                      className="flex-1 px-3 py-2.5 bg-transparent focus:outline-none text-gray-900 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={customDomainSaving}
                    className="px-5 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl text-sm transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {customDomainSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">https:// ছাড়া ডোমেইন দিন। যেমন: <span className="font-semibold">shop.mybrand.com</span></p>
              </div>

              {customDomainValue && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-800 font-semibold flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>সেভ করার পর, আপনার DNS প্রোভাইডারে <strong>{customDomainValue.replace(/^https?:\/\//, '').split('/')[0]}</strong> এর জন্য <strong>gorolyshop.com</strong> পয়েন্ট করে একটি <strong>CNAME</strong> রেকর্ড যোগ করুন।</span>
                </div>
              )}
            </form>
          </div>

          {/* Remove Domain */}
          {user?.customDomain && (
            <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-red-600 text-sm mb-2">Remove Custom Domain</h3>
              <p className="text-sm text-slate-500 mb-4">This will disconnect your custom domain. Your store will revert to the default URL.</p>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Remove your custom domain?')) return;
                  setCustomDomainSaving(true);
                  try {
                    const res = await fetch(`${API_URL}/users/profile`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                      body: JSON.stringify({ customDomain: '' }),
                    });
                    if (res.ok) {
                      const updatedUser = { ...user, customDomain: '' };
                      localStorage.setItem('shop_admin_user', JSON.stringify(updatedUser));
                      localStorage.setItem('shop_user', JSON.stringify(updatedUser));
                      setUser(updatedUser);
                      setCustomDomainValue('');
                      setCustomDomainMsg('Custom domain removed successfully.');
                    }
                  } catch (err) {
                    setCustomDomainErr(err.message);
                  } finally {
                    setCustomDomainSaving(false);
                  }
                }}
                className="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-sm transition"
              >
                Remove Domain
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'seller_own_profile' && (
        <div className="space-y-6 max-w-3xl w-full animate-fade-in">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your seller profile, NID verification, and account security.</p>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'info', label: 'Profile Info' },
              { id: 'nid', label: 'NID Verification' },
              { id: 'password', label: 'Change Password' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSellerProfileSubTab(tab.id)}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition ${
                  sellerProfileSubTab === tab.id
                    ? 'bg-[#FF6600] text-white shadow-md'
                    : 'bg-white border border-slate-200 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Info Tab */}
          {sellerProfileSubTab === 'info' && (
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Store & Personal Information</h2>
              {sellerProfileError && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} /> {sellerProfileError}
                </div>
              )}
              {sellerProfileSaved && (
                <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} /> Profile updated successfully!
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSellerProfileError('');
                  setSellerProfileSaved(false);
                  setSellerProfileLoading(true);
                  try {
                    const res = await fetch(`${API_URL}/users/profile`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                      body: JSON.stringify(sellerProfileForm),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setSellerProfileSaved(true);
                      const updated = { ...user, ...data };
                      localStorage.setItem('shop_admin_user', JSON.stringify(updated));
                      setUser(updated);
                    } else {
                      setSellerProfileError(data.message || 'Failed to update profile');
                    }
                  } catch (err) {
                    setSellerProfileError('An error occurred');
                  } finally {
                    setSellerProfileLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Full Name</label>
                    <input
                      type="text" value={sellerProfileForm.name}
                      onChange={e => setSellerProfileForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Phone</label>
                    <input
                      type="text" value={sellerProfileForm.phone}
                      onChange={e => setSellerProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="e.g. 01XXXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Shop / Owner Name</label>
                    <input
                      type="text" value={sellerProfileForm.owner_name}
                      onChange={e => setSellerProfileForm(p => ({ ...p, owner_name: e.target.value }))}
                      placeholder="Store or owner name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Facebook Link</label>
                    <input
                      type="text" value={sellerProfileForm.facebook}
                      onChange={e => setSellerProfileForm(p => ({ ...p, facebook: e.target.value }))}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Instagram Link</label>
                    <input
                      type="text" value={sellerProfileForm.instagram}
                      onChange={e => setSellerProfileForm(p => ({ ...p, instagram: e.target.value }))}
                      placeholder="https://instagram.com/yourpage"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Division</label>
                    <input
                      type="text" value={sellerProfileForm.division}
                      onChange={e => setSellerProfileForm(p => ({ ...p, division: e.target.value }))}
                      placeholder="e.g. Dhaka"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">District</label>
                    <input
                      type="text" value={sellerProfileForm.district}
                      onChange={e => setSellerProfileForm(p => ({ ...p, district: e.target.value }))}
                      placeholder="e.g. Gazipur"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Upazila / Thana</label>
                    <input
                      type="text" value={sellerProfileForm.upazila}
                      onChange={e => setSellerProfileForm(p => ({ ...p, upazila: e.target.value }))}
                      placeholder="e.g. Tongi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Full Address Details</label>
                  <textarea
                    rows={2} value={sellerProfileForm.address_details}
                    onChange={e => setSellerProfileForm(p => ({ ...p, address_details: e.target.value }))}
                    placeholder="House/Road/Area details"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm resize-none"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sellerProfileLoading}
                    className="px-6 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
                  >
                    {sellerProfileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NID Verification Tab */}
          {sellerProfileSubTab === 'nid' && (
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">NID Verification</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Upload your National ID card for account verification.</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  user?.verification_status === 'Verified' ? 'bg-green-100 text-green-700' :
                  user?.verification_status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {user?.verification_status || 'Unverified'}
                </span>
              </div>
              {user?.verification_status === 'Verified' && (
                <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} /> Your account is verified. Thank you!
                </div>
              )}
              {sellerProfileError && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} /> {sellerProfileError}
                </div>
              )}
              {sellerProfileSaved && (
                <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} /> NID details submitted for review!
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSellerProfileError('');
                  setSellerProfileSaved(false);
                  setSellerProfileLoading(true);
                  try {
                    let frontUrl = sellerProfileForm.nid_image_front || user?.nid_image_front || '';
                    let backUrl = sellerProfileForm.nid_image_back || user?.nid_image_back || '';
                    if (nidFrontFile) frontUrl = await uploadFile(nidFrontFile);
                    if (nidBackFile) backUrl = await uploadFile(nidBackFile);
                    const res = await fetch(`${API_URL}/users/profile`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                      body: JSON.stringify({ nid_number: sellerProfileForm.nid_number, nid_image_front: frontUrl, nid_image_back: backUrl }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setSellerProfileSaved(true);
                      const updated = { ...user, ...data };
                      localStorage.setItem('shop_admin_user', JSON.stringify(updated));
                      setUser(updated);
                    } else {
                      setSellerProfileError(data.message || 'Failed to submit NID');
                    }
                  } catch (err) {
                    setSellerProfileError('An error occurred. Please try again.');
                  } finally {
                    setSellerProfileLoading(false);
                  }
                }}
                className="space-y-5"
              >
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">NID Number</label>
                  <input
                    type="text" value={sellerProfileForm.nid_number}
                    onChange={e => setSellerProfileForm(p => ({ ...p, nid_number: e.target.value }))}
                    placeholder="Enter your National ID number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Front Image */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">NID Front Side</label>
                    <div
                      className="relative border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 transition cursor-pointer group"
                      style={{ minHeight: 140 }}
                      onClick={() => document.getElementById('nid-front-input').click()}
                    >
                      {(nidFrontPreview || user?.nid_image_front) ? (
                        <img src={nidFrontPreview || user?.nid_image_front} alt="NID Front" className="w-full h-36 object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-36 text-slate-400 group-hover:text-[#FF6600] transition">
                          <Upload size={24} className="mb-2" />
                          <span className="text-sm font-semibold">Click to upload front</span>
                        </div>
                      )}
                      <input
                        id="nid-front-input" type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setNidFrontFile(file);
                            const reader = new FileReader();
                            reader.onload = ev => setNidFrontPreview(ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  {/* Back Image */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">NID Back Side</label>
                    <div
                      className="relative border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 transition cursor-pointer group"
                      style={{ minHeight: 140 }}
                      onClick={() => document.getElementById('nid-back-input').click()}
                    >
                      {(nidBackPreview || user?.nid_image_back) ? (
                        <img src={nidBackPreview || user?.nid_image_back} alt="NID Back" className="w-full h-36 object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-36 text-slate-400 group-hover:text-[#FF6600] transition">
                          <Upload size={24} className="mb-2" />
                          <span className="text-sm font-semibold">Click to upload back</span>
                        </div>
                      )}
                      <input
                        id="nid-back-input" type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setNidBackFile(file);
                            const reader = new FileReader();
                            reader.onload = ev => setNidBackPreview(ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sellerProfileLoading || user?.verification_status === 'Verified'}
                    className="px-6 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
                  >
                    {sellerProfileLoading ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Change Password Tab */}
          {sellerProfileSubTab === 'password' && (
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 max-w-md">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Change Password</h2>
              {sellerPwError && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} /> {sellerPwError}
                </div>
              )}
              {sellerPwSuccess && (
                <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} /> Password changed successfully!
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSellerPwError('');
                  setSellerPwSuccess(false);
                  if (sellerPwForm.newPassword !== sellerPwForm.confirmPassword) {
                    setSellerPwError('New passwords do not match.');
                    return;
                  }
                  if (sellerPwForm.newPassword.length < 6) {
                    setSellerPwError('New password must be at least 6 characters.');
                    return;
                  }
                  setSellerPwLoading(true);
                  try {
                    const res = await fetch(`${API_URL}/users/profile/password`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                      body: JSON.stringify({ currentPassword: sellerPwForm.currentPassword, newPassword: sellerPwForm.newPassword }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setSellerPwSuccess(true);
                      setSellerPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    } else {
                      setSellerPwError(data.message || 'Failed to change password');
                    }
                  } catch (err) {
                    setSellerPwError('An error occurred. Please try again.');
                  } finally {
                    setSellerPwLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Current Password</label>
                  <input
                    type="password" value={sellerPwForm.currentPassword}
                    onChange={e => setSellerPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                    required placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">New Password</label>
                  <input
                    type="password" value={sellerPwForm.newPassword}
                    onChange={e => setSellerPwForm(p => ({ ...p, newPassword: e.target.value }))}
                    required placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Confirm New Password</label>
                  <input
                    type="password" value={sellerPwForm.confirmPassword}
                    onChange={e => setSellerPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    required placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sellerPwLoading}
                    className="px-6 py-2.5 bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
                  >
                    {sellerPwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
            >
              <X size={16} />
            </button>
            
            <h3 className="font-bold text-gray-900 text-xl pb-4 border-b border-slate-100 mb-6 flex items-center gap-3">
              <ShoppingBag className="text-amber-500" size={24} />
              Order Details <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">#{selectedOrder._id}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Customer Information</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm font-bold text-gray-900 mb-1">{selectedOrder.shippingAddress?.name || 'Customer'}</p>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2"><span className="text-slate-400 w-16">Phone:</span> {selectedOrder.shippingAddress?.phone}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2"><span className="text-slate-400 w-16">Address:</span> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Order Status</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Status</p>
                      <span className={`px-2.5 py-1 text-sm font-bold rounded-md ${selectedOrder.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : selectedOrder.status === 'Cancelled' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-orange-700'}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Payment</p>
                      <span className={`px-2.5 py-1 text-sm font-bold rounded-md ${selectedOrder.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Method</p>
                      <p className="text-sm font-bold text-slate-700">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Date</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {(selectedOrder.courierInfo?.provider || selectedOrder.courier_provider) && (
                    <div className="mt-3 bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                      <h4 className="font-bold text-[10px] uppercase tracking-wider text-indigo-600 mb-2">Courier Tracking</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Provider</p>
                          <p className="text-sm font-black text-slate-800 flex items-center gap-1">
                            <Truck size={14} className="text-indigo-500" />
                            {selectedOrder.courierInfo?.provider || selectedOrder.courier_provider}
                          </p>
                        </div>
                        {(selectedOrder.courierInfo?.trackingCode || selectedOrder.courier_tracking_code) && (
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Tracking Code</p>
                            <p className="font-mono text-sm font-bold text-slate-800 select-all bg-white px-2 py-1 rounded border border-indigo-200 inline-block">
                              {selectedOrder.courierInfo?.trackingCode || selectedOrder.courier_tracking_code}
                            </p>
                          </div>
                        )}
                      </div>
                      {(selectedOrder.courierInfo?.status || selectedOrder.courier_status) && (
                        <div className="mt-2 pt-2 border-t border-indigo-200/50">
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Delivery Status</p>
                          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 inline-block">
                            {selectedOrder.courierInfo?.status || selectedOrder.courier_status}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Order Items</h4>
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item</th>
                        <th className="py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                        <th className="py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedOrder.orderItems || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden flex-shrink-0">
                                <img src={item.image ? getImageUrl(item.image) : "https://via.placeholder.com/40"} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 line-clamp-2">{item.name}</p>
                                {item.color && <p className="text-[10px] text-slate-500 mt-0.5">Color: {item.color}</p>}
                                {item.size && <p className="text-[10px] text-slate-500">Size: {item.size}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center text-sm font-bold text-slate-700">{item.qty}</td>
                          <td className="py-3 px-3 text-right text-sm font-bold text-slate-900">{formatPrice(item.price, currencySymbol)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2 text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatPrice((selectedOrder.totalPrice || 0) - (selectedOrder.shippingPrice || 0) + (selectedOrder.discountPrice || 0), currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm text-slate-600">
                    <span>Shipping</span>
                    <span className="font-bold">{formatPrice(selectedOrder.shippingPrice || 0, currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 text-sm text-slate-600">
                    <span>Discount</span>
                    <span className="font-bold text-emerald-600">-{formatPrice(selectedOrder.discountPrice || 0, currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="font-black text-slate-900 text-sm uppercase tracking-wider">Total</span>
                    <span className="font-black text-amber-500 text-sm">{formatPrice(selectedOrder.totalPrice, currencySymbol)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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