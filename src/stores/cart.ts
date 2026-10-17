"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartGiftCard, CartLine, LineGift } from "@/demo/engine/cart-types";
import type { Pack } from "@/demo/types";
import { demoStorage, STORAGE_PREFIX } from "./storage";
import { playSound } from "@/lib/sound";

interface CartState {
  lines: CartLine[];
  /** Packs a medida del carrito (el programa del quiz, L4): no están en el catálogo, viajan con sus líneas. */
  customPacks: Pack[];
  couponCode: string | null;
  /** Gift cards con monto que se compran (R3b). No son productos: no se agrupan ni llevan envío. */
  giftCards: CartGiftCard[];
  addGiftCard: (card: Omit<CartGiftCard, "id">) => void;
  removeGiftCard: (id: string) => void;
  add: (line: Omit<CartLine, "id">) => void;
  /** Pone un pack en el carrito (L3). Si ya estaba, lo reemplaza: un pack se lleva una vez. */
  addPack: (packId: string, lines: Omit<CartLine, "id">[], custom?: Pack) => void;
  removePack: (packId: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  /** Marca (o desmarca) un ítem del carrito como regalo, desde el checkout. Con sabor o tamaño abiertos (R3b), `variantId` es la variante que fija el precio. */
  setGift: (id: string, gift: LineGift | null, variantId?: string) => void;
  remove: (id: string) => void;
  setCoupon: (code: string | null) => void;
  clear: () => void;
}

const newId = () => `l-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      customPacks: [],
      couponCode: null,
      giftCards: [],
      addGiftCard: (card) => { set((s) => ({ giftCards: [...(s.giftCards ?? []), { ...card, id: newId() }] })); playSound("add"); },
      removeGiftCard: (id) => set((s) => ({ giftCards: (s.giftCards ?? []).filter((c) => c.id !== id) })),
      add: (line) => {
        set((state) => {
          // Dos regalos son dos ítems (cada uno con su destinatario); lo demás se agrupa por variante.
          const existing = !line.gift && !line.packId && state.lines.find((l) => !l.gift && !l.packId && l.variantId === line.variantId);
          if (existing) {
            return { lines: state.lines.map((l) => (l.id === existing.id ? { ...l, quantity: Math.min(10, l.quantity + line.quantity) } : l)) };
          }
          return { lines: [...state.lines, { ...line, id: newId() }] };
        });
        playSound("add");
      },
      addPack: (packId, lines, custom) => {
        set((state) => ({
          lines: [...state.lines.filter((l) => l.packId !== packId), ...lines.map((l) => ({ ...l, packId, id: newId() }))],
          customPacks: custom ? [...(state.customPacks ?? []).filter((p) => p.id !== packId), custom] : state.customPacks ?? [],
        }));
        playSound("add");
      },
      removePack: (packId) => set((s) => ({ lines: s.lines.filter((l) => l.packId !== packId), customPacks: (s.customPacks ?? []).filter((p) => p.id !== packId) })),
      setQuantity: (id, quantity) => set((s) => ({ lines: s.lines.map((l) => (l.id === id ? { ...l, quantity } : l)) })),
      setGift: (id, gift, variantId) => set((s) => ({ lines: s.lines.map((l) => (l.id !== id ? l : gift ? { ...l, gift, ...(variantId ? { variantId } : {}) } : { ...l, gift: undefined })) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      setCoupon: (couponCode) => { set({ couponCode }); if (couponCode) playSound("coupon"); },
      clear: () => set({ lines: [], customPacks: [], couponCode: null, giftCards: [] }),
    }),
    { name: `${STORAGE_PREFIX}cart`, storage: demoStorage, skipHydration: true },
  ),
);
