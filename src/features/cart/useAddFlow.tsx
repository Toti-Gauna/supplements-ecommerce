"use client";
import { useState, type ReactNode } from "react";
import { rackFacts } from "@/demo/engine/rack";
import type { Product } from "@/demo/types";
import { QuickAddSheet } from "./QuickAddSheet";
import { useQuickAdd } from "./useQuickAdd";

/**
 * Agregar desde fuera de la ficha (tarjeta y hero): con una sola opción que se puede comprar, suma y abre el carrito;
 * con varios sabores o tamaños, abre la hoja chica para elegir. `sheet` se monta solo mientras está abierta.
 */
export function useAddFlow(product: Product | undefined): { add: () => void; sheet: ReactNode; choose: boolean } {
  const quickAdd = useQuickAdd();
  const [open, setOpen] = useState(false);
  const facts = product ? rackFacts(product) : null;
  const choose = (facts?.buyable.length ?? 0) > 1;
  const add = () => {
    if (!product || !facts) return;
    if (choose) setOpen(true);
    else quickAdd(product, facts.buyable[0]);
  };
  const sheet = open && product && facts ? <QuickAddSheet product={product} initialVariantId={facts.lead.id} onClose={() => setOpen(false)} /> : null;
  return { add, sheet, choose };
}
