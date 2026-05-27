import express from 'express';
import {
  getSellerPackages,
  createSellerPackage,
  updateSellerPackage,
  deleteSellerPackage,
} from '../controllers/sellerPackageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getSellerPackages)
  .post(protect, admin, createSellerPackage);

router.route('/:id')
  .put(protect, admin, updateSellerPackage)
  .delete(protect, admin, deleteSellerPackage);

export default router;
