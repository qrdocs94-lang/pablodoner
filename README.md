# 🌯 Pablo Döner — Bestell-Terminal

Vollständiges 24/7 Bestellsystem mit Stripe-Zahlung, Supabase-Datenbank und Küchen-Display.

---

## 🏗 Architektur-Übersicht

```
Kunde tippt auf Touchscreen
        ↓
  Next.js Terminal UI
  (React + Tailwind)
        ↓
  Supabase Edge Function
  "create-checkout"
  ┌─────────────────────────────┐
  │ 1. Preise aus DB laden      │ ← Sicherheit!
  │ 2. Order in DB speichern    │
  │ 3. Stripe Session erstellen │
  └─────────────────────────────┘
        ↓
  Stripe Checkout Page
        ↓ (nach Zahlung)
  Stripe Webhook → Edge Function
  "stripe-webhook"
  ┌─────────────────────────────┐
  │ Order Status → "paid"       │
  │ Realtime Push → Küche       │
  └─────────────────────────────┘
        ↓
  Küchen-Display
  (Realtime via Supabase)
```

---

## 🚀 Setup in 5 Schritten

### 1. Supabase Projekt anlegen
```bash
# Supabase CLI installieren
npm install -g supabase

# Projekt initialisieren
supabase init
supabase link --project-ref DEIN-PROJEKT-ID

# Datenbank-Schema einspielen
supabase db push
# oder direkt im Supabase Dashboard → SQL Editor
# → Inhalt von supabase/migrations/001_schema.sql einfügen
```

### 2. Stripe einrichten
```bash
# Stripe CLI installieren: https://stripe.com/docs/stripe-cli
# Test-Keys holen: https://dashboard.stripe.com/test/apikeys

# Webhook-Endpunkt registrieren (für Produktion)
stripe listen --forward-to https://DEIN-PROJEKT.supabase.co/functions/v1/stripe-webhook

# Events die du abonnieren musst:
# - checkout.session.completed
# - checkout.session.expired
# - checkout.session.async_payment_succeeded
# - checkout.session.async_payment_failed
# - payment_intent.payment_failed
```

### 3. Edge Functions deployen
```bash
# Secrets setzen (NICHT in .env für Produktion!)
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set APP_URL=https://pablo-doener.de

# Functions deployen
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

### 4. Next.js App starten
```bash
# Dependencies installieren
npm install

# .env.local anlegen
cp .env.example .env.local
# → Werte aus Supabase Dashboard eintragen

# Entwicklung
npm run dev

# Produktion (z.B. Vercel)
npm run build && npm start
```

### 5. Auf Vercel deployen
```bash
npm install -g vercel
vercel --prod

# Umgebungsvariablen in Vercel setzen:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# APP_URL (deine Vercel-URL)
```

---

## 📁 Dateistruktur

```
pablo-terminal/
├── supabase/
│   ├── migrations/
│   │   └── 001_schema.sql          ← DB Schema + Seed-Daten
│   └── functions/
│       ├── create-checkout/
│       │   └── index.ts            ← Stripe Checkout erstellen
│       └── stripe-webhook/
│           └── index.ts            ← Zahlung bestätigen
├── src/
│   ├── types/index.ts              ← TypeScript Types
│   ├── lib/
│   │   ├── supabase.ts             ← DB Client + API Helpers
│   │   └── cartStore.ts            ← Zustand Cart State
│   └── app/
│       ├── page.tsx                ← Bestellterminal (Kunden)
│       ├── order/[id]/page.tsx     ← Bestellstatus-Seite
│       └── kitchen/page.tsx        ← Küchen-Display (Personal)
├── .env.example
└── package.json
```

---

## 🔒 Sicherheit

### Preis-Validierung (wichtigster Punkt!)
```
❌ UNSICHER: Frontend sendet Preis → Stripe
✅ SICHER:   Frontend sendet product_id → Edge Function 
             lädt Preis aus DB → Stripe
```

Die Edge Function `create-checkout` lädt **immer** die Preise aus der Datenbank.
Ein Angreifer könnte im Browser den Preis ändern — das wird hier verhindert.

### Webhook-Signatur
Jeder Stripe-Webhook wird mit `constructEventAsync()` verifiziert.
Gefälschte Requests werden mit HTTP 400 abgelehnt.

### Row Level Security (RLS)
- Anonym: Kann Kategorien + Produkte lesen, Orders anlegen
- Service Role (Edge Functions): Vollzugriff für Updates
- Kein direkter DB-Zugriff von der Küche ohne Auth

---

## 🛠 URLs im laufenden System

| URL | Beschreibung |
|-----|-------------|
| `/` | Bestellterminal für Kunden (Touchscreen) |
| `/order/[id]` | Bestellstatus nach Zahlung |
| `/kitchen` | Küchen-Display für Personal |

---

## 💡 Erweiterungsmöglichkeiten

- **Push Notifications**: Wenn Bestellung `ready` → SMS an Kunden (Twilio)
- **Drucker**: Bon-Druck über `escpos` NPM-Paket
- **Admin-Panel**: Produkte/Preise verwalten (Supabase Dashboard reicht)
- **Liefergebiet**: PLZ-Validierung vor Checkout
- **Stammkunden**: Supabase Auth für Konten mit Bestellhistorie
- **Analytics**: Meistbestellte Produkte, Stoßzeiten

---

## 📞 Kontakt

Pablo Döner Bochum  
📍 Franziskusstr. 1, 44795 Bochum  
✉️ pablodoner7@gmail.com  
🕐 Di–Do: 10:00–22:00 | Fr–So: 12:00–00:00
