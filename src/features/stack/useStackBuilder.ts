"use client";
import { useCallback, useState } from "react";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { decodeStack, defaultStack, encodeStack, firstInStock, stackSummary, type StackPick } from "@/demo/engine/stack-builder";
import { goals } from "@/demo/fixtures/goals";
import { STACK_SLOTS, type StackSlotId } from "@/demo/fixtures/stack-builder";
import type { Goal } from "@/demo/types";
import { withBase } from "@/lib/base-path";
import { useDemoData } from "@/stores/admin";

export const parseGoal = (raw: string | null): Goal | null => goals.find((g) => g.id === raw)?.id ?? null;

const slotOrder = (slot: StackSlotId) => STACK_SLOTS.findIndex((s) => s.id === slot);

/** Reemplaza (o suma) lo elegido en un lugar, siempre en el orden del estante. */
function withPick(picks: StackPick[], pick: StackPick): StackPick[] {
  return [...picks.filter((p) => p.slot !== pick.slot), pick].sort((a, b) => slotOrder(a.slot) - slotOrder(b.slot));
}

/** La URL acompaña al estante (replaceState): recargar o volver deja lo mismo, sin sumar pasos al historial. */
function syncUrl(goal: Goal | null, picks: StackPick[]) {
  const query = encodeStack(goal, picks);
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

/**
 * Estado del armador "Armá tu stack": objetivo, lo elegido en cada lugar del estante y el resumen calculado por el
 * motor con la MISMA regla de descuento que el carrito (`settings.stack`).
 */
export function useStackBuilder() {
  const catalog = useDemoData((d) => d.products);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [picks, setPicks] = useState<StackPick[]>([]);
  /** Ya leyó la URL con los datos recuperados: recién ahí el armador responde (y los e2e lo esperan). */
  const [ready, setReady] = useState(false);

  const commit = (nextGoal: Goal | null, next: StackPick[]) => {
    setGoal(nextGoal);
    setPicks(next);
    syncUrl(nextGoal, next);
  };

  /** Viene del quiz o de un link compartido: `?objetivo=` arma el sugerido; `?stack=` manda sobre eso. */
  const load = useCallback((params: URLSearchParams) => {
    const fromGoal = parseGoal(params.get("objetivo"));
    const fromLink = decodeStack(params.get("stack"), catalog);
    setGoal(fromGoal);
    setPicks(fromLink.length > 0 || !fromGoal ? fromLink : defaultStack(fromGoal, catalog));
    setReady(true);
  }, [catalog]);

  const pickProduct = (slot: StackSlotId, slug: string) => {
    const product = catalog.find((p) => p.slug === slug);
    const variant = product && firstInStock(product);
    if (variant) commit(goal, withPick(picks, { slot, slug, variantId: variant.id }));
  };

  const pickVariant = (slot: StackSlotId, variantId: string) => {
    const current = picks.find((p) => p.slot === slot);
    if (current) commit(goal, withPick(picks, { ...current, variantId }));
  };

  return {
    ready,
    goal,
    catalog,
    summary: stackSummary(picks, catalog, rule),
    load,
    chooseGoal: (g: Goal) => commit(g, defaultStack(g, catalog)),
    pickProduct,
    pickVariant,
    clearSlot: (slot: StackSlotId) => commit(goal, picks.filter((p) => p.slot !== slot)),
    /** Link absoluto (con el dominio y el basePath de Pages) para compartir este estante. */
    shareUrl: () => `${window.location.origin}${withBase("/crear/")}?${encodeStack(goal, picks)}`,
  };
}
