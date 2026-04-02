// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Category, Product, Order } from "@/types";

let _supabase: SupabaseClient | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aqcccwszfzwnowmkppxk.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxY2Njd3N6Znp3bm93bWtwcHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTQzMzgsImV4cCI6MjA4OTgzMDMzOH0.oP50RbIcENZo_Vcn0sFw_WTwgv-pTp1D0NcW-XGB7vo";
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  }
});

// ── API helpers ──────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchProducts(categoryId?: string): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (error) return null;
  return data;
}

// ── Checkout ─────────────────────────────────────────────────
export async function createCheckoutSession(payload: {
  items: { product_id: string; quantity: number; options: Record<string, string | string[]> }[];
  order_type: "pickup" | "delivery";
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: { street: string; city: string; zip: string };
}): Promise<{ checkout_url: string; order_id: string; order_number: string }> {
  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: payload,
  });
  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data;
}

// ── Realtime subscription for kitchen display ─────────────────
export function subscribeToOrders(
  onUpdate: (order: Order) => void
) {
  return supabase
    .channel("orders-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      (payload) => onUpdate(payload.new as Order)
    )
    .subscribe();
}

// ── Kitchen: update order status ──────────────────────────────
export async function updateOrderStatus(
  orderId: string,
  status: "preparing" | "ready" | "cancelled"
): Promise<void> {
  const update: Record<string, string> = { status };
  if (status === "ready") update.ready_at = new Date().toISOString();
  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) throw error;
}



