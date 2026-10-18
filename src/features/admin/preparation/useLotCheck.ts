"use client";
import { useState } from "react";
import type { AdminOrder } from "@/demo/admin/types";
import { lotFor } from "@/demo/admin/workshop/lots";
import { getProduct } from "@/demo/engine/catalog";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";

/**
 * Control de lote de un pedido (Fase 7, paso 2 de Para armar): una casilla por producto con el lote que tiene que
 * salir (el que vence primero). Con todas marcadas, el pedido queda listo para despachar y el lote de cada línea queda
 * registrado. Lo usan el panel del control de lote y la tarjeta de Para armar.
 */
export function useLotCheck(order: AdminOrder, onDone?: () => void) {
  const confirmLots = useAdmin((s) => s.confirmLots);
  const push = useToasts((s) => s.push);
  const items = order.lines.map((line) => {
    const product = getProduct(line.productSlug);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    return { line, product, variant, lot: lotFor(product, variant) };
  });
  const [checked, setChecked] = useState<Set<string>>(() => new Set(Object.keys(order.lotCheck ?? {})));
  const [error, setError] = useState(false);
  const done = items.filter((i) => checked.has(i.line.id)).length;
  const toggle = (id: string, on: boolean) => {
    const next = new Set(checked);
    if (on) next.add(id); else next.delete(id);
    setChecked(next);
    setError(false);
  };
  const submit = () => {
    if (done < items.length) { setError(true); return; }
    const failed = confirmLots(order.code, Object.fromEntries(items.map((i) => [i.line.id, i.lot.text])));
    if (failed) push({ tone: "error", title: "No se pudo despachar", description: failed });
    else {
      push({ tone: "success", title: `${order.code} está listo para despachar`, description: "Lotes registrados en el pedido. Cambio guardado solo en esta demo (este navegador)." });
      onDone?.();
    }
  };
  return { items, checked, toggle, done, error, submit };
}

export type LotCheckItem = ReturnType<typeof useLotCheck>["items"][number];
