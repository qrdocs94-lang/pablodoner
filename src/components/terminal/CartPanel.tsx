"use client";
// src/components/terminal/CartPanel.tsx

import { useCartStore } from "@/lib/cartStore";
import { formatPrice } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
}

export default function CartPanel({ open, onClose, onCheckout, isCheckingOut }: Props) {
  const { items, orderType, removeItem, updateQuantity, subtotalCents, deliveryFeeCents, totalCents, deliveryAddress, setDeliveryAddress } = useCartStore();

  const addressComplete =
    orderType !== "delivery" ||
    (deliveryAddress.street.trim() !== "" &&
     deliveryAddress.city.trim() !== "" &&
     deliveryAddress.zip.trim() !== "");

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#FFF8F0] z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="bg-[#C0392B] px-6 py-5 flex items-center justify-between flex-shrink-0">
          <h2 className="font-black text-[#F39C12] text-2xl tracking-wider">🛒 Warenkorb</h2>
          <button
            onClick={onClose}
            className="text-white text-2xl font-bold w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Order type info */}
        <div className="bg-[#A01F1F] px-6 py-2.5 text-[#F39C12] text-sm font-bold flex-shrink-0">
          {orderType === "pickup" ? "🏃 Abholung — ca. 15 Min." : "🛵 Lieferung — ca. 30–40 Min."}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-20 text-[#7D6248]">
              <div className="text-5xl mb-4">🛒</div>
              <p className="font-bold">Dein Warenkorb ist leer</p>
              <p className="text-sm mt-1 opacity-70">Wähle etwas aus der Karte</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.cartKey} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                  <div className="text-3xl w-10 text-center flex-shrink-0">🌯</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-[#1A0800] text-sm">{item.product.name}</div>
                    {Object.entries(item.options).filter(([, v]) => v && (Array.isArray(v) ? v.length > 0 : true)).length > 0 && (
                      <div className="text-xs text-[#7D6248] mt-0.5 truncate">
                        {Object.entries(item.options)
                          .filter(([, v]) => v && (Array.isArray(v) ? v.length > 0 : true))
                          .map(([k, v]) => `${Array.isArray(v) ? v.join(", ") : v}`)
                          .join(" · ")}
                      </div>
                    )}
                    <div className="text-[#C0392B] font-bold text-sm mt-1">
                      {formatPrice(item.product.price_cents * item.quantity)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-[#EDE0D0] flex items-center justify-center font-black text-[#1A0800] hover:bg-[#C0392B] hover:text-white transition-colors"
                    >
                      −
                    </button>
                    <span className="font-black text-[#1A0800] w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-[#C0392B] flex items-center justify-center font-black text-white hover:bg-[#A01F1F] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delivery address form */}
          {orderType === "delivery" && items.length > 0 && (
            <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
              <div className="font-black text-[#1A0800] text-sm mb-3">🛵 Lieferadresse</div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Straße & Hausnummer"
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                  className="w-full border-2 border-[#EDE0D0] rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#C0392B]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="PLZ"
                    value={deliveryAddress.zip}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zip: e.target.value })}
                    className="w-24 border-2 border-[#EDE0D0] rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#C0392B]"
                  />
                  <input
                    type="text"
                    placeholder="Stadt"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    className="flex-1 border-2 border-[#EDE0D0] rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#C0392B]"
                  />
                </div>
              </div>
              {!addressComplete && (
                <p className="text-xs text-[#C0392B] font-bold mt-2">⚠️ Bitte Adresse vollständig ausfüllen</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="bg-white border-t-2 border-[#EDE0D0] px-6 py-5 flex-shrink-0">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-[#7D6248]">
                <span>Zwischensumme</span>
                <span>{formatPrice(subtotalCents())}</span>
              </div>
              {orderType === "delivery" && (
                <div className="flex justify-between text-sm text-[#7D6248]">
                  <span>Liefergebühr</span>
                  <span>{formatPrice(deliveryFeeCents())}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-[#1A0800] text-xl border-t border-[#EDE0D0] pt-2 mt-2">
                <span>Gesamt</span>
                <span className="text-[#C0392B]">{formatPrice(totalCents())}</span>
              </div>
            </div>

            <div className="flex gap-3 mb-3">
              <button className="flex-1 py-3 border-2 border-[#EDE0D0] rounded-xl font-bold text-sm text-[#4A3728] hover:border-[#C0392B] transition-colors">
                💵 Bar
              </button>
              <button className="flex-1 py-3 border-2 border-[#EDE0D0] rounded-xl font-bold text-sm text-[#4A3728] hover:border-[#C0392B] transition-colors">
                💳 Karte
              </button>
              <button className="flex-1 py-3 border-2 border-[#EDE0D0] rounded-xl font-bold text-sm text-[#4A3728] hover:border-[#C0392B] transition-colors">
                📱 Online
              </button>
            </div>

            <button
              onClick={onCheckout}
              disabled={isCheckingOut || !addressComplete}
              className="w-full bg-[#C0392B] hover:bg-[#A01F1F] disabled:bg-gray-400 text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg"
            >
              {isCheckingOut ? "⏳ Weiterleitung zu Stripe..." : "JETZT BESTELLEN →"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
