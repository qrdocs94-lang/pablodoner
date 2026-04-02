# 🌯 Smile Döner Terminal — Schritt-für-Schritt Anleitung
# (Kein Programmierwissen nötig!)

## ⚡ Schnellstart: Nur 4 Schritte

---

## SCHRITT 1 — Supabase einrichten (5 Min.)

1. Gehe zu **https://supabase.com** → "Start your project" → Konto erstellen
2. Neues Projekt erstellen:
   - Name: `pablo-doener`
   - Passwort: (sicheres Passwort merken!)
   - Region: `eu-central-1` (Frankfurt)
3. Warte ca. 2 Min. bis Projekt bereit ist
4. Gehe zu **Settings → API** und notiere:
   - `Project URL` → z.B. `https://abcdefgh.supabase.co`
   - `anon public` Key → langer Text mit eyJ...
   - `service_role` Key → anderer langer Text mit eyJ... (**geheim halten!**)
5. Gehe zu **Settings → General** und notiere:
   - `Reference ID` → z.B. `abcdefghijkl`

---

## SCHRITT 2 — Datenbank einrichten (2 Min.)

### Option A: PowerShell Script (empfohlen für Windows)
```powershell
# PowerShell öffnen (Windows-Taste → "powershell" eingeben)
cd pablo-terminal

# Script ausführen (fragt nach deinen Daten):
.\push-sql.ps1 -ProjectRef "DEIN_REF" -ServiceRoleKey "DEIN_SERVICE_KEY"
```

### Option B: Manuell im Browser
1. Öffne: **https://app.supabase.com/project/DEIN_REF/sql/new**
2. Öffne die Datei `supabase/migrations/001_schema.sql` mit Notepad
3. Alles kopieren (Strg+A → Strg+C)
4. Im Browser einfügen (Strg+V)
5. Klicke **"Run"** (grüner Button)
6. ✅ Fertig! Dein Menü ist jetzt in der Datenbank

---

## SCHRITT 3 — Stripe einrichten (5 Min.)

1. Gehe zu **https://stripe.com** → Konto erstellen
2. Dashboard → **Entwickler → API-Schlüssel**
3. Notiere:
   - `Geheimschlüssel` → `sk_test_...` (für Tests) oder `sk_live_...` (für echte Zahlung)
4. Webhook einrichten:
   - **Entwickler → Webhooks → Endpunkt hinzufügen**
   - URL: `https://DEIN_REF.supabase.co/functions/v1/stripe-webhook`
   - Events auswählen:
     - ✅ `checkout.session.completed`
     - ✅ `checkout.session.expired`
     - ✅ `payment_intent.payment_failed`
   - Notiere den **Webhook-Signatursschlüssel** → `whsec_...`

---

## SCHRITT 4 — App starten

### Option A: Vollautomatisch (PowerShell)
```powershell
# Einmalig ausführen — richtet alles ein:
.\setup.ps1
```

### Option B: Manuell
```powershell
# 1. Node.js installieren: https://nodejs.org (LTS Version)

# 2. .env.local Datei erstellen (Notepad öffnen, speichern als .env.local):
NEXT_PUBLIC_SUPABASE_URL=https://DEIN_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...DEIN_ANON_KEY
STRIPE_SECRET_KEY=sk_test_...

# 3. Abhängigkeiten installieren:
npm install

# 4. App starten:
npm run dev

# 5. Browser öffnen:
#    Bestellterminal: http://localhost:3000
#    Küchendisplay:   http://localhost:3000/kitchen
```

---

## 🔧 Edge Functions deployen (für echte Stripe-Zahlung)

```powershell
# Supabase CLI installieren:
winget install Supabase.CLI
# oder: https://supabase.com/docs/guides/cli/getting-started

# Einloggen:
supabase login

# Secrets setzen:
supabase secrets set --project-ref DEIN_REF STRIPE_SECRET_KEY=sk_live_...
supabase secrets set --project-ref DEIN_REF STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set --project-ref DEIN_REF APP_URL=https://deine-domain.de

# Functions deployen:
supabase functions deploy create-checkout --project-ref DEIN_REF
supabase functions deploy stripe-webhook  --project-ref DEIN_REF
```

---

## 🌐 Auf Vercel veröffentlichen (für 24/7 Betrieb)

```powershell
# Vercel CLI installieren:
npm install -g vercel

# Einloggen und deployen:
vercel login
vercel --prod

# Umgebungsvariablen in Vercel setzen:
# https://vercel.com/dein-projekt/settings/environment-variables
# NEXT_PUBLIC_SUPABASE_URL = https://...supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
# APP_URL = https://deine-vercel-url.vercel.app
```

---

## ❓ Häufige Fragen

**Q: Was kostet das?**
- Supabase Free Tier: Kostenlos bis 500MB DB, 2GB Transfer
- Stripe: Nur Gebühren bei echten Zahlungen (1,4% + 0,25€ pro Transaktion)
- Vercel Free Tier: Kostenlos für kleine Projekte

**Q: Kann ich Produkte/Preise später ändern?**
Ja! Einfach im Supabase Dashboard → Table Editor → products Tabelle bearbeiten.

**Q: Was ist der Unterschied zu Geminis Schema?**

| Feature | Gemini Schema | Dein Schema |
|---------|--------------|-------------|
| Auto-Bestellnummern | ❌ | ✅ PD-1000, PD-1001... |
| Extrawünsche JSONB | ❌ | ✅ sauce, spice, extras |
| Sicherheit (RLS) | ❌ | ✅ Row Level Security |
| Lieferung/Abholung | ❌ | ✅ order_type enum |
| Produktoptionen | ❌ | ✅ options_schema JSONB |
| Auto-Timestamps | ❌ | ✅ updated_at triggers |
| Seed-Daten | ❌ | ✅ ganzes Pablo-Menü |

---

## 📞 Support
✉️ pablodoner7@gmail.com
