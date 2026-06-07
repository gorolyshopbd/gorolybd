// Seed demo products via API
// Run: node scripts/seed-demo-products.js

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const DEMO_PRODUCTS = [
  // --- Admin Products ---
  { name: 'Premium Wireless Headphones', price: 2499, purchasePrice: 1800, category: 'Electronics', brand: 'SoundMax', countInStock: 50, barcode: 'DEMO-ADM-001', description: 'High-quality wireless headphones with noise cancellation and 30hr battery life.', image: 'https://picsum.photos/seed/headphones/400/400' },
  { name: 'Organic Green Tea (50 Pack)', price: 349, purchasePrice: 200, category: 'Groceries', brand: 'NatureLeaf', countInStock: 200, barcode: 'DEMO-ADM-002', description: 'Premium organic green tea bags, rich in antioxidants.' },
  { name: 'Stainless Steel Water Bottle 1L', price: 899, purchasePrice: 550, category: 'Home & Living', brand: 'AquaGuard', countInStock: 120, barcode: 'DEMO-ADM-003', description: 'Double-wall vacuum insulated, keeps drinks cold 24hr or hot 12hr.' },

  // --- Catalog Products (isCatalog: true) ---
  { name: 'Leather Office Chair', price: 15999, purchasePrice: 11000, category: 'Furniture', brand: 'ErgoComfort', countInStock: 15, barcode: 'DEMO-CAT-001', isCatalog: true, description: 'Ergonomic leather chair with lumbar support and adjustable armrests.' },
  { name: 'Standing Desk 140x70cm', price: 24999, purchasePrice: 18000, category: 'Furniture', brand: 'WorkSpace', countInStock: 8, barcode: 'DEMO-CAT-002', isCatalog: true, description: 'Electric height-adjustable standing desk, memory presets.' },

  // --- Classified Products ---
  { name: 'Used Canon EOS R6 Camera', price: 85000, purchasePrice: 70000, category: 'Electronics', brand: 'Canon', countInStock: 1, barcode: 'DEMO-CLF-001', tags: ['classified'], description: 'Like-new condition, shutter count 5000, includes kit lens 24-105mm.' },
  { name: 'Vintage Wooden Dining Table', price: 22000, purchasePrice: 15000, category: 'Furniture', brand: 'AntiqueCraft', countInStock: 1, barcode: 'DEMO-CLF-002', tags: ['classified'], description: 'Solid teak wood, seats 6-8 people, 15 years old, excellent condition.' },

  // --- Digital Products ---
  { name: 'Photo Editing Masterclass Video', price: 1499, purchasePrice: 500, category: 'Education', brand: 'LearnPro', countInStock: 999, barcode: 'DEMO-DIG-001', isDigital: true, description: 'Complete video course on photo editing with Photoshop and Lightroom.', digitalFileUrl: 'https://example.com/courses/photo-masterclass' },
  { name: 'Ultimate Web Templates Bundle', price: 2499, purchasePrice: 800, category: 'Digital Assets', brand: 'PixelForge', countInStock: 999, barcode: 'DEMO-DIG-002', isDigital: true, description: '50+ premium responsive HTML/CSS website templates.' },

  // --- Seller Products (will assign to a seller user) ---
  { name: 'Handmade Ceramic Coffee Mug Set', price: 1299, purchasePrice: 700, category: 'Home & Living', brand: 'ArtisanCraft', countInStock: 30, barcode: 'DEMO-SEL-001', description: 'Set of 4 handmade ceramic mugs, microwave and dishwasher safe.' },
  { name: 'Bamboo Cutting Board', price: 599, purchasePrice: 350, category: 'Kitchen', brand: 'EcoHome', countInStock: 75, barcode: 'DEMO-SEL-002', description: 'Natural organic bamboo cutting board, double-sided, juice groove.' },

  // --- Flash Sale Products ---
  { name: 'Smart LED Light Bulb (RGB)', price: 399, purchasePrice: 200, category: 'Electronics', brand: 'BrightLife', countInStock: 100, barcode: 'DEMO-FLS-001', isFlashSale: true, discountPercent: 40, description: 'WiFi-enabled RGB smart bulb, works with Alexa and Google Home.' },

  // --- More products for variety ---
  { name: 'Men\'s Running Shoes', price: 3499, purchasePrice: 2200, category: 'Fashion', brand: 'SportFlex', countInStock: 45, barcode: 'DEMO-GEN-001', description: 'Lightweight breathable running shoes with cushioned sole.' },
  { name: 'Women\'s Cotton T-Shirt Pack (3)', price: 1199, purchasePrice: 700, category: 'Fashion', brand: 'CottonComfort', countInStock: 80, barcode: 'DEMO-GEN-002', description: 'Soft premium cotton, pack of 3 assorted colors.' },
  { name: 'Bluetooth Portable Speaker', price: 1899, purchasePrice: 1200, category: 'Electronics', brand: 'SoundMax', countInStock: 35, barcode: 'DEMO-GEN-003', description: 'Waterproof portable speaker, 20hr battery, deep bass.' },
  { name: 'Yoga Mat Premium 6mm', price: 899, purchasePrice: 500, category: 'Sports', brand: 'FlexFit', countInStock: 60, barcode: 'DEMO-GEN-004', description: 'Non-slip TPE yoga mat, includes carrying strap.' },
  { name: 'Natural Honey 500g', price: 599, purchasePrice: 350, category: 'Groceries', brand: 'NatureLeaf', countInStock: 90, barcode: 'DEMO-GEN-005', description: 'Pure raw natural honey, no added sugar.' },
];

async function main() {
  console.log('Logging in as admin...');
  const loginRes = await fetch(`${API_URL}/users/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@shopio.com', password: 'admin123' }),
  });

  let loginData;
  if (!loginRes.ok) {
    const login2 = await fetch(`${API_URL}/users/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@gorolyshop.com', password: 'password' }),
    });
    if (!login2.ok) {
      console.error('Failed to login. Make sure the backend server is running.');
      process.exit(1);
    }
    loginData = await login2.json();
  } else {
    loginData = await loginRes.json();
  }

  const token = loginData.token || (loginData.user && loginData.user.token);
  if (!token) {
    console.error('No token received in login response:', JSON.stringify(loginData));
    process.exit(1);
  }

  console.log('Admin login successful. Creating demo products...');
  let success = 0;
  let failed = 0;

  for (const product of DEMO_PRODUCTS) {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...product,
          isPublished: true,
          isFeatured: Math.random() > 0.7,
          isTodaysDeal: Math.random() > 0.85,
          cashOnDelivery: true,
          shippingDays: Math.floor(Math.random() * 5) + 1,
          unit: 'pc',
          minOrderQty: 1,
          slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
        }),
      });

      const resText = await res.text();
      let errData;
      try { errData = JSON.parse(resText); } catch(e) { errData = { message: resText }; }
      if (res.ok) {
        success++;
        console.log(`  ✓ ${product.name}`);
      } else {
        console.log(`  ✗ ${product.name}: ${errData.message || errData.error || res.status + ' ' + resText.slice(0, 100)}`);
        failed++;
      }
    } catch (err) {
      console.log(`  ✗ ${product.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} products created, ${failed} failed.`);
}

main().catch(console.error);
