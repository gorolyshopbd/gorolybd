import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getPages, getPageBySlug, createPage, updatePage, deletePage, getPublicPages } from '../controllers/pageController.js';

const router = express.Router();

router.route('/').get(protect, admin, getPages).post(protect, admin, createPage);
router.route('/public/all').get(getPublicPages);
router.route('/slug/:slug').get(getPageBySlug);
router.route('/:slug').get(getPageBySlug);
router.route('/:id').put(protect, admin, updatePage).delete(protect, admin, deletePage);

export default router;
