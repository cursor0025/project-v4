-- ================================================================
-- BZMARKET - SCHÉMA COMPLET BASE DE DONNÉES
-- Système de Panier, Commandes & Livraison Multi-Vendeurs
-- ================================================================

-- ================================================================
-- 1. EXTENSION & TYPES
-- ================================================================

-- Activer UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types personnalisés
CREATE TYPE order_status AS ENUM (
  'pending_vendor_confirmation',
  'confirmed',
  'ready_for_pickup',
  'shipped',
  'in_transit',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE commission_status AS ENUM (
  'pending',
  'due',
  'paid'
);

CREATE TYPE delivery_type AS ENUM ('home', 'office');

CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- ================================================================
-- 2. MODIFICATION TABLE PRODUCTS (Ajout stock réservé)
-- ================================================================

-- Ajouter colonnes stock si elles n'existent pas
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reserved_stock INTEGER DEFAULT 0;

-- Colonne calculée : stock disponible
ALTER TABLE products
DROP COLUMN IF EXISTS available_stock;

ALTER TABLE products
ADD COLUMN available_stock INTEGER GENERATED ALWAYS AS (stock - COALESCE(reserved_stock, 0)) STORED;

-- ================================================================
-- 3. TABLE PROFILES (Ajout is_active)
-- ================================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ================================================================
-- 4. TABLES TRANSPORTEURS
-- ================================================================

-- Table transporteurs
CREATE TABLE IF NOT EXISTS shipping_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  tracking_prefix TEXT NOT NULL,
  tracking_url_template TEXT,
  phone_number TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table tarifs de livraison
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES shipping_providers(id) ON DELETE CASCADE,
  origin_wilaya TEXT NOT NULL,
  destination_wilaya TEXT NOT NULL,
  price_home DECIMAL(10,2) NOT NULL,
  price_office DECIMAL(10,2) NOT NULL,
  delivery_days_min INTEGER DEFAULT 2,
  delivery_days_max INTEGER DEFAULT 4,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, origin_wilaya, destination_wilaya)
);

-- Table configuration transporteurs par vendeur
CREATE TABLE IF NOT EXISTS vendor_shipping_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES shipping_providers(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, provider_id)
);
-- ================================================================
-- 5. TABLE CODES PROMO
-- ================================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value DECIMAL(10,2) NOT NULL,
  applies_to TEXT NOT NULL CHECK (applies_to IN ('shipping', 'total', 'products')),
  
  min_order_amount DECIMAL(10,2),
  max_discount_amount DECIMAL(10,2),
  first_order_only BOOLEAN DEFAULT false,
  
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  
  usage_limit INTEGER,
  usage_limit_per_user INTEGER DEFAULT 1,
  times_used INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table utilisation codes promo
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 6. TABLE COMMANDES (PRINCIPALE)
-- ================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  items JSONB NOT NULL,
  products_total DECIMAL(10,2) NOT NULL,
  
  shipping_provider_id UUID NOT NULL REFERENCES shipping_providers(id),
  shipping_provider_name TEXT NOT NULL,
  shipping_base_cost DECIMAL(10,2) NOT NULL,
  bzmarket_surcharge DECIMAL(10,2) NOT NULL DEFAULT 30,
  shipping_total DECIMAL(10,2) NOT NULL,
  delivery_type delivery_type NOT NULL,
  delivery_wilaya TEXT NOT NULL,
  delivery_commune TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  
  commission_provider DECIMAL(10,2) NOT NULL DEFAULT 50,
  commission_surcharge DECIMAL(10,2) NOT NULL DEFAULT 30,
  commission_total DECIMAL(10,2) NOT NULL DEFAULT 80,
  commission_status commission_status DEFAULT 'pending',
  commission_paid_at TIMESTAMPTZ,
  
  tracking_number TEXT,
  receipt_photo_url TEXT,
  tracking_verified BOOLEAN DEFAULT false,
  
  status order_status DEFAULT 'pending_vendor_confirmation',
  cancelled_reason TEXT,
  
  confirmed_at TIMESTAMPTZ,
  vendor_contacted_client BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  auto_cancel_at TIMESTAMPTZ,
  
  customer_email TEXT,
  customer_name TEXT,
  vendor_email TEXT,
  vendor_name TEXT,
  vendor_wilaya TEXT,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter la référence order_id dans promo_code_usage
ALTER TABLE promo_code_usage
DROP CONSTRAINT IF EXISTS fk_order;

ALTER TABLE promo_code_usage
ADD CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- ================================================================
-- 7. TABLE ALERTES ADMIN
-- ================================================================

CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  severity alert_severity DEFAULT 'medium',
  message TEXT NOT NULL,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ================================================================
-- 8. FONCTIONS & TRIGGERS
-- ================================================================

-- Fonction : Réserver du stock
CREATE OR REPLACE FUNCTION reserve_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET reserved_stock = COALESCE(reserved_stock, 0) + p_quantity
  WHERE id = p_product_id
    AND (stock - COALESCE(reserved_stock, 0)) >= p_quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuffisant pour le produit %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction : Libérer et décrémenter le stock (après livraison)
CREATE OR REPLACE FUNCTION release_and_decrement_stock(
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET 
    stock = stock - p_quantity,
    reserved_stock = GREATEST(0, COALESCE(reserved_stock, 0) - p_quantity)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction : Libérer le stock (annulation commande)
CREATE OR REPLACE FUNCTION release_reserved_stock(
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET reserved_stock = GREATEST(0, COALESCE(reserved_stock, 0) - p_quantity)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction : Incrémenter utilisation code promo
CREATE OR REPLACE FUNCTION increment_promo_usage(
  p_promo_code_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes
  SET times_used = times_used + 1
  WHERE id = p_promo_code_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger : Mise à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_providers_updated_at ON shipping_providers;
CREATE TRIGGER update_shipping_providers_updated_at BEFORE UPDATE ON shipping_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_rates_updated_at ON shipping_rates;
CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON shipping_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 9. INDEX POUR PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_auto_cancel ON orders(auto_cancel_at) WHERE status = 'pending_vendor_confirmation';

CREATE INDEX IF NOT EXISTS idx_shipping_rates_provider ON shipping_rates(provider_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_origin ON shipping_rates(origin_wilaya);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_destination ON shipping_rates(destination_wilaya);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_admin_alerts_resolved ON admin_alerts(resolved) WHERE resolved = false;

-- ================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

-- Policies Orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can view their orders" ON orders;
CREATE POLICY "Vendors can view their orders"
  ON orders FOR SELECT
  USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
  ON orders FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Vendors can update their orders" ON orders;
CREATE POLICY "Vendors can update their orders"
  ON orders FOR UPDATE
  USING (
    auth.uid() = vendor_id 
    AND status IN ('pending_vendor_confirmation', 'confirmed', 'ready_for_pickup')
  );

-- Policies Shipping Providers (Public READ)
DROP POLICY IF EXISTS "Anyone can view active providers" ON shipping_providers;
CREATE POLICY "Anyone can view active providers"
  ON shipping_providers FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Only admins can manage providers" ON shipping_providers;
CREATE POLICY "Only admins can manage providers"
  ON shipping_providers FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Policies Shipping Rates (Public READ)
DROP POLICY IF EXISTS "Anyone can view available rates" ON shipping_rates;
CREATE POLICY "Anyone can view available rates"
  ON shipping_rates FOR SELECT
  USING (is_available = true);

DROP POLICY IF EXISTS "Only admins can manage rates" ON shipping_rates;
CREATE POLICY "Only admins can manage rates"
  ON shipping_rates FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Policies Vendor Shipping Settings
DROP POLICY IF EXISTS "Vendors can view their settings" ON vendor_shipping_settings;
CREATE POLICY "Vendors can view their settings"
  ON vendor_shipping_settings FOR SELECT
  USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can manage their settings" ON vendor_shipping_settings;
CREATE POLICY "Vendors can manage their settings"
  ON vendor_shipping_settings FOR ALL
  USING (auth.uid() = vendor_id);

-- Policies Promo Codes (Public READ des actifs)
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true AND NOW() BETWEEN valid_from AND valid_until);

DROP POLICY IF EXISTS "Only admins can manage promo codes" ON promo_codes;
CREATE POLICY "Only admins can manage promo codes"
  ON promo_codes FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Policies Admin Alerts
DROP POLICY IF EXISTS "Only admins can view alerts" ON admin_alerts;
CREATE POLICY "Only admins can view alerts"
  ON admin_alerts FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ================================================================
-- 11. DONNÉES INITIALES
-- ================================================================

INSERT INTO shipping_providers (name, slug, tracking_prefix, tracking_url_template, phone_number, rating, review_count) VALUES
  ('Yalidine', 'yalidine', 'YAL', 'https://yalidine.app/tracking/{tracking}', '023 XX XX XX', 4.8, 5821),
  ('Procolis', 'procolis', 'PRO', 'https://procolis.com/track/{tracking}', '021 XX XX XX', 4.5, 3204),
  ('Aramex', 'aramex', 'ARX', 'https://www.aramex.dz/track?number={tracking}', '021 YY YY YY', 4.6, 2147)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO promo_codes (code, description, discount_type, discount_value, applies_to, first_order_only, valid_from, valid_until, usage_limit) VALUES
  ('BIENVENUE', 'Réduction de 50 DA sur la première commande', 'fixed', 50, 'shipping', true, NOW(), NOW() + INTERVAL '1 year', 1000),
  ('RAMADAN2026', 'Promo Ramadan - 10% de réduction', 'percentage', 10, 'total', false, NOW(), NOW() + INTERVAL '30 days', 500)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- FIN DU SCHÉMA
-- ================================================================
