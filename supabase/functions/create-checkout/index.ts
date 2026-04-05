// supabase/functions/create-checkout/index.ts
// ============================================================
// Supabase Edge Function: Create Stripe Checkout Session
// Validates prices from DB before creating session (security!)
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const DELIVERY_FEE_CENTS = 199; // 1.99 €
const APP_URL = Deno.env.get("APP_URL") ?? "https://pablodoner.vercel.app";

// ─── Types ───────────────────────────────────────────────────
interface CartItem {
  product_id: string;
  quantity: number;
  options?: Record<string, string | string[]>;
}

interface CheckoutRequest {
  items: CartItem[];
  order_type: "pickup" | "delivery";
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: {
    street: string;
    city: string;
    zip: string;
  };
}

// ─── CORS headers ────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Main Handler ────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: CheckoutRequest = await req.json();
    const { items, order_type, customer_name, customer_phone, delivery_address } = body;

    // ── 1. Input validation ──────────────────────────────────
    if (!items || items.length === 0) {
      return error(400, "Cart is empty");
    }
    if (order_type === "delivery" && !delivery_address) {
      return error(400, "Delivery address required");
    }

    // ── 2. Validate prices from DB (SECURITY CRITICAL) ───────
    // Never trust frontend prices — always load from DB
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const { data: dbProducts, error: dbErr } = await supabase
      .from("products")
      .select("id, name, price_cents, is_active")
      .in("id", productIds);

    if (dbErr) throw dbErr;
    if (!dbProducts || dbProducts.length !== productIds.length) {
      return error(400, "One or more products not found");
    }

    // Build a lookup map
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Check all products are active and build validated line items
    const validatedItems = [];
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) return error(400, `Product ${item.product_id} not found`);
      if (!product.is_active) return error(400, `Product "${product.name}" is no longer available`);
      if (item.quantity < 1 || item.quantity > 20) return error(400, "Invalid quantity");

      // Build options label for receipt
      const optionsLabel = item.options
        ? Object.entries(item.options)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(" | ")
        : "";

      validatedItems.push({
        product_id: product.id,
        name: product.name,
        price_cents: product.price_cents, // DB price, NOT frontend price
        quantity: item.quantity,
        options: item.options ?? {},
        options_label: optionsLabel,
      });
    }

    // ── 3. Calculate totals ───────────────────────────────────
    const subtotal_cents = validatedItems.reduce(
      (sum, i) => sum + i.price_cents * i.quantity,
      0
    );
    const delivery_fee_cents = order_type === "delivery" ? DELIVERY_FEE_CENTS : 0;
    const total_cents = subtotal_cents + delivery_fee_cents;

    // ── 4. Create order record in DB ──────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        order_type,
        customer_name: customer_name ?? null,
        customer_phone: customer_phone ?? null,
        delivery_address: delivery_address ?? null,
        items: validatedItems,
        subtotal_cents,
        delivery_fee_cents,
        total_cents,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // ── 5. Build Stripe line items ────────────────────────────
    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = validatedItems.map(
      (item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: item.price_cents,
          product_data: {
            name: item.name,
            description: item.options_label || undefined,
          },
        },
      })
    );

    // Add delivery fee as separate line item if applicable
    if (delivery_fee_cents > 0) {
      stripeLineItems.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: delivery_fee_cents,
          product_data: { name: "Liefergebühr" },
        },
      });
    }

    // ── 6. Create Stripe Checkout Session ────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: stripeLineItems,
      currency: "eur",
      success_url: `${APP_URL}/order/${order.id}?success=1`,
      cancel_url: `${APP_URL}/?cancelled=1`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        order_type,
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
        },
      },
      // Auto-expire after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    // ── 7. Store Stripe session ID in order ───────────────────
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    // ── 8. Return checkout URL to frontend ────────────────────
    return new Response(
      JSON.stringify({
        checkout_url: session.url,
        order_id: order.id,
        order_number: order.order_number,
        total_cents,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("[create-checkout] Error:", err);
    return error(500, "Internal server error");
  }
});

function error(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

