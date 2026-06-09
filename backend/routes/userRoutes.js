import express from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  updateSteadfastIntegration,
  updateOrderAutomationIntegration,
  sendOTP,
  verifyOTPCode,
  changePassword,
  changeEmail,
  forgotPassword,
  resetPassword,
  resetPasswordWithOtp,
  oauthLogin,
  getUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  adminResetPassword,
  deleteUser,
  banUser,
  unbanUser,
  setExtraDeliveryTime,
  importSellers,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/userController.js';
import { db } from '../config/db.js';
import generateToken from '../utils/generateToken.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Public routes
router.post('/', registerUser);
router.post('/login', authUser);
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }


    // Look up user in DB
    let user;
    let error;
    try {
      const result = await db.database.from('users').select('*').eq('email', username).single();
      user = result.data;
      error = result.error;
    } catch (e) {
      error = e;
    }

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned. Contact support.' });
    }

    if (!user.is_admin && user.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    return res.json({
      success: true,
      token: generateToken(user.id),
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
        role: user.role,
        permissions: user.permissions || [],
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTPCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/reset-password-otp', resetPasswordWithOtp);
router.post('/oauth', oauthLogin);

// Private routes (user profile)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/profile/steadfast').put(protect, updateSteadfastIntegration);
router.route('/profile/order-automation').put(protect, updateOrderAutomationIntegration);
router.route('/profile/password').put(protect, changePassword);
router.route('/profile/email').put(protect, changeEmail);

// Admin user management
router.route('/all').get(protect, admin, getUsers);
router.route('/import-sellers').post(protect, admin, upload.single('file'), importSellers);
router.route('/create').post(protect, admin, createUserByAdmin);
router.route('/:id').get(protect, admin, getUserById);
router.route('/:id').put(protect, admin, updateUserByAdmin);
router.route('/:id/password').put(protect, admin, adminResetPassword);
router.route('/:id/verification').put(protect, admin, async (req, res) => {
  const { verification_status } = req.body;
  const allowed = ['Verified', 'Rejected', 'Pending'];
  if (!allowed.includes(verification_status)) {
    return res.status(400).json({ message: 'Invalid verification status' });
  }
  try {
    const { data, error } = await db.database.from('users').update({ verification_status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ message: 'Verification status updated', verification_status: data.verification_status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.route('/:id/ban').put(protect, admin, banUser);
router.route('/:id/unban').put(protect, admin, unbanUser);
router.route('/:id/extra-delivery').put(protect, admin, setExtraDeliveryTime);
router.route('/:id').delete(protect, admin, deleteUser);

// Role management routes
router.route('/roles/all').get(protect, admin, getRoles);
router.route('/roles/create').post(protect, admin, createRole);
router.route('/roles/:id').put(protect, admin, updateRole);
router.route('/roles/:id').delete(protect, admin, deleteRole);

export default router;
