import express from 'express';
import multer from 'multer';
import {
  registerUser,
  authUser,
  getUserProfile,
  sendOTP,
  verifyOTPCode,
  changePassword,
  changeEmail,
  forgotPassword,
  resetPassword,
  oauthLogin,
  getUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  adminResetPassword,
  deleteUser,
  importSellers,
} from '../controllers/userController.js';
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

    const { supabase } = await import('../config/db.js');
    const bcrypt = (await import('bcryptjs')).default;
    const generateToken = (await import('../utils/generateToken.js')).default;

    const { data: user, error } = await supabase.from('users').select('*').eq('email', username).single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
router.post('/oauth', oauthLogin);

// Private routes (user profile)
router.route('/profile').get(protect, getUserProfile);
router.route('/profile/password').put(protect, changePassword);
router.route('/profile/email').put(protect, changeEmail);

// Admin user management
router.route('/all').get(protect, admin, getUsers);
router.route('/import-sellers').post(protect, admin, upload.single('file'), importSellers);
router.route('/create').post(protect, admin, createUserByAdmin);
router.route('/:id').get(protect, admin, getUserById);
router.route('/:id').put(protect, admin, updateUserByAdmin);
router.route('/:id/password').put(protect, admin, adminResetPassword);
router.route('/:id').delete(protect, admin, deleteUser);

export default router;
