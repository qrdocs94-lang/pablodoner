"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCategories, fetchProducts, createCheckoutSession } from "@/lib/supabase";
import { useCartStore } from "@/lib/cartStore";
import { Category, Product, formatPrice } from "@/types";
import OptionsModal from "@/components/terminal/OptionsModal";
import CartPanel from "@/components/terminal/CartPanel";

const categoryEmojis: Record<string, string> = {
  "Döner & Dürüm": "🌯",
  "Lahmacun": "🫓",
  "Falafel & Veggie": "🧆",
  "Snacks & Mehr": "🍟",
  "Extras & Saucen": "🫙",
  "Getränke": "🥤",
};

function getProductEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('dürüm') || n.includes('durum') || n.includes('wrap')) return '🫔';
  if (n.includes('döner') || n.includes('sandwich') || n.includes('drehspieß')) return '🌯';
  if (n.includes('lahmacun')) return '🫓';
  if (n.includes('falafel')) return '🧆';
  if (n.includes('salat')) return '🥗';
  if (n.includes('pommes')) return '🍟';
  if (n.includes('nugget') || n.includes('mozzarella')) return '🍗';
  if (n.includes('currywurst')) return '🌭';
  if (n.includes('toast') || n.includes('sucuk')) return '🥙';
  if (n.includes('cola') || n.includes('fanta') || n.includes('wasser') || n.includes('ayran') || n.includes('eistee') || n.includes('uludag') || n.includes('capri')) return '🥤';
  if (n.includes('teller') || n.includes('portion') || n.includes('box')) return '🍽️';
  if (n.includes('halloumi')) return '🧀';
  if (n.includes('sauce') || n.includes('soße') || n.includes('extra') || n.includes('ketchup') || n.includes('mayo') || n.includes('käse') || n.includes('juppi') || n.includes('samurai')) return '🫙';
  return '🌯';
}

export default function TerminalPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const { totalItems, totalFormatted, toCheckoutPayload, orderType, addItem, setOrderType } = useCartStore();

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()]).then(([cats, prods]) => {
      setCategories(cats);
      setAllProducts(prods);
    }).catch(() => setError("Menü konnte nicht geladen werden."));
  }, []);

  const productsByCategory = categories.map((cat, idx) => ({
    category: cat,
    products: allProducts.filter(p => p.category_id === cat.id),
    idx,
  })).filter(g => g.products.length > 0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const handleAddItem = useCallback((product: Product) => {
    if (product.options_schema && product.options_schema.length > 0) {
      setSelectedProduct(product);
    } else {
      addItem(product, {});
      showToast(`✓ ${product.name} hinzugefügt`);
    }
  }, [addItem, showToast]);

  const handleCheckout = useCallback(async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    setError(null);
    try {
      const payload = toCheckoutPayload();
      const { checkout_url } = await createCheckoutSession(payload);
      window.location.href = checkout_url;
    } catch (e: any) {
      setError(e.message ?? "Fehler beim Checkout");
    } finally {
      setIsCheckingOut(false);
    }
  }, [isCheckingOut, toCheckoutPayload]);

  const scrollToSection = (idx: number) => {
    setActiveSection(idx);
    const el = document.getElementById(`section-${idx}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cartItemCount = mounted ? totalItems() : 0;
  const cartTotal = mounted ? totalFormatted() : '0,00 €';

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100vh', paddingBottom: cartItemCount > 0 ? 90 : 0 }}>

      {/* INFO BAR */}
      <div style={{ background: '#1A1A1A', color: 'white', textAlign: 'center', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
        📍 Franziskusstr. 1, 44795 Bochum &nbsp;|&nbsp;
        <span style={{ color: '#F39C12' }}>Di–Do 10–22 Uhr &bull; Fr–So 12–00 Uhr</span>
      </div>

      {/* HEADER */}
      <header style={{ background: '#C0392B', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.25)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', border: '2px solid #F39C12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden' }}>
              <img src="/logo.png" alt="Smile Döner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerText = '🌯'; }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#F39C12', lineHeight: 1 }}>Pablo</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: 'white', lineHeight: 1, letterSpacing: 3 }}>DÖNER</div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 10 }}>
            <button
              onClick={() => setOrderType('pickup')}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, background: orderType === 'pickup' ? 'white' : 'transparent', color: orderType === 'pickup' ? '#C0392B' : 'rgba(255,255,255,0.7)', transition: 'all 0.2s' }}
            >
              🏃 Abholen
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, background: orderType === 'delivery' ? 'white' : 'transparent', color: orderType === 'delivery' ? '#C0392B' : 'rgba(255,255,255,0.7)', transition: 'all 0.2s' }}
            >
              🛵 Lieferung
            </button>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F39C12', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 900, fontSize: 15, color: '#1A1A1A', transition: 'all 0.2s', position: 'relative' }}
          >
            🛒 {cartTotal}
            {cartItemCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#96281B', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Nav */}
        <div style={{ background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 20px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {productsByCategory.map(({ category, idx }) => (
              <button
                key={category.id}
                onClick={() => scrollToSection(idx)}
                style={{
                  padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap',
                  background: activeSection === idx ? '#F39C12' : 'rgba(255,255,255,0.15)',
                  color: activeSection === idx ? '#1A1A1A' : 'white',
                  transition: 'all 0.2s',
                }}
              >
                {categoryEmojis[category.name] ?? '🌯'} {category.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #C0392B 0%, #96281B 100%)', color: 'white', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 4, color: '#F39C12', margin: 0 }}>BESTELL ONLINE</h1>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 6, fontWeight: 600 }}>🔥 Täglich frisch vom Spieß — Bochum's bester Döner</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          {['✓ Frisch vom Spieß', '✓ Vegetarisch verfügbar', '✓ Lieferung & Abholung'].map(badge => (
            <span key={badge} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{ background: '#FEE2E2', borderBottom: '1px solid #FECACA', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, color: '#991B1B' }}>
          ⚠️ {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#991B1B' }}>✕</button>
        </div>
      )}

      {/* MAIN CONTENT — all categories */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 40px' }}>
        {productsByCategory.map(({ category, products, idx }) => (
          <div key={category.id} id={`section-${idx}`} style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: '#C0392B', letterSpacing: 2, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
              {categoryEmojis[category.name] ?? '🌯'} {category.name.toUpperCase()}
            </div>
            <div style={{ height: 3, background: '#C0392B', borderRadius: 2, marginBottom: 20, opacity: 0.15 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onSelect={() => handleAddItem(product)}
                />
              ))}
            </div>
          </div>
        ))}

        {productsByCategory.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌯</div>
            <p style={{ fontWeight: 700, fontSize: 18 }}>Menü wird geladen...</p>
          </div>
        )}
      </main>

      {/* CHECKOUT BAR */}
      {cartItemCount > 0 && (
        <div
          onClick={() => setCartOpen(true)}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99,
            background: 'white', borderTop: '2px solid #f0f0f0',
            padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.1)', cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: '#888', fontWeight: 700 }}>{cartItemCount} Artikel im Warenkorb</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#1A1A1A' }}>{cartTotal}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleCheckout(); }}
            disabled={isCheckingOut}
            style={{ background: '#C0392B', color: 'white', border: 'none', borderRadius: 14, padding: '12px 28px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, cursor: 'pointer' }}
          >
            {isCheckingOut ? "WIRD VERARBEITET..." : "JETZT BEZAHLEN →"}
          </button>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: '#1A1A1A', color: 'white', padding: '10px 20px',
          borderRadius: 30, fontWeight: 700, fontSize: 14, zIndex: 300, whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}

      {/* MODALS */}
      {selectedProduct && (
        <OptionsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={(options) => {
            addItem(selectedProduct, options);
            showToast(`✓ ${selectedProduct.name} hinzugefügt`);
            setSelectedProduct(null);
          }}
        />
      )}
      {cartOpen && (
        <CartPanel
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={handleCheckout}
          isCheckingOut={isCheckingOut}
        />
      )}
    </div>
  );
}

function ProductCard({ product, index, onSelect }: { product: Product; index: number; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: 'white', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer',
        transition: 'all 0.25s', position: 'relative',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.13)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
    >
      <div style={{ height: 110, background: 'linear-gradient(135deg, #FDF3E3, #F5E6C8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{getProductEmoji(product.name)}</span>
        }
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, marginBottom: 4 }}>{product.name}</div>
        {product.description && (
          <div style={{ fontSize: 11, color: '#888', marginBottom: 8, lineHeight: 1.4 }}>{product.description}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#C0392B' }}>
            {formatPrice(product.price_cents)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#C0392B', color: 'white', fontSize: 20, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
