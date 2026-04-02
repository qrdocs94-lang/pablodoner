# ============================================================
# Pablo Döner — NUR SQL pushen (kein Supabase CLI nötig!)
# Funktioniert direkt über die Supabase Management API
# ============================================================
# Ausführen in PowerShell:
#   .\push-sql.ps1 -ProjectRef "abc123" -SupabaseKey "eyJ..."
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectRef,    # Dein Projekt-Ref (aus URL)

    [Parameter(Mandatory=$true)]
    [string]$ServiceRoleKey # service_role Key (NICHT der anon key!)
)

Write-Host "`n🌯 Pablo Döner — SQL Push Script" -ForegroundColor Cyan
Write-Host "   Projekt: $ProjectRef`n" -ForegroundColor Gray

# Das komplette SQL als Here-String
$SQL = @'
-- ============================================================
-- PABLO DÖNER — Vollständiges Schema
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS order_type CASCADE;

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, icon TEXT,
  sort_order INT DEFAULT 0, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT,
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  image_url TEXT, is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  options_schema JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);

CREATE TYPE order_status AS ENUM ('pending','paid','preparing','ready','cancelled');
CREATE TYPE order_type   AS ENUM ('pickup','delivery');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  status order_status DEFAULT 'pending',
  order_type order_type DEFAULT 'pickup',
  customer_name TEXT, customer_phone TEXT, delivery_address JSONB,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal_cents INT DEFAULT 0, delivery_fee_cents INT DEFAULT 0,
  total_cents INT DEFAULT 0,
  stripe_session_id TEXT UNIQUE, stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), paid_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ, updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe ON orders(stripe_session_id);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'PD-' || nextval('order_number_seq')::TEXT;
  END IF; RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_ts BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_ts BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_categories" ON categories FOR SELECT USING (is_active=true);
CREATE POLICY "read_products"   ON products   FOR SELECT USING (is_active=true);
CREATE POLICY "insert_orders"   ON orders     FOR INSERT WITH CHECK (true);
CREATE POLICY "read_orders"     ON orders     FOR SELECT USING (true);
CREATE POLICY "svc_categories"  ON categories FOR ALL USING (auth.role()='service_role');
CREATE POLICY "svc_products"    ON products   FOR ALL USING (auth.role()='service_role');
CREATE POLICY "svc_orders"      ON orders     FOR ALL USING (auth.role()='service_role');

-- SEED DATA
INSERT INTO categories (name,slug,icon,sort_order) VALUES
  ('Döner & Dürüm','doener','🌯',1),('Lahmacun','lahmacun','🫓',2),
  ('Falafel & Veggie','falafel','🧆',3),('Snacks & Mehr','snacks','🍟',4),
  ('Getränke','getraenke','🥤',5);

DO $seed$
DECLARE d UUID; l UUID; f UUID; s UUID; g UUID; do JSONB; fo JSONB; lo JSONB;
BEGIN
  SELECT id INTO d FROM categories WHERE slug='doener';
  SELECT id INTO l FROM categories WHERE slug='lahmacun';
  SELECT id INTO f FROM categories WHERE slug='falafel';
  SELECT id INTO s FROM categories WHERE slug='snacks';
  SELECT id INTO g FROM categories WHERE slug='getraenke';
  do := '[{"key":"sauce","label":"Soße","type":"select","required":true,"options":["Kräutersoße","Knoblauchsoße","Scharfe Soße","Juppi Sauce","Samurai Sauce","Ohne Soße"]},{"key":"spice","label":"Schärfe","type":"select","required":false,"options":["Mild","Medium","Scharf","Extra Scharf"]},{"key":"extras","label":"Extras","type":"multiselect","required":false,"options":["Ohne Zwiebeln","Ohne Tomaten","Ohne Salat","Extra Fleisch","Extra Käse"]}]'::jsonb;
  fo := '[{"key":"sauce","label":"Soße","type":"select","required":true,"options":["Kräutersoße","Knoblauchsoße","Scharfe Soße","Ohne Soße"]},{"key":"extras","label":"Extras","type":"multiselect","required":false,"options":["Ohne Zwiebeln","Ohne Tomaten"]}]'::jsonb;
  lo := '[{"key":"sauce","label":"Soße","type":"select","required":false,"options":["Kräutersoße","Joghurt","Scharfe Soße","Ohne"]},{"key":"extras","label":"Extras","type":"multiselect","required":false,"options":["Ohne Zwiebeln","Extra Scharf"]}]'::jsonb;
  INSERT INTO products(category_id,name,description,price_cents,sort_order,options_schema) VALUES
    (d,'Drehspieß Sandwich','Knuspriges Brot mit Fleisch & Salat',800,1,do),
    (d,'Drehspieß Sandwich Big','Große Portion',900,2,do),
    (d,'Dürüm','Fladenbrot gerollt',900,3,do),(d,'Big Dürüm','Extragroßes Dürüm',1000,4,do),
    (d,'Drehspieß Box','Mit Pommes & Soße',800,5,do),(d,'Drehspieß Teller','Fleisch, Reis, Salat',1400,6,do),
    (d,'Fleisch Portion Klein','Kleine Portion',800,7,do),(d,'Fleisch Portion Groß','Große Portion',1400,8,do),
    (l,'Lahmacun','Hackfleisch-Teig',450,1,lo),(l,'Lahmacun mit Salat','Mit Salat',650,2,lo),
    (l,'Lahmacun mit Salat & Fleisch','Mit Spießfleisch',1050,3,lo),
    (f,'Falafel Sandwich','Brot, Salat, Hummus',700,1,fo),(f,'Falafel Dürüm','Gerollt',800,2,fo),
    (f,'Falafel Teller','Mit Hummus',1100,3,fo),(f,'Falafel Stück','Einzeln',100,4,'[]'::jsonb),
    (f,'Salat Sandwich','Frisches Gemüse',500,5,fo),(f,'Halloumi Sandwich','Gegrillter Halloumi',650,6,fo),
    (f,'Halloumi Wrap','Halloumi gerollt',750,7,fo),
    (s,'Pommes','Frittiert',450,1,'[]'::jsonb),(s,'Toast Sucuk mit Käse','Überbacken',550,2,'[]'::jsonb),
    (s,'Currywurst','Mit Currysauce',500,3,'[]'::jsonb),(s,'Currywurst mit Pommes','',750,4,'[]'::jsonb),
    (s,'Nuggets 6 Stück','Knusprig',500,5,'[]'::jsonb),(s,'Chilli Cheese Nuggets 6 Stück','Pikant',500,6,'[]'::jsonb),
    (s,'Mozzarella Sticks 6 Stück','Goldbraun',500,7,'[]'::jsonb),
    (g,'Ayran','Joghurtgetränk',200,1,'[]'::jsonb),(g,'Wasser','Mineralwasser',200,2,'[]'::jsonb),
    (g,'Coca-Cola','Eiskalt',250,3,'[]'::jsonb),(g,'Cola Zero','Ohne Zucker',250,4,'[]'::jsonb),
    (g,'Fanta Orange','Fruchtig',250,5,'[]'::jsonb),(g,'Fanta Exotic','Tropisch',250,6,'[]'::jsonb),
    (g,'Fanta Mango Dragonfruit','Exotisch',250,7,'[]'::jsonb),(g,'Uludag','Türkisches Wasser',250,8,'[]'::jsonb),
    (g,'Eistee','Kalt',300,9,'[]'::jsonb),(g,'Capri-Sonne','Süß',150,10,'[]'::jsonb);
END $seed$;
'@

# Supabase Management API — direkte SQL-Ausführung
$apiUrl = "https://api.supabase.com/v1/projects/$ProjectRef/database/query"
$headers = @{
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type"  = "application/json"
}

$body = @{ query = $SQL } | ConvertTo-Json -Depth 5 -Compress

Write-Host "📡 Verbinde mit Supabase..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers -Body $body
    Write-Host "✅ Schema + Menü-Daten erfolgreich eingespielt!" -ForegroundColor Green
    Write-Host "`n📊 Überprüfe unter:" -ForegroundColor Cyan
    Write-Host "   https://app.supabase.com/project/$ProjectRef/editor" -ForegroundColor White
} catch {
    $errMsg = $_.Exception.Message
    Write-Host "⚠️  Direkter API-Push nicht möglich: $errMsg" -ForegroundColor Yellow
    Write-Host "`n📋 MANUELL EINFÜGEN:" -ForegroundColor Cyan
    Write-Host "   1. Öffne: https://app.supabase.com/project/$ProjectRef/sql/new" -ForegroundColor White
    Write-Host "   2. Kopiere den Inhalt von: supabase/migrations/001_schema.sql" -ForegroundColor White
    Write-Host "   3. Klicke 'Run'" -ForegroundColor White
    # Öffne Browser automatisch
    Start-Process "https://app.supabase.com/project/$ProjectRef/sql/new"
    Write-Host "`n   Browser geöffnet! SQL wurde in Zwischenablage kopiert:" -ForegroundColor Green
    $SQL | Set-Clipboard
    Write-Host "   → Ctrl+V im SQL Editor einfügen und Run klicken" -ForegroundColor Green
}
