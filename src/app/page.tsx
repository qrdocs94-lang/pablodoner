"use client";
// src/app/page.tsx — Main Order Terminal

import { useState, useEffect, useCallback } from "react";
import { fetchCategories, fetchProducts, createCheckoutSession } from "@/lib/supabase";
import { useCartStore } from "@/lib/cartStore";
import { Category, Product, formatPrice } from "@/types";
import OptionsModal from "@/components/terminal/OptionsModal";
import CartPanel from "@/components/terminal/CartPanel";

export default function TerminalPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { totalItems, totalFormatted, toCheckoutPayload, orderType } = useCartStore();

  // ── Load categories on mount ──────────────────────────────
  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setActiveCat(cats[0]);
    });
  }, []);

  // ── Load products when category changes ──────────────────
  useEffect(() => {
    if (!activeCat) return;
    fetchProducts(activeCat.id).then(setProducts);
  }, [activeCat]);

  // ── Checkout ──────────────────────────────────────────────
  const handleCheckout = useCallback(async () => {
    setIsCheckingOut(true);
    setError(null);
    try {
      const payload = toCheckoutPayload();
      const { checkout_url } = await createCheckoutSession(payload);
      window.location.href = checkout_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Checkout");
      setIsCheckingOut(false);
    }
  }, [toCheckoutPayload]);

  const cartCount = mounted ? totalItems() : 0;

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="bg-[#C0392B] px-6 py-0 flex items-center justify-between h-20 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-[#F39C12] overflow-hidden flex items-center justify-center text-3xl">
            🌯
          </div>
          <div>
            <div className="font-black text-[#F39C12] text-2xl leading-tight tracking-wide">Pablo</div>
            <div className="font-black text-white text-2xl leading-tight tracking-widest">DÖNER</div>
          </div>
        </div>

        {/* Order type toggle */}
        <div className="flex bg-[#A01F1F] rounded-full p-1 gap-1">
          {(["pickup", "delivery"] as const).map((type) => (
            <button
              key={type}
              onClick={() => useCartStore.getState().setOrderType(type)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                orderType === type
                  ? "bg-[#F39C12] text-[#1A0800]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {type === "pickup" ? "🏃 Abholen" : "🛵 Lieferung"}
            </button>
          ))}
        </div>

        {/* Cart button */}
        <button
          onClick={() => setCartOpen(true)}
          className="bg-[#F39C12] hover:bg-[#e08e10] text-[#1A0800] font-black rounded-full px-6 py-3 flex items-center gap-3 text-base transition-all active:scale-95 shadow-md"
        >
          🛒
          <span>{totalFormatted()}</span>
          {cartCount > 0 && (
            <span className="bg-[#C0392B] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── CATEGORY CHIPS ──────────────────────────────────── */}
      <div className="bg-white border-b border-[#EAD9C5] px-6 py-3 flex gap-3 overflow-x-auto flex-shrink-0 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat)}
            className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 whitespace-nowrap ${
              activeCat?.id === cat.id
                ? "bg-[#C0392B] text-white shadow-md"
                : "border-2 border-[#EAD9C5] text-[#4A3728] hover:border-[#C0392B]"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* ── ERROR BANNER ────────────────────────────────────── */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-6 py-3 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* ── PRODUCT GRID ────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-5">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-black text-[#C0392B] text-2xl tracking-widest uppercase">
            {activeCat?.icon} {activeCat?.name}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      </main>

      {/* ── BOTTOM CHECKOUT BAR (visible when cart has items) ── */}
      {cartCount > 0 && (
        <div className="bg-white border-t-2 border-[#EAD9C5] px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div>
            <div className="text-sm text-[#7D6248]">{cartCount} Artikel</div>
            <div className="font-black text-[#1A0800] text-xl">{totalFormatted()}</div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="bg-[#C0392B] hover:bg-[#A01F1F] disabled:bg-gray-400 text-white font-black text-lg px-10 py-4 rounded-2xl transition-all active:scale-95 shadow-lg disabled:cursor-not-allowed"
          >
            {isCheckingOut ? "⏳ Weiterleitung..." : "JETZT BEZAHLEN →"}
          </button>
        </div>
      )}

      {/* ── OPTIONS MODAL ─────────────────────────────────── */}
      {selectedProduct && (
        <OptionsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={(options) => {
            useCartStore.getState().addItem(selectedProduct, options);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* ── CART PANEL ────────────────────────────────────── */}
      <CartPanel
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />
    </div>
  );
}

// ── Product Card Component ─────────────────────────────────────
function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group"
      onClick={onAdd}
    >
      {/* Image / Emoji area */}
      <div className="h-32 bg-gradient-to-br from-[#F5E6D0] to-[#E8C99A] flex items-center justify-center text-6xl relative overflow-hidden">
        <span className="transform group-hover:scale-110 transition-transform duration-200">
          {product.options_schema && JSON.stringify(product.options_schema).includes('sauce') ? '🌯' :
           product.name.toLowerCase().includes('falafel') ? '🧆' :
           product.name.toLowerCase().includes('lahmacun') ? '🫓' :
           product.name.toLowerCase().includes('pommes') ? '🍟' :
           product.name.toLowerCase().includes('nuggets') ? '🍗' :
           product.name.toLowerCase().includes('wurst') ? '🌭' :
           product.name.toLowerCase().includes('cola') || product.name.toLowerCase().includes('fanta') ? '🥤' :
           product.name.toLowerCase().includes('ayran') ? '🥛' :
           product.name.toLowerCase().includes('salat') ? '🥗' :
           product.name.toLowerCase().includes('halloumi') ? '🧀' :
           product.name.toLowerCase().includes('teller') ? '🍽️' :
           product.name.toLowerCase().includes('toast') ? '🍞' :
           product.name.toLowerCase().includes('mozzarella') ? '🧀' :
           '🌯'}
        </span>
      </div>
      <div className="p-3">
        <div className="font-black text-[#1A0800] text-sm leading-tight mb-1">{product.name}</div>
        {product.description && (
          <div className="text-[#7D6248] text-xs mb-3 line-clamp-2">{product.description}</div>
        )}
        <div className="flex items-center justify-between">
          <div className="font-black text-[#C0392B] text-lg">{formatPrice(product.price_cents)}</div>
          <button className="w-9 h-9 bg-[#C0392B] hover:bg-[#A01F1F] text-white rounded-full flex items-center justify-center text-xl font-black transition-all group-hover:scale-110 active:scale-95">
            +
          </button>
        </div>
      </div>
    </div>
  );
}
