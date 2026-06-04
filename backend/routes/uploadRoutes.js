import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadImage, uploadMultipleImages, uploadCategoryImage } from '../controllers/uploadController.js';
import { protect, admin, adminOrSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, adminOrSeller, (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadImage);

router.post('/multiple', protect, adminOrSeller, (req, res, next) => {
  upload.array('images', 10)(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadMultipleImages);

router.post('/category', protect, admin, (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadCategoryImage);

export default router;
