// src/lib/cartStore.ts
// Global cart state using Zustand
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, OrderType, formatPrice, cartKey } from "@/types";

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  deliveryAddress: { street: string; city: string; zip: string };

  // Actions
  addItem: (product: Product, options: Record<string, string | string[]>) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setDeliveryAddress: (addr: { street: string; city: string; zip: string }) => void;

  // Computed
  totalItems: () => number;
  subtotalCents: () => number;
  deliveryFeeCents: () => number;
  totalCents: () => number;
  totalFormatted: () => string;
  toCheckoutPayload: () => {
    items: { product_id: string; quantity: number; options: Record<string, string | string[]> }[];
    order_type: OrderType;
    customer_name?: string;
    customer_phone?: string;
    delivery_address?: { street: string; city: string; zip: string };
  };
}

const DELIVERY_FEE = 199;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: "pickup",
      customerName: "",
      customerPhone: "",
      deliveryAddress: { street: "", city: "", zip: "" },

      addItem: (product, options) => {
        const key = cartKey(product.id, options);
        set((state) => {
          const existing = state.items.find((i) => i.cartKey === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartKey === key ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            items: [...state.items, { product, quantity: 1, options, cartKey: key }],
          };
        });
      },

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.cartKey !== key) })),

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.cartKey === key ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [], customerName: "", customerPhone: "", deliveryAddress: { street: "", city: "", zip: "" } }),

      setOrderType: (type) => set({ orderType: type }),
      setCustomerInfo: (name, phone) => set({ customerName: name, customerPhone: phone }),
      setDeliveryAddress: (addr) => set({ deliveryAddress: addr }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotalCents: () => get().items.reduce((sum, i) => sum + i.product.price_cents * i.quantity, 0),
      deliveryFeeCents: () => (get().orderType === "delivery" ? DELIVERY_FEE : 0),
      totalCents: () => get().subtotalCents() + get().deliveryFeeCents(),
      totalFormatted: () => formatPrice(get().totalCents()),

      toCheckoutPayload: () => {
        const state = get();
        return {
          items: state.items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            options: i.options,
          })),
          order_type: state.orderType,
          customer_name: state.customerName || undefined,
          customer_phone: state.customerPhone || undefined,
          delivery_address:
            state.orderType === "delivery" && state.deliveryAddress.street
              ? state.deliveryAddress
              : undefined,
        };
      },
    }),
    { name: "pablo-cart" }
  )
);
