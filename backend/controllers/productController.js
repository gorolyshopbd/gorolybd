import { db } from '../config/db.js';

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
      query = query.ilike('category', category);
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
    if (error) throw error;

    const formattedProducts = products.map(p => ({
      ...p,
      _id: p.id,
      countInStock: p.count_in_stock,
      discountPercent: p.discount_percent,
      discountType: p.discount_type || 'percent',
      isFlashSale: p.is_flash_sale,
      flashSaleEnd: p.flash_sale_end,
      digitalFileUrl: p.digital_file_url,
      metaTitle: p.meta_title,
      metaDescription: p.meta_description,
      metaKeywords: p.meta_keywords,
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
      isFeatured: p.is_featured
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
      discountPercent: product.discount_percent,
      discountType: product.discount_type || 'percent',
      isFlashSale: product.is_flash_sale,
      flashSaleEnd: product.flash_sale_end,
      digitalFileUrl: product.digital_file_url,
      metaTitle: product.meta_title,
      metaDescription: product.meta_description,
      metaKeywords: product.meta_keywords,
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
  try {
    const { data: product, error } = await db.database.from('products').insert({
      user_id: req.user._id,
      name: 'Sample Name',
      price: 0,
      image_url: '/images/sample.jpg',
      brand: 'Sample Brand',
      category: 'Sample Category',
      count_in_stock: 0,
      description: 'Sample Description',
      discount_percent: 0,
      discount_type: 'percent',
      is_flash_sale: false,
      is_digital: false,
      digital_file_url: '',
      meta_title: '',
      meta_description: '',
      tags: [],
      youtube_url: '',
      unit: 'pc',
      min_order_qty: 1,
      barcode: '',
      slug: '',
      shipping_days: 2,
      cash_on_delivery: true,
      is_published: true,
      is_catalog: true,
      is_todays_deal: false,
      is_featured: false,
    }).select().single();

    if (error) throw error;
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
  const {
    name, price, description, image, images, brand, category, countInStock, discountPercent, discountType,
    isFlashSale, isDigital, digitalFileUrl, metaTitle, metaDescription, metaKeywords, metaImage, tags, youtubeUrl, flashSaleStart, flashSaleEnd,
    unit, minOrderQty, barcode, slug, shippingDays, cashOnDelivery,
    isPublished, isCatalog, isTodaysDeal, isFeatured
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
    if (discountPercent !== undefined) updateData.discount_percent = discountPercent;
    if (discountType !== undefined) updateData.discount_type = discountType === 'flat' ? 'flat' : 'percent';
    if (isFlashSale !== undefined) updateData.is_flash_sale = isFlashSale;
    if (isDigital !== undefined) updateData.is_digital = isDigital;
    if (digitalFileUrl !== undefined) updateData.digital_file_url = digitalFileUrl;
    if (metaTitle !== undefined) updateData.meta_title = metaTitle;
    if (metaDescription !== undefined) updateData.meta_description = metaDescription;
    if (metaKeywords !== undefined) updateData.meta_keywords = metaKeywords;
    if (metaImage !== undefined) updateData.meta_image_url = metaImage;
    if (tags !== undefined) updateData.tags = tags;
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

    const { data: product, error } = await db.database.from('products').update(updateData).eq('id', req.params.id).select().single();
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
    const { error: reviewError } = await db.database.from('reviews').insert({
      product_id: req.params.id,
      user_id: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    });
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
