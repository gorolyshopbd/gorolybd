import { db } from '../config/db.js';

// @desc    Get all seller packages
// @route   GET /api/seller-packages
// @access  Protected (Admin)
const getSellerPackages = async (req, res) => {
  try {
    const { data, error } = await db
      .from('seller_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const packages = (data || []).map(p => ({ ...p, _id: p.id }));
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new seller package
// @route   POST /api/seller-packages
// @access  Protected (Admin)
const createSellerPackage = async (req, res) => {
  try {
    const { name, price, duration_days, product_limit, commission_rate, features } = req.body;

    if (!name || price === undefined || !duration_days || !product_limit) {
      return res.status(400).json({ message: 'Name, price, duration, and product limit are required.' });
    }

    const { data, error } = await db
      .from('seller_packages')
      .insert([{
        name,
        price: Number(price),
        duration_days: Number(duration_days),
        product_limit: Number(product_limit),
        is_active: true,
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ ...data, _id: data.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a seller package
// @route   PUT /api/seller-packages/:id
// @access  Protected (Admin)
const updateSellerPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration_days, product_limit, is_active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (duration_days !== undefined) updateData.duration_days = Number(duration_days);
    if (product_limit !== undefined) updateData.product_limit = Number(product_limit);
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await db
      .from('seller_packages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ ...data, _id: data.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a seller package
// @route   DELETE /api/seller-packages/:id
// @access  Protected (Admin)
const deleteSellerPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await db
      .from('seller_packages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getSellerPackages, createSellerPackage, updateSellerPackage, deleteSellerPackage };
