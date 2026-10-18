import { brand } from "@/config/brand";
import { demoNow } from "../clock";
import { recordFromGift } from "../engine/gift-status";
import { DEMO_TODAY } from "../fixtures/admin-orders";
import type { CustomerProfile, NoticeChannel } from "../fixtures/customers";
import type { Goal } from "../types";
import { auditEntry, type AdminData } from "./defaults";
import type { EmailContext } from "./emails/render";
import { composeEmails, pushOutbox, repurchaseKey } from "./emails/triggers";
import { noticeFor, withNotice, type RepurchaseItem } from "./repurchase";
import { birthdayGift, birthdayState, giftParam } from "./birthday";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;
type Get = () => AdminData;

export type NoticeResult = "sent" | "already" | "off";

export interface CustomerActions {
  addCustomerNote: (email: string, text: string) => void;
  setCustomerBirthday: (email: string, birthday: string | undefined) => void;
  /** Sin objetivo, el panel lo deduce de lo que compra. */
  setCustomerGoal: (email: string, goal: Goal | undefined) => void;
  /**
   * Aviso de recompra (ficha o inicio): el email "Tu pote se está por terminar" a la bandeja de salida, o el WhatsApp
   * prellenado. Uno por pote: si ya se avisó por cualquiera de los dos, devuelve "already" y no repite nada.
   */
  notifyRepurchase: (item: RepurchaseItem, channel: NoticeChannel) => NoticeResult;
  /**
   * Regalo de cumpleaños (R4c): emite una gift card de la casa y su regalo (quedan en Promos → Regalos) y anota en la ficha
   * que ya se armó este año. Devuelve el código y el parámetro del link, o null si no cumple pronto o ya se armó.
   */
  sendBirthdayGift: (email: string, name: string) => { code: string; param: string } | null;
}

const EMPTY_PROFILE: CustomerProfile = { notes: [] };

/** Datos del email de recompra: el cliente, el producto (con su variante) y el día en que se le termina. */
export function repurchaseContext(item: RepurchaseItem): EmailContext {
  return { customerName: item.name, email: item.email, refill: { slug: item.slug, variantId: item.variantId, date: item.runsOutOn } };
}

export function createCustomerActions(set: Set, get: Get): CustomerActions {
  const profiles = (s: AdminData, email: string, fn: (p: CustomerProfile) => CustomerProfile) => {
    const key = email.trim().toLowerCase();
    return { ...s.workshop, profiles: { ...s.workshop.profiles, [key]: fn(s.workshop.profiles[key] ?? EMPTY_PROFILE) } };
  };
  const edit = (action: string, email: string, fn: (p: CustomerProfile) => CustomerProfile) =>
    set((s) => ({ workshop: profiles(s, email, fn), audit: [auditEntry(action, email), ...s.audit].slice(0, 80) }));

  return {
    addCustomerNote: (email, text) => edit("Nota del cliente", email, (p) => ({ ...p, notes: [{ at: demoNow(), text: text.trim() }, ...p.notes] })),
    setCustomerBirthday: (email, birthday) => edit("Cumpleaños del cliente", email, (p) => ({ ...p, birthday })),
    setCustomerGoal: (email, goal) => edit("Objetivo del cliente", email, (p) => ({ ...p, goal })),
    sendBirthdayGift: (email, name) => {
      const key = email.trim().toLowerCase();
      const state = birthdayState(get().workshop.profiles[key], DEMO_TODAY);
      if (!state || state.done) return null;
      const made = birthdayGift({ name, email, store: brand.name, today: DEMO_TODAY, now: demoNow(), random: Math.random });
      if (!made) return null;
      const param = giftParam(made.gift);
      set((st) => ({
        data: { ...st.data, giftRecords: [recordFromGift(made.gift), ...(st.data.giftRecords ?? [])], giftCards: [made.card, ...(st.data.giftCards ?? [])] },
        workshop: profiles(st, email, (p) => ({ ...p, birthdayGift: { year: Number(state.date.slice(0, 4)), code: made.gift.code, at: demoNow(), param } })),
        audit: [auditEntry(`Regalo de cumpleaños armado para ${name}`, made.gift.code), ...st.audit].slice(0, 80),
      }));
      return { code: made.gift.code, param };
    },
    notifyRepurchase: (item, channel) => {
      const s = get();
      if (noticeFor(s.workshop.profiles[item.email.toLowerCase()], item)) return "already";
      const at = demoNow();
      const key = repurchaseKey(item.email, item.slug, item.runsOutOn);
      const mails = channel === "email" ? composeEmails(s.emails.templates, ["repurchase"], repurchaseContext(item), at, { key }) : [];
      if (channel === "email" && !mails.length) return "off";
      const action = `Aviso de recompra por ${channel === "email" ? "email" : "WhatsApp"}: ${item.product}`;
      set((st) => ({
        workshop: profiles(st, item.email, (p) => withNotice(p, item.key, channel, at)),
        emails: { ...st.emails, outbox: pushOutbox(st.emails.outbox, mails) },
        audit: [auditEntry(action, item.email), ...st.audit].slice(0, 80),
      }));
      return "sent";
    },
  };
}
