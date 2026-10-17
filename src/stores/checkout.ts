"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/demo/engine/cart-types";
import type { Quote } from "@/demo/engine/pricing";
import type { FulfillmentType, PaymentMethod } from "@/demo/types";
import { demoStorage, STORAGE_PREFIX } from "./storage";
import { playSound } from "@/lib/sound";

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface Address {
  street: string;
  number: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface DemoOrder {
  code: string;
  token: string;
  createdAt: string;
  contact: Contact;
  fulfillment: FulfillmentType;
  paymentMethod: PaymentMethod;
  lines: CartLine[];
  quote: Omit<Quote, "lines">;
  asAccount: boolean;
  /** Día de despacho que se le prometió al confirmar (calendario de despachos); el panel puede reprogramarlo. */
  promisedDate?: string;
  /** Códigos de los regalos de este pedido (ver stores/gifts). */
  gifts?: string[];
  /** Gift cards compradas en este pedido (R3b): monto de cada una. */
  giftCardAmounts?: number[];
  /** Saldo de gift card usado en este pedido (renglón de descuento). */
  giftCardPayment?: { code: string; amount: number };
}

interface CheckoutState {
  contact: Contact;
  address: Address;
  fulfillment: FulfillmentType | null;
  paymentMethod: PaymentMethod | null;
  acceptedTerms: boolean;
  /** Gift card aplicada en el paso Pago (R3b); el saldo se valida en engine/gift-cards.ts. */
  giftCardCode: string | null;
  lastOrder: DemoOrder | null;
  patch: (data: Partial<Omit<CheckoutState, "patch" | "reset" | "placeOrder">>) => void;
  placeOrder: (order: DemoOrder) => void;
  reset: () => void;
}

const empty = {
  contact: { name: "", email: "", phone: "" },
  address: { street: "", number: "", city: "Mar del Plata", province: "Buenos Aires", postalCode: "" },
  fulfillment: null,
  paymentMethod: null,
  acceptedTerms: false,
  giftCardCode: null as string | null,
};

export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({
      ...empty,
      lastOrder: null,
      patch: (data) => set(data),
      placeOrder: (order) => { set({ ...empty, lastOrder: order }); playSound("purchase"); },
      reset: () => set({ ...empty, lastOrder: null }),
    }),
    { name: `${STORAGE_PREFIX}checkout`, storage: demoStorage, skipHydration: true },
  ),
);
