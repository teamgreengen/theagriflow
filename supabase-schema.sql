-- =============================================
-- AGRIFLOW DATABASE SCHEMA - COMPLETE
-- =============================================

-- Drop existing tables (run in order to handle dependencies)
DROP TABLE IF EXISTS rider_withdrawals CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS platform_stats CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS riders CASCADE;
DROP TABLE IF EXISTS sellers CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin', 'super_admin', 'rider')),
  phone TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sellerId UUID REFERENCES users(id),
  categoryId UUID,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'piece',
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  parentId UUID REFERENCES categories(id),
  orderIndex INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. ORDERS TABLE
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderNumber TEXT UNIQUE,
  userId UUID REFERENCES users(id),
  sellerId UUID REFERENCES users(id),
  riderId UUID REFERENCES users(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2),
  deliveryFee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  paymentStatus TEXT DEFAULT 'pending',
  paymentMethod TEXT,
  paymentReference TEXT,
  delivery JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. BANNERS TABLE
-- =============================================
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image TEXT NOT NULL,
  link TEXT,
  buttonText TEXT,
  active BOOLEAN DEFAULT true,
  orderIndex INTEGER DEFAULT 0,
  type TEXT DEFAULT 'hero',
  startDate TIMESTAMPTZ,
  endDate TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productId UUID REFERENCES products(id),
  userId UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. SETTINGS TABLE
-- =============================================
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  value JSONB,
  description TEXT,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. EARNINGS TABLE
-- =============================================
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  orderId UUID REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT DEFAULT 'sale',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. SELLERS TABLE
-- =============================================
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id) UNIQUE,
  storeName TEXT,
  storeSlug TEXT UNIQUE,
  description TEXT,
  logo TEXT,
  banner TEXT,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  totalSales INTEGER DEFAULT 0,
  totalOrders INTEGER DEFAULT 0,
  totalEarnings DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. RIDERS TABLE
-- =============================================
CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id) UNIQUE,
  available BOOLEAN DEFAULT true,
  totalDeliveries INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0,
  vehicleType TEXT,
  licenseNumber TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. SYSTEM LOGS TABLE
-- =============================================
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entityType TEXT,
  entityId TEXT,
  details JSONB,
  ipAddress TEXT,
  userAgent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 12. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 13. PLATFORM STATS TABLE
-- =============================================
CREATE TABLE platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  newUsers INTEGER DEFAULT 0,
  newSellers INTEGER DEFAULT 0,
  newOrders INTEGER DEFAULT 0,
  totalRevenue DECIMAL(10,2) DEFAULT 0,
  totalOrders INTEGER DEFAULT 0,
  activeUsers INTEGER DEFAULT 0,
  activeSellers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 14. DELIVERIES TABLE
-- =============================================
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID REFERENCES orders(id),
  sellerId UUID REFERENCES users(id),
  riderId UUID REFERENCES users(id),
  userId UUID REFERENCES users(id),
  pickupAddress TEXT,
  deliveryAddress TEXT,
  deliveryPhone TEXT,
  fee DECIMAL(10,2) DEFAULT 15,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 15. ADDRESSES TABLE
-- =============================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  label TEXT DEFAULT 'Home',
  street TEXT,
  city TEXT,
  region TEXT,
  phone TEXT,
  isDefault BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 16. WISHLIST TABLE
-- =============================================
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  productId UUID REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(userId, productId)
);

-- =============================================
-- 17. WITHDRAWALS TABLE
-- =============================================
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sellerId UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  method TEXT,
  accountDetails TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 18. RIDER WITHDRAWALS TABLE
-- =============================================
CREATE TABLE rider_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  riderId UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  method TEXT,
  accountDetails TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_withdrawals ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - PUBLIC READ
-- =============================================
CREATE POLICY "Public can read products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Public can read banners" ON banners FOR SELECT USING (active = true);
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);

-- =============================================
-- RLS POLICIES - AUTHENTICATED USERS
-- =============================================
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = userId OR auth.uid() = sellerId OR auth.uid() = riderId);
CREATE POLICY "Users can read own addresses" ON addresses FOR SELECT USING (auth.uid() = userId);
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = userId);
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = userId);

-- =============================================
-- RLS POLICIES - SELLERS
-- =============================================
CREATE POLICY "Sellers can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM sellers WHERE sellers.userId = auth.uid())
);
CREATE POLICY "Sellers can manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM sellers WHERE sellers.userId = auth.uid() AND sellers.id = orders.sellerId)
);
CREATE POLICY "Sellers can manage earnings" ON earnings FOR ALL USING (
  EXISTS (SELECT 1 FROM sellers WHERE sellers.userId = auth.uid())
);
CREATE POLICY "Sellers can manage withdrawals" ON withdrawals FOR ALL USING (auth.uid() = sellerId);

-- =============================================
-- RLS POLICIES - RIDERS
-- =============================================
CREATE POLICY "Riders can manage deliveries" ON deliveries FOR ALL USING (auth.uid() = riderId);
CREATE POLICY "Riders can manage earnings" ON earnings FOR ALL USING (auth.uid() = userId);
CREATE POLICY "Riders can manage rider_withdrawals" ON rider_withdrawals FOR ALL USING (auth.uid() = riderId);

-- =============================================
-- RLS POLICIES - ADMIN/SUPER_ADMIN
-- =============================================
CREATE POLICY "Admins can read all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can read all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage banners" ON banners FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage settings" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "SuperAdmin can manage system_logs" ON system_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'super_admin')
);
CREATE POLICY "Admins can manage sellers" ON sellers FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage riders" ON riders FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);

-- =============================================
-- DEFAULT SETTINGS
-- =============================================
INSERT INTO settings (id, value, category) VALUES 
  ('platform', '{"name": "Agriflow", "tagline": "Ghana''s Agricultural Marketplace"}', 'general'),
  ('commission', '{"rate": 10, "minWithdrawal": 50}', 'business'),
  ('delivery', '{"fee": 15, "freeThreshold": 100, "type": "flat"}', 'business'),
  ('contact', '{"email": "support@agriflow.com", "phone": "+233241234567", "address": "Accra, Ghana"}', 'contact'),
  ('social', '{"facebook": "", "twitter": "", "instagram": "", "whatsapp": ""}', 'contact'),
  ('features', '{"maintenanceMode": false, "registrationEnabled": true, "sellerApprovalRequired": true}', 'general'),
  ('branding', '{"logo": "", "favicon": "", "primaryColor": "#2d5a27", "secondaryColor": "#f59e0b"}', 'branding')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- DEFAULT CATEGORIES
-- =============================================
INSERT INTO categories (name, description, image, orderIndex, active) VALUES
  ('Vegetables', 'Fresh vegetables from local farms', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', 1, true),
  ('Fruits', 'Fresh tropical fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', 2, true),
  ('Cereals & Grains', 'Rice, maize, beans and more', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 3, true),
  ('Livestock', 'Cattle, goats, sheep', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400', 4, true),
  ('Poultry', 'Chickens, eggs, ducks', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400', 5, true),
  ('Fresh Herbs', 'Basil, mint, parsley and more', 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400', 6, true),
  ('Spices', 'Pepper, ginger, turmeric and more', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 7, true),
  ('Seeds', 'Plant seeds and seedlings', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 8, true),
  ('Farm Tools', 'Agricultural equipment', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400', 9, true),
  ('Processed', 'Processed agricultural products', 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400', 10, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- DEFAULT BANNERS
-- =============================================
INSERT INTO banners (title, subtitle, image, link, active, orderIndex, type) VALUES
  ('Fresh from Ghana''s Farms', 'Buy directly from local farmers', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200', '/products', true, 1, 'hero'),
  ('Start Selling Today', 'Reach thousands of customers', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', '/seller/register', true, 2, 'hero')
ON CONFLICT DO NOTHING;

-- =============================================
-- SUPER ADMIN USER
-- =============================================
INSERT INTO users (email, name, role, created_at) VALUES 
  ('teamgreengen@gmail.com', 'Team Green Gen', 'super_admin', NOW())
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';

-- =============================================
-- NOTE: STORAGE SETUP
-- =============================================
-- Create 'images' bucket in Supabase Dashboard → Storage
-- Then add these policies manually in Storage policies UI:
--
-- Policy 1: "Public can read images"
--   FOR: SELECT
--   TO: public
--   USING: bucket_id = 'images'
--
-- Policy 2: "Authenticated can upload"
--   FOR: INSERT
--   TO: authenticated
--   WITH CHECK: bucket_id = 'images'
--
-- Policy 3: "Authenticated can update"
--   FOR: UPDATE  
--   TO: authenticated
--   USING: bucket_id = 'images'