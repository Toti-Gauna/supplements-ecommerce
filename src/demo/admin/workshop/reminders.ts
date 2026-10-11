import { addDays, daysBetween } from "../../engine/workdays";
import { isPaidOrLater } from "../../engine/orders";
import type { CustomerProfile, WorkshopSettings } from "../../fixtures/workshop";
import type { Product } from "../../types";
import { toDayKey } from "@/lib/date";
import type { CustomerRow } from "../customers";

/** Recordatorios para escribirle al cliente: cumpleaños de la mascota o del cliente y recompra de lo que se termina. */
export type ReminderKind = "pet-birthday" | "birthday" | "repurchase";

export interface Reminder {
  id: string;
  email: string;
  name: string;
  kind: ReminderKind;
  /** AAAA-MM-DD */
  date: string;
  /** Días desde hoy (negativo = ya pasó). */
  inDays: number;
  title: string;
  /** Mensaje sugerido para copiar en WhatsApp o email. */
  message: string;
  /** Mascota del recordatorio (para el email de cumpleaños). */
  petId?: string;
}

export const REMINDER_HORIZON = 30;

/** Próxima vez que cae un MM-DD desde hoy (incluido). */
export function nextOccurrence(mmdd: string, today: string): string {
  const thisYear = `${today.slice(0, 4)}-${mmdd}`;
  return thisYear >= today ? thisYear : `${Number(today.slice(0, 4)) + 1}-${mmdd}`;
}

const firstName = (name: string) => name.split(" ")[0] ?? name;

export function remindersFor(customer: CustomerRow, profile: CustomerProfile | undefined, products: Product[], settings: WorkshopSettings, today: string, horizon = REMINDER_HORIZON): Reminder[] {
  const out: Reminder[] = [];
  const key = customer.email.toLowerCase();
  const push = (kind: ReminderKind, id: string, date: string, title: string, message: string) => {
    const inDays = daysBetween(today, date);
    if (inDays <= horizon) out.push({ id: `${key}:${kind}:${id}`, email: customer.email, name: customer.name, kind, date, inDays, title, message, ...(kind === "pet-birthday" ? { petId: id } : {}) });
  };
  for (const pet of profile?.pets ?? []) {
    if (!pet.birthday) continue;
    push("pet-birthday", pet.id, nextOccurrence(pet.birthday, today), `Cumple de ${pet.name}`,
      `¡Hola ${firstName(customer.name)}! Se viene el cumple de ${pet.name} 🎂 Si querés regalarle algo con su nombre, avisanos y lo tenemos listo para la fecha.`);
  }
  if (profile?.birthday) {
    push("birthday", "self", nextOccurrence(profile.birthday, today), `Cumpleaños de ${firstName(customer.name)}`,
      `¡Feliz cumple, ${firstName(customer.name)}! Desde el taller de Volta te mandamos un abrazo.`);
  }
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const seen = new Set<string>();
  for (const order of customer.orders) {
    if (!isPaidOrLater(order.status)) continue;
    for (const line of order.lines) {
      const product = bySlug.get(line.productSlug);
      const days = product ? settings.repurchaseDays[product.categorySlug] : undefined;
      if (!product || !days || seen.has(product.slug)) continue;
      seen.add(product.slug);
      const due = addDays(toDayKey(order.createdAt), days);
      // Solo la compra más reciente de cada producto (los pedidos vienen del más nuevo al más viejo).
      if (daysBetween(today, due) < -14) continue;
      push("repurchase", product.slug, due, `Recompra: ${product.name}`,
        `¡Hola ${firstName(customer.name)}! ¿Cómo te fue con ${product.name.toLowerCase()}? Si se te está terminando, te lo preparamos de nuevo.`);
    }
  }
  return out;
}

export function customerReminders(customers: CustomerRow[], profiles: Record<string, CustomerProfile>, products: Product[], settings: WorkshopSettings, today: string, horizon = REMINDER_HORIZON): Reminder[] {
  return customers
    .filter((c) => !c.blocked)
    .flatMap((c) => remindersFor(c, profiles[c.email.toLowerCase()], products, settings, today, horizon))
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

export const REMINDER_LABEL: Record<ReminderKind, string> = { "pet-birthday": "Cumple de mascota", birthday: "Cumpleaños", repurchase: "Recompra" };
