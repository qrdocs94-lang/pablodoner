"use client";
 
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
 
interface Order {
  id: string;
  status: string;
  total_cents: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  created_at: string;
  order_type: string;
}
 
export default function OrderStatusPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!id) return;
 
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();
 
      if (!error && data) setOrder(data);
      setLoading(false);
    };
 
    fetchOrder();
 
    // Realtime updates
    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${id}`,
      }, (payload) => {
        setOrder(payload.new as Order);
      })
      .subscribe();
 
    return () => { supabase.removeChannel(channel); };
  }, [id]);
 
  const statusInfo = {
    pending:    { label: "Bestellung eingegangen",  emoji: "📋", color: "text-yellow-600", bg: "bg-yellow-50" },
    preparing:  { label: "Wird zubereitet",          emoji: "👨‍🍳", color: "text-orange-600", bg: "bg-orange-50" },
    ready:      { label: "Bereit zur Abholung!",     emoji: "✅", color: "text-green-600",  bg: "bg-green-50"  },
    delivered:  { label: "Geliefert",                emoji: "🎉", color: "text-blue-600",   bg: "bg-blue-50"   },
  };
 
  const current = statusInfo[(order?.status as keyof typeof statusInfo)] ?? statusInfo.pending;
 
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
      <div className="text-center">
        <div className="text-5xl animate-bounce mb-4">🌯</div>
        <p className="text-gray-500">Bestellung wird geladen...</p>
      </div>
    </div>
  );
 
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-700">Bestellung nicht gefunden</h2>
        <p className="text-gray-500 mt-2">Bitte überprüfe die Bestellnummer.</p>
        <a href="/" className="mt-4 inline-block bg-[#C0392B] text-white px-6 py-2 rounded-full font-semibold">
          Zurück zur Speisekarte
        </a>
      </div>
    </div>
  );
 
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="text-4xl font-black text-[#C0392B]">Smile</div>
        <div className="text-xl font-black text-gray-800 tracking-widest">DÖNER</div>
      </div>
 
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* Status Banner */}
        <div className={`${current.bg} p-6 text-center`}>
          <div className="text-5xl mb-2">{current.emoji}</div>
          <h2 className={`text-xl font-bold ${current.color}`}>{current.label}</h2>
          <p className="text-gray-500 text-sm mt-1">Bestellung #{id.slice(0, 8).toUpperCase()}</p>
        </div>
 
        {/* Progress Steps */}
        <div className="px-6 py-4">
          {["pending", "preparing", "ready", "delivered"].map((step, i) => {
            const steps = ["pending", "preparing", "ready", "delivered"];
            const currentIndex = steps.indexOf(order.status);
            const isActive = i <= currentIndex;
            const labels = ["Eingegangen", "In Zubereitung", "Bereit", "Geliefert"];
            return (
              <div key={step} className="flex items-center mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${isActive ? "bg-[#C0392B] text-white" : "bg-gray-200 text-gray-400"}`}>
                  {i + 1}
                </div>
                <span className={`font-medium ${isActive ? "text-gray-800" : "text-gray-400"}`}>{labels[i]}</span>
              </div>
            );
          })}
        </div>
 
        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="px-6 pb-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-700 mt-4 mb-2">Deine Bestellung</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">{item.quantity}× {item.name}</span>
                <span className="text-gray-500">{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-3 pt-3 border-t border-gray-100">
              <span>Gesamt</span>
              <span className="text-[#C0392B]">{(order.total_cents / 100).toFixed(2)} €</span>
            </div>
          </div>
        )}
 
        <div className="px-6 pb-6 pt-2">
          <a href="/" className="block w-full text-center bg-[#C0392B] text-white py-3 rounded-2xl font-bold hover:bg-[#a93226] transition">
            Neue Bestellung
          </a>
        </div>
      </div>
    </div>
  );
}
 
