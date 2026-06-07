import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = null;
      let error = null;

      try {
        const result = await db.database
          .from('users')
          .select('*')
          .eq('id', decoded.id)
          .single();
        user = result.data;
        error = result.error;
      } catch (e) {
        error = e;
      }

      // Hardcoded bypass for testing without database
      if ((error || !user) && decoded.id === 'hardcoded-admin-123') {
        req.user = {
          _id: 'hardcoded-admin-123',
          id: 'hardcoded-admin-123',
          name: 'Admin',
          email: 'admin@gorolyshop.com',
          is_admin: true,
          isAdmin: true,
          role: 'superadmin'
        };
        return next();
      }

      if (error || !user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = {
        ...user,
        _id: user.id,
        isAdmin: user.is_admin,
      };

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    return next();
  }
  return res.status(401).json({ message: 'Not authorized as an admin' });
};

const adminOrSeller = (req, res, next) => {
  if (req.user && (req.user.is_admin || req.user.role === 'seller')) {
    return next();
  }
  return res.status(401).json({ message: 'Not authorized as an admin or seller' });
};

export { protect, admin, adminOrSeller };

