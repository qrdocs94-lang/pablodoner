// supabase/functions/stripe-webhook/index.ts
// ============================================================
// Stripe Webhook Handler
// checkout.session.completed → reads checkout_sessions table
// → creates order with 'paid' status (no pending order exists)
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

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();

  // ── Verify webhook signature (SECURITY: prevents spoofed events) ──
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] Invalid signature:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log(`[webhook] Event: ${event.type} | ID: ${event.id}`);

  try {
    switch (event.type) {

      // ── Payment SUCCESS ────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status !== "paid") {
          console.log(`[webhook] Session ${session.id} not yet paid (e.g. bank transfer), skipping`);
          break;
        }

        // Look up the saved checkout data
        const { data: checkoutSession, error: lookupErr } = await supabase
          .from("checkout_sessions")
          .select("order_data")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (lookupErr) {
          console.error("[webhook] Failed to look up checkout_session:", lookupErr);
          throw lookupErr;
        }

        if (!checkoutSession) {
          console.warn(`[webhook] No checkout_session found for ${session.id} — already processed?`);
          break;
        }

        const od = checkoutSession.order_data;

        // Create the order now that payment is confirmed
        const { data: order, error: insertErr } = await supabase
          .from("orders")
          .insert({
            status: "paid",
            order_type: od.order_type,
            customer_name: od.customer_name,
            customer_phone: od.customer_phone,
            delivery_address: od.delivery_address,
            items: od.items,
            subtotal_cents: od.subtotal_cents,
            delivery_fee_cents: od.delivery_fee_cents,
            total_cents: od.total_cents,
            stripe_session_id: session.id,
            stripe_payment_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
          })
          .select("id, order_number")
          .single();

        if (insertErr) {
          console.error("[webhook] Failed to create order:", insertErr);
          throw insertErr;
        }

        // Clean up the temp checkout session
        await supabase
          .from("checkout_sessions")
          .delete()
          .eq("stripe_session_id", session.id);

        console.log(
          `[webhook] ✅ Order ${order.order_number} created as PAID | Total: ${od.total_cents / 100} €`
        );
        break;
      }

      // ── Async payment success (e.g. SEPA) ─────────────────
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;

        const { data: checkoutSession } = await supabase
          .from("checkout_sessions")
          .select("order_data")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (!checkoutSession) {
          console.warn(`[webhook] No checkout_session found for async payment ${session.id}`);
          break;
        }

        const od = checkoutSession.order_data;

        await supabase.from("orders").insert({
          status: "paid",
          order_type: od.order_type,
          customer_name: od.customer_name,
          customer_phone: od.customer_phone,
          delivery_address: od.delivery_address,
          items: od.items,
          subtotal_cents: od.subtotal_cents,
          delivery_fee_cents: od.delivery_fee_cents,
          total_cents: od.total_cents,
          stripe_session_id: session.id,
          stripe_payment_id: session.payment_intent as string,
          paid_at: new Date().toISOString(),
        });

        await supabase
          .from("checkout_sessions")
          .delete()
          .eq("stripe_session_id", session.id);

        console.log(`[webhook] ✅ Async payment succeeded for session ${session.id}`);
        break;
      }

      // ── Payment FAILED / Session EXPIRED ──────────────────
      // Just clean up the temp checkout session — no DB order to cancel
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        await supabase
          .from("checkout_sessions")
          .delete()
          .eq("stripe_session_id", session.id);

        console.log(`[webhook] 🗑️ Cleaned up checkout_session for ${session.id} (${event.type})`);
        break;
      }

      case "payment_intent.payment_failed": {
        // No order was created, nothing to clean up
        console.log(`[webhook] ❌ payment_intent.payment_failed — no action needed`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    // Return 200 anyway to prevent Stripe from retrying non-retriable errors
    return new Response("Handler error", { status: 200 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
