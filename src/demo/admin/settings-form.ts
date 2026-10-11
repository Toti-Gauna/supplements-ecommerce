import type { PaymentMethod, ShippingZone } from "../types";

/**
 * Ajustes por sección (8.3.29): validación de cada subpágina con las mismas reglas que tenía la página única, más
 * avisos claros donde antes se descartaba en silencio (códigos postales mal escritos).
 */

/** WhatsApp: vacío (el botón abre WhatsApp para elegir contacto) o de 10 a 15 dígitos con país y área. */
export function checkWhatsapp(text: string): string | null {
  const digits = text.replace(/\D/g, "");
  return digits && (digits.length < 10 || digits.length > 15) ? "Escribí el número con código de país y área, por ejemplo 54 9 223 555 0000." : null;
}

export interface PaymentsDraft { methods: PaymentMethod[]; pct: number; hours: number }

export function checkPayments(d: PaymentsDraft): string | null {
  if (d.methods.length === 0) return "Dejá al menos un medio de pago activo.";
  if (d.pct > 50) return "El descuento por transferencia/QR no puede superar 50%.";
  if (d.hours < 1 || d.hours > 168) return "La reserva va de 1 a 168 horas.";
  return null;
}

/** Zona en edición: los códigos postales como el texto que escribe el dueño. */
export type ZoneDraft = ShippingZone & { cps: string };
export interface ShippingDraft { free: number; zones: ZoneDraft[] }

export const zoneDraft = (z: ShippingZone): ZoneDraft => ({ ...z, cps: (z.postalCodes ?? []).join(", ") });

export function zoneFromDraft({ cps, ...z }: ZoneDraft): ShippingZone {
  return { ...z, etaText: z.etaText.trim(), postalCodes: z.type === "LOCAL_DELIVERY" ? cps.split(/[\s,]+/).filter(Boolean) : z.postalCodes };
}

/** Errores por zona (por ID) y del umbral de envío gratis. */
export function checkShipping(d: ShippingDraft): { free?: string; zones: Record<string, string[]> } {
  const zones: Record<string, string[]> = {};
  for (const z of d.zones) {
    const list: string[] = [];
    if (!z.etaText.trim()) list.push("Escribí el plazo que ve el comprador.");
    if (z.type === "LOCAL_DELIVERY") {
      const bad = z.cps.split(/[\s,]+/).filter((c) => c && !/^\d{4}$/.test(c));
      if (bad.length) list.push(`Estos códigos postales no tienen 4 dígitos: ${bad.join(", ")}.`);
    }
    if (list.length) zones[z.id] = list;
  }
  return { free: d.free < 0 ? "El monto no puede ser negativo." : undefined, zones };
}
