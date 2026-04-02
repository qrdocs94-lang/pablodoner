"use client";
export const dynamic = 'force-dynamic';
// src/app/kitchen/page.tsx — Realtime Kitchen Display

import { useEffect, useState } from "react";
import { supabase, subscribeToOrders, updateOrderStatus } from "@/lib/supabase";
import { Order, OrderStatus, formatPrice } from "@/types";

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    // Load recent orders (last 24h, not cancelled)
    supabase
      .from("orders")
      .select("*")
      .neq("status", "cancelled")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });

    // Realtime subscription
    const sub = subscribeToOrders((updated) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === updated.id);
        if (exists) return prev.map((o) => (o.id === updated.id ? updated : o));
        return [updated, ...prev];
      });
    });

    // Clock
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => { sub.unsubscribe(); clearInterval(interval); };
  }, []);

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
        />
        <Column
          title="🔥 IN ZUBEREITUNG"
          color="text-[#F39C12]"
          headerBg="bg-[#120d03]"
          orders={preparing}
          primaryAction={{ label: "✓ FERTIG", color: "bg-green-600 text-white", next: "ready" }}
        />
        <Column
          title="✅ FERTIG / AUSGABE"
          color="text-green-400"
          headerBg="bg-[#061306]"
          orders={ready}
          primaryAction={null}
        />
      </div>
    </div>
  );
}

// ── Column ───────────────────────────────────────────────────
function Column({
  title, color, headerBg, orders, primaryAction,
}: {
  title: string;
  color: string;
  headerBg: string;
  orders: Order[];
  primaryAction: { label: string; color: string; next: "preparing" | "ready" } | null;
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
          <KitchenCard key={order.id} order={order} primaryAction={primaryAction} />
        ))}
      </div>
    </div>
  );
}

// ── Kitchen Card ─────────────────────────────────────────────
function KitchenCard({
  order,
  primaryAction,
}: {
  order: Order;
  primaryAction: { label: string; color: string; next: "preparing" | "ready" } | null;
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

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className={`font-black text-sm ${timerColor}`}>⏱ {elapsed}min</span>
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

