# ============================================================
# Pablo Döner Terminal — Setup Script (PowerShell / Windows)
# Führe dieses Script einmal aus — es richtet alles ein!
# ============================================================
# Ausführen: Right-Click → "Als PowerShell ausführen"
# oder: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# dann: .\setup.ps1
# ============================================================

param(
    [string]$SupabaseUrl     = "",
    [string]$SupabaseKey     = "",   # service_role key
    [string]$ProjectRef      = "",   # z.B. "abcdefghijklmnop"
    [string]$StripeSecretKey = "",
    [string]$AppUrl          = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$GREEN  = "Green"
$YELLOW = "Yellow"
$RED    = "Red"
$CYAN   = "Cyan"

function Write-Step($msg)  { Write-Host "`n▶  $msg" -ForegroundColor $CYAN }
function Write-Ok($msg)    { Write-Host "   ✅ $msg" -ForegroundColor $GREEN }
function Write-Warn($msg)  { Write-Host "   ⚠️  $msg" -ForegroundColor $YELLOW }
function Write-Fail($msg)  { Write-Host "   ❌ $msg" -ForegroundColor $RED; exit 1 }

Write-Host @"

  ╔══════════════════════════════════════════╗
  ║  🌯  PABLO DÖNER — TERMINAL SETUP       ║
  ║      Automatisches Deployment-Script    ║
  ╚══════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# ── Interaktive Eingabe wenn Parameter fehlen ──────────────
if (-not $SupabaseUrl) {
    Write-Host "Supabase URL (z.B. https://xyz.supabase.co): " -NoNewline
    $SupabaseUrl = Read-Host
}
if (-not $SupabaseKey) {
    Write-Host "Supabase SERVICE_ROLE Key: " -NoNewline
    $SupabaseKey = Read-Host
}
if (-not $ProjectRef) {
    Write-Host "Supabase Project Ref (aus URL, z.B. 'abcdefghijkl'): " -NoNewline
    $ProjectRef = Read-Host
}
if (-not $StripeSecretKey) {
    Write-Host "Stripe Secret Key (sk_test_... oder sk_live_...): " -NoNewline
    $StripeSecretKey = Read-Host
}

$headers = @{
    "apikey"        = $SupabaseKey
    "Authorization" = "Bearer $SupabaseKey"
    "Content-Type"  = "application/json"
}

# ════════════════════════════════════════════════════════════
# SCHRITT 1: SQL Schema direkt via REST API pushen
# ════════════════════════════════════════════════════════════
Write-Step "Datenbank-Schema wird eingespielt..."

$sqlSchema = @'
-- ============================================================
-- PABLO DÖNER — Supabase Schema (automatisch eingespielt)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (für sauberes Re-Deploy)
DROP TABLE IF EXISTS orders    CASCADE;
DROP TABLE IF EXISTS products  CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TYPE  IF EXISTS order_status CASCADE;
DROP TYPE  IF EXISTS order_type   CASCADE;

-- CATEGORIES
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  price_cents    INT NOT NULL CHECK (price_cents >= 0),
  image_url      TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  sort_order     INT NOT NULL DEFAULT 0,
  options_schema JSONB DEFAULT '[]'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);

-- ORDERS
CREATE TYPE order_status AS ENUM ('pending','paid','preparing','ready','cancelled');
CREATE TYPE order_type   AS ENUM ('pickup','delivery');

CREATE TABLE orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number       TEXT NOT NULL UNIQUE,
  status             order_status NOT NULL DEFAULT 'pending',
  order_type         order_type NOT NULL DEFAULT 'pickup',
  customer_name      TEXT,
  customer_phone     TEXT,
  delivery_address   JSONB,
  items              JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_cents     INT NOT NULL DEFAULT 0,
  delivery_fee_cents INT NOT NULL DEFAULT 0,
  total_cents        INT NOT NULL DEFAULT 0,
  stripe_session_id  TEXT UNIQUE,
  stripe_payment_id  TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at            TIMESTAMPTZ,
  ready_at           TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe ON orders(stripe_session_id);

-- AUTO ORDER NUMBER
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'PD-' || nextval('order_number_seq')::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- AUTO updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_products"   ON products   FOR SELECT USING (is_active = true);
CREATE POLICY "public_insert_orders"   ON orders     FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_orders"     ON orders     FOR SELECT USING (true);
CREATE POLICY "service_categories"     ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_products"       ON products   FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_orders"         ON orders     FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SEED: Pablo Döner Menü
-- ============================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Döner & Dürüm',    'doener',    '🌯', 1),
  ('Lahmacun',         'lahmacun',  '🫓', 2),
  ('Falafel & Veggie', 'falafel',   '🧆', 3),
  ('Snacks & Mehr',    'snacks',    '🍟', 4),
  ('Getränke',         'getraenke', '🥤', 5);

DO $$
DECLARE
  d UUID; l UUID; f UUID; s UUID; g UUID;
  dopts JSONB; fopts JSONB; lopts JSONB;
BEGIN
  SELECT id INTO d FROM categories WHERE slug='doener';
  SELECT id INTO l FROM categories WHERE slug='lahmacun';
  SELECT id INTO f FROM categories WHERE slug='falafel';
  SELECT id INTO s FROM categories WHERE slug='snacks';
  SELECT id INTO g FROM categories WHERE slug='getraenke';

  dopts := '[{"key":"sauce","label":"Soße","type":"select","required":true,"options":["Kräutersoße","Knoblauchsoße","Scharfe Soße","Juppi Sauce","Samurai Sauce","Ohne Soße"]},{"key":"spice","label":"Schärfe","type":"select","required":false,"options":["Mild","Medium","Scharf","Extra Scharf"]},{"key":"extras","label":"Extras","type":"multiselect","required":false,"options":["Ohne Zwiebeln","Ohne Tomaten","Ohne Salat","Extra Fleisch","Extra Käse"]}]'::jsonb;
  fopts := '[{"key":"sauce","label":"Soße","type":"select","required":true,"options":["Kräutersoße","Knoblauchsoße","Scharfe Soße","Ohne Soße"]},{"key":"extras","label":"Extras","type":"multiselect","required":false,"options":["Ohne Zwiebeln","Ohne Tomaten"]}]'::jsonb;
  lopts := '[{"key":"sauce","label":"Soße","type":"select","required":false,"options":["Kräutersoße","Joghurt","Scharfe Soße","Ohne"]},{"key":"extras","label":"Extras","type":"multiselect","required":false,"options":["Ohne Zwiebeln","Extra Scharf"]}]'::jsonb;

  INSERT INTO products (category_id,name,description,price_cents,sort_order,options_schema) VALUES
    (d,'Drehspieß Sandwich','Knuspriges Brot mit Fleisch & Salat',800,1,dopts),
    (d,'Drehspieß Sandwich Big','Große Portion',900,2,dopts),
    (d,'Dürüm','Fladenbrot gerollt',900,3,dopts),
    (d,'Big Dürüm','Extragroßes Dürüm',1000,4,dopts),
    (d,'Drehspieß Box','Mit Pommes & Soße',800,5,dopts),
    (d,'Drehspieß Teller','Fleisch, Reis, Salat & Soße',1400,6,dopts),
    (d,'Fleisch Portion Klein','Kleine Fleischportion',800,7,dopts),
    (d,'Fleisch Portion Groß','Große Fleischportion',1400,8,dopts),
    (l,'Lahmacun','Dünner Teig, Hackfleisch',450,1,lopts),
    (l,'Lahmacun mit Salat','Mit Salat & Soße',650,2,lopts),
    (l,'Lahmacun mit Salat & Fleisch','Mit Spießfleisch',1050,3,lopts),
    (f,'Falafel Sandwich','Brot, Salat, Hummus',700,1,fopts),
    (f,'Falafel Dürüm','Gerollt mit Falafel',800,2,fopts),
    (f,'Falafel Teller','Falafel, Salat, Hummus',1100,3,fopts),
    (f,'Falafel Stück','Einzelnes Falafel',100,4,'[]'::jsonb),
    (f,'Salat Sandwich','Frisches Gemüse',500,5,fopts),
    (f,'Halloumi Sandwich','Gegrillter Halloumi',650,6,fopts),
    (f,'Halloumi Wrap','Halloumi gerollt',750,7,fopts),
    (s,'Pommes','Knusprig frittiert',450,1,'[]'::jsonb),
    (s,'Toast Sucuk mit Käse','Überbacken mit Käse',550,2,'[]'::jsonb),
    (s,'Currywurst','Mit Currysauce',500,3,'[]'::jsonb),
    (s,'Currywurst mit Pommes','Currywurst + Pommes',750,4,'[]'::jsonb),
    (s,'Nuggets 6 Stück','Knusprige Nuggets',500,5,'[]'::jsonb),
    (s,'Chilli Cheese Nuggets 6 Stück','Pikant mit Käse',500,6,'[]'::jsonb),
    (s,'Mozzarella Sticks 6 Stück','Goldbraune Sticks',500,7,'[]'::jsonb),
    (g,'Ayran','Joghurtgetränk',200,1,'[]'::jsonb),
    (g,'Wasser','Mineralwasser',200,2,'[]'::jsonb),
    (g,'Coca-Cola','Eiskalt',250,3,'[]'::jsonb),
    (g,'Cola Zero','Ohne Zucker',250,4,'[]'::jsonb),
    (g,'Fanta Orange','Fruchtig',250,5,'[]'::jsonb),
    (g,'Fanta Exotic','Tropisch',250,6,'[]'::jsonb),
    (g,'Fanta Mango Dragonfruit','Exotisch',250,7,'[]'::jsonb),
    (g,'Uludag','Türkisches Mineralwasser',250,8,'[]'::jsonb),
    (g,'Eistee','Erfrischend kalt',300,9,'[]'::jsonb),
    (g,'Capri-Sonne','Fruchtig süß',150,10,'[]'::jsonb);
END $$;
'@

# SQL via Supabase REST API ausführen
$sqlBody = @{ query = $sqlSchema } | ConvertTo-Json -Depth 10
try {
    $response = Invoke-RestMethod `
        -Uri "$SupabaseUrl/rest/v1/rpc/exec" `
        -Method POST `
        -Headers $headers `
        -Body $sqlBody
    Write-Ok "Schema eingespielt"
} catch {
    # Fallback: direkter SQL-Endpunkt
    try {
        $response = Invoke-RestMethod `
            -Uri "$SupabaseUrl/pg/query" `
            -Method POST `
            -Headers $headers `
            -Body $sqlBody
        Write-Ok "Schema eingespielt (Fallback)"
    } catch {
        Write-Warn "REST-Methode nicht verfügbar — bitte SQL manuell einfügen (siehe unten)"
        Write-Host "`n📋 MANUELL: Gehe zu https://app.supabase.com → SQL Editor → Neues Query" -ForegroundColor Yellow
        Write-Host "   Füge den Inhalt von: supabase/migrations/001_schema.sql ein" -ForegroundColor Yellow
    }
}

# ════════════════════════════════════════════════════════════
# SCHRITT 2: .env.local erstellen
# ════════════════════════════════════════════════════════════
Write-Step ".env.local wird erstellt..."

$envContent = @"
# Pablo Döner Terminal — Auto-generiert von setup.ps1
NEXT_PUBLIC_SUPABASE_URL=$SupabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SupabaseKey
APP_URL=$AppUrl
STRIPE_SECRET_KEY=$StripeSecretKey
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Ok ".env.local erstellt"

# ════════════════════════════════════════════════════════════
# SCHRITT 3: Supabase CLI prüfen und Functions deployen
# ════════════════════════════════════════════════════════════
Write-Step "Supabase CLI wird geprüft..."

$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCli) {
    Write-Warn "Supabase CLI nicht gefunden. Installieren mit:"
    Write-Host "   winget install Supabase.CLI" -ForegroundColor Yellow
    Write-Host "   (oder: https://supabase.com/docs/guides/cli)" -ForegroundColor Yellow
    Write-Warn "Edge Functions werden NICHT automatisch deployed."
    Write-Warn "Bitte nach CLI-Installation manuell ausführen:"
    Write-Host "   supabase functions deploy create-checkout" -ForegroundColor Yellow
    Write-Host "   supabase functions deploy stripe-webhook" -ForegroundColor Yellow
} else {
    Write-Ok "Supabase CLI gefunden: $(supabase --version)"

    # Stripe Webhook Secret holen
    Write-Host "`nStripe Webhook Secret (whsec_..., leer lassen zum Überspringen): " -NoNewline
    $webhookSecret = Read-Host

    Write-Step "Supabase Secrets werden gesetzt..."
    supabase secrets set --project-ref $ProjectRef `
        STRIPE_SECRET_KEY=$StripeSecretKey `
        APP_URL=$AppUrl

    if ($webhookSecret) {
        supabase secrets set --project-ref $ProjectRef `
            STRIPE_WEBHOOK_SECRET=$webhookSecret
        Write-Ok "Stripe Webhook Secret gesetzt"
    }

    Write-Step "Edge Functions werden deployed..."
    supabase functions deploy create-checkout  --project-ref $ProjectRef
    supabase functions deploy stripe-webhook   --project-ref $ProjectRef
    Write-Ok "Edge Functions deployed!"
}

# ════════════════════════════════════════════════════════════
# SCHRITT 4: npm install
# ════════════════════════════════════════════════════════════
Write-Step "NPM Dependencies werden installiert..."
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($npm) {
    npm install
    Write-Ok "Dependencies installiert"
} else {
    Write-Warn "npm nicht gefunden — bitte Node.js installieren: https://nodejs.org"
}

# ════════════════════════════════════════════════════════════
# FERTIG
# ════════════════════════════════════════════════════════════
Write-Host @"

  ╔══════════════════════════════════════════════════════════╗
  ║  ✅  SETUP ABGESCHLOSSEN!                               ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  Nächste Schritte:                                       ║
  ║                                                          ║
  ║  1. Terminal starten:   npm run dev                      ║
  ║  2. Bestellterminal:    http://localhost:3000            ║
  ║  3. Küchendisplay:      http://localhost:3000/kitchen    ║
  ║                                                          ║
  ║  Stripe Webhook lokal testen:                            ║
  ║  stripe listen --forward-to localhost:3000/api/webhook   ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green
