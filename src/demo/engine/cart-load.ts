import type { StackResult } from "./stack";

/**
 * Carga del bolso (R2): un solo medidor para lo que el carrito todavía puede ganar. La barra mide el camino al envío
 * gratis y las metas (envío gratis y descuento stack) se leen como placas que encastran, en el orden en que conviene
 * completarlas. Puro: la UI solo lo dibuja.
 */

export type LoadGoalId = "shipping" | "stack";

export interface LoadGoal {
  id: LoadGoalId;
  done: boolean;
  /** "Envío gratis" / "Stack −10 %". */
  label: string;
  /** Lo que falta, en palabras ("faltan $ 35.200", "1 categoría más"); vacío si está hecho. */
  missing: string;
}

export interface CartLoad {
  /** 0 a 100: avance hacia el envío gratis (o 100 si ya está). */
  pct: number;
  goals: LoadGoal[];
  /** La próxima meta, en una frase; null si el bolso ya tiene todo. */
  next: string | null;
}

const money = (n: number) => `$ ${n.toLocaleString("es-AR")}`;

export function cartLoad(subtotal: number, stack: Pick<StackResult, "categories" | "missing">, opts: { freeShippingFrom: number; stackPct: number }): CartLoad {
  const freeFrom = Math.max(0, opts.freeShippingFrom);
  const shippingMissing = Math.max(0, freeFrom - subtotal);
  const pct = freeFrom > 0 ? Math.min(100, Math.floor((subtotal / freeFrom) * 100)) : 100;
  const goals: LoadGoal[] = [{ id: "shipping", done: shippingMissing === 0, label: "Envío gratis", missing: shippingMissing ? `faltan ${money(shippingMissing)}` : "" }];
  // El stack solo se ofrece si hay algún suplemento y la tienda tiene el descuento activo.
  if (opts.stackPct > 0 && stack.categories.length > 0) {
    const n = stack.missing;
    goals.push({ id: "stack", done: n === 0, label: `Stack −${opts.stackPct} %`, missing: n ? `${n} categoría${n === 1 ? "" : "s"} más` : "" });
  }
  const pending = goals.filter((g) => !g.done);
  const next = pending.length === 0 ? null : pending.map((g) => (g.id === "shipping" ? `Te faltan ${money(shippingMissing)} para el envío gratis` : `Sumá ${g.missing} de suplementos y tenés ${opts.stackPct} % off`)).join(" · ");
  return { pct, goals, next };
}
