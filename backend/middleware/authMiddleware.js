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

      const { data: user, error } = await db.database
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error) {
        console.error('Database error in authMiddleware:', error);
        return res.status(500).json({ message: 'Database connection failed or timed out.' });
      }
      
      if (!user) {
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

