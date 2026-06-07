import { db } from '../config/db.js';
import { generateImageAlt, injectInternalLinks, generateProductMeta } from '../services/aiSeoService.js';

const DEMO_PRODUCTS = [
  { _id: 'demo-001', id: 'demo-001', name: 'Premium Wireless Headphones', price: 2499, purchasePrice: 1800, image_url: 'https://picsum.photos/seed/headphones/400/400', image: 'https://picsum.photos/seed/headphones/400/400', category: 'Electronics', brand: 'SoundMax', count_in_stock: 50, countInStock: 50, barcode: 'DEMO-ADM-001', description: 'High-quality wireless headphones with noise cancellation and 30hr battery life.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: true, isFeatured: true, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: false, isFlashSale: false, salesCount: 128, rating: 4.5, tags: [], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 2, shippingDays: 2, cash_on_delivery: true, cashOnDelivery: true, discount_percent: 0, discountPercent: 0, discount_type: 'percent', discountType: 'percent', slug: 'premium-wireless-headphones', created_at: new Date().toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-002', id: 'demo-002', name: 'Organic Green Tea (50 Pack)', price: 349, purchasePrice: 200, image_url: 'https://picsum.photos/seed/greentea/400/400', image: 'https://picsum.photos/seed/greentea/400/400', category: 'Groceries', brand: 'NatureLeaf', count_in_stock: 200, countInStock: 200, barcode: 'DEMO-ADM-002', description: 'Premium organic green tea bags, rich in antioxidants.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: false, isFeatured: false, is_todays_deal: true, isTodaysDeal: true, is_flash_sale: false, isFlashSale: false, salesCount: 340, rating: 4.2, tags: [], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 3, shippingDays: 3, cash_on_delivery: true, cashOnDelivery: true, discount_percent: 0, discountPercent: 0, discount_type: 'percent', discountType: 'percent', slug: 'organic-green-tea', created_at: new Date().toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-003', id: 'demo-003', name: 'Stainless Steel Water Bottle 1L', price: 899, purchasePrice: 550, image_url: 'https://picsum.photos/seed/waterbottle/400/400', image: 'https://picsum.photos/seed/waterbottle/400/400', category: 'Home & Living', brand: 'AquaGuard', count_in_stock: 120, countInStock: 120, barcode: 'DEMO-ADM-003', description: 'Double-wall vacuum insulated, keeps drinks cold 24hr or hot 12hr.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: true, isFeatured: true, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: true, isFlashSale: true, salesCount: 89, rating: 4.7, tags: [], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 2, shippingDays: 2, cash_on_delivery: true, cashOnDelivery: true, discount_percent: 20, discountPercent: 20, discount_type: 'percent', discountType: 'percent', slug: 'water-bottle-1l', created_at: new Date().toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-004', id: 'demo-004', name: 'Leather Office Chair', price: 15999, purchasePrice: 11000, image_url: 'https://picsum.photos/seed/chair/400/400', image: 'https://picsum.photos/seed/chair/400/400', category: 'Furniture', brand: 'ErgoComfort', count_in_stock: 15, countInStock: 15, barcode: 'DEMO-CAT-001', description: 'Ergonomic leather chair with lumbar support and adjustable armrests.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: false, isFeatured: false, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: false, isFlashSale: false, salesCount: 12, rating: 4.0, tags: [], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 5, shippingDays: 5, cash_on_delivery: true, cashOnDelivery: true, discount_percent: 0, discountPercent: 0, discount_type: 'percent', discountType: 'percent', slug: 'leather-office-chair', created_at: new Date().toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-005', id: 'demo-005', name: 'Used Canon EOS R6 Camera', price: 85000, purchasePrice: 70000, image_url: 'https://picsum.photos/seed/camera/400/400', image: 'https://picsum.photos/seed/camera/400/400', category: 'Electronics', brand: 'Canon', count_in_stock: 1, countInStock: 1, barcode: 'DEMO-CLF-001', description: 'Like-new condition, shutter count 5000, includes kit lens 24-105mm.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: false, isFeatured: false, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: false, isFlashSale: false, salesCount: 1, rating: 4.8, tags: ['classified'], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 2, shippingDays: 2, cash_on_delivery: false, cashOnDelivery: false, discount_percent: 0, discountPercent: 0, discount_type: 'percent', discountType: 'percent', slug: 'canon-eos-r6', created_at: new Date().toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-006', id: 'demo-006', name: 'Photo Editing Masterclass', price: 1499, purchasePrice: 500, image_url: 'https://picsum.photos/seed/course/400/400', image: 'https://picsum.photos/seed/course/400/400', category: 'Education', brand: 'LearnPro', count_in_stock: 999, countInStock: 999, barcode: 'DEMO-DIG-001', description: 'Complete video course on photo editing with Photoshop and Lightroom.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: true, isDigital: true, is_featured: true, isFeatured: true, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: false, isFlashSale: false, salesCount: 250, rating: 4.6, tags: [], digitalFileUrl: 'https://example.com/courses/photo', unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 0, shippingDays: 0, cash_on_delivery: false, cashOnDelivery: false, discount_percent: 0, discountPercent: 0, discount_type: 'percent', discountType: 'percent', slug: 'photo-masterclass', created_at: new Date().toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-007', id: 'demo-007', name: 'Handmade Ceramic Coffee Mug Set', price: 1299, purchasePrice: 700, image_url: 'https://picsum.photos/seed/mugs/400/400', image: 'https://picsum.photos/seed/mugs/400/400', category: 'Home & Living', brand: 'ArtisanCraft', count_in_stock: 30, countInStock: 30, barcode: 'DEMO-SEL-001', description: 'Set of 4 handmade ceramic mugs, microwave and dishwasher safe.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: false, isFeatured: false, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: false, isFlashSale: false, salesCount: 45, rating: 4.3, tags: [], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 3, shippingDays: 3, cash_on_delivery: true, cashOnDelivery: true, discount_percent: 0, discountPercent: 0, discount_type: 'percent', discountType: 'percent', slug: 'ceramic-mug-set', created_at: new Date(Date.now() - 86400000).toISOString(), user_id: 'seller-demo-001', isAdmin: false },
  { _id: 'demo-008', id: 'demo-008', name: 'Smart LED Light Bulb (RGB)', price: 399, purchasePrice: 200, image_url: 'https://picsum.photos/seed/ledbulb/400/400', image: 'https://picsum.photos/seed/ledbulb/400/400', category: 'Electronics', brand: 'BrightLife', count_in_stock: 100, countInStock: 100, barcode: 'DEMO-FLS-001', description: 'WiFi-enabled RGB smart bulb, works with Alexa and Google Home.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: false, isFeatured: false, is_todays_deal: true, isTodaysDeal: true, is_flash_sale: true, isFlashSale: true, salesCount: 78, rating: 4.1, tags: [], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 2, shippingDays: 2, cash_on_delivery: true, cashOnDelivery: true, discount_percent: 40, discountPercent: 40, discount_type: 'percent', discountType: 'percent', slug: 'smart-led-bulb', created_at: new Date(Date.now() - 172800000).toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-009', id: 'demo-009', name: "Men's Running Shoes", price: 3499, purchasePrice: 2200, image_url: 'https://picsum.photos/seed/shoes/400/400', image: 'https://picsum.photos/seed/shoes/400/400', category: 'Fashion', brand: 'SportFlex', count_in_stock: 45, countInStock: 45, barcode: 'DEMO-GEN-001', description: 'Lightweight breathable running shoes with cushioned sole.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: false, isFeatured: false, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: false, isFlashSale: false, salesCount: 67, rating: 4.4, tags: [], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 3, shippingDays: 3, cash_on_delivery: true, cashOnDelivery: true, discount_percent: 15, discountPercent: 15, discount_type: 'percent', discountType: 'percent', slug: 'running-shoes', created_at: new Date(Date.now() - 259200000).toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-010', id: 'demo-010', name: 'Bluetooth Portable Speaker', price: 1899, purchasePrice: 1200, image_url: 'https://picsum.photos/seed/speaker/400/400', image: 'https://picsum.photos/seed/speaker/400/400', category: 'Electronics', brand: 'SoundMax', count_in_stock: 35, countInStock: 35, barcode: 'DEMO-GEN-003', description: 'Waterproof portable speaker, 20hr battery, deep bass.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: false, isFeatured: false, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: false, isFlashSale: false, salesCount: 156, rating: 4.3, tags: [], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 2, shippingDays: 2, cash_on_delivery: true, cashOnDelivery: true, discount_percent: 0, discountPercent: 0, discount_type: 'percent', discountType: 'percent', slug: 'portable-speaker', created_at: new Date(Date.now() - 345600000).toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-011', id: 'demo-011', name: 'Natural Honey 500g', price: 599, purchasePrice: 350, image_url: 'https://picsum.photos/seed/honey/400/400', image: 'https://picsum.photos/seed/honey/400/400', category: 'Groceries', brand: 'NatureLeaf', count_in_stock: 90, countInStock: 90, barcode: 'DEMO-GEN-005', description: 'Pure raw natural honey, no added sugar.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: false, isFeatured: false, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: false, isFlashSale: false, salesCount: 210, rating: 4.9, tags: [], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 2, shippingDays: 2, cash_on_delivery: true, cashOnDelivery: true, discount_percent: 0, discountPercent: 0, discount_type: 'percent', discountType: 'percent', slug: 'natural-honey', created_at: new Date(Date.now() - 432000000).toISOString(), user_id: null, isAdmin: true },
  { _id: 'demo-012', id: 'demo-012', name: 'Vintage Wooden Dining Table', price: 22000, purchasePrice: 15000, image_url: 'https://picsum.photos/seed/table/400/400', image: 'https://picsum.photos/seed/table/400/400', category: 'Furniture', brand: 'AntiqueCraft', count_in_stock: 1, countInStock: 1, barcode: 'DEMO-CLF-002', description: 'Solid teak wood, seats 6-8 people, 15 years old, excellent condition.', is_published: true, isPublished: true, is_catalog: true, isCatalog: true, is_digital: false, isDigital: false, is_featured: false, isFeatured: false, is_todays_deal: false, isTodaysDeal: false, is_flash_sale: false, isFlashSale: false, salesCount: 1, rating: 5.0, tags: ['classified'], unit: 'pc', min_order_qty: 1, minOrderQty: 1, shipping_days: 5, shippingDays: 5, cash_on_delivery: false, cashOnDelivery: false, discount_percent: 0, discountPercent: 0, discount_type: 'percent', discountType: 'percent', slug: 'vintage-dining-table', created_at: new Date(Date.now() - 518400000).toISOString(), user_id: null, isAdmin: true },
];

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword ? String(req.query.keyword).toLowerCase() : '';
  const category = req.query.category ? String(req.query.category).toLowerCase() : '';
  const isFlashSale = req.query.isFlashSale === 'true';

  try {
    let query = db.database.from('products').select('*', { count: 'exact' });

    if (req.query.sellerId) {
      query = query.eq('user_id', req.query.sellerId);
    }

    if (keyword) {
      query = query.ilike('name', `%${keyword}%`);
    }
    if (category) {
      try {
        const { data: categoriesFound } = await db.database
          .from('categories')
          .select('name, subcategories')
          .ilike('name', category)
          .limit(1);
        
        const catData = categoriesFound && categoriesFound[0];
        if (catData) {
          const categoriesToMatch = [catData.name];
          const subs = catData.subcategories
            ? (Array.isArray(catData.subcategories)
              ? catData.subcategories
              : (typeof catData.subcategories === 'string'
                ? catData.subcategories.split(',').map(s => s.trim()).filter(Boolean)
                : []))
            : [];
          categoriesToMatch.push(...subs);
          query = query.in('category', categoriesToMatch);
        } else {
          query = query.ilike('category', category);
        }
      } catch (err) {
        console.error('Failed to resolve nested categories:', err);
        query = query.ilike('category', category);
      }
    }
    if (isFlashSale) {
      query = query.eq('is_flash_sale', true);
      // Simplified flash sale check for db query
    }

    // Pagination
    if (req.query.all !== 'true') {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }
    query = query.order('created_at', { ascending: false });

    const { data: products, count, error } = await query;
    if (error) {
      console.warn('DB error fetching products (returning demo data):', error.message);
      let filtered = [...DEMO_PRODUCTS];
      if (keyword) filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(keyword));
      if (category) filtered = filtered.filter(p => (p.category || '').toLowerCase().includes(category));
      if (isFlashSale) filtered = filtered.filter(p => p.is_flash_sale);
      return res.json({ products: filtered, page: 1, pages: 1 });
    }

    const formattedProducts = (products || []).map(p => ({
      ...p,
      _id: p.id,
      countInStock: p.count_in_stock,
      purchasePrice: p.purchase_price,
      discountPercent: p.discount_percent,
      discountType: p.discount_type || 'percent',
      isFlashSale: p.is_flash_sale,
      flashSaleEnd: p.flash_sale_end,
      digitalFileUrl: p.digital_file_url,
      shortDescription: (p.tags || []).find(t => typeof t === 'string' && t.startsWith('SHORT_DESC:'))?.replace('SHORT_DESC:', '') || '',
      metaTitle: p.meta_title,
      metaDescription: p.meta_description,
      metaKeywords: '',
      metaImage: p.meta_image_url,
      youtubeUrl: p.youtube_url,
      image: p.image_url,
      unit: p.unit,
      minOrderQty: p.min_order_qty,
      barcode: p.barcode,
      slug: p.slug,
      shippingDays: p.shipping_days,
      cashOnDelivery: p.cash_on_delivery,
      isPublished: p.is_published,
      isCatalog: p.is_catalog,
      isTodaysDeal: p.is_todays_deal,
      isFeatured: p.is_featured,
      tags: (p.tags || []).filter(t => typeof t === 'string' && !t.startsWith('SHORT_DESC:'))
    }));

    res.json({ products: formattedProducts, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { data: product, error } = await db.database
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) return res.status(404).json({ message: 'Product not found' });

    const { data: reviews } = await db.database.from('reviews').select('*').eq('product_id', product.id);

    const { data: productImages } = await db.database.from('product_images').select('*').eq('product_id', product.id).order('sort_order', { ascending: true });

    const imagesArr = (productImages || []).map(pi => pi.image_url).filter(Boolean);

    res.json({
      ...product,
      _id: product.id,
      countInStock: product.count_in_stock,
      purchasePrice: product.purchase_price,
      discountPercent: product.discount_percent,
      discountType: product.discount_type || 'percent',
      isFlashSale: product.is_flash_sale,
      flashSaleEnd: product.flash_sale_end,
      digitalFileUrl: product.digital_file_url,
      shortDescription: (product.tags || []).find(t => typeof t === 'string' && t.startsWith('SHORT_DESC:'))?.replace('SHORT_DESC:', '') || '',
      metaTitle: product.meta_title,
      metaDescription: product.meta_description,
      metaKeywords: '',
      metaImage: product.meta_image_url,
      youtubeUrl: product.youtube_url,
      image: product.image_url,
      images: imagesArr,
      unit: product.unit,
      minOrderQty: product.min_order_qty,
      barcode: product.barcode,
      slug: product.slug,
      shippingDays: product.shipping_days,
      cashOnDelivery: product.cash_on_delivery,
      isPublished: product.is_published,
      isCatalog: product.is_catalog,
      isTodaysDeal: product.is_todays_deal,
      isFeatured: product.is_featured,
      tags: (product.tags || []).filter(t => typeof t === 'string' && !t.startsWith('SHORT_DESC:')),
      reviews: reviews || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    // If seller, check ownership
    if (req.user.role === 'seller') {
      const { data: prod } = await db.database.from('products').select('user_id').eq('id', req.params.id).single();
      if (!prod || prod.user_id !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized to delete this product' });
      }
    }

    const { error } = await db.database.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const {
    name, price, description, image, images, brand, category, countInStock, discountPercent, discountType,
    isFlashSale, isDigital, digitalFileUrl, metaTitle, metaDescription, metaKeywords, metaImage, tags, youtubeUrl, flashSaleStart, flashSaleEnd,
    unit, minOrderQty, barcode, slug, shippingDays, cashOnDelivery,
    isPublished, isCatalog, isTodaysDeal, isFeatured, shortDescription, purchasePrice
  } = req.body;

  try {
    const insertData = {
      user_id: req.user._id,
      name: name || 'Sample Name',
      price: price || 0,
      image_url: image || '/images/sample.jpg',
      brand: brand || 'Sample Brand',
      category: category || 'Sample Category',
      count_in_stock: countInStock || 0,
      purchase_price: purchasePrice || 0,
      description: description || 'Sample Description',
      discount_percent: discountPercent || 0,
      discount_type: discountType === 'flat' ? 'flat' : 'percent',
      is_flash_sale: isFlashSale || false,
      is_digital: isDigital || false,
      digital_file_url: digitalFileUrl || '',
      meta_title: metaTitle || '',
      meta_description: metaDescription || '',
      meta_image_url: metaImage || '',
      tags: [],
      youtube_url: youtubeUrl || '',
      unit: unit || 'pc',
      min_order_qty: minOrderQty || 1,
      barcode: barcode || ('sample-code-' + Date.now()),
      slug: slug || ('sample-' + Date.now()),
      shipping_days: Number(shippingDays || 2),
      cash_on_delivery: cashOnDelivery !== false,
      is_published: isPublished !== false,
      is_catalog: isCatalog !== false,
      is_todays_deal: isTodaysDeal || false,
      is_featured: isFeatured || false,
      flash_sale_start: flashSaleStart || null,
      flash_sale_end: flashSaleEnd || null,
    };

    if (tags !== undefined || shortDescription !== undefined) {
      insertData.tags = (tags || []).filter(t => typeof t === 'string' && !t.startsWith('SHORT_DESC:'));
      if (shortDescription) {
        insertData.tags.push('SHORT_DESC:' + shortDescription);
      }
    }

    let result = await db.database.from('products').insert([insertData]).select().single();

    // Auto-remove missing columns
    while (result.error && result.error.message && result.error.message.includes('Could not find the') && result.error.message.includes('column')) {
      const match = result.error.message.match(/'([^']+)' column/);
      if (match && match[1]) {
        console.warn(`Column ${match[1]} not found, retrying insert without it`);
        delete insertData[match[1]];
        result = await db.database.from('products').insert([insertData]).select().single();
      } else {
        break;
      }
    }

    let { data: product, error } = result;

    if (error) throw error;
    
    if (images && Array.isArray(images) && images.length > 0) {
        const imgRows = images.filter(Boolean).map((url, i) => ({
          product_id: product.id,
          image_url: url,
          sort_order: i,
        }));
        const { error: imgErr } = await db.database.from('product_images').insert(imgRows);
        if (imgErr) console.error('Failed to save product images:', imgErr);
    }

    res.status(201).json({ ...product, _id: product.id });
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  console.log("UPDATE PRODUCT CALLED WITH:", req.body.shortDescription);
  const {
    name, price, description, image, images, brand, category, countInStock, discountPercent, discountType,
    isFlashSale, isDigital, digitalFileUrl, metaTitle, metaDescription, metaKeywords, metaImage, tags, youtubeUrl, flashSaleStart, flashSaleEnd,
    unit, minOrderQty, barcode, slug, shippingDays, cashOnDelivery,
    isPublished, isCatalog, isTodaysDeal, isFeatured, shortDescription, purchasePrice
  } = req.body;

  try {
    // If seller, check ownership
    if (req.user.role === 'seller') {
      const { data: prod } = await db.database.from('products').select('user_id').eq('id', req.params.id).single();
      if (!prod || prod.user_id !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized to update this product' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image_url = image;
    if (brand !== undefined) updateData.brand = brand;
    if (category !== undefined) updateData.category = category;
    if (countInStock !== undefined) updateData.count_in_stock = countInStock;
    if (purchasePrice !== undefined) updateData.purchase_price = purchasePrice;
    if (discountPercent !== undefined) updateData.discount_percent = discountPercent;
    if (discountType !== undefined) updateData.discount_type = discountType === 'flat' ? 'flat' : 'percent';
    if (isFlashSale !== undefined) updateData.is_flash_sale = isFlashSale;
    if (isDigital !== undefined) updateData.is_digital = isDigital;
    if (digitalFileUrl !== undefined) updateData.digital_file_url = digitalFileUrl;
    if (metaTitle !== undefined) updateData.meta_title = metaTitle;
    if (metaDescription !== undefined) updateData.meta_description = metaDescription;
    // if (metaKeywords !== undefined) updateData.meta_keywords = metaKeywords;
    if (metaImage !== undefined) updateData.meta_image_url = metaImage;
    if (tags !== undefined || shortDescription !== undefined) {
      updateData.tags = (tags || []).filter(t => typeof t === 'string' && !t.startsWith('SHORT_DESC:'));
      if (shortDescription) {
        updateData.tags.push('SHORT_DESC:' + shortDescription);
      }
    }
    if (youtubeUrl !== undefined) updateData.youtube_url = youtubeUrl;
    if (flashSaleStart !== undefined) updateData.flash_sale_start = flashSaleStart || null;
    if (flashSaleEnd !== undefined) updateData.flash_sale_end = flashSaleEnd || null;
    if (unit !== undefined) updateData.unit = unit;
    if (minOrderQty !== undefined) updateData.min_order_qty = minOrderQty;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (slug !== undefined) updateData.slug = slug;
    if (shippingDays !== undefined) updateData.shipping_days = Number(shippingDays || 0);
    if (cashOnDelivery !== undefined) updateData.cash_on_delivery = cashOnDelivery;
    if (isPublished !== undefined) updateData.is_published = isPublished;
    if (isCatalog !== undefined) updateData.is_catalog = isCatalog;
    if (isTodaysDeal !== undefined) updateData.is_todays_deal = isTodaysDeal;
    if (isFeatured !== undefined) updateData.is_featured = isFeatured;

    // ── AI SEO: Auto-generate Image ALT text ────────────────────────────────
    if (image && !updateData.image_alt) {
      try {
        updateData.image_alt = await generateImageAlt({
          name: updateData.name || name,
          category: updateData.category || category,
          brand: updateData.brand || brand,
        });
      } catch (e) { /* non-blocking */ }
    }

    // ── AI SEO: Auto-generate missing meta title/description ────────────────
    if (!metaTitle || !metaDescription) {
      try {
        const aiMeta = await generateProductMeta({
          name: updateData.name || name,
          category: updateData.category || category,
          brand: updateData.brand || brand,
          description: updateData.description || description || '',
        });
        if (!metaTitle) updateData.meta_title = aiMeta.title;
        if (!metaDescription) updateData.meta_description = aiMeta.description;
      } catch (e) { /* non-blocking */ }
    }

    // ── AI SEO: Inject internal links into description ───────────────────────
    if (description !== undefined) {
      try {
        const [{ data: allCats }, { data: topProds }] = await Promise.all([
          db.database.from('categories').select('id, name').limit(50),
          db.database.from('products').select('id, name').limit(50),
        ]);
        updateData.description = await injectInternalLinks(
          updateData.description,
          (allCats || []).map(c => ({ ...c, _id: c.id })),
          (topProds || []).map(p => ({ ...p, _id: p.id })),
          req.params.id
        );
      } catch (e) { /* non-blocking */ }
    }
    // ───────────────────────────────────────────────────────────────────────

    let result = await db.database.from('products').update(updateData).eq('id', req.params.id).select().single();
    
    // Auto-remove missing columns
    while (result.error && result.error.message && result.error.message.includes('Could not find the') && result.error.message.includes('column')) {
      const match = result.error.message.match(/'([^']+)' column/);
      if (match && match[1]) {
        console.warn(`Column ${match[1]} not found, retrying update without it`);
        delete updateData[match[1]];
        result = await db.database.from('products').update(updateData).eq('id', req.params.id).select().single();
      } else {
        break;
      }
    }

    let { data: product, error } = result;
    if (error) throw error;

    if (images !== undefined) {
      await db.database.from('product_images').delete().eq('product_id', req.params.id);
      if (Array.isArray(images) && images.length > 0) {
        const imgRows = images.filter(Boolean).map((url, i) => ({
          product_id: req.params.id,
          image_url: url,
          sort_order: i,
        }));
        const { error: imgErr } = await db.database.from('product_images').insert(imgRows);
        if (imgErr) console.error('Failed to save product images:', imgErr);
      }
    }

    res.json({ ...product, _id: product.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    // Check if user purchased the product
    const { data: orders } = await db
      .from('orders')
      .select('id, order_items!inner(product_id)')
      .eq('user_id', req.user._id)
      .eq('order_items.product_id', req.params.id);

    if (!orders || orders.length === 0) {
      return res.status(400).json({ message: 'You can only review products you have purchased.' });
    }

    // Check if already reviewed
    const { data: existingReview } = await db
      .from('reviews')
      .select('id')
      .eq('user_id', req.user._id)
      .eq('product_id', req.params.id)
      .single();

    if (existingReview) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    // Insert review
    const { error: reviewError } = await db.database.from('reviews').insert([{
      product_id: req.params.id,
      user_id: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    }]);
    if (reviewError) throw reviewError;

    // Recalculate rating
    const { data: allReviews } = await db.database.from('reviews').select('rating').eq('product_id', req.params.id);
    const numReviews = allReviews.length;
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await db.database.from('products').update({ rating: avgRating, num_reviews: numReviews }).eq('id', req.params.id);

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get related products by category
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const { data: product } = await db.database.from('products').select('category').eq('id', req.params.id).single();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { data: related, error } = await db.database
      .from('products')
      .select('*')
      .neq('id', req.params.id)
      .eq('category', product.category)
      .limit(4);

    if (error) throw error;
    
    const formattedRelated = related.map(p => ({
      ...p,
      _id: p.id,
      countInStock: p.count_in_stock,
      discountPercent: p.discount_percent,
      discountType: p.discount_type || 'percent',
      shippingDays: p.shipping_days,
      cashOnDelivery: p.cash_on_delivery,
      image: p.image_url
    }));

    res.json(formattedRelated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getRelatedProducts,
};
