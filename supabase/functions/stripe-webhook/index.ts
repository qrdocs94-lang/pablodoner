// supabase/functions/stripe-webhook/index.ts
// ============================================================
// Stripe Webhook Handler
// Listens for checkout.session.completed → sets order to 'paid'
// Also handles payment_intent.payment_failed
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
          // Session completed but not yet paid (e.g. bank transfer)
          console.log(`[webhook] Session ${session.id} not yet paid, skipping`);
          break;
        }

        const order_id = session.metadata?.order_id;
        if (!order_id) {
          console.error("[webhook] No order_id in session metadata");
          break;
        }

        // Update order: pending → paid
        const { data: updated, error: updateErr } = await supabase
          .from("orders")
          .update({
            status: "paid",
            stripe_payment_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
          })
          .eq("id", order_id)
          .eq("status", "pending")   // idempotency guard
          .select("id, order_number, order_type, items, total_cents")
          .single();

        if (updateErr) {
          console.error("[webhook] DB update failed:", updateErr);
          throw updateErr;
        }

        if (!updated) {
          console.warn(`[webhook] Order ${order_id} not updated (already processed?)`);
          break;
        }

        console.log(
          `[webhook] ✅ Order ${updated.order_number} marked as PAID | Total: ${updated.total_cents / 100} €`
        );

        // ── Optional: Send notification to kitchen ──────────
        // You could trigger a Supabase Realtime broadcast here,
        // or call a push notification service, etc.
        // await notifyKitchen(updated);

        break;
      }

      // ── Async payment success (e.g. SEPA) ─────────────────
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const order_id = session.metadata?.order_id;
        if (!order_id) break;

        await supabase
          .from("orders")
          .update({
            status: "paid",
            stripe_payment_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
          })
          .eq("id", order_id)
          .eq("status", "pending");

        console.log(`[webhook] ✅ Async payment succeeded for order ${order_id}`);
        break;
      }

      // ── Payment FAILED ─────────────────────────────────────
      case "checkout.session.async_payment_failed":
      case "payment_intent.payment_failed": {
        const obj = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
        const order_id = (obj as Stripe.Checkout.Session).metadata?.order_id
          ?? (obj as Stripe.PaymentIntent).metadata?.order_id;

        if (!order_id) break;

        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", order_id)
          .eq("status", "pending");

        console.log(`[webhook] ❌ Payment failed for order ${order_id}`);
        break;
      }

      // ── Session EXPIRED ────────────────────────────────────
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const order_id = session.metadata?.order_id;
        if (!order_id) break;

        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", order_id)
          .eq("status", "pending");

        console.log(`[webhook] ⏰ Session expired for order ${order_id}`);
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
