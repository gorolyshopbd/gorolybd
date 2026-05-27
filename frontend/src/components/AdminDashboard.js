'use client';

import React, { useState, useEffect, useContext } from 'react';
import { ShopContext, getImageUrl, formatPrice } from '@/context/ShopContext';
import { 
  ShoppingBag, DollarSign, Users, AlertCircle, Package, ArrowRight,
  CircleDot, Tag, Plus, Check, Truck, CreditCard, ChevronRight, X,
  Sliders, Ship, Globe, MessageCircle, MessageSquare, Eye, EyeOff, LayoutGrid,
  BarChart3, PieChart, TrendingUp, Play, Image as ImageIcon, CheckCircle2, MoreVertical, Edit2, Search,
  FolderOpen, Upload, Trash2, Edit
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RPie, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

export default function AdminDashboard({ onTabChange }) {
  const { API_URL, changeUserEmail, fetchUsers, createUserByAdmin, importSellersByAdmin, updateUserByAdmin, adminResetUserPassword, deleteUserByAdmin, currencySymbol, currencyCode, payouts, fetchPayouts, requestPayout, updatePayoutStatus, sellerSettings, fetchSellerSettings, updateSellerSettings, sellerPackages, fetchSellerPackages, createSellerPackage, updateSellerPackage, deleteSellerPackage } = useContext(ShopContext);
  const [user, setUser] = useState(null);

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

  const revenueData = [];
  const categoryData = [];
  const orderStatusData = [];

  const [productsList, setProductsList] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState({ sellers: true });
  const toggleMenu = (id) => setExpandedMenus(prev => ({...prev, [id]: !prev[id]})); // dashboard, orders, products, coupons, settings
  
  // Product Sub Tab State
  const [productSubTab, setProductSubTab] = useState('all'); // all, category, add, attributes, digital

  // Categories (API-based management)
  const [categoryList, setCategoryList] = useState([]);
  const [catForm, setCatForm] = useState({ name: '', image: '', order: 0 });
  const [editingCat, setEditingCat] = useState(null);
  // Brands (API-based management)
  const [brandList, setBrandList] = useState([]);
  const [brandForm, setBrandForm] = useState({ name: '', image: '', order: 0 });
  const [editingBrand, setEditingBrand] = useState(null);
  // Categories and Attributes (legacy)
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ name: '', values: '' });

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
    topBarStoreLink: '#',
    topBarPlayStoreLink: '#',
    topBarAppStoreLink: '#',
  });

  // Seller Settings local state
  const [localSellerSettings, setLocalSellerSettings] = useState({
    category_based_commission: false,
    seller_based_commission: false,
    message_to_seller_mail: true
  });

  useEffect(() => {
    if (sellerSettings) {
      setLocalSellerSettings(sellerSettings);
    }
  }, [sellerSettings]);

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
    }
  }, [user]);

  useEffect(() => {
    if (user && (activeTab === 'users' || activeTab === 'sellers_all')) fetchAllUsers();
  }, [user, activeTab]);

  // Separate effect for chat polling
  useEffect(() => {
    if (!user || activeTab !== 'chat') return;
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
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
      } catch (e) {}
      throw new Error(errMsg);
    }
    const data = await res.json();
    return data.image;
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
          metaTitle: '',
          metaDescription: '',
          tags: '',
          youtubeUrl: '',
        });
        setImageFile(null);
        setImagePreview('');
        setAdditionalImageFiles([]);
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
        }),
      });
      if (res.ok) {
        alert('Product updated!');
        setEditingProduct(null);
        setEditImageFile(null);
        setEditImagePreview('');
        setEditAdditionalImageFiles([]);
        fetchProducts();
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
      if (res.ok) setCategoryList(await res.json());
    } catch {}
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(catForm),
      });
      if (res.ok) { setCatForm({ name: '', image: '', order: 0 }); fetchCategories(); }
    } catch {}
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/categories/${editingCat._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(catForm),
      });
      if (res.ok) { setEditingCat(null); setCatForm({ name: '', image: '', order: 0 }); fetchCategories(); }
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
        Cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', progress: 'w-full from-rose-400 to-rose-500' },
      };
      
      const theme = statusColors[order.status] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', progress: 'w-0' };
      
      return (
        <tr key={order._id} className="border-b border-transparent hover:bg-gray-50/80 transition group">
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
              <span className="font-bold text-gray-700 text-xs bg-white border border-gray-200 px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                {order.paymentMethod === 'Cash on Delivery' ? <Truck size={12} className="text-gray-400" /> : <CreditCard size={12} className="text-blue-400" />}
                {order.paymentMethod === 'Cash on Delivery' ? 'COD' : order.paymentMethod}
              </span>
              {order.isPaid ? (
                <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">Paid</span>
              ) : (
                <span className="text-[10px] px-2 py-1 rounded-md bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20">Unpaid</span>
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
                      className="px-2 py-1.5 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-bold rounded-lg text-gray-600 flex items-center gap-1 transition shadow-xs"
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
                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all duration-200 ml-1"
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row admin-panel-root">
      
      {/* Modern Dark Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col overflow-y-auto scrollbar-hide">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-sm font-black text-white">S</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-tight">Shopio</div>
                <div className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Admin Panel</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: CircleDot },
            { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: metrics.pendingOrders },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'coupons', label: 'Coupons', icon: Tag, adminOnly: true },
            { id: 'shipping', label: 'Shipping', icon: Ship, adminOnly: true },
            { id: 'categories', label: 'Categories', icon: LayoutGrid, adminOnly: true },
            { id: 'brands', label: 'Brands', icon: Tag, adminOnly: true },
            { id: 'pages', label: 'Pages', icon: Globe, adminOnly: true },
            { id: 'offers', label: 'Offers', icon: TrendingUp, adminOnly: true },
            { id: 'banners', label: 'Banners', icon: Globe, adminOnly: true },
            { id: 'users', label: 'Users', icon: Users, adminOnly: true },
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
            { id: 'settings', label: 'Settings', icon: Sliders, adminOnly: true },
          ].filter(item => {
            if (user && user.role === 'seller') return !item.adminOnly;
            if (user && user.isAdmin) return !item.sellerOnly;
            return true;
          }).map((item) => {
            const Icon = item.icon;
            const hasSub = !!item.subItems;
            const isExpanded = expandedMenus[item.id];
            const isActive = activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab));

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
                    isActive && !hasSub
                      ? 'bg-indigo-500/15 text-indigo-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive && !hasSub
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-slate-800/50 text-slate-500 group-hover:bg-slate-700/50 group-hover:text-slate-300'
                    }`}>
                      <Icon size={15} />
                    </div>
                    <span className={`text-sm ${isActive && !hasSub ? 'font-semibold text-indigo-200' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge > 0 && (
                      <span className="bg-rose-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                        {item.badge}
                      </span>
                    )}
                    {hasSub && (
                      <ChevronRight size={13} className={`transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-slate-300' : 'text-slate-600'
                      }`} />
                    )}
                  </div>
                </button>
                
                {hasSub && isExpanded && (
                  <div className="mt-0.5 ml-5 pl-4 border-l border-slate-700/50 space-y-0.5">
                    {item.subItems.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all duration-200 ${
                          activeTab === sub.id
                            ? 'text-indigo-300 font-semibold bg-indigo-500/10'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-3 py-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex-shrink-0">
              AH
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">Asif Hossain</div>
              <div className="text-[9px] text-slate-500 font-medium truncate">Store Owner</div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('shop_admin_token');
                localStorage.removeItem('shop_admin_user');
                window.location.href = '/admin/login';
              }}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-all duration-200 flex-shrink-0"
              title="Logout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-xs text-gray-500 mt-0.5">Overview & Statistics</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600">01/05/2026 - 31/05/2026</button>
                <button className="px-3 py-1.5 bg-blue-600 rounded-md text-xs font-semibold text-white">Print</button>
              </div>
            </div>

            {/* Metrics Grid with Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Visits', val: metrics.totalOrders * 12, change: '+18.45%', data: [4,2,5,3,6,4,8] },
                { label: 'Impressions', val: metrics.totalProducts * 43, change: '+21.35%', data: [2,4,3,5,4,6,5] },
                { label: 'Conversions', val: metrics.totalOrders, change: '-8.25%', data: [5,3,4,2,5,3,4] },
                { label: 'Downloads', val: metrics.totalCustomers * 2, change: '+12.75%', data: [1,2,3,2,4,3,5] },
              ].map((card, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{card.val.toLocaleString()}</h3>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{card.label}</span>
                    </div>
                  </div>
                  <div className="h-12 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={card.data.map((v,i)=>({name:i, value:v}))}>
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Line Chart */}
              <div className="lg:col-span-2 bg-white p-5 border border-gray-100 rounded-xl shadow-sm">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">Sales Statistics Overview</h3>
                  <p className="text-[10px] text-gray-500">Lorem ipsum is placeholder text commonly used</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'Jan', TotalCost: 40, TotalRevenue: 24 },
                      { name: 'Feb', TotalCost: 30, TotalRevenue: 13 },
                      { name: 'Mar', TotalCost: 20, TotalRevenue: 58 },
                      { name: 'Apr', TotalCost: 27, TotalRevenue: 39 },
                      { name: 'May', TotalCost: 18, TotalRevenue: 48 },
                      { name: 'Jun', TotalCost: 23, TotalRevenue: 38 },
                      { name: 'Jul', TotalCost: 34, TotalRevenue: 43 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="TotalRevenue" stroke="#0f62fe" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="TotalCost" stroke="#34d399" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie/Radar equivalent (Using Pie for now) */}
              <div className="bg-white p-5 border border-gray-100 rounded-xl shadow-sm">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">Net Profit Margin</h3>
                  <p className="text-[10px] text-gray-500">Started collecting data from February 2019</p>
                </div>
                <div className="h-64 flex justify-center items-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPie>
                      <Pie
                        data={[
                          { name: 'Sales', value: 65 },
                          { name: 'Orders', value: 35 }
                        ]}
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#0f62fe" />
                        <Cell fill="#38bdf8" />
                      </Pie>
                      <Tooltip />
                    </RPie>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-gray-900">65%</span>
                    <span className="text-[9px] text-gray-500 uppercase font-bold">Sales</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Table Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Recent Activity</h3>
              <div className="h-32 flex items-center justify-center text-gray-400 text-xs">
                More widget content here...
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white/50 border border-gray-200 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Orders Overview</h1>
                <p className="text-xs text-gray-500 font-medium mt-1">Review orders, manage payment status, and initiate courier shipments.</p>
              </div>
              <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Orders</span>
                <span className="text-lg font-black text-gray-900">{metrics.orders?.length || 0}</span>
              </div>
            </div>
            
            <div className="overflow-x-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
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
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
              {[
                { id: 'all', label: 'All Products' },
                { id: 'category', label: 'Category' },
                { id: 'add', label: 'Add Product' },
                { id: 'attributes', label: 'Attributes' },
                { id: 'digital', label: 'Digital Products' }
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setProductSubTab(subTab.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    productSubTab === subTab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-gray-200 hover:text-gray-900'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            {/* Sub-tab: ALL PRODUCTS LIST */}
            {productSubTab === 'all' && (
              <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 shadow-xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Store Catalog</h3>
                    <p className="text-[10px] text-gray-500">List of all physical and digital goods available.</p>
                  </div>
                  <button 
                    onClick={() => setProductSubTab('add')} 
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>
                <div className="overflow-x-auto p-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="py-3 px-4 rounded-l-xl">Product</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {productsList.map((prod) => (
                        <tr key={prod._id} className="border-b border-transparent hover:bg-gray-50/80 transition group">
                          <td className="py-4 px-4 rounded-l-xl">
                            <div className="flex items-center gap-4">
                              <img src={getImageUrl(prod.image)} className="w-12 h-12 object-cover rounded-xl border border-gray-200 group-hover:scale-105 transition-transform shadow-xs" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900 line-clamp-1">{prod.name}</h4>
                                  {prod.isDigital && (
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase">
                                      Digital
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{prod.category} • {prod.brand}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-extrabold text-gray-900">{formatPrice(prod.price, currencySymbol)}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${prod.countInStock > 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {prod.isDigital ? 'Unlimited' : `${prod.countInStock} Left`}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right rounded-r-xl">
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
                                });
                                setEditingProduct(prod);
                                setEditAdditionalImageFiles([]);
                                setEditImageFile(null);
                                setEditImagePreview('');
                              }}
                              className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-lg font-bold transition mr-2"
                            >
                              <Edit size={14} className="inline mr-1" /> Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this product?')) {
                                  const res = await fetch(`${API_URL}/products/${prod._id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${user.token}` },
                                  });
                                  if (res.ok) {
                                    alert('Product deleted!');
                                    fetchProducts();
                                  } else {
                                    alert('Error deleting product');
                                  }
                                }
                              }}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg font-bold transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab: CATEGORY MANAGER */}
            {productSubTab === 'category' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-base">All Categories</h3>
                    <p className="text-[10px] text-gray-500">Browse categories used for catalog navigation.</p>
                  </div>
                  <div className="divide-y divide-gray-100 text-xs">
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

                <div className="lg:col-span-4 bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">Create Category</h3>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Home Appliances"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
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
              <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 max-w-2xl p-6 sm:p-8 space-y-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Add New Product Details</h3>
                  <p className="text-[10px] text-gray-500">Provide pricing, category, digital links, and catalog description.</p>
                </div>
                <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sony Wireless Earbuds"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Brand</label>
                      <select value={brandList.find((b) => b.name === newProduct.brand) ? newProduct.brand : ''}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value, customBrand: '' })}
                        className="w-full mt-1 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                      >
                        <option value="">Select brand</option>
                        {brandList.map((b) => <option key={b._id} value={b.name}>{b.name}</option>)}
                      </select>
                      <input type="text" placeholder="Or type custom brand" value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Base Price ({currencyCode})</label>
                      <input
                        type="number"
                        required
                        placeholder="99.99"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock Count</label>
                      <input
                        type="number"
                        required={!newProduct.isDigital}
                        placeholder={newProduct.isDigital ? "Unlimited" : "e.g. 25"}
                        disabled={newProduct.isDigital}
                        value={newProduct.isDigital ? '' : newProduct.countInStock}
                        onChange={(e) => setNewProduct({ ...newProduct, countInStock: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category Selector</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                      >
                        <option value="">Select category</option>
                        {categoryList.map((cat) => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discount Percent (%)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newProduct.discountPercent}
                        onChange={(e) => setNewProduct({ ...newProduct, discountPercent: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                  </div>

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
                      {newProduct.image && !imagePreview && (
                        <span className="text-[10px] text-gray-500">Using default image</span>
                      )}
                    </div>
                    {(imagePreview || newProduct.image) && (
                      <div className="mt-2">
                        <img
                          src={imagePreview || newProduct.image}
                          alt="Preview"
                          className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Additional Images (Upload)</label>
                      <button
                        type="button"
                        onClick={() => setAdditionalImageFiles([...additionalImageFiles, null])}
                        className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-[10px] font-bold rounded-xl transition-all duration-200"
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
                        {additionalImageFiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = additionalImageFiles.filter((_, i) => i !== idx);
                              setAdditionalImageFiles(updated);
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Digital Product Option */}
                  <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-2xl space-y-3.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDigital"
                        checked={newProduct.isDigital}
                        onChange={(e) => setNewProduct({ ...newProduct, isDigital: e.target.checked })}
                        className="accent-blue-600 rounded-sm scale-110 cursor-pointer"
                      />
                      <label htmlFor="isDigital" className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider cursor-pointer">
                        Is Digital Product (Downloadable file or link delivery)
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
                          className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="flash"
                      checked={newProduct.isFlashSale}
                      onChange={(e) => setNewProduct({ ...newProduct, isFlashSale: e.target.checked })}
                      className="accent-blue-600 rounded-sm"
                    />
                    <label htmlFor="flash" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer">
                      Promote to Flash Sale List
                    </label>
                  </div>

                  {newProduct.isFlashSale && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Flash Sale Start</label>
                        <input type="datetime-local" value={newProduct.flashSaleStart ? newProduct.flashSaleStart.slice(0,16) : ''}
                          onChange={(e) => setNewProduct({ ...newProduct, flashSaleStart: e.target.value })}
                          className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Flash Sale End</label>
                        <input type="datetime-local" value={newProduct.flashSaleEnd ? newProduct.flashSaleEnd.slice(0,16) : ''}
                          onChange={(e) => setNewProduct({ ...newProduct, flashSaleEnd: e.target.value })}
                          className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Description</label>
                    <textarea
                      required
                      placeholder="Write descriptive content for store details..."
                      rows="3"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                    ></textarea>
                  </div>

                  {/* SEO Section */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">SEO Settings</span>
                      <div className="flex-1 border-t border-gray-200" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Title</label>
                      <input type="text" value={newProduct.metaTitle}
                        onChange={(e) => setNewProduct({ ...newProduct, metaTitle: e.target.value })}
                        placeholder="Leave empty to use product name"
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
                      <textarea rows="2" value={newProduct.metaDescription}
                        onChange={(e) => setNewProduct({ ...newProduct, metaDescription: e.target.value })}
                        placeholder="Brief description for search engines"
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                      ></textarea>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tags (comma-separated)</label>
                      <input type="text" value={newProduct.tags}
                        onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                        placeholder="e.g. fashion, summer, sale, trending"
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">YouTube Video URL (Optional)</label>
                      <input type="text" value={newProduct.youtubeUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, youtubeUrl: e.target.value })}
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition shadow-lg shadow-blue-600/10"
                  >
                    {loading ? 'Adding...' : 'Publish Product to Catalog'}
                  </button>
                </form>
              </div>
            )}

            {/* Sub-tab: ATTRIBUTES */}
            {productSubTab === 'attributes' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-base">Product Attributes</h3>
                    <p className="text-[10px] text-gray-500">Configure sizing, colors, brands, and values for dropdown tags.</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {attributes.map((attr, idx) => (
                      <div key={idx} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-gray-900 text-sm">{attr.name}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {attr.values.map((val, vidx) => (
                            <span key={vidx} className="px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-600 font-semibold rounded-lg">
                              {val}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">Create Attribute</h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Attribute Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Material"
                        value={newAttribute.name}
                        onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Values (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Leather, Cotton, Polyester"
                        value={newAttribute.values}
                        onChange={(e) => setNewAttribute({ ...newAttribute, values: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newAttribute.name || !newAttribute.values) return;
                        const parsedVals = newAttribute.values.split(',').map(x => x.trim()).filter(Boolean);
                        setAttributes([...attributes, { name: newAttribute.name, values: parsedVals }]);
                        setNewAttribute({ name: '', values: '' });
                        alert('Attribute configuration added!');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition"
                    >
                      Save Attribute
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab: DIGITAL PRODUCTS */}
            {productSubTab === 'digital' && (
              <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-base">Digital Assets Manager</h3>
                  <p className="text-[10px] text-gray-500">List of all intangible goods, software keys, courses, and downloads.</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {productsList.filter(p => p.isDigital).map((prod) => (
                    <div key={prod._id} className="p-4 flex items-center justify-between text-xs sm:text-sm hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl(prod.image)} className="w-10 h-10 object-cover rounded-lg bg-white border border-gray-200" />
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
            <div className="lg:col-span-8 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Store Coupons</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] text-gray-500 uppercase font-bold bg-white/50">
                      <th className="py-3 pl-4">Coupon Code</th>
                      <th className="py-3">Discount (%)</th>
                      <th className="py-3">Expiry Date</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponsList.map((cp) => (
                      <tr key={cp._id} className="border-b border-gray-100/30 text-xs hover:bg-gray-50/80 transition-colors duration-200">
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
                              cp.isActive ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/30' : 'bg-rose-950/50 text-rose-400 border-rose-900/30'
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
                            className="text-[10px] font-bold text-rose-400 hover:text-rose-300"
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
            <div className="lg:col-span-4 bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
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
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-mono"
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
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
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
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"
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
            <div className="lg:col-span-8 bg-white/50 border border-gray-200 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="font-black text-gray-900 text-lg tracking-tight">Shipping Methods</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Manage delivery options available during checkout.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-full border border-gray-100 shadow-inner">
                  <Ship className="text-gray-400" size={24} />
                </div>
              </div>
              <div className="overflow-x-auto w-full p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                      <th className="py-3 px-4 rounded-l-xl">Method</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Est. Delivery</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {shippingMethods.map((method) => (
                      <tr key={method._id} className="border-b border-transparent hover:bg-gray-50/80 transition group">
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
                              : 'bg-gray-100 text-gray-500 border-gray-200'
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
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all duration-200"
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

            <div className="lg:col-span-4 bg-white/80 p-8 border border-gray-200 shadow-lg rounded-3xl space-y-6 backdrop-blur-md h-fit">
              <div className="flex items-center gap-2 mb-2 pb-4 border-b border-gray-100">
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
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
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
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Estimated Delivery</label>
                  <input
                    type="text"
                    placeholder="e.g. 3-5 business days"
                    value={newShipping.estimatedDays}
                    onChange={(e) => setNewShipping({ ...newShipping, estimatedDays: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Description (optional)</label>
                  <textarea
                    placeholder="Brief description..."
                    rows="2"
                    value={newShipping.description}
                    onChange={(e) => setNewShipping({ ...newShipping, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner resize-none"
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
        {activeTab === 'categories' && (
          <div className="space-y-8 max-w-4xl w-full">
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Category Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Create and manage categories with images.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {categoryList.map((cat) => (
                <div key={cat._id} className="bg-white/50 border border-gray-200 rounded-3xl p-5 flex flex-col items-center gap-3 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 group backdrop-blur-md">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-xs border border-gray-100 group-hover:scale-105 transition-transform duration-300 bg-white">
                    {cat.image ? (
                      <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="text-center w-full">
                    <h4 className="font-extrabold text-gray-900 text-sm truncate w-full px-2">{cat.name}</h4>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">Order: {cat.order || 0}</span>
                  </div>
                  <div className="flex gap-2 mt-2 w-full">
                    <button onClick={() => { setEditingCat(cat); setCatForm({ name: cat.name, image: cat.image || '', order: cat.order || 0 }); }}
                      className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-lg text-xs font-bold transition flex justify-center items-center gap-1">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDeleteCategory(cat._id)}
                      className="w-8 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all duration-200">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {categoryList.length === 0 && (
                <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-300">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
                    <FolderOpen className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">No categories found.</p>
                  <p className="text-xs text-gray-400 mt-1">Create one below to get started.</p>
                </div>
              )}
            </div>

            {/* Category Form */}
            <form onSubmit={editingCat ? handleUpdateCategory : handleCreateCategory} className="bg-white border border-gray-100 shadow-md rounded-3xl p-6 md:p-8 space-y-5 max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${editingCat ? 'bg-amber-400' : 'bg-blue-500'}`}></div>
                <h3 className="font-black text-gray-900 text-lg">{editingCat ? 'Edit Category' : 'Create New Category'}</h3>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Category Name</label>
                <input required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Electronics, Clothing..."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Category Image</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input value={catForm.image} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                      placeholder="Image URL or Browse..."
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner" />
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
                          if (res.ok) setCatForm({ ...catForm, image: data.image });
                        } catch {}
                      }} />
                  </label>
                </div>
                {catForm.image && (
                  <div className="mt-4 flex justify-center p-4 bg-gray-50 border border-gray-200 border-dashed rounded-2xl">
                    <img src={getImageUrl(catForm.image)} alt="preview" className="h-24 w-24 object-cover rounded-xl shadow-md border border-white" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Display Order</label>
                <input type="number" value={catForm.order} onChange={(e) => setCatForm({ ...catForm, order: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-black rounded-xl shadow-lg shadow-blue-500/30 transition text-sm flex justify-center items-center gap-2">
                  {editingCat ? <><Edit size={16} /> Update Category</> : <><Plus size={16} /> Save Category</>}

                </button>
                {editingCat && (
                  <button type="button" onClick={() => { setEditingCat(null); setCatForm({ name: '', image: '', order: 0 }); }}
                    className="py-2.5 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition text-sm">Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* BRANDS TAB */}
        {activeTab === 'brands' && (
          <div className="space-y-8 max-w-4xl w-full">
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Brand Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Create and manage brands with images.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {brandList.map((brand) => (
                <div key={brand._id} className="bg-white/50 border border-gray-200 rounded-3xl p-5 flex flex-col items-center gap-3 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 group backdrop-blur-md">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-xs border border-gray-100 group-hover:scale-105 transition-transform duration-300 bg-white">
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
                      className="w-8 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all duration-200">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {brandList.length === 0 && (
                <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-300">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
                    <FolderOpen className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">No brands found.</p>
                  <p className="text-xs text-gray-400 mt-1">Create one below to get started.</p>
                </div>
              )}
            </div>

            {/* Brand Form */}
            <form onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand} className="bg-white border border-gray-100 shadow-md rounded-3xl p-6 md:p-8 space-y-5 max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${editingBrand ? 'bg-amber-400' : 'bg-blue-500'}`}></div>
                <h3 className="font-black text-gray-900 text-lg">{editingBrand ? 'Edit Brand' : 'Create New Brand'}</h3>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Brand Name</label>
                <input required value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="e.g. Nike, Apple..."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Brand Image</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input value={brandForm.image} onChange={(e) => setBrandForm({ ...brandForm, image: e.target.value })}
                      placeholder="Image URL or Browse..."
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner" />
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
                  <div className="mt-4 flex justify-center p-4 bg-gray-50 border border-gray-200 border-dashed rounded-2xl">
                    <img src={getImageUrl(brandForm.image)} alt="preview" className="h-24 w-24 object-cover rounded-xl shadow-md border border-white" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Display Order</label>
                <input type="number" value={brandForm.order} onChange={(e) => setBrandForm({ ...brandForm, order: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner" />
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
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              {/* Toolbar */}
              <div className="border-b border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="font-bold text-gray-800 text-sm">Sellers</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 focus:outline-hidden bg-gray-50 min-w-[120px]">
                    <option>Filter by</option>
                  </select>
                  <div className="flex items-center">
                    <input type="text" placeholder="Search" className="border border-gray-200 border-r-0 rounded-l-lg px-3 py-1.5 text-xs w-48 focus:outline-hidden" />
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
                    <tr className="bg-gray-50/80 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 border-b border-gray-100 w-12 text-center">#</th>
                      <th className="py-3 px-4 border-b border-gray-100">Shop Name en</th>
                      <th className="py-3 px-4 border-b border-gray-100">Author</th>
                      <th className="py-3 px-4 border-b border-gray-100">Info</th>
                      <th className="py-3 px-4 border-b border-gray-100 text-center">Shop Publish</th>
                      <th className="py-3 px-4 border-b border-gray-100 text-center">Options</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {allUsers.filter(u => u.role === 'seller').map((seller, index) => (
                      <tr key={seller._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="py-4 px-4 text-center text-gray-500">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-gray-200">
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
            <div className="border-b border-gray-200 pb-5 flex items-center justify-between">
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
              <form onSubmit={handleOwnPasswordChange} className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4 max-w-md">
                <h3 className="font-bold text-gray-900 text-sm">Change Your Password</h3>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                  <input type="password" required value={ownPasswordData.currentPassword}
                    onChange={(e) => setOwnPasswordData({ ...ownPasswordData, currentPassword: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                  <input type="password" required value={ownPasswordData.newPassword}
                    onChange={(e) => setOwnPasswordData({ ...ownPasswordData, newPassword: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
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
              <form onSubmit={handleOwnEmailChange} className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4 max-w-md">
                <h3 className="font-bold text-gray-900 text-sm">Change Your Email</h3>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                  <input type="password" required value={ownEmailData.password}
                    onChange={(e) => setOwnEmailData({ ...ownEmailData, password: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Email</label>
                  <input type="email" required value={ownEmailData.newEmail}
                    onChange={(e) => setOwnEmailData({ ...ownEmailData, newEmail: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl text-sm">Update Email</button>
                  <button type="button" onClick={() => { setShowOwnEmailForm(false); setOwnEmailData({ password: '', newEmail: '' }); }}
                    className="py-2 px-4 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm">Cancel</button>
                </div>
              </form>
            )}

            {/* User List */}
            <div className="bg-white/50 border border-gray-200 rounded-3xl overflow-hidden shadow-md backdrop-blur-md">
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                      <th className="py-3 px-4 rounded-l-xl">User</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Permissions</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {allUsers.filter(u => activeTab === 'sellers_all' ? u.role === 'seller' : true).map((u) => (
                      <tr key={u._id} className="border-b border-transparent hover:bg-gray-50/80 transition group">
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
                            'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>{u.role || 'customer'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(u.permissions || []).slice(0, 3).map((p) => (
                              <span key={p} className="px-2 py-1 bg-gray-100/80 text-gray-500 rounded-lg text-[9px] font-bold border border-gray-200/50">{p}</span>
                            ))}
                            {(u.permissions || []).length > 3 && (
                              <span className="px-2 py-1 bg-gray-100/50 text-gray-500 rounded-lg text-[9px] font-bold border border-gray-200/50">+{u.permissions.length - 3}</span>
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
                                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg font-bold transition">
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
            <form onSubmit={handleCreateUser} className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4 max-w-lg">
              <h3 className="font-bold text-gray-900 text-sm">Create New User</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</label>
                  <input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                  <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <input required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                  <input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</label>
                <select value={userForm.role} onChange={(e) => {
                  const role = e.target.value;
                  setUserForm({ ...userForm, role, permissions: ROLE_PERMS[role] || [] });
                }} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm">
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
                <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-gray-900 text-sm">Edit User</h3>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</label>
                        <input required value={editingUserForm.name} onChange={(e) => setEditingUserForm({ ...editingUserForm, name: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                        <input type="email" required value={editingUserForm.email} onChange={(e) => setEditingUserForm({ ...editingUserForm, email: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                        <input value={editingUserForm.phone} onChange={(e) => setEditingUserForm({ ...editingUserForm, phone: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</label>
                        <select value={editingUserForm.role} onChange={(e) => {
                          const role = e.target.value;
                          setEditingUserForm({ ...editingUserForm, role, permissions: ROLE_PERMS[role] || [] });
                        }} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm">
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

        {/* PAGES TAB */}
        {activeTab === 'pages' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Page Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Create and manage custom pages (About, Contact, Terms, Privacy, etc.).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Pages List */}
              <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">All Pages</h3>
                </div>
                <div className="divide-y divide-gray-100">
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
                        <button onClick={() => handleDeletePage(page._id)} className="text-rose-400 hover:text-rose-300 font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                  {pagesList.length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">No pages yet. Create your first page!</p>
                  )}
                </div>
              </div>

              {/* Page Form */}
              <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">{editingPage ? 'Edit Page' : 'Create Page'}</h3>
                {editingPage && (
                  <button onClick={() => { setEditingPage(null); setPageForm({ title: '', slug: '', content: '', isPublished: false }); }} className="text-[10px] hover:text-gray-900">Cancel edit</button>
                )}
                <form onSubmit={editingPage ? handleUpdatePage : handleCreatePage} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Page Title</label>
                    <input type="text" required placeholder="e.g. About Us" value={pageForm.title}
                      onChange={(e) => setPageForm({ ...pageForm, title: e.target.value, slug: editingPage ? pageForm.slug : e.target.value.toLowerCase().replace(/s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                      className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  {!editingPage && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Slug (auto-generated)</label>
                      <input type="text" required placeholder="about-us" value={pageForm.slug}
                        onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-mono" />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Content (HTML supported)</label>
                    <textarea rows="6" placeholder="Write page content here..." value={pageForm.content}
                      onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs font-mono"></textarea>
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
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Offer Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Create promotional offers and banners for the storefront.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Offers List */}
              <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">All Offers</h3>
                </div>
                <div className="divide-y divide-gray-100">
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
                        <button onClick={() => handleDeleteOffer(offer._id)} className="text-rose-400 hover:text-rose-300 font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                  {offersList.length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">No offers yet.</p>
                  )}
                </div>
              </div>

              {/* Offer Form */}
              <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">{editingOffer ? 'Edit Offer' : 'Create Offer'}</h3>
                {editingOffer && (
                  <button onClick={() => { setEditingOffer(null); setOfferForm({ title: '', description: '', discountPercent: '', image: '', link: '', isActive: true }); }} className="text-[10px] hover:text-gray-900">Cancel edit</button>
                )}
                <form onSubmit={editingOffer ? handleUpdateOffer : handleCreateOffer} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Offer Title</label>
                    <input type="text" required placeholder="e.g. Summer Sale" value={offerForm.title}
                      onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea rows="2" placeholder="Short description..." value={offerForm.description}
                      onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discount %</label>
                      <input type="number" min="0" max="100" placeholder="e.g. 30" value={offerForm.discountPercent}
                        onChange={(e) => setOfferForm({ ...offerForm, discountPercent: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                      <input type="text" placeholder="https://..." value={offerForm.image}
                        onChange={(e) => setOfferForm({ ...offerForm, image: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Link (optional)</label>
                    <input type="text" placeholder="e.g. /shop?category=Fashion" value={offerForm.link}
                      onChange={(e) => setOfferForm({ ...offerForm, link: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
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
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Banner Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Manage homepage slider banners.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">All Banners</h3>
                </div>
                <div className="divide-y divide-gray-100">
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
                        <button onClick={() => handleDeleteBanner(b._id)} className="text-rose-400 hover:text-rose-300 font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                  {bannersList.length === 0 && <p className="text-center text-gray-500 text-xs py-8">No banners yet.</p>}
                </div>
              </div>
              <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">{editingBanner ? 'Edit Banner' : 'Create Banner'}</h3>
                {editingBanner && (
                  <button onClick={() => { setEditingBanner(null); setBannerForm({ title: '', subtitle: '', image: '', link: '', isActive: true, order: 0 }); }} className="text-[10px] hover:text-gray-900">Cancel edit</button>
                )}
                <form onSubmit={editingBanner ? handleUpdateBanner : handleCreateBanner} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Title</label>
                      <input type="text" placeholder="Summer Sale" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order</label>
                      <input type="number" min="0" value={bannerForm.order} onChange={(e) => setBannerForm({ ...bannerForm, order: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subtitle</label>
                    <input type="text" placeholder="Get up to 50% off" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                    <div className="flex gap-2 mt-1">
                      <input type="text" required placeholder="https://..." value={bannerForm.image} onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })} className="flex-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
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
                    <input type="text" placeholder="/shop" value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
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
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Seller Payouts History</h1>
              <p className="text-xs text-gray-400 mt-1">View completed and rejected payout requests.</p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 border-b border-gray-100">Date</th>
                      <th className="py-3 px-4 border-b border-gray-100">Seller</th>
                      <th className="py-3 px-4 border-b border-gray-100">Amount</th>
                      <th className="py-3 px-4 border-b border-gray-100">Method & Details</th>
                      <th className="py-3 px-4 border-b border-gray-100">Transaction ID</th>
                      <th className="py-3 px-4 border-b border-gray-100">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {(payouts || []).filter(p => p.status !== 'pending').map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
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
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Pending Payout Requests</h1>
              <p className="text-xs text-gray-400 mt-1">Approve or reject incoming payout requests from sellers.</p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 border-b border-gray-100">Date</th>
                      <th className="py-3 px-4 border-b border-gray-100">Seller</th>
                      <th className="py-3 px-4 border-b border-gray-100">Amount</th>
                      <th className="py-3 px-4 border-b border-gray-100">Method & Details</th>
                      <th className="py-3 px-4 border-b border-gray-100 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {(payouts || []).filter(p => p.status === 'pending').map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
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
            <div className="border-b border-gray-200 pb-5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-amber-400 rounded-full"></div>
                <h1 className="text-xl font-bold text-gray-900">Seller Settings</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Seller Products Commission Card */}
                <div className="bg-white border border-gray-100 rounded-lg shadow-xs">
                  <div className="p-4 border-b border-gray-100">
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
                <div className="bg-white border border-gray-100 rounded-lg shadow-xs">
                  <div className="p-4 border-b border-gray-100">
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
                <div className="bg-white border border-gray-100 rounded-lg shadow-xs">
                  <div className="p-4 border-b border-gray-100">
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
            <div className="border-b border-gray-200 pb-5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-amber-400 rounded-full"></div>
                <h1 className="text-xl font-bold text-gray-900">Import Sellers</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Import Form */}
              <div className="bg-white border border-gray-100 rounded-lg shadow-xs">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800">Import Sellers</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Import File <span className="text-gray-400">*(.csv/.xlsx/.xls File)</span></label>
                    <div className="flex">
                      <div className="flex-1 border border-gray-200 border-r-0 rounded-l-lg bg-white overflow-hidden flex items-center px-3 text-sm text-gray-500 h-10 truncate">
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
              <div className="bg-white border border-gray-100 rounded-lg shadow-xs h-fit">
                <div className="p-4 border-b border-gray-100">
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
          <div className="space-y-8 max-w-6xl w-full animate-fade-in">
            <h1 className="text-xl font-bold text-gray-900">Subscription Setting</h1>
            <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500">
              Subscription configuration is currently under development. Phase 2 will bring full backend integration.
            </div>
          </div>
        )}
        {activeTab === 'seller_pkg_packages' && (
          <div className="space-y-8 max-w-6xl w-full animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Packages List */}
              <div className="lg:col-span-8 bg-white/50 border border-gray-200 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Seller Packages</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">Create and manage subscription packages for sellers.</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total</span>
                    <span className="text-lg font-black text-gray-900">{sellerPackages?.length || 0}</span>
                  </div>
                </div>
                <div className="overflow-x-auto p-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
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
                        <tr key={pkg._id || pkg.id} className="border-b border-transparent hover:bg-gray-50/80 transition group">
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
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
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
                                  }} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all duration-200">
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
              <div className="lg:col-span-4 bg-white/80 p-8 border border-gray-200 shadow-lg rounded-3xl space-y-6 backdrop-blur-md h-fit">
                <div className="flex items-center gap-2 mb-2 pb-4 border-b border-gray-100">
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
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
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
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner font-mono font-bold"
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
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
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
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-inner"
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
        {activeTab === 'seller_pkg_online_history' && (
          <div className="space-y-8 max-w-6xl w-full animate-fade-in">
            <h1 className="text-xl font-bold text-gray-900">Online Purchase History</h1>
            <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500">
              Online subscription history is currently under development. Phase 2 will bring full backend integration.
            </div>
          </div>
        )}
        {activeTab === 'seller_pkg_offline_history' && (
          <div className="space-y-8 max-w-6xl w-full animate-fade-in">
            <h1 className="text-xl font-bold text-gray-900">Offline Purchase History</h1>
            <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500">
              Offline subscription history is currently under development. Phase 2 will bring full backend integration.
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Support Chat</h1>
              <p className="text-xs text-gray-400 mt-1">View and reply to customer messages in real-time.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><MessageSquare size={16} className="text-blue-500" /> Messages ({chatMessages.filter((m) => !m.isAdmin).length})</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleCloseChat} className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline font-semibold">Close Chat</button>
                  <button onClick={fetchChatMessages} className="text-[10px] text-blue-400 hover:underline">Refresh</button>
                </div>
              </div>
              <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-gray-50/50">
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
              <form onSubmit={handleSendChatReply} className="border-t border-gray-200 p-3 flex gap-2 bg-white">
                <input type="text" placeholder="Type your reply..." value={chatReply} onChange={(e) => setChatReply(e.target.value)} className="flex-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-lg text-xs transition">Send</button>
              </form>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Store Settings & Gateways</h1>
              <p className="text-xs text-gray-400 mt-1">Configure OTP gateways, payment gateways, and analytics tracking (Facebook Pixel &amp; Google GA4).</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">

              {/* Advance Payment Section */}
              <div className="bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
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
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Orders above this amount require advance payment.</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Advance %</label>
                    <input type="number" min="1" max="100" value={settings.advancePaymentPercent || 50} onChange={(e) => setSettings({ ...settings, advancePaymentPercent: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Percentage to pay upfront.</p>
                  </div>
                </div>
              </div>

              {/* Branding Section */}
              <div className="bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                  <LayoutGrid size={16} className="text-blue-500" />
                  Branding Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Site Title</label>
                    <input type="text" value={settings.siteTitle || ''}
                      onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
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
                        className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs font-semibold"
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
                        className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Favicon URL</label>
                    <input type="text" value={settings.faviconUrl || ''}
                      onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    {settings.faviconUrl && (
                      <img src={getImageUrl(settings.faviconUrl)} alt="favicon preview" className="mt-2 w-8 h-8 object-contain rounded border border-gray-300" />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Header Logo URL</label>
                    <input type="text" value={settings.headerLogo || ''}
                      onChange={(e) => setSettings({ ...settings, headerLogo: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    {settings.headerLogo && (
                      <img src={getImageUrl(settings.headerLogo)} alt="header logo preview" className="mt-2 h-10 object-contain rounded border border-gray-300" />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Footer Logo URL</label>
                    <input type="text" value={settings.footerLogo || ''}
                      onChange={(e) => setSettings({ ...settings, footerLogo: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                    {settings.footerLogo && (
                      <img src={getImageUrl(settings.footerLogo)} alt="footer logo preview" className="mt-2 h-10 object-contain rounded border border-gray-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* OTP gateway Configuration */}
              <div className="bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Sliders size={16} className="text-blue-500" />
                  OTP Configuration Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMS/OTP Gateway</label>
                    <select
                      value={settings.otpGateway}
                      onChange={(e) => setSettings({ ...settings, otpGateway: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    >
                      <option value="Simulated">Simulated Gateway (Quick Local Sandbox)</option>
                      <option value="Twilio">Twilio SMS API</option>
                      <option value="Firebase">Firebase Phone Auth</option>
                      <option value="GreenwebSMS">Greenweb SMS Gateway BD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OTP Code Length</label>
                    <select
                      value={settings.otpLength}
                      onChange={(e) => setSettings({ ...settings, otpLength: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
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
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateway Configurations */}
              <div className="bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-6 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                  <CreditCard size={16} className="text-emerald-500" />
                  Payment Gateways Configuration
                </h3>

                <div className="space-y-6">
                  {/* bKash configuration */}
                  <div className="p-5 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
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
                  <div className="p-5 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
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
                  <div className="p-5 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
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
                  <div className="p-5 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-md flex items-center justify-between">
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
              <div className="bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics &amp; Tracking
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
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
                        className="w-full mt-1.5 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner placeholder-gray-400"
                      />
                    </div>
                    {settings.facebookPixelId && (
                      <p className="text-[10px] text-emerald-400 font-semibold">Pixel will be loaded on storefront.</p>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
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
                        className="w-full mt-1.5 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner placeholder-gray-400"
                      />
                    </div>
                    {settings.ga4MeasurementId && (
                      <p className="text-[10px] text-emerald-400 font-semibold">GA4 will be loaded on storefront.</p>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
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
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs font-mono placeholder-gray-400"
                  />
                  {settings.customHeaderCode && (
                    <p className="text-[10px] text-emerald-400 font-semibold">Custom code will be injected into &lt;head&gt; on storefront.</p>
                  )}
                </div>
              </div>

              {/* Top Utility Bar Settings */}
              <div className="bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
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
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Find a Store URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /pages/store-locator"
                      value={settings.topBarStoreLink || ''}
                      onChange={(e) => setSettings({ ...settings, topBarStoreLink: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Google Play Store App URL</label>
                    <input
                      type="text"
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      value={settings.topBarPlayStoreLink || ''}
                      onChange={(e) => setSettings({ ...settings, topBarPlayStoreLink: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Apple App Store URL</label>
                    <input
                      type="text"
                      placeholder="https://apps.apple.com/us/app/..."
                      value={settings.topBarAppStoreLink || ''}
                      onChange={(e) => setSettings({ ...settings, topBarAppStoreLink: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Settings */}
              <div className="bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Globe size={16} className="text-purple-500" />
                  Footer Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                    <input type="text" value={settings.footerEmail || ''} onChange={(e) => setSettings({ ...settings, footerEmail: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                    <input type="text" value={settings.footerPhone || ''} onChange={(e) => setSettings({ ...settings, footerPhone: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Address</label>
                    <input type="text" value={settings.footerAddress || ''} onChange={(e) => setSettings({ ...settings, footerAddress: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Copyright Text</label>
                    <input type="text" value={settings.footerCopyright || ''} onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Newsletter Title</label>
                    <input type="text" value={settings.footerNewsletterTitle || ''} onChange={(e) => setSettings({ ...settings, footerNewsletterTitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Newsletter Subtitle</label>
                    <input type="text" value={settings.footerNewsletterSubtitle || ''} onChange={(e) => setSettings({ ...settings, footerNewsletterSubtitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Facebook URL</label>
                    <input type="text" placeholder="https://facebook.com/..." value={settings.footerFacebook || ''} onChange={(e) => setSettings({ ...settings, footerFacebook: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Twitter URL</label>
                    <input type="text" placeholder="https://twitter.com/..." value={settings.footerTwitter || ''} onChange={(e) => setSettings({ ...settings, footerTwitter: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Instagram URL</label>
                    <input type="text" placeholder="https://instagram.com/..." value={settings.footerInstagram || ''} onChange={(e) => setSettings({ ...settings, footerInstagram: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Youtube URL</label>
                    <input type="text" placeholder="https://youtube.com/..." value={settings.footerYoutube || ''} onChange={(e) => setSettings({ ...settings, footerYoutube: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                  </div>
                </div>
              </div>

              {/* Popup Settings */}
              <div className="bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Offer Popup &amp; Recent Sale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="popup-enabled" checked={settings.popupEnabled || false} onChange={(e) => setSettings({ ...settings, popupEnabled: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                      <label htmlFor="popup-enabled" className="font-bold text-gray-900 text-xs cursor-pointer">Enable Offer Popup</label>
                    </div>
                    <p className="text-[10px] text-gray-500">Shows once per session when visitor lands on the site.</p>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Popup Title</label>
                      <input type="text" value={settings.popupTitle || ''} onChange={(e) => setSettings({ ...settings, popupTitle: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Popup Text</label>
                      <textarea rows="2" value={settings.popupText || ''} onChange={(e) => setSettings({ ...settings, popupText: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"></textarea>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL (optional)</label>
                      <input type="text" value={settings.popupImage || ''} onChange={(e) => setSettings({ ...settings, popupImage: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Link (optional)</label>
                      <input type="text" placeholder="/shop" value={settings.popupLink || ''} onChange={(e) => setSettings({ ...settings, popupLink: e.target.value })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Delay (seconds)</label>
                      <input type="number" min="0" max="30" value={settings.popupDelay || 3} onChange={(e) => setSettings({ ...settings, popupDelay: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-md space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="recent-sale-enabled" checked={settings.recentSaleEnabled !== false} onChange={(e) => setSettings({ ...settings, recentSaleEnabled: e.target.checked })} className="accent-blue-600 rounded-sm cursor-pointer" />
                      <label htmlFor="recent-sale-enabled" className="font-bold text-gray-900 text-xs cursor-pointer">Enable Recent Sale Popup</label>
                    </div>
                    <p className="text-[10px] text-gray-500">Shows a random "someone purchased something" notification every N seconds.</p>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Interval (seconds)</label>
                      <input type="number" min="10" max="300" value={settings.recentSaleInterval || 30} onChange={(e) => setSettings({ ...settings, recentSaleInterval: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
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
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-xl font-bold text-gray-900">Video Manager</h1>
              <p className="text-xs text-gray-400 mt-1">Upload and manage TikTok/Reels shoppable videos and link them to products.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Videos List */}
              <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 shadow-sm">
                <div className="p-5 border-b border-gray-100 bg-white">
                  <h3 className="font-bold text-gray-900 text-sm">All Shoppable Videos</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {videosList.map((vid) => (
                    <div key={vid._id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50 transition">
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
                        <button onClick={() => handleDeleteVideo(vid._id)} className="text-rose-500 hover:text-rose-400 font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                  {videosList.length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">No videos yet. Add your first shoppable video!</p>
                  )}
                </div>
              </div>

              {/* Video Form */}
              <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl p-6 border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">
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
                      className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" 
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
                      className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe this video..." 
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner leading-relaxed"
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tag Store Product</label>
                    <select
                      value={videoForm.product}
                      onChange={(e) => setVideoForm({ ...videoForm, product: e.target.value })}
                      className="w-full mt-1 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-2xl mx-4 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1.5 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                  <input type="text" required value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Brand</label>
                  <select value={brandList.find((b) => b.name === editForm.brand) ? editForm.brand : ''}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                  >
                    <option value="">Select brand</option>
                    {brandList.map((b) => <option key={b._id} value={b.name}>{b.name}</option>)}
                  </select>
                  <input type="text" placeholder="Or type custom brand" value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price ($)</label>
                  <input type="number" required value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock</label>
                  <input type="number" required value={editForm.countInStock}
                    onChange={(e) => setEditForm({ ...editForm, countInStock: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner font-semibold">
                    <option value="">Select category</option>
                    {categoryList.map((cat) => (<option key={cat._id} value={cat.name}>{cat.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discount %</label>
                  <input type="number" value={editForm.discountPercent}
                    onChange={(e) => setEditForm({ ...editForm, discountPercent: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner" />
                </div>
              </div>
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
                  <div className="mt-2">
                    <img
                      src={editImagePreview || getImageUrl(editForm.image)}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>

              {/* Existing Additional Images */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Existing Additional Images</label>
                {editForm.images.length === 0 && (
                  <p className="text-[10px] text-gray-400 italic">No additional images.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {editForm.images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 border border-gray-200 rounded-lg overflow-hidden group">
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
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Upload New Additional Images</label>
                  <button
                    type="button"
                    onClick={() => setEditAdditionalImageFiles([...editAdditionalImageFiles, null])}
                    className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-[10px] font-bold rounded-xl transition-all duration-200"
                  >
                    + Add Slot
                  </button>
                </div>
                {editAdditionalImageFiles.length === 0 && (
                  <p className="text-[10px] text-gray-450 italic">No new files added.</p>
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
                      className="p-1.5 text-gray-550 hover:text-red-400 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea rows="3" required value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner"></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="edit-flash" checked={editForm.isFlashSale}
                  onChange={(e) => setEditForm({ ...editForm, isFlashSale: e.target.checked })}
                  className="accent-blue-600 rounded-sm" />
                <label htmlFor="edit-flash" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer">Flash Sale</label>
              </div>
              {editForm.isFlashSale && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Start</label>
                    <input type="datetime-local" value={editForm.flashSaleStart ? editForm.flashSaleStart.slice(0,16) : ''}
                      onChange={(e) => setEditForm({ ...editForm, flashSaleStart: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">End</label>
                    <input type="datetime-local" value={editForm.flashSaleEnd ? editForm.flashSaleEnd.slice(0,16) : ''}
                      onChange={(e) => setEditForm({ ...editForm, flashSaleEnd: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-xs"
                    />
                  </div>
                </div>
              )}

              {/* SEO Section */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">SEO Settings</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Title</label>
                  <input type="text" value={editForm.metaTitle}
                    onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })}
                    placeholder="Leave empty to use product name"
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
                  <textarea rows="2" value={editForm.metaDescription}
                    onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                    placeholder="Brief description for search engines"
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                  ></textarea>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tags (comma-separated)</label>
                  <input type="text" value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    placeholder="e.g. fashion, summer, sale, trending"
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">YouTube Video URL (Optional)</label>
                  <input type="text" value={editForm.youtubeUrl}
                    onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    className="w-full mt-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:bg-white transition-all duration-300 shadow-inner text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold rounded-xl transition">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {activeTab === 'seller_own_payouts' && (
        <div className="space-y-6 max-w-7xl w-full animate-fade-in">
          <div className="border-b border-gray-200 pb-5 flex justify-between items-center">
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
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4 border-b border-gray-100">Date</th>
                    <th className="py-3 px-4 border-b border-gray-100">Amount</th>
                    <th className="py-3 px-4 border-b border-gray-100">Method & Details</th>
                    <th className="py-3 px-4 border-b border-gray-100">Transaction ID</th>
                    <th className="py-3 px-4 border-b border-gray-100">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {(payouts || []).map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
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

      <style>{`
        /* Custom Admin Panel Enlargement Styles */
        .admin-panel-root aside nav button {
          padding: 0.85rem 1.25rem !important;
          font-size: 1rem !important;
          font-weight: 700 !important;
          border-radius: 0.875rem !important;
          margin-bottom: 0.25rem !important;
        }
        .admin-panel-root aside .text-xl {
          font-size: 1.4rem !important;
        }
        .admin-panel-root aside button.bg-blue-600 {
          padding: 1rem 1.5rem !important;
          font-size: 0.95rem !important;
          border-radius: 0.875rem !important;
        }
        .admin-panel-root main h1.text-2xl,
        .admin-panel-root main h1.text-xl {
          font-size: 2.2rem !important;
          font-weight: 900 !important;
          line-height: 1.2 !important;
        }
        .admin-panel-root main h3.text-gray-900 {
          font-size: 2.25rem !important;
          font-weight: 900 !important;
        }
        .admin-panel-root main .text-[10px] {
          font-size: 0.8rem !important;
        }
        .admin-panel-root table th {
          font-size: 0.85rem !important;
          padding: 1.2rem 1rem !important;
          font-weight: 800 !important;
        }
        .admin-panel-root table td {
          font-size: 0.95rem !important;
          padding: 1.2rem 1rem !important;
        }
        .admin-panel-root table button {
          padding: 0.5rem 0.85rem !important;
          font-size: 0.8rem !important;
          font-weight: 800 !important;
          border-radius: 0.5rem !important;
        }
        .admin-panel-root input[type="text"],
        .admin-panel-root input[type="number"],
        .admin-panel-root input[type="email"],
        .admin-panel-root input[type="password"],
        .admin-panel-root input[type="datetime-local"],
        .admin-panel-root select,
        .admin-panel-root textarea {
          font-size: 0.95rem !important;
          padding: 0.85rem 1rem !important;
          border-radius: 0.75rem !important;
          min-height: 2.85rem !important;
        }
        .admin-panel-root label {
          font-size: 0.85rem !important;
          font-weight: 700 !important;
          color: #475569 !important;
          margin-bottom: 0.35rem !important;
          display: inline-block;
        }
        .admin-panel-root button[type="submit"],
        .admin-panel-root button.bg-blue-600,
        .admin-panel-root button.bg-emerald-600,
        .admin-panel-root button.bg-rose-600 {
          padding: 0.9rem 1.75rem !important;
          font-size: 0.95rem !important;
          font-weight: 800 !important;
          border-radius: 0.875rem !important;
          letter-spacing: 0.025em !important;
        }
        .admin-panel-root .bg-white {
          border-radius: 1.5rem !important;
        }
      `}</style>
    </div>
  );
}
