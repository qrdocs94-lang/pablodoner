import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const DELIVERY_FEE = 199;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://aqcccwszfzwnowmkppxk.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    );

    const body = await req.json();
    const { items, order_type, customer_name, customer_phone, delivery_address } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Keine Artikel im Warenkorb" }, { status: 400 });
    }

    const subtotal_cents: number = items.reduce(
      (sum: number, item: { price_cents: number; quantity: number }) =>
        sum + item.price_cents * item.quantity,
      0
    );
    const delivery_fee_cents = order_type === "delivery" ? DELIVERY_FEE : 0;
    const total_cents = subtotal_cents + delivery_fee_cents;

    const order_number = `BAR-${Date.now().toString().slice(-6)}`;

    const db_items = items.map((item: {
      product_id: string;
      name: string;
      price_cents: number;
      quantity: number;
      options: Record<string, string | string[]>;
    }) => ({
      product_id: item.product_id,
      name: item.name,
      price_cents: item.price_cents,
      quantity: item.quantity,
      options: item.options,
    }));

    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number,
        status: "cash",
        order_type,
        customer_name: customer_name ?? null,
        customer_phone: customer_phone ?? null,
        delivery_address: delivery_address ?? null,
        items: db_items,
        subtotal_cents,
        delivery_fee_cents,
        total_cents,
        stripe_session_id: null,
        paid_at: new Date().toISOString(),
      })
      .select("id, order_number")
      .single();

    if (error) throw error;

    return NextResponse.json({ order_id: data.id, order_number: data.order_number });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Fehler beim Erstellen der Bestellung";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
