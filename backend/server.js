import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import sellerSettingsRoutes from './routes/sellerSettingsRoutes.js';
import sellerPackageRoutes from './routes/sellerPackageRoutes.js';
import sellerSubscriptionRoutes from './routes/sellerSubscriptionRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import rupantorpayRoutes from './routes/rupantorpayRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import fraudRoutes from './routes/fraudRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/seller-settings', sellerSettingsRoutes);
app.use('/api/seller-packages', sellerPackageRoutes);
app.use('/api/seller-subscriptions', sellerSubscriptionRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/rupantorpay', rupantorpayRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin/fraud', fraudRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/inventory', inventoryRoutes);

// Serve static uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running with Supabase...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
