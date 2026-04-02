#!/bin/bash
# ============================================================
# Pablo Döner Terminal — Setup Script (Mac / Linux / WSL)
# ============================================================
# Ausführen: chmod +x setup.sh && ./setup.sh
# ============================================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

step()  { echo -e "\n${CYAN}▶  $1${NC}"; }
ok()    { echo -e "   ${GREEN}✅ $1${NC}"; }
warn()  { echo -e "   ${YELLOW}⚠️  $1${NC}"; }
fail()  { echo -e "   ${RED}❌ $1${NC}"; exit 1; }

echo -e "${BOLD}${CYAN}
  ╔══════════════════════════════════════════╗
  ║  🌯  PABLO DÖNER — TERMINAL SETUP       ║
  ║      Mac / Linux / WSL                  ║
  ╚══════════════════════════════════════════╝
${NC}"

# ── Eingaben ──────────────────────────────────────────────
read -rp "Supabase URL (https://xyz.supabase.co): " SUPABASE_URL
read -rp "Supabase SERVICE_ROLE Key: " SUPABASE_KEY
read -rp "Supabase Project Ref: " PROJECT_REF
read -rp "Stripe Secret Key (sk_test_...): " STRIPE_SECRET
read -rp "App URL [http://localhost:3000]: " APP_URL
APP_URL=${APP_URL:-http://localhost:3000}

# ════════════════════════════════════════════════════════════
# SCHRITT 1: SQL Schema pushen
# ════════════════════════════════════════════════════════════
step "Datenbank-Schema wird eingespielt..."

SQL_FILE="$(dirname "$0")/supabase/migrations/001_schema.sql"

if command -v supabase &>/dev/null; then
    supabase db push --project-ref "$PROJECT_REF" 2>/dev/null && ok "Schema via CLI eingespielt" || {
        warn "CLI push fehlgeschlagen — versuche direkten SQL-Upload..."
        push_sql_via_api
    }
else
    push_sql_via_api() {
        # Lese SQL-Datei
        SQL_CONTENT=$(cat "$SQL_FILE")
        RESPONSE=$(curl -s -X POST \
            "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
            -H "apikey: $SUPABASE_KEY" \
            -H "Authorization: Bearer $SUPABASE_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"query\": $(echo "$SQL_CONTENT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}")
        echo "$RESPONSE" | grep -q "error" && warn "API-Upload fehlgeschlagen" || ok "Schema via API eingespielt"
    }
    warn "Supabase CLI nicht gefunden"
    echo -e "${YELLOW}   Installieren: brew install supabase/tap/supabase${NC}"
    echo -e "${YELLOW}   oder: https://supabase.com/docs/guides/cli${NC}"
    echo ""
    echo -e "${YELLOW}   MANUELL: Gehe zu https://app.supabase.com → SQL Editor${NC}"
    echo -e "${YELLOW}   Füge Inhalt von supabase/migrations/001_schema.sql ein${NC}"
fi

# ════════════════════════════════════════════════════════════
# SCHRITT 2: .env.local erstellen
# ════════════════════════════════════════════════════════════
step ".env.local wird erstellt..."

cat > .env.local << EOF
# Pablo Döner Terminal — Auto-generiert von setup.sh
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
APP_URL=$APP_URL
STRIPE_SECRET_KEY=$STRIPE_SECRET
EOF

ok ".env.local erstellt"

# ════════════════════════════════════════════════════════════
# SCHRITT 3: Supabase Secrets + Edge Functions
# ════════════════════════════════════════════════════════════
step "Supabase Secrets & Edge Functions..."

if command -v supabase &>/dev/null; then
    read -rp "Stripe Webhook Secret (whsec_..., leer = überspringen): " WEBHOOK_SECRET

    supabase secrets set --project-ref "$PROJECT_REF" \
        STRIPE_SECRET_KEY="$STRIPE_SECRET" \
        APP_URL="$APP_URL"

    [[ -n "$WEBHOOK_SECRET" ]] && \
        supabase secrets set --project-ref "$PROJECT_REF" \
            STRIPE_WEBHOOK_SECRET="$WEBHOOK_SECRET" && \
        ok "Webhook Secret gesetzt"

    supabase functions deploy create-checkout --project-ref "$PROJECT_REF"
    supabase functions deploy stripe-webhook  --project-ref "$PROJECT_REF"
    ok "Edge Functions deployed!"
else
    warn "Edge Functions manuell deployen nach CLI-Installation:"
    echo "   supabase functions deploy create-checkout"
    echo "   supabase functions deploy stripe-webhook"
fi

# ════════════════════════════════════════════════════════════
# SCHRITT 4: npm install
# ════════════════════════════════════════════════════════════
step "NPM Dependencies..."

if command -v npm &>/dev/null; then
    npm install && ok "Dependencies installiert"
else
    warn "npm nicht gefunden — Node.js installieren: https://nodejs.org"
fi

# ════════════════════════════════════════════════════════════
echo -e "${GREEN}${BOLD}
  ╔══════════════════════════════════════════════════════════╗
  ║  ✅  SETUP ABGESCHLOSSEN!                               ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  npm run dev          → Terminal starten                 ║
  ║  localhost:3000       → Bestellterminal (Kunden)         ║
  ║  localhost:3000/kitchen → Küchendisplay                  ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
${NC}"
