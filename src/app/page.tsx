"use client";
export const dynamic = 'force-dynamic';
 
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
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => setMounted(true), []);
 
  const { totalItems, totalFormatted, toCheckoutPayload, orderType } = useCartStore();
 
  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setActiveCat(cats[0]);
    });
  }, []);
 
  useEffect(() => {
    if (!activeCat) return;
    fetchProducts(activeCat.id).then(setProducts);
  }, [activeCat]);
 
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
 
  const { setOrderType } = useCartStore();
 
  const categoryEmojis: Record<string, string> = {
    "Döner & Dürüm": "🌯",
    "Lahmacun": "🫓",
    "Falafel & Veggie": "🧆",
    "Snacks & Mehr": "🍟",
    "Getränke": "🥤",
  };
 
  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)', paddingBottom: '90px' }}>
 
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header style={{ background: 'var(--red)', boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
 
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0, background: 'white' }}>
              <img src="/logo.png" alt="Pablo Döner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#F39C12', lineHeight: 1 }}>Pablo</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: 'white', lineHeight: 1, letterSpacing: 2 }}>DÖNER</div>
            </div>
          </div>
 
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button className={`mode-btn ${orderType === 'pickup' ? 'active' : ''}`} onClick={() => setOrderType('pickup')}>
              🏃 Abholen
            </button>
            <button className={`mode-btn ${orderType === 'delivery' ? 'active' : ''}`} onClick={() => setOrderType('delivery')}>
              🛵 Lieferung
            </button>
          </div>
 
          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F39C12', border: 'none', borderRadius: 12, padding: '10px 18px', cursor: 'pointer', fontWeight: 800, fontSize: 16, color: '#1A1A1A', transition: 'all 0.2s' }}
          >
            🛒 {mounted ? (typeof totalFormatted === 'function' ? totalFormatted() : totalFormatted) : '0,00 €'}
            {mounted && totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>
        </div>
 
        {/* Category Nav */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 20px', display: 'flex', gap: 8, overflowX: 'auto' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill ${activeCat?.id === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {categoryEmojis[cat.name] ?? '🌯'} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>
 
      {/* ── ERROR BANNER ───────────────────────────────────────────── */}
      {error && (
        <div style={{ background: '#FEE2E2', borderBottom: '1px solid #FECACA', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, color: '#991B1B' }}>
          ⚠️ {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#991B1B' }}>✕</button>
        </div>
      )}
 
      {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
 
        {/* Category Title */}
        {activeCat && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>{categoryEmojis[activeCat.name] ?? '🌯'}</span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: 'var(--red)', letterSpacing: 1, margin: 0 }}>
              {activeCat.name.toUpperCase()}
            </h2>
          </div>
        )}
 
        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onSelect={() => setSelectedProduct(product)}
            />
          ))}
        </div>
 
        {products.length === 0 && activeCat && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌯</div>
            <p style={{ fontWeight: 700, fontSize: 18 }}>Keine Produkte gefunden</p>
          </div>
        )}
      </main>
 
      {/* ── CHECKOUT BAR ───────────────────────────────────────────── */}
      {mounted && totalItems > 0 && (
        <div className="checkout-bar slide-up">
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>{totalItems} Artikel</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: 'var(--text)' }}>{totalFormatted}</div>
          </div>
          <button className="checkout-btn" onClick={handleCheckout} disabled={isCheckingOut}>
            {isCheckingOut ? "WIRD VERARBEITET..." : "JETZT BEZAHLEN →"}
          </button>
        </div>
      )}
 
      {/* ── MODALS ─────────────────────────────────────────────────── */}
      {selectedProduct && (
        <OptionsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      {cartOpen && (
        <CartPanel onClose={() => setCartOpen(false)} onCheckout={handleCheckout} isCheckingOut={isCheckingOut} />
      )}
    </div>
  );
}
 
/* ── Product Card Component ─────────────────────────────────────────── */
function ProductCard({ product, index, onSelect }: { product: Product; index: number; onSelect: () => void }) {
  const { addItem } = useCartStore();
 
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.has_options) {
      onSelect();
    } else {
      addItem({ product_id: product.id, name: product.name, price: product.price, quantity: 1, options: {} });
    }
  };
 
  return (
    <div
      className="product-card"
      onClick={onSelect}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Image */}
      <div style={{ background: 'linear-gradient(135deg, #FDF3E3 0%, #F5E6C8 100%)', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{getProductEmoji(product.name)}</span>
        }
      </div>
 
      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 4, lineHeight: 1.2 }}>{product.name}</div>
        {product.description && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.4 }}>{product.description}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: 'var(--red)' }}>
            {formatPrice(product.price)}
          </span>
          <button className="add-btn" onClick={handleAdd}>+</button>
        </div>
      </div>
    </div>
  );
}
 
function getProductEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('dürüm') || n.includes('durum') || n.includes('wrap')) return '🫔';
  if (n.includes('döner') || n.includes('sandwich')) return '🌯';
  if (n.includes('lahmacun')) return '🫓';
  if (n.includes('falafel')) return '🧆';
  if (n.includes('salat')) return '🥗';
  if (n.includes('pommes')) return '🍟';
  if (n.includes('nugget')) return '🍗';
  if (n.includes('cola') || n.includes('wasser') || n.includes('ayran')) return '🥤';
  if (n.includes('teller')) return '🍽️';
  if (n.includes('halloumi')) return '🧀';
  if (n.includes('currywurst')) return '🌭';
  if (n.includes('sauce') || n.includes('soße') || n.includes('extra')) return '🫙';
  return '🌯';
}
 
