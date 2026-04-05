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

// ── Admin: fetch all orders ────────────────────────────────────
export async function fetchAllOrdersAdmin(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Admin: fetch all products (including inactive) ─────────────
export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

// ── Admin: upload product image to Storage ─────────────────────
export async function uploadProductImage(file: File, productId?: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const prefix = productId ?? crypto.randomUUID();
  const fileName = `${prefix}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return data.publicUrl;
}

// ── Admin: create product ──────────────────────────────────────
export async function createProduct(product: {
  category_id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url?: string | null;
  sort_order?: number;
}): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({ ...product, is_active: true, options_schema: [] })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Admin: update product ──────────────────────────────────────
export async function updateProduct(
  id: string,
  updates: Partial<Pick<Product, "name" | "description" | "price_cents" | "is_active" | "category_id" | "image_url">>
): Promise<void> {
  const { error } = await supabase.from("products").update(updates).eq("id", id);
  if (error) throw error;
}

// ── Admin: delete product ──────────────────────────────────────
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ── Kitchen/Admin: full order update ──────────────────────────
export async function updateOrderFull(
  orderId: string,
  updates: {
    status?: string;
    items?: import("@/types").OrderItem[];
    delivery_address?: { street: string; city: string; zip: string } | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    notes?: string | null;
  }
): Promise<void> {
  const payload: Record<string, unknown> = { ...updates };

  // Recalculate totals when items change
  if (updates.items) {
    const subtotal = updates.items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
    payload.subtotal_cents = subtotal;
    // Keep existing delivery fee — only recalculate subtotal/total
    const { data: existing } = await supabase
      .from("orders")
      .select("delivery_fee_cents")
      .eq("id", orderId)
      .single();
    const fee = existing?.delivery_fee_cents ?? 0;
    payload.total_cents = subtotal + fee;
  }

  if (updates.status === "ready") {
    payload.ready_at = new Date().toISOString();
  }

  const { error } = await supabase.from("orders").update(payload).eq("id", orderId);
  if (error) throw error;
}

