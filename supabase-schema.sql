-- Migration: Firebase Firestore → Supabase PostgreSQL
-- Updated: Additional tables for SuperAdmin

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'buyer',
  phone TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'active',
  emailVerified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sellerId UUID REFERENCES users(id),
  categoryId UUID,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT,
  stock INTEGER DEFAULT 0,
  images TEXT[],
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  parentId UUID REFERENCES categories(id),
  orderIndex INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderNumber TEXT UNIQUE,
  userId UUID REFERENCES users(id),
  sellerId UUID REFERENCES users(id),
  riderId UUID REFERENCES users(id),
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2),
  deliveryFee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  paymentStatus TEXT DEFAULT 'pending',
  paymentMethod TEXT,
  paymentReference TEXT,
  shippingAddress JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image TEXT NOT NULL,
  link TEXT,
  buttonText TEXT,
  active BOOLEAN DEFAULT true,
  orderIndex INTEGER DEFAULT 0,
  startDate TIMESTAMPTZ,
  endDate TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productId UUID REFERENCES products(id),
  userId UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Settings Table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  value JSONB,
  description TEXT,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Earnings Table
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  orderId UUID REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT DEFAULT 'sale',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Sellers Table
CREATE TABLE IF NOT EXISTS sellers (
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

-- 10. Riders Table
CREATE TABLE IF NOT EXISTS riders (
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

-- 11. System Logs (for SuperAdmin audit trail)
CREATE TABLE IF NOT EXISTS system_logs (
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

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Platform Analytics (daily stats snapshot)
CREATE TABLE IF NOT EXISTS platform_stats (
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

-- Enable Row Level Security
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

-- RLS Policies for Public Read
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (active = true);

-- RLS Policies for Authenticated Users
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = userId OR auth.uid() = sellerId OR auth.uid() = riderId);

-- Admin/SuperAdmin can read all
CREATE POLICY "Admins read all users" ON users FOR SELECT USING (role IN ('admin', 'super_admin'));
CREATE POLICY "Admins read all orders" ON orders FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "Admins manage settings" ON settings FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "Admins manage system_logs" ON system_logs FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "Admins manage notifications" ON notifications FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));

-- Storage Bucket for Images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() IN ('authenticated', 'anon'));
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.role() IN ('authenticated', 'anon'));

-- Insert default settings
INSERT INTO settings (id, value, category) VALUES 
  ('platform', '{"name": "Agriflow", "tagline": "Ghana''s Agricultural Marketplace"}', 'general'),
  ('commission', '{"rate": 10, "minWithdrawal": 50}', 'business'),
  ('delivery', '{"fee": 15, "freeThreshold": 100, "type": "flat"}', 'business'),
  ('contact', '{"email": "support@agriflow.com", "phone": "+233241234567", "address": "Accra, Ghana"}', 'contact'),
  ('social', '{"facebook": "", "twitter": "", "instagram": "", "whatsapp": ""}', 'contact'),
  ('features', '{"maintenanceMode": false, "registrationEnabled": true, "sellerApprovalRequired": true}', 'general')
ON CONFLICT (id) DO NOTHING;