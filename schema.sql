-- ============================================================
-- SHOPIO - Complete Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  phone         TEXT DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('superadmin','admin','manager','moderator','customer','seller')),
  permissions   TEXT[] DEFAULT '{}',
  nid_number    TEXT,
  nid_image_front TEXT,
  nid_image_back TEXT,
  verification_status TEXT DEFAULT 'Not Verified',
  steadfast_api_key TEXT DEFAULT '',
  steadfast_secret_key TEXT DEFAULT '',
  steadfast_enabled BOOLEAN DEFAULT false,
  order_automation_enabled BOOLEAN DEFAULT false,
  twilio_account_sid TEXT DEFAULT '',
  twilio_auth_token TEXT DEFAULT '',
  twilio_from_number TEXT DEFAULT '',
  elevenlabs_api_key TEXT DEFAULT '',
  elevenlabs_voice_id TEXT DEFAULT '',
  openai_api_key TEXT DEFAULT '',
  openai_model TEXT DEFAULT 'gpt-5.2',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. IMAGES TABLE (Central image registry — links to Supabase Storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename      TEXT NOT NULL,
  original_name TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  public_url    TEXT NOT NULL,
  mime_type     TEXT DEFAULT 'image/jpeg',
  size_bytes    BIGINT DEFAULT 0,
  bucket        TEXT DEFAULT 'images',
  uploaded_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  image_url  TEXT DEFAULT '',
  image_id   UUID REFERENCES images(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. BRANDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  image_url  TEXT DEFAULT '',
  image_id   UUID REFERENCES images(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  name               TEXT NOT NULL,
  image_url          TEXT NOT NULL DEFAULT '',
  image_id           UUID REFERENCES images(id) ON DELETE SET NULL,
  brand              TEXT NOT NULL DEFAULT '',
  category           TEXT NOT NULL DEFAULT '',
  description        TEXT NOT NULL DEFAULT '',
  rating             NUMERIC(3,2) NOT NULL DEFAULT 0,
  num_reviews        INT NOT NULL DEFAULT 0,
  price              NUMERIC(10,2) NOT NULL DEFAULT 0,
  count_in_stock     INT NOT NULL DEFAULT 0,
  discount_percent   NUMERIC(10,2) DEFAULT 0,
  discount_type      TEXT DEFAULT 'percent' CHECK (discount_type IN ('percent', 'flat')),
  is_flash_sale      BOOLEAN DEFAULT false,
  flash_sale_start   TIMESTAMPTZ,
  flash_sale_end     TIMESTAMPTZ,
  is_digital         BOOLEAN DEFAULT false,
  digital_file_url   TEXT DEFAULT '',
  youtube_url        TEXT DEFAULT '',
  meta_title         TEXT DEFAULT '',
  meta_description   TEXT DEFAULT '',
  tags               TEXT[] DEFAULT '{}',
  unit               TEXT DEFAULT 'pc',
  min_order_qty      INT DEFAULT 1,
  barcode            TEXT DEFAULT '',
  slug               TEXT DEFAULT '',
  shipping_days      INT DEFAULT 2,
  cash_on_delivery   BOOLEAN DEFAULT true,
  is_published       BOOLEAN DEFAULT true,
  is_catalog         BOOLEAN DEFAULT true,
  is_todays_deal     BOOLEAN DEFAULT false,
  is_featured        BOOLEAN DEFAULT false,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. PRODUCT IMAGES TABLE (Multiple images per product)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  image_id   UUID REFERENCES images(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  rating     NUMERIC(3,2) NOT NULL,
  comment    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Shipping Address
  shipping_name           TEXT NOT NULL DEFAULT '',
  shipping_address        TEXT NOT NULL DEFAULT '',
  shipping_city           TEXT NOT NULL DEFAULT '',
  shipping_postal_code    TEXT NOT NULL DEFAULT '',
  shipping_phone          TEXT NOT NULL DEFAULT '',
  -- Payment
  payment_method          TEXT NOT NULL DEFAULT 'Cash on Delivery',
  payment_result_id       TEXT DEFAULT '',
  payment_result_status   TEXT DEFAULT '',
  payment_result_time     TEXT DEFAULT '',
  payment_result_email    TEXT DEFAULT '',
  -- Shipping Method snapshot
  shipping_method_id      TEXT DEFAULT '',
  shipping_method_name    TEXT DEFAULT '',
  shipping_method_price   NUMERIC(10,2) DEFAULT 0,
  shipping_method_days    TEXT DEFAULT '',
  -- Courier
  courier_provider        TEXT DEFAULT '',
  courier_tracking_code   TEXT DEFAULT '',
  courier_status          TEXT DEFAULT 'Pending',
  -- Pricing
  items_price             NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price             NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Advance Payment
  advance_payment         BOOLEAN DEFAULT false,
  advance_amount          NUMERIC(10,2) DEFAULT 0,
  -- Status
  is_paid                 BOOLEAN NOT NULL DEFAULT false,
  paid_at                 TIMESTAMPTZ,
  status                  TEXT NOT NULL DEFAULT 'Pending'
                            CHECK (status IN ('Pending','Processing','Shipped','Delivered','Cancelled')),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  qty        INT NOT NULL DEFAULT 1,
  image      TEXT NOT NULL DEFAULT '',
  price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. COUPONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        TEXT NOT NULL UNIQUE,
  discount    NUMERIC(5,2) NOT NULL DEFAULT 0,
  expiry_date TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. SHIPPING METHODS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS shipping_methods (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  estimated_days TEXT NOT NULL DEFAULT '5-7 business days',
  description    TEXT DEFAULT '',
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. BANNERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT DEFAULT '',
  subtitle   TEXT DEFAULT '',
  image_url  TEXT NOT NULL DEFAULT '',
  image_id   UUID REFERENCES images(id) ON DELETE SET NULL,
  link       TEXT DEFAULT '',
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. OFFERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS offers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT DEFAULT '',
  discount_percent NUMERIC(5,2) DEFAULT 0,
  image_url        TEXT DEFAULT '',
  image_id         UUID REFERENCES images(id) ON DELETE SET NULL,
  link             TEXT DEFAULT '',
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. PAGES TABLE (CMS pages)
-- ============================================================
CREATE TABLE IF NOT EXISTS pages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  content      TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. SETTINGS TABLE (Single row — global site settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id                           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- OTP
  otp_gateway                  TEXT DEFAULT 'Simulated'
                                 CHECK (otp_gateway IN ('Simulated','Twilio','Firebase','GreenwebSMS','SAS_BULK_SMS')),
  otp_length                   INT DEFAULT 6,
  otp_expiry                   INT DEFAULT 5,
  -- SAS Bulk SMS
  sas_sms_gateway_url          TEXT DEFAULT '',
  sas_sms_api_key              TEXT DEFAULT '',
  sas_sms_secret_key           TEXT DEFAULT '',
  sas_sms_sender_id            TEXT DEFAULT '',
  -- bKash
  bkash_mode                   TEXT DEFAULT 'Sandbox',
  bkash_enabled                BOOLEAN DEFAULT true,
  bkash_merchant_number        TEXT DEFAULT '01700000000',
  -- Nagad
  nagad_mode                   TEXT DEFAULT 'Sandbox',
  nagad_enabled                BOOLEAN DEFAULT true,
  nagad_merchant_id            TEXT DEFAULT 'NAGAD12345',
  -- Rupantor Pay
  rupantor_pay_mode            TEXT DEFAULT 'Sandbox',
  rupantor_pay_enabled         BOOLEAN DEFAULT true,
  rupantor_pay_store_id        TEXT DEFAULT '',
  rupantor_pay_signature_key   TEXT DEFAULT '',
  -- SSLCommerz
  sslcommerz_mode              TEXT DEFAULT 'Sandbox',
  sslcommerz_enabled           BOOLEAN DEFAULT true,
  sslcommerz_store_id          TEXT DEFAULT 'shopio_ssl_mock',
  -- COD / Advance Payment
  cod_enabled                  BOOLEAN DEFAULT true,
  advance_payment_enabled      BOOLEAN DEFAULT false,
  advance_payment_threshold    NUMERIC(10,2) DEFAULT 1000,
  advance_payment_percent      NUMERIC(5,2) DEFAULT 50,
  -- Analytics
  facebook_pixel_id            TEXT DEFAULT '',
  facebook_access_token        TEXT DEFAULT '',
  ga4_measurement_id           TEXT DEFAULT '',
  google_tag_manager_id        TEXT DEFAULT '',
  google_tag_manager_enabled   BOOLEAN DEFAULT false,
  -- Footer
  footer_email                 TEXT DEFAULT 'support@shopio.com',
  footer_phone                 TEXT DEFAULT '+880 1712-345678',
  footer_address               TEXT DEFAULT 'Dhaka, Bangladesh',
  footer_copyright             TEXT DEFAULT '© 2026 Shopio BD. All rights reserved.',
  footer_newsletter_title      TEXT DEFAULT 'Subscribe to our newsletter',
  footer_newsletter_subtitle   TEXT DEFAULT 'Get the latest updates on new products, flash sales, and exclusive coupons.',
  footer_facebook              TEXT DEFAULT '',
  footer_twitter               TEXT DEFAULT '',
  footer_instagram             TEXT DEFAULT '',
  footer_youtube               TEXT DEFAULT '',
  -- Popup
  popup_enabled                BOOLEAN DEFAULT false,
  popup_title                  TEXT DEFAULT 'Special Offer!',
  popup_text                   TEXT DEFAULT 'Get 20% off your first order. Use code: WELCOME20',
  popup_image                  TEXT DEFAULT '',
  popup_link                   TEXT DEFAULT '',
  popup_delay                  INT DEFAULT 3,
  -- Recent Sale Popup
  recent_sale_enabled          BOOLEAN DEFAULT true,
  recent_sale_interval         INT DEFAULT 30,
  custom_header_code           TEXT DEFAULT '',
  -- Currency
  currency                     TEXT DEFAULT 'BDT',
  currency_symbol              TEXT DEFAULT '৳',
  -- Branding
  site_title                   TEXT DEFAULT 'Shopio - E-Commerce',
  favicon_url                  TEXT DEFAULT '',
  header_logo                  TEXT DEFAULT '',
  footer_logo                  TEXT DEFAULT '',
  header_bg_color              TEXT DEFAULT '#F97316',
  header_text_color            TEXT DEFAULT '#FFFFFF',
  header_accent_color          TEXT DEFAULT '#FF6600',
  notice_bar_enabled           BOOLEAN DEFAULT true,
  notice_bar_text              TEXT DEFAULT 'Summer Sale - All Swim Suits OFF 50%! Free delivery on orders over ৳999.',
  notice_bar_bg_color          TEXT DEFAULT '#6F1BE4',
  notice_bar_text_color        TEXT DEFAULT '#FFFFFF',
  created_at                   TIMESTAMPTZ DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. VIDEOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  video_url   TEXT NOT NULL,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  likes       INT DEFAULT 0,
  liked_by    TEXT[] DEFAULT '{}',
  shares      INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 17. VIDEO COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS video_comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  comment    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 18. CHAT SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username   TEXT DEFAULT 'Guest',
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  is_closed  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 19. CHAT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  username   TEXT DEFAULT 'Guest',
  message    TEXT NOT NULL,
  is_admin   BOOLEAN DEFAULT false,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category      ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand         ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_flash_sale    ON products(is_flash_sale);
CREATE INDEX IF NOT EXISTS idx_orders_user_id         ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id     ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_by     ON images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_video_comments_video   ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session  ON chat_messages(session_id);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at            BEFORE UPDATE ON users            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_categories_updated_at       BEFORE UPDATE ON categories       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_brands_updated_at           BEFORE UPDATE ON brands           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_products_updated_at         BEFORE UPDATE ON products         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_reviews_updated_at          BEFORE UPDATE ON reviews          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_orders_updated_at           BEFORE UPDATE ON orders           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_coupons_updated_at          BEFORE UPDATE ON coupons          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_shipping_updated_at         BEFORE UPDATE ON shipping_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_banners_updated_at          BEFORE UPDATE ON banners          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_offers_updated_at           BEFORE UPDATE ON offers           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_pages_updated_at            BEFORE UPDATE ON pages            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_settings_updated_at         BEFORE UPDATE ON settings         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_videos_updated_at           BEFORE UPDATE ON videos           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_chat_sessions_updated_at    BEFORE UPDATE ON chat_sessions    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default settings row (only one row ever)
INSERT INTO settings (id)
VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- Default admin user
-- Password: admin123  (bcrypt hash below)
INSERT INTO users (name, email, password_hash, is_admin, role, permissions)
VALUES (
  'Admin',
  'admin@shopio.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lT9i',
  true,
  'superadmin',
  ARRAY['orders','products','categories','brands','coupons','shipping','pages','offers','banners','chat','settings','users']
)
ON CONFLICT (email) DO NOTHING;

-- Default customer user
-- Password: user123
INSERT INTO users (name, email, password_hash, is_admin, role)
VALUES (
  'John Doe',
  'user@shopio.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  false,
  'customer'
)
ON CONFLICT (email) DO NOTHING;



-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Enable after adding policies
-- ============================================================
-- Run these only after you have set up your RLS policies:
--
-- ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE images         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_sessions  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages  ENABLE ROW LEVEL SECURITY;
