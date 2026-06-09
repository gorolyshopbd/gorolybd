import express from 'express';
import upload, { uploadPdfMiddleware } from '../middleware/uploadMiddleware.js';
import { uploadImage, uploadMultipleImages, uploadCategoryImage, uploadPdf, uploadDescriptionImages } from '../controllers/uploadController.js';
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

router.post('/pdf', protect, adminOrSeller, (req, res, next) => {
  uploadPdfMiddleware.single('pdf')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadPdf);

router.post('/descriptions', protect, adminOrSeller, (req, res, next) => {
  upload.array('images', 20)(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadDescriptionImages);

export default router;
