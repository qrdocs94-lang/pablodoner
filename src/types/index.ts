// src/types/index.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface OptionSchema {
  key: string;
  label: string;
  type: "select" | "multiselect";
  required: boolean;
  options: string[];
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  options_schema: OptionSchema[];
}

export type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "cancelled";
export type OrderType   = "pickup" | "delivery";

export interface OrderItem {
  product_id: string;
  name: string;
  price_cents: number;
  quantity: number;
  options: Record<string, string | string[]>;
  options_label?: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  order_type: OrderType;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: { street: string; city: string; zip: string } | null;
  items: OrderItem[];
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  stripe_session_id: string | null;
  created_at: string;
  paid_at: string | null;
}

// Cart item (frontend only, before checkout)
export interface CartItem {
  product: Product;
  quantity: number;
  options: Record<string, string | string[]>;
  cartKey: string; // unique key: product_id + JSON(options)
}

// Utility: format cents to EUR string
export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

// Generate a stable cart key for deduplication
export function cartKey(productId: string, options: Record<string, string | string[]>): string {
  return productId + "|" + JSON.stringify(options, Object.keys(options).sort());
}
