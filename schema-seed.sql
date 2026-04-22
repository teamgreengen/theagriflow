-- Supabase SQL Schema for StingyMarkets
-- Run in Supabase SQL Editor

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  wallet DECIMAL(10,2) DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  cat_image TEXT,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcat TEXT NOT NULL,
  cat_id UUID REFERENCES categories(id),
  status INTEGER DEFAULT 1
);

-- Sellers
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  b_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  wallet DECIMAL(10,2) DEFAULT 0,
  commission DECIMAL(5,2) DEFAULT 5,
  status INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  cat_id UUID REFERENCES categories(id),
  subcat_id UUID REFERENCES subcategories(id),
  short_desc TEXT,
  description TEXT,
  disclaimer TEXT,
  price DECIMAL(10,2) NOT NULL,
  fa DECIMAL(10,2) NOT NULL,
  qty INTEGER DEFAULT 0,
  sku TEXT,
  img1 TEXT, img2 TEXT, img3 TEXT, img4 TEXT,
  status INTEGER DEFAULT 1,
  approved BOOLEAN DEFAULT FALSE,
  added_by UUID REFERENCES sellers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- City
CREATE TABLE IF NOT EXISTS city (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL,
  state_id UUID,
  status INTEGER DEFAULT 1
);

-- User Address
CREATE TABLE IF NOT EXISTS user_address (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  u_id UUID REFERENCES users(id),
  user_name TEXT,
  user_mobile TEXT,
  address TEXT,
  city_id UUID REFERENCES city(id),
  pincode TEXT,
  landmark TEXT,
  address_type TEXT DEFAULT 'home',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  u_id UUID REFERENCES users(id),
  belonging_city UUID REFERENCES city(id),
  total DECIMAL(10,2) DEFAULT 0,
  ship_fee DECIMAL(10,2) DEFAULT 0,
  promo DECIMAL(10,2) DEFAULT 0,
  is_applied INTEGER DEFAULT 0,
  wl_amt DECIMAL(10,2) DEFAULT 0,
  is_add_w INTEGER DEFAULT 0,
  final_amt DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart Detail
CREATE TABLE IF NOT EXISTS cart_detail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES cart(id),
  p_id UUID REFERENCES product(id),
  qty INTEGER DEFAULT 1
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  u_id UUID REFERENCES users(id),
  o_id TEXT UNIQUE,
  ad_id UUID REFERENCES user_address(id),
  txnid TEXT,
  total_amt DECIMAL(10,2),
  ship_fee_order DECIMAL(10,2),
  final_val DECIMAL(10,2),
  payment_type INTEGER,
  payment_status TEXT DEFAULT 'pending',
  order_status INTEGER DEFAULT 1,
  dv_date UUID,
  dv_boy_id UUID,
  is_p_app INTEGER DEFAULT 0,
  is_w_ap INTEGER DEFAULT 0,
  prmo DECIMAL(10,2) DEFAULT 0,
  wlmt DECIMAL(10,2) DEFAULT 0,
  payu_status TEXT,
  mihpayid TEXT,
  u_cnfrm INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Detail
CREATE TABLE IF NOT EXISTS order_detail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oid UUID REFERENCES orders(id),
  p_id UUID REFERENCES product(id),
  qty INTEGER DEFAULT 1,
  price DECIMAL(10,2)
);

-- Order Time
CREATE TABLE IF NOT EXISTS order_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oid UUID REFERENCES orders(id),
  o_status INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  u_id UUID REFERENCES users(id),
  p_id UUID REFERENCES product(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(u_id, p_id)
);

-- Wallet Transaction
CREATE TABLE IF NOT EXISTS wallet_txn (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  u_id UUID REFERENCES users(id),
  amount DECIMAL(10,2),
  type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  discount DECIMAL(10,2),
  min_order DECIMAL(10,2),
  status INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery Time
CREATE TABLE IF NOT EXISTS dv_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_time TIME,
  to_time TIME,
  status INTEGER DEFAULT 1
);

-- Delivery Boys
CREATE TABLE IF NOT EXISTS delivery_boys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE city ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_txn ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dv_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_boys ENABLE ROW LEVEL SECURITY;

-- Allow all for now (add proper policies for production)
CREATE POLICY "allow_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON subcategories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON sellers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON product FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON city FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON user_address FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON cart FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON cart_detail FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON order_detail FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON order_time FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON wishlist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON wallet_txn FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON promo_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON dv_time FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON delivery_boys FOR ALL USING (true) WITH CHECK (true);

-- Sample Data
INSERT INTO categories (category) VALUES 
  ('Fruits & Vegetables'), ('Dairy & Eggs'), ('Beverages'), ('Bakery'), ('Snacks');

INSERT INTO city (city_name) VALUES ('Accra'), ('Kumasi'), ('Takoradi');

INSERT INTO promo_codes (code, discount, min_order) VALUES 
  ('SAVE10', 10, 100), ('SAVE20', 20, 200);

INSERT INTO dv_time (from_time, to_time) VALUES 
  ('08:00:00', '10:00:00'), ('10:00:00', '12:00:00'), ('12:00:00', '14:00:00'),
  ('14:00:00', '16:00:00'), ('16:00:00', '18:00:00'), ('18:00:00', '20:00:00');

-- Function to decrement product qty
CREATE OR REPLACE FUNCTION decrement_product_qty(pid UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product SET qty = qty - qty WHERE id = pid;
END;
$$ LANGUAGE plpgsql;