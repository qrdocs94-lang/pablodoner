"use client";
export const dynamic = 'force-dynamic';
// src/app/kitchen/page.tsx — Realtime Kitchen Display

import { useEffect, useState } from "react";
import { supabase, subscribeToOrders, updateOrderStatus, updateOrderFull } from "@/lib/supabase";
import { Order, OrderItem, OrderStatus, formatPrice } from "@/types";

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clock, setClock] = useState(new Date());
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .neq("status", "cancelled")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });

    const sub = subscribeToOrders((updated) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === updated.id);
        if (exists) return prev.map((o) => (o.id === updated.id ? updated : o));
        return [updated, ...prev];
      });
    });

    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => { sub.unsubscribe(); clearInterval(interval); };
  }, []);

  const handleOrderUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditingOrder(null);
  };

  const byStatus = (status: OrderStatus) => orders.filter((o) => o.status === status);
  const paid      = byStatus("paid");
  const preparing = byStatus("preparing");
  const ready     = byStatus("ready");

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="font-black text-[#F39C12] text-xl tracking-wider">SMILE DÖNER — KÜCHEN DISPLAY</div>
          <div className="text-white/40 text-xs font-bold tracking-widest uppercase">Franziskusstr. 1, 44795 Bochum</div>
        </div>
        <div className="text-right">
          <div className="font-black text-[#F39C12] text-3xl tabular-nums">
            {clock.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-white/40 text-xs">{orders.filter(o => o.status !== "ready" && o.status !== "cancelled").length} aktive Bestellungen</div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 grid grid-cols-3 gap-0">
        <Column
          title="📥 NEU / BEZAHLT"
          color="text-blue-400"
          headerBg="bg-[#0a1a2e]"
          orders={paid}
          primaryAction={{ label: "▶ STARTEN", color: "bg-[#F39C12] text-[#1A0800]", next: "preparing" }}
          onEdit={setEditingOrder}
        />
        <Column
          title="🔥 IN ZUBEREITUNG"
          color="text-[#F39C12]"
          headerBg="bg-[#120d03]"
          orders={preparing}
          primaryAction={{ label: "✓ FERTIG", color: "bg-green-600 text-white", next: "ready" }}
          onEdit={setEditingOrder}
        />
        <Column
          title="✅ FERTIG / AUSGABE"
          color="text-green-400"
          headerBg="bg-[#061306]"
          orders={ready}
          primaryAction={null}
          onEdit={setEditingOrder}
        />
      </div>

      {/* Edit Modal */}
      {editingOrder && (
        <EditModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={handleOrderUpdated}
        />
      )}
    </div>
  );
}

// ── Column ───────────────────────────────────────────────────
function Column({
  title, color, headerBg, orders, primaryAction, onEdit,
}: {
  title: string;
  color: string;
  headerBg: string;
  orders: Order[];
  primaryAction: { label: string; color: string; next: "preparing" | "ready" } | null;
  onEdit: (order: Order) => void;
}) {
  return (
    <div className="flex flex-col border-r border-white/10 last:border-r-0">
      <div className={`${headerBg} border-b border-white/10 px-4 py-3 flex items-center justify-between`}>
        <span className={`font-black text-sm tracking-wider ${color}`}>{title}</span>
        <span className={`font-black text-sm px-3 py-0.5 rounded-full bg-white/10 ${color}`}>{orders.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {orders.length === 0 && (
          <div className="text-center py-16 text-white/20">
            <div className="text-4xl mb-3 opacity-40">
              {title.includes("NEU") ? "📭" : title.includes("ZUB") ? "🍳" : "✅"}
            </div>
            <p className="font-bold text-sm">Keine Bestellungen</p>
          </div>
        )}
        {orders.map((order) => (
          <KitchenCard key={order.id} order={order} primaryAction={primaryAction} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

// ── Kitchen Card ─────────────────────────────────────────────
function KitchenCard({
  order,
  primaryAction,
  onEdit,
}: {
  order: Order;
  primaryAction: { label: string; color: string; next: "preparing" | "ready" } | null;
  onEdit: (order: Order) => void;
}) {
  const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  const isLate  = elapsed > (order.order_type === "delivery" ? 30 : 15);
  const isWarn  = elapsed > (order.order_type === "delivery" ? 20 : 10);
  const timerColor = isLate ? "text-red-400 animate-pulse" : isWarn ? "text-yellow-400" : "text-green-400";

  const handleAction = async () => {
    if (!primaryAction) return;
    await updateOrderStatus(order.id, primaryAction.next);
  };

  return (
    <div className={`bg-[#1a1a24] rounded-2xl p-4 border ${isLate ? "border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]" : "border-white/10"}`}>
      {/* Top */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-black text-2xl tracking-widest text-white">{order.order_number}</span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${order.order_type === "pickup" ? "bg-blue-900/50 text-blue-300" : "bg-yellow-900/50 text-yellow-300"}`}>
          {order.order_type === "pickup" ? "🏃 Abholung" : "🛵 Lieferung"}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="font-black text-[#F39C12] text-sm w-6 flex-shrink-0">{item.quantity}×</span>
            <div className="flex-1">
              <div className="text-white font-bold text-sm leading-tight">{item.name}</div>
              {item.options && Object.keys(item.options).length > 0 && (
                <div className="text-white/50 text-xs mt-0.5">
                  {Object.entries(item.options)
                    .filter(([, v]) => v && (Array.isArray(v) ? v.length > 0 : true))
                    .map(([, v]) => Array.isArray(v) ? v.join(", ") : v)
                    .join(" · ")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-3 px-3 py-2 bg-yellow-900/20 border border-yellow-700/30 rounded-lg text-yellow-300 text-xs">
          📝 {order.notes}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-2">
          <span className={`font-black text-sm ${timerColor}`}>⏱ {elapsed}min</span>
          <button
            onClick={() => onEdit(order)}
            className="text-white/40 hover:text-white/80 font-bold text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            title="Bestellung bearbeiten"
          >
            ✏️
          </button>
        </div>
        {primaryAction ? (
          <button
            onClick={handleAction}
            className={`${primaryAction.color} font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95 hover:opacity-90`}
          >
            {primaryAction.label}
          </button>
        ) : (
          <button
            onClick={() => updateOrderStatus(order.id, "cancelled")}
            className="text-white/30 hover:text-white/60 font-bold text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            ✕ Archiv
          </button>
        )}
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────
function EditModal({
  order,
  onClose,
  onSaved,
}: {
  order: Order;
  onClose: () => void;
  onSaved: (updated: Order) => void;
}) {
  const [items, setItems] = useState<OrderItem[]>(order.items.map(i => ({ ...i })));
  const [status, setStatus] = useState<string>(order.status);
  const [customerName, setCustomerName] = useState(order.customer_name ?? "");
  const [customerPhone, setCustomerPhone] = useState(order.customer_phone ?? "");
  const [street, setStreet] = useState(order.delivery_address?.street ?? "");
  const [city, setCity] = useState(order.delivery_address?.city ?? "");
  const [zip, setZip] = useState(order.delivery_address?.zip ?? "");
  const [notes, setNotes] = useState(order.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setQty = (idx: number, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter((_, i) => i !== idx));
    } else {
      setItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
    }
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setError("Mindestens ein Artikel muss vorhanden sein.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const deliveryAddress = order.order_type === "delivery" && (street || city || zip)
        ? { street, city, zip }
        : order.delivery_address;

      await updateOrderFull(order.id, {
        status,
        items,
        delivery_address: deliveryAddress,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        notes: notes || null,
      });

      const subtotal = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
      const fee = order.delivery_fee_cents;
      const updated: Order = {
        ...order,
        status: status as OrderStatus,
        items,
        delivery_address: deliveryAddress,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        notes: notes || null,
        subtotal_cents: subtotal,
        total_cents: subtotal + fee,
      };
      onSaved(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a24] border border-white/15 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <span className="font-black text-white text-lg tracking-wider">{order.order_number}</span>
            <span className="ml-3 text-white/40 text-sm">bearbeiten</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Status */}
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2 block">Status</label>
            <div className="flex gap-2">
              {(["paid", "preparing", "ready"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black tracking-wide transition-all ${
                    status === s
                      ? s === "paid" ? "bg-blue-600 text-white"
                        : s === "preparing" ? "bg-[#F39C12] text-[#1A0800]"
                        : "bg-green-600 text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {s === "paid" ? "📥 Neu" : s === "preparing" ? "🔥 Zubereitung" : "✅ Fertig"}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2 block">Artikel</label>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">{item.name}</div>
                    <div className="text-white/40 text-xs">{formatPrice(item.price_cents)} / Stk.</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQty(idx, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-700/50 text-white font-black text-sm flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-black text-[#F39C12] text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQty(idx, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-green-700/50 text-white font-black text-sm flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                    className="text-white/20 hover:text-red-400 transition-colors text-sm font-bold px-1"
                    title="Artikel entfernen"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-white/30 text-sm text-center py-3">Alle Artikel entfernt</div>
              )}
            </div>
            <div className="mt-2 text-right text-white/40 text-xs">
              Gesamt: <span className="text-white font-bold">
                {formatPrice(items.reduce((s, i) => s + i.price_cents * i.quantity, 0) + order.delivery_fee_cents)}
              </span>
            </div>
          </div>

          {/* Lieferadresse */}
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2 block">
              Kunde &amp; Adresse
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Name"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F39C12]/50"
                />
                <input
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Telefon"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F39C12]/50"
                />
              </div>
              {order.order_type === "delivery" && (
                <>
                  <input
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="Straße &amp; Hausnummer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F39C12]/50"
                  />
                  <div className="flex gap-2">
                    <input
                      value={zip}
                      onChange={e => setZip(e.target.value)}
                      placeholder="PLZ"
                      className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F39C12]/50"
                    />
                    <input
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Stadt"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F39C12]/50"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notiz */}
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2 block">Notiz / Kommentar</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="z.B. klingeln wenn fertig, 2. OG links..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F39C12]/50 resize-none"
            />
          </div>

          {error && <div className="text-red-400 text-sm font-bold">{error}</div>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-bold text-sm transition-all"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#F39C12] hover:bg-[#e08e0b] disabled:opacity-50 text-[#1A0800] font-black text-sm transition-all"
          >
            {saving ? "Speichern..." : "✓ Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
