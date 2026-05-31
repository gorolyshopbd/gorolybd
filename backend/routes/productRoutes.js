import express from 'express';
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getRelatedProducts,
} from '../controllers/productController.js';
import { protect, admin, adminOrSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, adminOrSeller, createProduct);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/related').get(getRelatedProducts);
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, adminOrSeller, deleteProduct)
  .put(protect, adminOrSeller, updateProduct);

export default router;
