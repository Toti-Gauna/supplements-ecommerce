"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, LineGift } from "@/demo/engine/cart-types";
import { demoStorage, STORAGE_PREFIX } from "./storage";
import { playSound } from "@/lib/sound";

interface CartState {
  lines: CartLine[];
  couponCode: string | null;
  add: (line: Omit<CartLine, "id">) => void;
  setQuantity: (id: string, quantity: number) => void;
  /** Marca (o desmarca) un ítem del carrito como regalo, desde el checkout. */
  setGift: (id: string, gift: LineGift | null) => void;
  remove: (id: string) => void;
  setCoupon: (code: string | null) => void;
  clear: () => void;
}

const newId = () => `l-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      couponCode: null,
      add: (line) => {
        set((state) => {
          // Dos personalizaciones distintas (o dos regalos) son dos ítems; sin personalización se agrupa por variante.
          const existing = !line.personalization && !line.gift && state.lines.find((l) => !l.personalization && !l.gift && l.variantId === line.variantId);
          if (existing) {
            return { lines: state.lines.map((l) => (l.id === existing.id ? { ...l, quantity: Math.min(10, l.quantity + line.quantity) } : l)) };
          }
          return { lines: [...state.lines, { ...line, id: newId() }] };
        });
        playSound("add");
      },
      setQuantity: (id, quantity) => set((s) => ({ lines: s.lines.map((l) => (l.id === id ? { ...l, quantity } : l)) })),
      setGift: (id, gift) => set((s) => ({ lines: s.lines.map((l) => (l.id !== id ? l : gift ? { ...l, gift } : { ...l, gift: undefined })) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      setCoupon: (couponCode) => { set({ couponCode }); if (couponCode) playSound("coupon"); },
      clear: () => set({ lines: [], couponCode: null }),
    }),
    { name: `${STORAGE_PREFIX}cart`, storage: demoStorage, skipHydration: true },
  ),
);
