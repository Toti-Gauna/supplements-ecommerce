"use client";
import { useMemo } from "react";
import { searchPots, type CounterLine } from "@/demo/engine/counter";
import { counterPlans } from "@/demo/engine/counter-pay";
import { addLine, buildTicket, setLineQty } from "@/demo/engine/counter-ticket";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { useAdmin } from "@/stores/admin";
import { useSessionDraft } from "../useSessionDraft";

/** Lo que el mostrador lee del panel: catálogo, regla del stack, cuotas y el aviso de stock bajo. */
export function useCounterCatalog() {
  const products = useAdmin((s) => s.data.products);
  const categories = useAdmin((s) => s.data.categories);
  const settings = useAdmin((s) => s.data.settings);
  return useMemo(() => ({
    products, categories, rule: settings.stack ?? DEFAULT_STACK_RULE, plans: counterPlans(settings.counterPlans), low: settings.lowStockThreshold ?? 3,
  }), [products, categories, settings]);
}

const NO_LINES: CounterLine[] = [];
const isLines = (x: unknown): x is CounterLine[] =>
  Array.isArray(x) && x.every((l: Partial<CounterLine>) => typeof l?.productSlug === "string" && typeof l.variantId === "string" && Number.isInteger(l.qty) && l.qty! > 0);

/**
 * Ticket en armado (o los productos de un pedido por chat) con lo que se busca: sobrevive a cambiar de pestaña dentro
 * del panel (borrador de la pestaña del navegador) y se vacía al registrar la venta.
 */
export function useCounterTicket(draftKey: string, query: string) {
  const catalog = useCounterCatalog();
  const draft = useSessionDraft<CounterLine[]>(draftKey, NO_LINES, isLines);
  const lines = draft.draft;
  const ticket = useMemo(() => buildTicket(lines, catalog.products, catalog.rule), [lines, catalog]);
  const pots = useMemo(() => searchPots(query, catalog.products, catalog.categories, { today: DEMO_TODAY, lines, low: catalog.low }), [query, lines, catalog]);
  return {
    catalog, lines, ticket, pots,
    add: (productSlug: string, variantId: string) => draft.setDraft((prev) => addLine(prev, productSlug, variantId)),
    setQty: (key: string, qty: number) => draft.setDraft((prev) => setLineQty(prev, key, qty)),
    clear: () => draft.reset(NO_LINES),
  };
}
