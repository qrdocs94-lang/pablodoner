import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SAUCES = [
  { name: "Ketchup",        price_cents: 50,  sort_order: 1 },
  { name: "Mayo",           price_cents: 50,  sort_order: 2 },
  { name: "Currysauce",     price_cents: 50,  sort_order: 3 },
  { name: "Knoblauchsauce", price_cents: 100, sort_order: 4 },
  { name: "Kräutersauce",   price_cents: 100, sort_order: 5 },
  { name: "Scharfe Sauce",  price_cents: 100, sort_order: 6 },
  { name: "Juppi Sauce",    price_cents: 100, sort_order: 7 },
  { name: "Samurai Sauce",  price_cents: 100, sort_order: 8 },
];

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://aqcccwszfzwnowmkppxk.supabase.co";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY nicht konfiguriert. Bitte in Vercel env vars setzen." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // 1. Check if Extras category already exists
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "extras")
    .maybeSingle();

  let categoryId: string;

  if (existing?.id) {
    categoryId = existing.id;
  } else {
    // Move Getränke to sort_order 6
    await supabase.from("categories").update({ sort_order: 6 }).eq("slug", "getraenke");

    // Insert Extras category at sort_order 5
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .insert({ name: "Extras", slug: "extras", icon: "🫙", sort_order: 5, is_active: true })
      .select("id")
      .single();

    if (catErr) {
      return NextResponse.json({ error: catErr.message }, { status: 500 });
    }
    categoryId = cat.id;
  }

  // 2. Insert missing sauces (skip existing by name)
  const { data: existingProducts } = await supabase
    .from("products")
    .select("name")
    .eq("category_id", categoryId);

  const existingNames = new Set((existingProducts ?? []).map((p: { name: string }) => p.name));

  const toInsert = SAUCES
    .filter(s => !existingNames.has(s.name))
    .map(s => ({
      category_id:    categoryId,
      name:           s.name,
      description:    "",
      price_cents:    s.price_cents,
      sort_order:     s.sort_order,
      is_active:      true,
      options_schema: [],
    }));

  if (toInsert.length > 0) {
    const { error: prodsErr } = await supabase.from("products").insert(toInsert);
    if (prodsErr) {
      return NextResponse.json({ error: prodsErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    message: "Extras erfolgreich eingerichtet",
    category_id: categoryId,
    inserted: toInsert.length,
    skipped: SAUCES.length - toInsert.length,
  });
}
