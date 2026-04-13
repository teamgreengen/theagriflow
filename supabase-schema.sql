-- =============================================
-- AGRIFLOW DATABASE TABLES ONLY
-- Drop existing tables (run in order)
-- =============================================
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

-- 1. USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'buyer',
  phone TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
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

-- 3. PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sellerId UUID REFERENCES users(id) ON DELETE CASCADE,
  categoryId UUID REFERENCES categories(id) ON DELETE SET NULL,
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

-- 4. ORDERS
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
  status TEXT DEFAULT 'pending',
  paymentStatus TEXT DEFAULT 'pending',
  paymentMethod TEXT,
  paymentReference TEXT,
  delivery JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BANNERS
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productId UUID REFERENCES products(id),
  userId UUID REFERENCES users(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SETTINGS
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  value JSONB,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EARNINGS
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  orderId UUID REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT DEFAULT 'sale',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SELLERS
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

-- 10. RIDERS
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

-- 11. SYSTEM_LOGS
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entityType TEXT,
  entityId TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS
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

-- 13. DELIVERIES
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
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ADDRESSES
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

-- 15. WISHLIST
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  productId UUID REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(userId, productId)
);

-- 16. WITHDRAWALS
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sellerId UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  method TEXT,
  accountDetails TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. RIDER_WITHDRAWALS
CREATE TABLE rider_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  riderId UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  method TEXT,
  accountDetails TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- 1. HANDLER FOR NEW USERS FROM AUTH
-- This trigger automatically synchronizes Supabase users into our public profile table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run handle_new_user() on every signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. UPDATED_AT TRIGGER FUNCTION
-- Automatically updates the 'updated_at' timestamp on record updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adding update triggers to core system tables
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
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
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Public products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Public categories" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Public banners" ON banners FOR SELECT USING (active = true);

CREATE POLICY "Users own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users orders" ON orders FOR SELECT USING (auth.uid() = userId OR auth.uid() = sellerId OR auth.uid() = riderId);
CREATE POLICY "Users addresses" ON addresses FOR ALL USING (auth.uid() = userId);
CREATE POLICY "Users wishlist" ON wishlist FOR ALL USING (auth.uid() = userId);

CREATE POLICY "Sellers products" ON products FOR ALL USING (EXISTS (SELECT 1 FROM sellers WHERE sellers.userId = auth.uid()));
CREATE POLICY "Sellers orders" ON orders FOR ALL USING (EXISTS (SELECT 1 FROM sellers WHERE sellers.userId = auth.uid() AND sellers.id = orders.sellerId));

CREATE POLICY "Riders deliveries" ON deliveries FOR ALL USING (auth.uid() = riderId);

CREATE POLICY "Admins users" ON users FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins orders" ON orders FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins products" ON products FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins categories" ON categories FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins banners" ON banners FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins settings" ON settings FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins notifications" ON notifications FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "SuperAdmin logs" ON system_logs FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "Admins sellers" ON sellers FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins riders" ON riders FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- REVIEWS POLICIES
CREATE POLICY "Public reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = userId);
CREATE POLICY "Users delete own reviews" ON reviews FOR DELETE USING (auth.uid() = userId);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_products_category ON products(categoryId);
CREATE INDEX idx_products_seller ON products(sellerId);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);

CREATE INDEX idx_orders_user ON orders(userId);
CREATE INDEX idx_orders_seller ON orders(sellerId);
CREATE INDEX idx_orders_rider ON orders(riderId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(orderNumber);

CREATE INDEX idx_categories_parent ON categories(parentId);
CREATE INDEX idx_reviews_product ON reviews(productId);

CREATE INDEX idx_earnings_user ON earnings(userId);
CREATE INDEX idx_earnings_status ON earnings(status);

CREATE INDEX idx_deliveries_order ON deliveries(orderId);
CREATE INDEX idx_deliveries_rider ON deliveries(riderId);
CREATE INDEX idx_deliveries_status ON deliveries(status);

CREATE INDEX idx_sellers_status ON sellers(status);
CREATE INDEX idx_sellers_slug ON sellers(storeSlug);

CREATE INDEX idx_riders_available ON riders(available);
CREATE INDEX idx_riders_user ON riders(userId);

CREATE INDEX idx_system_logs_user ON system_logs(userId);
CREATE INDEX idx_notifications_user ON notifications(userId);
CREATE INDEX idx_notifications_read ON notifications(read);

-- DEFAULT SETTINGS
INSERT INTO settings (id, value, category) VALUES 
  ('platform', '{"name": "Agriflow", "tagline": "Ghana''s Agricultural Marketplace"}', 'general'),
  ('commission', '{"rate": 10, "minWithdrawal": 50}', 'business'),
  ('delivery', '{"fee": 15, "freeThreshold": 100, "type": "flat"}', 'business'),
  ('contact', '{"email": "support@agriflow.com", "phone": "+233241234567", "address": "Accra, Ghana"}', 'contact'),
  ('social', '{"facebook": "", "twitter": "", "instagram": "", "whatsapp": ""}', 'contact'),
  ('features', '{"maintenanceMode": false, "registrationEnabled": true, "sellerApprovalRequired": true}', 'general'),
  ('branding', '{"logo": "", "favicon": "", "primaryColor": "#2d5a27", "secondaryColor": "#f59e0b"}', 'branding')
ON CONFLICT (id) DO NOTHING;

-- DEFAULT CATEGORIES
INSERT INTO categories (name, description, image, orderIndex, active) VALUES
  ('Vegetables', 'Fresh vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', 1, true),
  ('Fruits', 'Fresh fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', 2, true),
  ('Cereals', 'Rice, maize, beans', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 3, true),
  ('Livestock', 'Cattle, goats', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400', 4, true),
  ('Poultry', 'Chickens, eggs', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400', 5, true),
  ('Herbs', 'Fresh herbs', 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400', 6, true),
  ('Spices', 'Pepper, ginger', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 7, true),
  ('Seeds', 'Plant seeds', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 8, true),
  ('Farm Tools', 'Equipment', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400', 9, true),
  ('Processed', 'Processed foods', 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400', 10, true);

-- DEFAULT BANNERS
INSERT INTO banners (title, subtitle, image, link, active, orderIndex, type) VALUES
  ('Fresh from Ghana''s Farms', 'Buy directly from local farmers', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200', '/products', true, 1, 'hero'),
  ('Start Selling Today', 'Reach thousands of customers', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', '/seller/register', true, 2, 'hero');

-- SUPER ADMIN USER
INSERT INTO users (email, name, role, created_at) VALUES 
  ('teamgreengen@gmail.com', 'Team Green Gen', 'super_admin', NOW())
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';

-- DONE! Tables created successfully.
-- Your images bucket already exists - just make sure to add policies in Storage settings.