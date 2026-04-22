-- Run in Supabase SQL Editor
-- Categories
INSERT INTO public.categories (category) VALUES 
  (''Fruits & Vegetables''), (''Dairy & Eggs''), (''Beverages''), (''Bakery''), (''Snacks'');

-- Cities
INSERT INTO public.city (city_name) VALUES 
  (''Accra''), (''Kumasi''), (''Takoradi''), (''Tema''), (''Cape Coast'');

-- Promo Codes
INSERT INTO public.promo_codes (code, discount, min_order) VALUES 
  (''WELCOME10'', 10.00, 100.00), (''GHS20'', 20.00, 200.00);

-- Delivery Time Slots
INSERT INTO public.dv_time (from_time, to_time) VALUES 
  (''08:00:00'', ''10:00:00''), (''10:00:00'', ''12:00:00''), (''12:00:00'', ''14:00:00''),
  (''14:00:00'', ''16:00:00''), (''16:00:00'', ''18:00:00''), (''18:00:00'', ''20:00:00'');
