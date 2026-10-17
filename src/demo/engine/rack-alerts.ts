import type { Product } from "../types";
import { unitPrice } from "./catalog";
import { rackFacts } from "./rack";

/**
 * "Avisame si baja o si vuelve" (R2c, simulado): al pedir el aviso se anota el precio de la presentación que manda en
 * la tarjeta y si el producto estaba sin stock. Después, con los datos de hoy (lo que el dueño cambió en el panel),
 * el aviso "salta" si ese precio bajó o si volvió el stock. En la demo no se manda nada; en producción lo evalúa el
 * servidor al guardar un precio o un ingreso de stock y sale por email o WhatsApp.
 */
export interface RackAlert {
  slug: string;
  variantId: string;
  /** Precio que tenía al pedir el aviso (pesos enteros). */
  price: number;
  /** Estaba sin stock (ninguna presentación se podía comprar) al pedir el aviso. */
  wasOut: boolean;
}

export type RackAlertStatus =
  | { kind: "watching"; out: boolean }
  | { kind: "triggered"; drop: { from: number; to: number; saved: number } | null; back: boolean }
  | { kind: "gone" };

export function createRackAlert(product: Product): RackAlert {
  const f = rackFacts(product);
  return { slug: product.slug, variantId: f.lead.id, price: f.price, wasOut: f.buyable.length === 0 };
}

/** Cómo está el aviso con el catálogo de hoy. Si la presentación ya no existe, compara con la que manda ahora. */
export function rackAlertStatus(alert: RackAlert, product: Product | undefined): RackAlertStatus {
  if (!product || product.active === false) return { kind: "gone" };
  const f = rackFacts(product);
  const variant = product.variants.find((v) => v.id === alert.variantId) ?? f.lead;
  const now = unitPrice(product, variant);
  const drop = now < alert.price ? { from: alert.price, to: now, saved: alert.price - now } : null;
  const out = f.buyable.length === 0;
  const back = alert.wasOut && !out;
  return drop || back ? { kind: "triggered", drop, back } : { kind: "watching", out };
}

/** El texto del aviso, como llegaría por WhatsApp (simulado). */
export function rackAlertText(status: RackAlertStatus, money: (n: number) => string): string {
  if (status.kind === "gone") return "Este producto ya no está en la tienda.";
  if (status.kind === "watching") return status.out ? "Te avisamos cuando vuelva o si baja de precio." : "Te avisamos si baja de precio.";
  const parts = [status.back && "Volvió el stock", status.drop && `Bajó ${money(status.drop.saved)}: de ${money(status.drop.from)} a ${money(status.drop.to)}`];
  return `${parts.filter(Boolean).join(" · ")}.`;
}
