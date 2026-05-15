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
  "Extras": "🫙",
  "Extras & Saucen": "🫙",
  "Getränke": "🥤",
};

const STATIC_EXTRAS_CATEGORY: Category = {
  id: 'static-extras',
  name: 'Extras',
  slug: 'extras',
  icon: '🫙',
  sort_order: 45,
  is_active: true,
};

const STATIC_EXTRAS_PRODUCTS: Product[] = [
  { id: 'static-extras-ketchup',    category_id: 'static-extras', name: 'Ketchup',         description: '', price_cents: 50,  image_url: null, is_active: true, sort_order: 1, options_schema: [] },
  { id: 'static-extras-mayo',       category_id: 'static-extras', name: 'Mayo',             description: '', price_cents: 50,  image_url: null, is_active: true, sort_order: 2, options_schema: [] },
  { id: 'static-extras-curry',      category_id: 'static-extras', name: 'Currysauce',       description: '', price_cents: 50,  image_url: null, is_active: true, sort_order: 3, options_schema: [] },
  { id: 'static-extras-knoblauch',  category_id: 'static-extras', name: 'Knoblauchsauce',   description: '', price_cents: 100, image_url: null, is_active: true, sort_order: 4, options_schema: [] },
  { id: 'static-extras-kraeuter',   category_id: 'static-extras', name: 'Kräutersauce',     description: '', price_cents: 100, image_url: null, is_active: true, sort_order: 5, options_schema: [] },
  { id: 'static-extras-scharf',     category_id: 'static-extras', name: 'Scharfe Sauce',    description: '', price_cents: 100, image_url: null, is_active: true, sort_order: 6, options_schema: [] },
  { id: 'static-extras-juppi',      category_id: 'static-extras', name: 'Juppi Sauce',      description: '', price_cents: 100, image_url: null, is_active: true, sort_order: 7, options_schema: [] },
  { id: 'static-extras-samurai',    category_id: 'static-extras', name: 'Samurai Sauce',    description: '', price_cents: 100, image_url: null, is_active: true, sort_order: 8, options_schema: [] },
];

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
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const { totalItems, totalFormatted, toCheckoutPayload, toCashCheckoutPayload, orderType, addItem, setOrderType, clearCart } = useCartStore();

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()]).then(([cats, prods]) => {
      const hasExtrasInDb = cats.some(c => c.name === "Extras" || c.slug === "extras");
      if (hasExtrasInDb) {
        // DB has real Extras category — use it directly
        setCategories(cats);
        setAllProducts(prods);
      } else {
        // Fallback: inject static extras between Snacks & Mehr and Getränke
        const insertAt = (() => {
          const i = cats.findIndex(c => c.name === "Snacks & Mehr");
          return i >= 0 ? i + 1 : cats.length;
        })();
        const catsWithExtras = [...cats];
        catsWithExtras.splice(insertAt, 0, STATIC_EXTRAS_CATEGORY);
        setCategories(catsWithExtras);
        setAllProducts([...prods, ...STATIC_EXTRAS_PRODUCTS]);
      }
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

  const handleCashCheckout = useCallback(async () => {
    if (isCashingOut) return;
    setIsCashingOut(true);
    setError(null);
    try {
      const payload = toCashCheckoutPayload();
      const res = await fetch("/api/cash-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Erstellen der Bestellung");
      clearCart();
      window.location.href = `/order/${data.order_id}`;
    } catch (e: any) {
      setError(e.message ?? "Fehler beim Erstellen der Bestellung");
    } finally {
      setIsCashingOut(false);
    }
  }, [isCashingOut, toCashCheckoutPayload, clearCart]);

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
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: cartItemCount > 0 ? 90 : 0 }}>

      {/* INFO BAR */}
      <div style={{ background: 'rgba(0,0,0,0.7)', borderBottom: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', textAlign: 'center', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
        📍 Franziskusstr. 1, 44795 Bochum &nbsp;|&nbsp;
        <span style={{ color: '#F39C12' }}>Di–Do 10–22 Uhr &bull; Fr–So 12–00 Uhr</span>
      </div>

      {/* HEADER */}
      <header style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <img src="/PHOTO-2026-04-10-14-31-43.jpg" alt="Smile Döner" style={{ height: 48, width: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }} />

          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: 4, borderRadius: 10 }}>
            <button
              onClick={() => setOrderType('pickup')}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, background: orderType === 'pickup' ? 'rgba(255,255,255,0.15)' : 'transparent', color: orderType === 'pickup' ? '#ffffff' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
            >
              🏃 Abholen
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, background: orderType === 'delivery' ? 'rgba(255,255,255,0.15)' : 'transparent', color: orderType === 'delivery' ? '#ffffff' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
            >
              🛵 Lieferung
            </button>
          </div>

          {/* Right side: Phone + Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Phone */}
            <style>{`.phone-text { display: none; } @media (min-width: 640px) { .phone-text { display: inline; } }`}</style>
            <a
              href="tel:02345798533"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 800, fontSize: 14, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            >
              📞 <span className="phone-text">02345 798533</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#C0392B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 900, fontSize: 15, color: 'white', transition: 'all 0.2s', position: 'relative', backdropFilter: 'blur(8px)' }}
            >
              🛒 {cartTotal}
              {cartItemCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#F39C12', color: '#1A1A1A', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0a0a0a' }}>
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Nav */}
        <div style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 20px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {productsByCategory.map(({ category, idx }) => (
              <button
                key={category.id}
                onClick={() => scrollToSection(idx)}
                style={{
                  padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
                  fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap',
                  background: activeSection === idx ? '#F39C12' : 'rgba(255,255,255,0.06)',
                  border: activeSection === idx ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                  color: activeSection === idx ? '#1A1A1A' : 'rgba(255,255,255,0.75)',
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
      <HeroSlider />

      {/* ERROR */}
      {error && (
        <div style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, color: '#ff6b6b' }}>
          ⚠️ {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#ff6b6b' }}>✕</button>
        </div>
      )}

      {/* MAIN CONTENT — all categories */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 40px' }}>
        {productsByCategory.map(({ category, products, idx }) => (
          <div key={category.id} id={`section-${idx}`} style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: '#ffffff', letterSpacing: 2, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
              {categoryEmojis[category.name] ?? '🌯'} {category.name.toUpperCase()}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 20 }} />
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
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.4)' }}>
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
            background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.5)', cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{cartItemCount} Artikel im Warenkorb</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#ffffff' }}>{cartTotal}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleCheckout(); }}
            disabled={isCheckingOut}
            style={{ background: '#C0392B', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 28px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, cursor: 'pointer' }}
          >
            {isCheckingOut ? "WIRD VERARBEITET..." : "JETZT BEZAHLEN →"}
          </button>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white', padding: '10px 20px',
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
          onCashCheckout={handleCashCheckout}
          isCashingOut={isCashingOut}
        />
      )}
      {/* FOOTER */}
      <footer style={{ background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.07)', color: "rgba(255,255,255,0.4)", padding: "20px", textAlign: "center", fontSize: 12 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 6, fontSize: 14 }}>🌯 Smile Döner Bochum</div>
          <div style={{ marginBottom: 8 }}>Franziskusstr. 1, 44795 Bochum · pablodoner7@gmail.com</div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 12 }}>
            <a href="/impressum" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Impressum</a>
            <a href="/datenschutz" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Datenschutz</a>
          </div>
          {/* Hidden Admin Button */}
          <div style={{ marginTop: 8 }}>
            <a href="/admin" style={{ color: "rgba(255,255,255,0.05)", fontSize: 10, textDecoration: "none" }}>●</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, index, onSelect }: { product: Product; index: number; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)', cursor: 'pointer',
        transition: 'all 0.25s', position: 'relative',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
    >
      <div style={{ height: 110, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{getProductEmoji(product.name)}</span>
        }
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, marginBottom: 4, color: '#ffffff' }}>{product.name}</div>
        {product.description && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8, lineHeight: 1.4 }}>{product.description}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#f5c518' }}>
            {formatPrice(product.price_cents)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: '#C0392B', color: 'white', fontSize: 20, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hero Slider ───────────────────────────────────────────────
const HERO_SLIDES = ['/done.png', '/caption.jpg'];

function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'relative', color: 'white', padding: '40px 20px 48px', textAlign: 'center', overflow: 'hidden', minHeight: 200 }}>
      {/* Slides */}
      {HERO_SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: i === active ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 0,
          }}
        />
      ))}

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />

      {/* Text content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 4, color: '#F39C12', margin: 0 }}>BESTELL ONLINE</h1>
        <p style={{ fontSize: 15, opacity: 0.85, marginTop: 6, fontWeight: 600 }}>🔥 Täglich frisch vom Spieß — Bochum's bester Döner</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          {['✓ Frisch vom Spieß', '✓ Vegetarisch verfügbar', '✓ Lieferung & Abholung'].map(badge => (
            <span key={badge} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
              {badge}
            </span>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18 }}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Bild ${i + 1}`}
              style={{
                width: i === active ? 20 : 8, height: 8,
                borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === active ? '#F39C12' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
