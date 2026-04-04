"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  supabase,
  subscribeToOrders,
  updateOrderStatus,
  fetchAllOrdersAdmin,
  fetchCategories,
  fetchAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "@/lib/supabase";
import { Order, Product, Category, OrderStatus, formatPrice } from "@/types";

// ── Constants ────────────────────────────────────────────────
const ADMIN_PASSWORD = "pablo2024";

type AdminPage = "dashboard" | "kueche" | "bestellungen" | "produkte";

// ── Root component ───────────────────────────────────────────
export default function AdminRoot() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pablo_admin") === "1") setLoggedIn(true);
  }, []);

  const handleLogin = (pw: string) => {
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem("pablo_admin", "1");
      setLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem("pablo_admin");
    setLoggedIn(false);
  };

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />;
  return <AdminPanel onLogout={handleLogout} />;
}

// ── Login Screen ─────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pw: string) => boolean }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!onLogin(pw)) setError("Falsches Passwort.");
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem', width: 340, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌯</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#C0392B', letterSpacing: 2 }}>SMILE DÖNER</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Admin-Bereich</div>
        </div>
        <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6, fontWeight: 600 }}>Passwort</label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Admin-Passwort eingeben"
          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15, marginBottom: 16, outline: 'none', boxSizing: 'border-box' }}
          autoFocus
        />
        <button
          onClick={submit}
          style={{ width: '100%', padding: 12, background: '#C0392B', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          Anmelden
        </button>
        {error && <p style={{ color: '#C0392B', fontSize: 13, textAlign: 'center', marginTop: 10 }}>{error}</p>}
      </div>
    </div>
  );
}

// ── Admin Panel ──────────────────────────────────────────────
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ords, prods, cats] = await Promise.all([
        fetchAllOrdersAdmin(),
        fetchAllProductsAdmin(),
        fetchCategories(),
      ]);
      setOrders(ords);
      setProducts(prods);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const sub = subscribeToOrders((updated) => {
      setOrders(prev => {
        const exists = prev.find(o => o.id === updated.id);
        if (exists) return prev.map(o => o.id === updated.id ? updated : o);
        return [updated, ...prev];
      });
    });
    return () => { sub.unsubscribe(); };
  }, [loadData]);

  const navItems: { id: AdminPage; icon: string; label: string }[] = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "kueche", icon: "👨‍🍳", label: "Küche Live" },
    { id: "bestellungen", icon: "📋", label: "Bestellungen" },
    { id: "produkte", icon: "🍽️", label: "Produkte" },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: '#C0392B', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: 1 }}>SMILE DÖNER</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Admin Panel</div>
        </div>
        {navItems.map(item => (
          <div
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', cursor: 'pointer',
              color: page === item.id ? 'white' : 'rgba(255,255,255,0.75)',
              fontSize: 14, fontWeight: 500,
              background: page === item.id ? 'rgba(0,0,0,0.2)' : 'transparent',
              borderLeft: page === item.id ? '3px solid #F39C12' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: 16 }}>
          <button
            onClick={onLogout}
            style={{ width: '100%', padding: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
          >
            Abmelden
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, overflow: 'auto', background: '#F5F5F5' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: 16 }}>
            Daten werden geladen...
          </div>
        ) : (
          <>
            {page === "dashboard" && (
              <DashboardTab orders={orders} onNavigate={setPage} onUpdateStatus={async (id, status) => { await updateOrderStatus(id, status); await loadData(); }} />
            )}
            {page === "kueche" && (
              <KuecheTab orders={orders} onUpdateStatus={async (id, status) => { await updateOrderStatus(id, status); }} />
            )}
            {page === "bestellungen" && (
              <BestellungenTab orders={orders} onUpdateStatus={async (id, status) => { await updateOrderStatus(id, status); await loadData(); }} />
            )}
            {page === "produkte" && (
              <ProdukteTab
                products={products}
                categories={categories}
                onRefresh={loadData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Utilities ────────────────────────────────────────────────
function fmt(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

function statusLabel(s: OrderStatus | string) {
  const map: Record<string, string> = {
    pending: 'Ausstehend', paid: 'Bezahlt', preparing: 'In Zubereitung',
    ready: 'Fertig', cancelled: 'Storniert',
  };
  return map[s] ?? s;
}

function statusColor(s: OrderStatus | string) {
  const map: Record<string, { bg: string; color: string }> = {
    pending:    { bg: '#FEF3C7', color: '#92400E' },
    paid:       { bg: '#DBEAFE', color: '#1E40AF' },
    preparing:  { bg: '#E0F2FE', color: '#0C4A6E' },
    ready:      { bg: '#DCFCE7', color: '#14532D' },
    cancelled:  { bg: '#FEE2E2', color: '#7F1D1D' },
  };
  return map[s] ?? { bg: '#F3F4F6', color: '#374151' };
}

function getProductEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('dürüm') || n.includes('wrap')) return '🫔';
  if (n.includes('döner') || n.includes('sandwich') || n.includes('drehspieß')) return '🌯';
  if (n.includes('lahmacun')) return '🫓';
  if (n.includes('falafel')) return '🧆';
  if (n.includes('salat')) return '🥗';
  if (n.includes('halloumi')) return '🧀';
  if (n.includes('pommes')) return '🍟';
  if (n.includes('nugget') || n.includes('mozzarella')) return '🍗';
  if (n.includes('currywurst')) return '🌭';
  if (n.includes('cola') || n.includes('fanta') || n.includes('wasser') || n.includes('ayran') || n.includes('eistee')) return '🥤';
  if (n.includes('sauce') || n.includes('soße') || n.includes('extra') || n.includes('juppi') || n.includes('samurai')) return '🫙';
  if (n.includes('teller') || n.includes('portion') || n.includes('box')) return '🍽️';
  return '🌯';
}

function printOrder(order: Order) {
  const win = window.open('', '_blank', 'width=400,height=700');
  if (!win) { alert('Popup wurde blockiert. Bitte Popup-Blocker deaktivieren.'); return; }
  const addr = order.delivery_address ? `${order.delivery_address.street}, ${order.delivery_address.zip} ${order.delivery_address.city}` : '';
  const time = new Date(order.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const date = new Date(order.created_at).toLocaleDateString('de-DE');
  win.document.write(`<!DOCTYPE html><html><head><title>Bon ${order.order_number}</title>
  <style>
    body{font-family:'Courier New',monospace;padding:20px;max-width:300px;margin:0 auto}
    h1{font-size:22px;text-align:center;letter-spacing:3px;margin-bottom:4px}
    .sub{text-align:center;font-size:12px;color:#666;margin-bottom:16px}
    hr{border:none;border-top:2px dashed #ccc;margin:12px 0}
    .row{display:flex;justify-content:space-between;font-size:13px;padding:2px 0}
    .total{display:flex;justify-content:space-between;font-size:16px;font-weight:900;padding:4px 0}
    .footer{text-align:center;font-size:11px;color:#666;margin-top:16px;line-height:1.6}
    .options{font-size:11px;color:#888;padding-left:16px}
  </style></head><body>
  <h1>SMILE DÖNER</h1>
  <div class="sub">Franziskusstr. 1, 44795 Bochum<br>pablodoner7@gmail.com</div>
  <hr>
  <div class="row"><span><strong>${order.order_number}</strong></span><span>${date} ${time} Uhr</span></div>
  <div class="row"><span>${order.order_type === 'delivery' ? '🛵 LIEFERUNG' : '🏃 ABHOLUNG'}</span></div>
  ${order.customer_name ? `<div class="row"><span>Kunde: ${order.customer_name}</span></div>` : ''}
  ${order.customer_phone ? `<div class="row"><span>Tel: ${order.customer_phone}</span></div>` : ''}
  ${addr ? `<div class="row"><span>Adresse: ${addr}</span></div>` : ''}
  <hr>
  ${order.items.map(item => {
    const optStr = item.options ? Object.values(item.options).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).map(v => Array.isArray(v) ? v.join(', ') : v).join(' · ') : '';
    return `<div class="row"><span>${item.quantity}x ${item.name}</span><span>${fmt(item.price_cents * item.quantity)}</span></div>${optStr ? `<div class="options">${optStr}</div>` : ''}`;
  }).join('')}
  <hr>
  ${order.order_type === 'delivery' && order.delivery_fee_cents > 0 ? `<div class="row"><span>Liefergebühr</span><span>${fmt(order.delivery_fee_cents)}</span></div>` : ''}
  <div class="total"><span>GESAMT</span><span>${fmt(order.total_cents)}</span></div>
  <div class="footer">Vielen Dank für Ihre Bestellung!<br>Wir freuen uns auf Ihren nächsten Besuch.</div>
  <script>window.print();setTimeout(()=>window.close(),2000)<\/script>
  </body></html>`);
  win.document.close();
}

// ── Dashboard Tab ────────────────────────────────────────────
function DashboardTab({ orders, onNavigate, onUpdateStatus }: {
  orders: Order[];
  onNavigate: (p: AdminPage) => void;
  onUpdateStatus: (id: string, status: "preparing" | "ready" | "cancelled") => void;
}) {
  const [showMonthly, setShowMonthly] = useState(false);
  const todayStr = new Date().toLocaleDateString('de-DE');
  const todayOrders = orders.filter(o => new Date(o.created_at).toLocaleDateString('de-DE') === todayStr);
  const revenue = todayOrders.reduce((s, o) => s + o.total_cents, 0);
  const pending = orders.filter(o => o.status === 'paid' || o.status === 'pending').length;
  const preparing = orders.filter(o => o.status === 'preparing').length;

  const stats = [
    { label: 'Bestellungen heute', value: todayOrders.length, badge: 'Heute', badgeColor: '#DBEAFE', badgeText: '#1E40AF' },
    { label: 'Umsatz heute', value: fmt(revenue), badge: 'Gesamt', badgeColor: '#DCFCE7', badgeText: '#14532D' },
    { label: 'Ausstehend / Bezahlt', value: pending, badge: 'Neu', badgeColor: '#FEF3C7', badgeText: '#92400E' },
    { label: 'In Zubereitung', value: preparing, badge: 'Aktiv', badgeColor: '#E0F2FE', badgeText: '#0C4A6E' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        sub={`Übersicht — ${new Date().toLocaleDateString('de-DE')}`}
        action={
          <button
            onClick={() => setShowMonthly(true)}
            style={{ padding: '8px 16px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            📄 Monatsbericht
          </button>
        }
      />
      <div style={{ padding: '20px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: '#1A1A1A', marginTop: 4 }}>{s.value}</div>
              <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 10, marginTop: 6, fontWeight: 500, background: s.badgeColor, color: s.badgeText }}>
                {s.badge}
              </span>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Neueste Bestellungen</span>
            <button onClick={() => onNavigate('bestellungen')} style={{ padding: '5px 12px', border: '1px solid #ddd', borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
              Alle anzeigen
            </button>
          </div>
          <OrderTable orders={orders.slice(0, 5)} onUpdateStatus={onUpdateStatus} compact />
        </div>
      </div>

      {showMonthly && <MonthlyReportModal onClose={() => setShowMonthly(false)} />}
    </div>
  );
}

// ── Monthly Report Modal ──────────────────────────────────────
function MonthlyReportModal({ onClose }: { onClose: () => void }) {
  const [monthOrders, setMonthOrders] = useState<Order[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState('');

  const now = new Date();
  const monthName = now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const y = now.getFullYear(), m = now.getMonth();
    const from = new Date(y, m, 1).toISOString();
    const to   = new Date(y, m + 1, 0, 23, 59, 59).toISOString();
    supabase
      .from('orders')
      .select('*')
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false })
      .then(({ data }) => setMonthOrders(data ?? []));
  }, []);

  const total    = monthOrders?.reduce((s, o) => s + o.total_cents, 0) ?? 0;
  const pickup   = monthOrders?.filter(o => o.order_type === 'pickup').length ?? 0;
  const delivery = monthOrders?.filter(o => o.order_type === 'delivery').length ?? 0;

  const statusLbl = (s: string) => ({ pending: 'Ausstehend', paid: 'Bezahlt', preparing: 'Zubereitung', ready: 'Fertig', cancelled: 'Storniert' }[s] ?? s);
  const statusClr = (s: string) => ({ paid: '#1d4ed8', preparing: '#b45309', ready: '#15803d', cancelled: '#dc2626', pending: '#6b7280' }[s] ?? '#333');

  const handleDelete = async () => {
    if (!monthOrders || monthOrders.length === 0) return;
    const ok = window.confirm(
      `Monat löschen: ${monthName}\n\n${monthOrders.length} Bestellungen werden dauerhaft gelöscht.\n\n⚠️ Diese Aktion kann NICHT rückgängig gemacht werden!\n\nFortfahren?`
    );
    if (!ok) return;
    setDeleting(true);
    const ids = monthOrders.map(o => o.id);
    const { error: err } = await supabase.from('orders').delete().in('id', ids);
    setDeleting(false);
    if (err) { setError('Fehler: ' + err.message); return; }
    setDeleted(true);
    setMonthOrders([]);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 740, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden' }}
        className="no-print">
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>📄 Monatsbericht — {monthName}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888', lineHeight: 1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflow: 'auto', flex: 1, padding: '20px 24px' }} id="monthly-report-content">
          {monthOrders === null ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Lade Bestellungen...</div>
          ) : (
            <>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Bestellungen', value: monthOrders.length },
                  { label: 'Gesamtumsatz', value: fmt(total) },
                  { label: '🏃 Abholung', value: pickup },
                  { label: '🛵 Lieferung', value: delivery },
                ].map(s => (
                  <div key={s.label} style={{ background: '#f8f8f8', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginTop: 4 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              {monthOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Keine Bestellungen in diesem Monat</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      {['Bestellnr.', 'Datum', 'Uhrzeit', 'Typ', 'Status', 'Betrag'].map((h, i) => (
                        <th key={h} style={{ padding: '9px 12px', textAlign: i === 5 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '2px solid #eee' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthOrders.map(o => {
                      const d = new Date(o.created_at);
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '9px 12px', fontWeight: 700 }}>{o.order_number}</td>
                          <td style={{ padding: '9px 12px' }}>{d.toLocaleDateString('de-DE')}</td>
                          <td style={{ padding: '9px 12px' }}>{d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={{ padding: '9px 12px' }}>{o.order_type === 'delivery' ? '🛵 Lieferung' : '🏃 Abholung'}</td>
                          <td style={{ padding: '9px 12px', fontWeight: 600, color: statusClr(o.status) }}>{statusLbl(o.status)}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700 }}>{fmt(o.total_cents)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f5f5f5' }}>
                      <td colSpan={5} style={{ padding: '10px 12px', fontWeight: 700 }}>Gesamt</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#C0392B' }}>{fmt(total)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {deleted && (
                <div style={{ marginTop: 12, background: '#dcfce7', color: '#14532d', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
                  ✅ Alle Bestellungen des Monats wurden erfolgreich gelöscht.
                </div>
              )}
              {error && <div style={{ marginTop: 12, color: '#c0392b', fontSize: 13, fontWeight: 600 }}>{error}</div>}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          <button onClick={() => window.print()} style={{ padding: '9px 18px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🖨️ Drucken
          </button>
          {!deleted && monthOrders && monthOrders.length > 0 && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: '9px 18px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: deleting ? .6 : 1 }}
            >
              {deleting ? '⏳ Wird gelöscht...' : '🗑️ Monat löschen'}
            </button>
          )}
          <button onClick={onClose} style={{ marginLeft: 'auto', padding: '9px 18px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Schließen
          </button>
        </div>
      </div>

      {/* Print-only content */}
      <style>{`
        @media print {
          body > *:not(#monthly-print-root) { display: none !important; }
          #monthly-print-root { display: block !important; position: fixed; top: 0; left: 0; width: 100%; padding: 24px; font-family: 'Segoe UI', sans-serif; }
        }
        #monthly-print-root { display: none; }
      `}</style>
      <div id="monthly-print-root">
        <h1 style={{ fontSize: 22, letterSpacing: 3, marginBottom: 4 }}>SMILE DÖNER</h1>
        <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Monatsbericht — {monthName} · Franziskusstr. 1, 44795 Bochum</p>
        {monthOrders && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
              {[['Bestellungen', monthOrders.length], ['Umsatz', fmt(total)], ['Abholung', pickup], ['Lieferung', delivery]].map(([l, v]) => (
                <div key={l as string} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  {['Bestellnr.', 'Datum', 'Uhrzeit', 'Typ', 'Status', 'Betrag'].map((h, i) => (
                    <th key={h} style={{ padding: '7px 10px', textAlign: i === 5 ? 'right' : 'left', fontWeight: 700, borderBottom: '2px solid #ccc' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthOrders.map(o => {
                  const d = new Date(o.created_at);
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 700 }}>{o.order_number}</td>
                      <td style={{ padding: '7px 10px' }}>{d.toLocaleDateString('de-DE')}</td>
                      <td style={{ padding: '7px 10px' }}>{d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ padding: '7px 10px' }}>{o.order_type === 'delivery' ? 'Lieferung' : 'Abholung'}</td>
                      <td style={{ padding: '7px 10px' }}>{statusLbl(o.status)}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700 }}>{fmt(o.total_cents)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr><td colSpan={5} style={{ padding: '7px 10px', fontWeight: 700 }}>Gesamt</td><td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700 }}>{fmt(total)}</td></tr>
              </tfoot>
            </table>
            <p style={{ marginTop: 20, fontSize: 11, color: '#999', textAlign: 'center' }}>Erstellt am {new Date().toLocaleString('de-DE')} · Smile Döner Admin</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Küche Tab ────────────────────────────────────────────────
function KuecheTab({ orders, onUpdateStatus }: {
  orders: Order[];
  onUpdateStatus: (id: string, status: "preparing" | "ready" | "cancelled") => void;
}) {
  const paid      = orders.filter(o => o.status === 'paid' || o.status === 'pending');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready     = orders.filter(o => o.status === 'ready');

  return (
    <div style={{ height: '100%' }}>
      <PageHeader title="Küche — Live Dashboard" sub="Echtzeit-Bestellübersicht für Küchenmitarbeiter" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {/* Column: Neu/Bezahlt */}
          <KanbanColumn
            title="📥 Neu / Bezahlt"
            titleBg="#FEF3C7"
            titleColor="#92400E"
            orders={paid}
            actionLabel="✓ Annehmen & Starten"
            actionBg="#C0392B"
            nextStatus="preparing"
            onAction={onUpdateStatus}
          />
          {/* Column: In Zubereitung */}
          <KanbanColumn
            title="🔥 In Zubereitung"
            titleBg="#DBEAFE"
            titleColor="#1E3A5F"
            orders={preparing}
            actionLabel="✓ Fertig — Bereit!"
            actionBg="#16A34A"
            nextStatus="ready"
            onAction={onUpdateStatus}
          />
          {/* Column: Fertig */}
          <KanbanColumn
            title="✅ Fertig / Ausgabe"
            titleBg="#DCFCE7"
            titleColor="#14532D"
            orders={ready}
            actionLabel={null}
            actionBg=""
            nextStatus={null}
            onAction={onUpdateStatus}
          />
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ title, titleBg, titleColor, orders, actionLabel, actionBg, nextStatus, onAction }: {
  title: string;
  titleBg: string;
  titleColor: string;
  orders: Order[];
  actionLabel: string | null;
  actionBg: string;
  nextStatus: "preparing" | "ready" | null;
  onAction: (id: string, status: "preparing" | "ready" | "cancelled") => void;
}) {
  return (
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '10px 14px', background: titleBg, color: titleColor, fontWeight: 700, fontSize: 13 }}>
        {title} ({orders.length})
      </div>
      <div style={{ padding: 10, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: '#bbb', fontSize: 13 }}>Keine Bestellungen</div>
        )}
        {orders.map(order => {
          const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
          const isLate = elapsed > 15;
          return (
            <div
              key={order.id}
              style={{ border: isLate ? '1.5px solid #F87171' : '1px solid #F0F0F0', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{order.order_number}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{new Date(order.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 12, padding: '2px 0', display: 'flex', gap: 6 }}>
                    <span style={{ fontWeight: 700, minWidth: 18 }}>{item.quantity}×</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#888', borderTop: '1px solid #F0F0F0', paddingTop: 8, marginBottom: 8 }}>
                {order.order_type === 'delivery' ? '🛵 Lieferung' : '🏃 Abholung'}
                {order.customer_name && ` — ${order.customer_name}`}
                {order.customer_phone && <><br />{order.customer_phone}</>}
                {order.delivery_address && <><br />📍 {order.delivery_address.street}, {order.delivery_address.zip} {order.delivery_address.city}</>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {actionLabel && nextStatus && (
                  <button
                    onClick={() => onAction(order.id, nextStatus)}
                    style={{ flex: 1, padding: '7px 0', background: actionBg, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {actionLabel}
                  </button>
                )}
                {!actionLabel && (
                  <button
                    onClick={() => onAction(order.id, 'cancelled')}
                    style={{ flex: 1, padding: '7px 0', background: 'none', border: '1px solid #ddd', borderRadius: 8, fontSize: 12, color: '#888', cursor: 'pointer' }}
                  >
                    ✕ Archivieren
                  </button>
                )}
                <button
                  onClick={() => printOrder(order)}
                  style={{ padding: '7px 10px', background: '#1A1A1A', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}
                >
                  🖨️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Bestellungen Tab ─────────────────────────────────────────
function BestellungenTab({ orders, onUpdateStatus }: {
  orders: Order[];
  onUpdateStatus: (id: string, status: "preparing" | "ready" | "cancelled") => void;
}) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const statuses = ['all', 'pending', 'paid', 'preparing', 'ready', 'cancelled'];
  const sLabels: Record<string, string> = { all: 'Alle', pending: 'Ausstehend', paid: 'Bezahlt', preparing: 'In Zubereitung', ready: 'Fertig', cancelled: 'Storniert' };

  return (
    <div>
      <PageHeader title="Bestellungen" sub={`${orders.length} Bestellungen gesamt`} />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {/* Filter */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  background: filter === s ? '#C0392B' : 'none',
                  color: filter === s ? 'white' : '#888',
                  border: filter === s ? '1px solid #C0392B' : '1px solid #ddd',
                }}
              >
                {sLabels[s]} ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
              </button>
            ))}
          </div>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 130px 110px 160px', gap: 12, padding: '10px 16px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', fontSize: 11, fontWeight: 600, color: '#888' }}>
            <div>BESTELLUNG</div>
            <div>KUNDE</div>
            <div>BETRAG</div>
            <div>STATUS</div>
            <div>AKTIONEN</div>
          </div>
          <OrderTable orders={filtered} onUpdateStatus={onUpdateStatus} compact={false} />
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#bbb' }}>Keine Bestellungen in dieser Kategorie</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Order Table (shared) ──────────────────────────────────────
function OrderTable({ orders, onUpdateStatus, compact }: {
  orders: Order[];
  onUpdateStatus: (id: string, status: "preparing" | "ready" | "cancelled") => void;
  compact: boolean;
}) {
  return (
    <>
      {orders.map(order => {
        const time = new Date(order.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(order.created_at).toLocaleDateString('de-DE');
        const sc = statusColor(order.status);
        return (
          <div
            key={order.id}
            style={{ display: 'grid', gridTemplateColumns: '100px 1fr 130px 110px 160px', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F0F0F0', alignItems: 'center', fontSize: 13 }}
          >
            {/* Order number */}
            <div>
              <div style={{ fontWeight: 700 }}>{order.order_number}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{time} — {date}</div>
            </div>
            {/* Customer */}
            <div>
              <div style={{ fontWeight: 500 }}>{order.customer_name ?? '—'}</div>
              {order.customer_phone && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>📞 {order.customer_phone}</div>}
              {order.delivery_address && (
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  📍 {order.delivery_address.street}, {order.delivery_address.zip} {order.delivery_address.city}
                </div>
              )}
              {!compact && (
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                </div>
              )}
            </div>
            {/* Amount */}
            <div>
              <div style={{ fontWeight: 700 }}>{fmt(order.total_cents)}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{order.order_type === 'delivery' ? '🛵 Lieferung' : '🏃 Abholung'}</div>
            </div>
            {/* Status */}
            <div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color }}>
                {statusLabel(order.status)}
              </span>
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(order.status === 'pending' || order.status === 'paid') && (
                <button onClick={() => onUpdateStatus(order.id, 'preparing')} style={{ padding: '5px 10px', borderRadius: 6, background: '#C0392B', color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                  Annehmen
                </button>
              )}
              {order.status === 'preparing' && (
                <button onClick={() => onUpdateStatus(order.id, 'ready')} style={{ padding: '5px 10px', borderRadius: 6, background: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                  Fertig
                </button>
              )}
              <button onClick={() => printOrder(order)} style={{ padding: '5px 10px', borderRadius: 6, background: '#1A1A1A', color: 'white', border: '1px solid #1A1A1A', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                🖨️ Bon
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── Produkte Tab ─────────────────────────────────────────────
function ProdukteTab({ products, categories, onRefresh }: {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
}) {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', category_id: categories[0]?.id ?? '', price: '', description: '' });
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const resetForm = () => {
    setForm({ name: '', category_id: categories[0]?.id ?? '', price: '', description: '' });
    setAddImageFile(null);
    setAddImagePreview(null);
  };

  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAddImageFile(file);
    setAddImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEditImageFile(file);
    setEditImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price) { setError('Name und Preis sind pflicht.'); return; }
    const priceCents = Math.round(parseFloat(form.price.replace(',', '.')) * 100);
    if (isNaN(priceCents) || priceCents <= 0) { setError('Ungültiger Preis.'); return; }
    setSaving(true);
    setError('');
    try {
      let image_url: string | null = null;
      if (addImageFile) image_url = await uploadProductImage(addImageFile, undefined);
      await createProduct({ category_id: form.category_id, name: form.name.trim(), description: form.description.trim(), price_cents: priceCents, image_url });
      resetForm();
      setShowAddForm(false);
      onRefresh();
    } catch (e: any) {
      setError(e.message ?? 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    setSaving(true);
    setError('');
    try {
      let image_url = editProduct.image_url;
      if (imageFile) image_url = await uploadProductImage(imageFile, editProduct.id);
      else if (editImageFile) image_url = await uploadProductImage(editImageFile, editProduct.id);
      await updateProduct(editProduct.id, {
        name: editProduct.name,
        description: editProduct.description,
        price_cents: editProduct.price_cents,
        category_id: editProduct.category_id,
        is_active: editProduct.is_active,
        image_url,
      });
      setEditProduct(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      setImageFile(null);
      onRefresh();
    } catch (e: any) {
      setError(e.message ?? 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    try {
      await deleteProduct(id);
      onRefresh();
    } catch (e: any) {
      alert('Fehler beim Löschen: ' + e.message);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      onRefresh();
    } catch (e: any) {
      alert('Fehler: ' + e.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Produkte verwalten"
        sub={`${products.length} Produkte im System`}
        action={<button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '8px 16px', background: '#C0392B', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Produkt hinzufügen</button>}
      />
      <div style={{ padding: '20px 24px' }}>
        {/* Add form */}
        {showAddForm && (
          <div style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Neues Produkt</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <FormField label="Produktname *">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Döner Teller" style={inputStyle} />
              </FormField>
              <FormField label="Kategorie *">
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={inputStyle}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Preis (€) *">
                <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="8.00" type="text" style={inputStyle} />
              </FormField>
              <FormField label="Beschreibung">
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kurze Beschreibung (optional)" style={inputStyle} />
              </FormField>
            </div>
            {/* Image upload — prominent section */}
            <div style={{ background: '#f8f9fa', border: '1.5px dashed #dee2e6', borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#555', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px' }}>🖼️ Produktbild (optional)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 72, height: 72, borderRadius: 10, border: '1px solid #dee2e6', overflow: 'hidden', background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {addImagePreview
                    ? <img src={addImagePreview} alt="Vorschau" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 26 }}>🖼️</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAddImageChange} style={{ fontSize: 13, width: '100%' }} />
                  <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>
                    {addImageFile ? `✅ ${addImageFile.name}` : 'JPG, PNG oder WEBP · wird in Supabase Storage gespeichert'}
                  </div>
                </div>
              </div>
            </div>
            {error && <p style={{ color: '#C0392B', fontSize: 13, marginBottom: 8, marginTop: 8 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={() => { setShowAddForm(false); resetForm(); setError(''); }} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13 }}>Abbrechen</button>
              <button onClick={handleAdd} disabled={saving} style={{ padding: '8px 16px', background: '#C0392B', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Speichern...' : '+ Hinzufügen'}
              </button>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editProduct && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: 24 }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Produkt bearbeiten</div>
                <button onClick={() => { setEditProduct(null); setImageFile(null); setEditImageFile(null); setEditImagePreview(null); setError(''); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888', lineHeight: 1 }}>✕</button>
              </div>

              <div style={{background:'lime', padding:8, fontWeight:900}}>VERSION 2 - BILD UPLOAD AKTIV</div>

              {/* ── BILD UPLOAD — ganz oben, immer sichtbar ── */}
              <div style={{ marginBottom: 16, padding: 14, border: '3px dashed #C0392B', borderRadius: 10, background: '#fff0ee' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#C0392B', marginBottom: 10 }}>📷 Produktbild hochladen</div>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'block', width: '100%', fontSize: 14, padding: '4px 0' }}
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {imageFile
                  ? <div style={{ marginTop: 8, color: '#1a7a1a', fontWeight: 700, fontSize: 13 }}>✅ {imageFile.name}</div>
                  : <div style={{ marginTop: 6, color: '#999', fontSize: 12 }}>JPG, PNG oder WEBP — optional</div>
                }
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                <FormField label="Produktname">
                  <input value={editProduct.name} onChange={e => setEditProduct(p => p ? { ...p, name: e.target.value } : p)} style={inputStyle} />
                </FormField>
                <FormField label="Kategorie">
                  <select value={editProduct.category_id} onChange={e => setEditProduct(p => p ? { ...p, category_id: e.target.value } : p)} style={inputStyle}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Preis (Cent) — z.B. 800 = 8,00 €">
                  <input type="number" value={editProduct.price_cents} onChange={e => setEditProduct(p => p ? { ...p, price_cents: parseInt(e.target.value) || 0 } : p)} style={inputStyle} />
                </FormField>
                <FormField label="Beschreibung">
                  <input value={editProduct.description ?? ''} onChange={e => setEditProduct(p => p ? { ...p, description: e.target.value } : p)} style={inputStyle} />
                </FormField>
              </div>

              {/* Aktiv checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <input type="checkbox" id="is_active_edit" checked={editProduct.is_active} onChange={e => setEditProduct(p => p ? { ...p, is_active: e.target.checked } : p)} />
                <label htmlFor="is_active_edit" style={{ fontSize: 13, fontWeight: 500 }}>Aktiv (im Bestellmenü sichtbar)</label>
              </div>

              {error && <p style={{ color: '#C0392B', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{error}</p>}

              {/* Footer buttons */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => { setEditProduct(null); setImageFile(null); setEditImageFile(null); setEditImagePreview(null); setError(''); }} style={{ padding: '9px 18px', border: '1px solid #ddd', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13 }}>Abbrechen</button>
                <button onClick={handleSaveEdit} disabled={saving} style={{ padding: '9px 18px', background: '#C0392B', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? .6 : 1 }}>
                  {saving ? '⏳ Speichern...' : '✓ Speichern'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products grid grouped by category */}
        {categories.map(cat => {
          const catProducts = products.filter(p => p.category_id === cat.id);
          if (catProducts.length === 0) return null;
          return (
            <div key={cat.id} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                {cat.icon} {cat.name} ({catProducts.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                {catProducts.map(product => (
                  <div
                    key={product.id}
                    style={{
                      background: product.is_active ? 'white' : '#FAFAFA',
                      border: product.is_active ? '1px solid #F0F0F0' : '1px dashed #ddd',
                      borderRadius: 12, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      boxShadow: product.is_active ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
                      opacity: product.is_active ? 1 : 0.7,
                    }}
                  >
                    <div style={{ fontSize: 26, width: 44, height: 44, background: '#F5F5F5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : getProductEmoji(product.name)
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                      {product.description && <div style={{ fontSize: 11, color: '#888', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.description}</div>}
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#C0392B', marginTop: 4 }}>{fmt(product.price_cents)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => handleToggleActive(product)} title={product.is_active ? 'Deaktivieren' : 'Aktivieren'} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {product.is_active ? '👁️' : '🚫'}
                      </button>
                      <button onClick={() => setEditProduct(product)} title="Bearbeiten" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(product.id, product.name)} title="Löschen" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared UI ────────────────────────────────────────────────
function PageHeader({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderBottom: '1px solid #F0F0F0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A' }}>{title}</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{sub}</div>
      </div>
      {action}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 4, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB',
  borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
};


 
