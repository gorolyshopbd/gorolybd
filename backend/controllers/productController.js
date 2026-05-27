import { supabase } from '../config/db.js';

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
    let query = supabase.from('products').select('*', { count: 'exact' });

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
      // Simplified flash sale check for Supabase query
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: products, count, error } = await query;
    if (error) throw error;

    const formattedProducts = products.map(p => ({
      ...p,
      _id: p.id,
      countInStock: p.count_in_stock,
      discountPercent: p.discount_percent,
      isFlashSale: p.is_flash_sale,
      flashSaleEnd: p.flash_sale_end,
      digitalFileUrl: p.digital_file_url,
      metaTitle: p.meta_title,
      metaDescription: p.meta_description,
      youtubeUrl: p.youtube_url,
      image: p.image_url
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
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) return res.status(404).json({ message: 'Product not found' });

    const { data: reviews } = await supabase.from('reviews').select('*').eq('product_id', product.id);

    res.json({
      ...product,
      _id: product.id,
      countInStock: product.count_in_stock,
      discountPercent: product.discount_percent,
      isFlashSale: product.is_flash_sale,
      flashSaleEnd: product.flash_sale_end,
      digitalFileUrl: product.digital_file_url,
      metaTitle: product.meta_title,
      metaDescription: product.meta_description,
      youtubeUrl: product.youtube_url,
      image: product.image_url,
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
      const { data: prod } = await supabase.from('products').select('user_id').eq('id', req.params.id).single();
      if (!prod || prod.user_id !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized to delete this product' });
      }
    }

    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
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
    const { data: product, error } = await supabase.from('products').insert({
      user_id: req.user._id,
      name: 'Sample Name',
      price: 0,
      image_url: '/images/sample.jpg',
      brand: 'Sample Brand',
      category: 'Sample Category',
      count_in_stock: 0,
      description: 'Sample Description',
      discount_percent: 0,
      is_flash_sale: false,
      is_digital: false,
      digital_file_url: '',
      meta_title: '',
      meta_description: '',
      tags: [],
      youtube_url: '',
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
    name, price, description, image, images, brand, category, countInStock, discountPercent,
    isFlashSale, isDigital, digitalFileUrl, metaTitle, metaDescription, tags, youtubeUrl, flashSaleStart, flashSaleEnd
  } = req.body;

  try {
    // If seller, check ownership
    if (req.user.role === 'seller') {
      const { data: prod } = await supabase.from('products').select('user_id').eq('id', req.params.id).single();
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
    if (isFlashSale !== undefined) updateData.is_flash_sale = isFlashSale;
    if (isDigital !== undefined) updateData.is_digital = isDigital;
    if (digitalFileUrl !== undefined) updateData.digital_file_url = digitalFileUrl;
    if (metaTitle !== undefined) updateData.meta_title = metaTitle;
    if (metaDescription !== undefined) updateData.meta_description = metaDescription;
    if (tags !== undefined) updateData.tags = tags;
    if (youtubeUrl !== undefined) updateData.youtube_url = youtubeUrl;
    if (flashSaleStart !== undefined) updateData.flash_sale_start = flashSaleStart || null;
    if (flashSaleEnd !== undefined) updateData.flash_sale_end = flashSaleEnd || null;

    const { data: product, error } = await supabase.from('products').update(updateData).eq('id', req.params.id).select().single();
    if (error) throw error;
    
    // Manage additional images in product_images table if needed, skipping for brevity or treating image_url as primary

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
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_items!inner(product_id)')
      .eq('user_id', req.user._id)
      .eq('order_items.product_id', req.params.id);

    if (!orders || orders.length === 0) {
      return res.status(400).json({ message: 'You can only review products you have purchased.' });
    }

    // Check if already reviewed
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user._id)
      .eq('product_id', req.params.id)
      .single();

    if (existingReview) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    // Insert review
    const { error: reviewError } = await supabase.from('reviews').insert({
      product_id: req.params.id,
      user_id: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    });
    if (reviewError) throw reviewError;

    // Recalculate rating
    const { data: allReviews } = await supabase.from('reviews').select('rating').eq('product_id', req.params.id);
    const numReviews = allReviews.length;
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await supabase.from('products').update({ rating: avgRating, num_reviews: numReviews }).eq('id', req.params.id);

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
    const { data: product } = await supabase.from('products').select('category').eq('id', req.params.id).single();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { data: related, error } = await supabase
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
