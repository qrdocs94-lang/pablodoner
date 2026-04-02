-- ============================================================
-- SMILE DÖNER — Supabase Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,                        -- 'Döner & Dürüm'
  slug       TEXT NOT NULL UNIQUE,                 -- 'doener'
  icon       TEXT,                                 -- emoji or icon URL
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price_cents   INT NOT NULL CHECK (price_cents >= 0),  -- price in EUR cents (850 = 8.50 €)
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0,
  -- Configurable options schema stored as JSONB template
  -- Example: [{"key":"sauce","label":"Soße","type":"select","options":["Kräuter","Scharf","Knoblauch","Ohne"]}]
  options_schema JSONB DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'preparing', 'ready', 'cancelled');
CREATE TYPE order_type   AS ENUM ('pickup', 'delivery');

CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        TEXT NOT NULL UNIQUE,           -- human-readable: 'PD-1042'
  status              order_status NOT NULL DEFAULT 'pending',
  order_type          order_type NOT NULL DEFAULT 'pickup',

  -- Customer info (for delivery)
  customer_name       TEXT,
  customer_phone      TEXT,
  delivery_address    JSONB,   -- {street, city, zip}

  -- Cart as JSONB — validated against DB prices before Stripe session
  -- Structure:
  -- [{
  --   product_id: uuid,
  --   name: string,
  --   price_cents: number,         -- snapshot at time of order
  --   quantity: number,
  --   options: {                   -- JSONB for flexible extras
  --     sauce: "Knoblauch",
  --     extras: ["Ohne Zwiebeln", "Extra Fleisch"],
  --     spice: "scharf"
  --   }
  -- }]
  items               JSONB NOT NULL DEFAULT '[]'::jsonb,

  subtotal_cents      INT NOT NULL DEFAULT 0,
  delivery_fee_cents  INT NOT NULL DEFAULT 0,
  total_cents         INT NOT NULL DEFAULT 0,

  -- Stripe
  stripe_session_id   TEXT UNIQUE,
  stripe_payment_id   TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at             TIMESTAMPTZ,
  ready_at            TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_stripe_sess  ON orders(stripe_session_id);
CREATE INDEX idx_orders_created      ON orders(created_at DESC);

-- ============================================================
-- AUTO-INCREMENT ORDER NUMBER  (PD-1000, PD-1001 …)
-- ============================================================
CREATE SEQUENCE order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'PD-' || nextval('order_number_seq')::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;

-- Public can read active categories and products
CREATE POLICY "public_read_categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (is_active = true);

-- Orders: insert allowed for anon (terminal), read only own
CREATE POLICY "public_insert_orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read_own_order" ON orders
  FOR SELECT USING (true);   -- filter by session/id in app

-- Service role (Edge Functions) can do everything
CREATE POLICY "service_all_categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_all_products" ON products
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_all_orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SEED DATA — Smile Döner Menu
-- ============================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Döner & Dürüm',   'doener',    '🌯', 1),
  ('Lahmacun',        'lahmacun',  '🫓', 2),
  ('Falafel & Veggie','falafel',   '🧆', 3),
  ('Snacks & Mehr',   'snacks',    '🍟', 4),
  ('Getränke',        'getraenke', '🥤', 5);

-- Döner options schema (reusable)
-- sauce: select | extras: multiselect | spice: select
DO $$
DECLARE
  cat_doener    UUID;
  cat_lahmacun  UUID;
  cat_falafel   UUID;
  cat_snacks    UUID;
  cat_drinks    UUID;
  doener_opts   JSONB;
  falafel_opts  JSONB;
  lahmacun_opts JSONB;
BEGIN
  SELECT id INTO cat_doener    FROM categories WHERE slug = 'doener';
  SELECT id INTO cat_lahmacun  FROM categories WHERE slug = 'lahmacun';
  SELECT id INTO cat_falafel   FROM categories WHERE slug = 'falafel';
  SELECT id INTO cat_snacks    FROM categories WHERE slug = 'snacks';
  SELECT id INTO cat_drinks    FROM categories WHERE slug = 'getraenke';

  doener_opts := '[
    {"key":"sauce","label":"Soße","type":"select","required":true,"options":["Kräutersoße","Knoblauchsoße","Scharfe Soße","Juppi Sauce","Samurai Sauce","Ohne Soße"]},
    {"key":"spice","label":"Schärfe","type":"select","required":false,"options":["Mild","Medium","Scharf","Extra Scharf"]},
    {"key":"extras","label":"Extras","type":"multiselect","required":false,"options":["Ohne Zwiebeln","Ohne Tomaten","Ohne Salat","Extra Fleisch (+2€)","Extra Käse (+0.50€)","Ohne Alles (nur Fleisch)"]}
  ]'::jsonb;

  falafel_opts := '[
    {"key":"sauce","label":"Soße","type":"select","required":true,"options":["Kräutersoße","Knoblauchsoße","Scharfe Soße","Ohne Soße"]},
    {"key":"extras","label":"Extras","type":"multiselect","required":false,"options":["Ohne Zwiebeln","Ohne Tomaten","Extra Falafel (+1€)"]}
  ]'::jsonb;

  lahmacun_opts := '[
    {"key":"sauce","label":"Soße","type":"select","required":false,"options":["Kräutersoße","Joghurt","Scharfe Soße","Ohne"]},
    {"key":"extras","label":"Extras","type":"multiselect","required":false,"options":["Ohne Zwiebeln","Extra Scharf"]}
  ]'::jsonb;

  -- DÖNER & DÜRÜM
  INSERT INTO products (category_id, name, description, price_cents, sort_order, options_schema) VALUES
    (cat_doener, 'Drehspieß Sandwich',      'Knuspriges Brot mit Fleisch & Salat',            800,  1, doener_opts),
    (cat_doener, 'Drehspieß Sandwich Big',  'Große Portion für den echten Hunger',             900,  2, doener_opts),
    (cat_doener, 'Dürüm',                   'Weiches Fladenbrot gerollt',                      900,  3, doener_opts),
    (cat_doener, 'Big Dürüm',               'Extragroßes Dürüm',                              1000,  4, doener_opts),
    (cat_doener, 'Drehspieß Box',           'Mit Pommes & Soße',                               800,  5, doener_opts),
    (cat_doener, 'Drehspieß Teller',        'Fleisch, Reis, Salat & Soße',                    1400,  6, doener_opts),
    (cat_doener, 'Fleisch Portion Klein',   'Kleine Fleischportion',                           800,  7, doener_opts),
    (cat_doener, 'Fleisch Portion Groß',    'Große Fleischportion',                           1400,  8, doener_opts);

  -- LAHMACUN
  INSERT INTO products (category_id, name, description, price_cents, sort_order, options_schema) VALUES
    (cat_lahmacun, 'Lahmacun',                    'Dünner Teig, Hackfleisch',           450, 1, lahmacun_opts),
    (cat_lahmacun, 'Lahmacun mit Salat',          'Mit frischem Salat & Soße',          650, 2, lahmacun_opts),
    (cat_lahmacun, 'Lahmacun mit Salat & Fleisch','Mit Salat & Drehspießfleisch',       1050, 3, lahmacun_opts);

  -- FALAFEL
  INSERT INTO products (category_id, name, description, price_cents, sort_order, options_schema) VALUES
    (cat_falafel, 'Falafel Sandwich',   'Brot, Salat, Hummus, Soße',       700,  1, falafel_opts),
    (cat_falafel, 'Falafel Dürüm',     'Gerollt mit Falafel & Salat',      800,  2, falafel_opts),
    (cat_falafel, 'Falafel Teller',    'Falafel, Salat, Hummus',          1100,  3, falafel_opts),
    (cat_falafel, 'Falafel Stück',     'Einzelnes Falafel-Bällchen',       100,  4, '[]'::jsonb),
    (cat_falafel, 'Salat Sandwich',    'Frisches Gemüse im Brot',          500,  5, falafel_opts),
    (cat_falafel, 'Halloumi Sandwich', 'Gegrillter Halloumi im Brot',      650,  6, falafel_opts),
    (cat_falafel, 'Halloumi Wrap',     'Gegrillter Halloumi gerollt',      750,  7, falafel_opts);

  -- SNACKS
  INSERT INTO products (category_id, name, description, price_cents, sort_order, options_schema) VALUES
    (cat_snacks, 'Pommes',                       'Knusprig frittiert',             450, 1, '[]'::jsonb),
    (cat_snacks, 'Toast Sucuk mit Käse',         'Überbacken mit Käse',            550, 2, '[]'::jsonb),
    (cat_snacks, 'Currywurst',                   'Mit Currysauce',                 500, 3, '[]'::jsonb),
    (cat_snacks, 'Currywurst mit Pommes',        'Currywurst + Pommes',            750, 4, '[]'::jsonb),
    (cat_snacks, 'Nuggets 6 Stück',              'Knusprige Hühnchen-Nuggets',     500, 5, '[]'::jsonb),
    (cat_snacks, 'Chilli Cheese Nuggets 6 Stück','Pikant mit Käse-Füllung',        500, 6, '[]'::jsonb),
    (cat_snacks, 'Mozzarella Sticks 6 Stück',   'Goldbraune Mozzarella Sticks',   500, 7, '[]'::jsonb);

  -- GETRÄNKE (no options)
  INSERT INTO products (category_id, name, description, price_cents, sort_order, options_schema) VALUES
    (cat_drinks, 'Ayran',                  'Frisches Joghurtgetränk',  200, 1, '[]'::jsonb),
    (cat_drinks, 'Wasser',                 'Stilles Mineralwasser',    200, 2, '[]'::jsonb),
    (cat_drinks, 'Coca-Cola',              'Klassisch eiskalt',        250, 3, '[]'::jsonb),
    (cat_drinks, 'Cola Zero',              'Ohne Zucker',              250, 4, '[]'::jsonb),
    (cat_drinks, 'Fanta Orange',           'Erfrischend fruchtig',     250, 5, '[]'::jsonb),
    (cat_drinks, 'Fanta Exotic',           'Tropisch fruchtig',        250, 6, '[]'::jsonb),
    (cat_drinks, 'Fanta Mango Dragonfruit','Exotischer Sommer',        250, 7, '[]'::jsonb),
    (cat_drinks, 'Uludag',                 'Türkisches Mineralwasser', 250, 8, '[]'::jsonb),
    (cat_drinks, 'Eistee',                 'Erfrischend kalt',         300, 9, '[]'::jsonb),
    (cat_drinks, 'Capri-Sonne',            'Fruchtig und süß',         150, 10,'[]'::jsonb);
END $$;
