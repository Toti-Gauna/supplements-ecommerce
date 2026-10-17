"use client";
import { useCallback, useState } from "react";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { decodeGoals, decodeSport, decodeStack, defaultStack, encodeStack, firstInStock, stackSummary, type StackPick } from "@/demo/engine/stack-builder";
import { equalizeDuration } from "@/demo/engine/stack-duration";
import { chooseSport, EMPTY_SELECTION, selectionFromUrl, sportGear, toggleGoal, type GoalSelection } from "@/demo/engine/stack-goals";
import { STACK_SLOTS, type StackSlotId } from "@/demo/fixtures/stack-builder";
import type { Goal, SportId } from "@/demo/types";
import { withBase } from "@/lib/base-path";
import { useDemoData } from "@/stores/admin";

const slotOrder = (slot: StackSlotId) => STACK_SLOTS.findIndex((s) => s.id === slot);

/** Reemplaza (o suma) lo elegido en un lugar, siempre en el orden del estante. */
function withPick(picks: StackPick[], pick: StackPick): StackPick[] {
  return [...picks.filter((p) => p.slot !== pick.slot), pick].sort((a, b) => slotOrder(a.slot) - slotOrder(b.slot));
}

/** La URL acompaña al estante (replaceState): recargar o volver deja lo mismo, sin sumar pasos al historial. */
function syncUrl(sel: GoalSelection, picks: StackPick[]) {
  const query = encodeStack(sel.goals, picks, sel.sport);
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

/**
 * Estado del armador "Armá tu stack": hasta tres objetivos, un deporte opcional (suma sus objetivos y su equipamiento),
 * lo elegido en cada lugar del estante y el resumen calculado por el motor con la MISMA regla de descuento que el
 * carrito (`settings.stack`).
 */
export function useStackBuilder() {
  const catalog = useDemoData((d) => d.products);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  const [sel, setSel] = useState<GoalSelection>(EMPTY_SELECTION);
  const [picks, setPicks] = useState<StackPick[]>([]);
  /** Intentó sumar un cuarto objetivo: se avisa hasta que cambie algo. */
  const [capped, setCapped] = useState(false);
  /** Ya leyó la URL con los datos recuperados: recién ahí el armador responde (y los e2e lo esperan). */
  const [ready, setReady] = useState(false);

  const commit = (next: GoalSelection, nextPicks: StackPick[]) => {
    setSel(next);
    setPicks(nextPicks);
    syncUrl(next, nextPicks);
  };
  /** Cambiaron los objetivos: el estante vuelve al sugerido para la combinación. */
  const regoal = (next: GoalSelection) => commit(next, next.goals.length ? defaultStack(next.goals, catalog) : []);

  /** Viene del quiz, del inicio o de un link compartido: `?objetivo=a,b&deporte=` arma el sugerido; `?stack=` manda. */
  const load = useCallback((params: URLSearchParams) => {
    const next = selectionFromUrl(decodeGoals(params.get("objetivo")), decodeSport(params.get("deporte")));
    const fromLink = decodeStack(params.get("stack"), catalog);
    setSel(next);
    setPicks(fromLink.length > 0 || !next.goals.length ? fromLink : defaultStack(next.goals, catalog));
    setReady(true);
  }, [catalog]);

  const toggle = (goal: Goal) => {
    const { selection, capped: full } = toggleGoal(sel, goal);
    setCapped(full);
    if (!full) regoal(selection);
  };

  const pickSport = (sport: SportId | null) => {
    setCapped(false);
    if (sport !== sel.sport) regoal(chooseSport(sel, sport));
  };

  const pickProduct = (slot: StackSlotId, slug: string) => {
    const product = catalog.find((p) => p.slug === slug);
    const variant = product && firstInStock(product);
    if (variant) commit(sel, withPick(picks, { slot, slug, variantId: variant.id }));
  };

  const pickVariant = (slot: StackSlotId, variantId: string) => {
    const current = picks.find((p) => p.slot === slot);
    const stock = catalog.find((p) => p.slug === current?.slug)?.variants.find((v) => v.id === variantId)?.stock ?? 0;
    // La cantidad sigue, salvo que la presentación nueva no tenga tantas.
    if (current) commit(sel, withPick(picks, { ...current, variantId, ...(current.qty && stock >= 0 ? { qty: Math.min(current.qty, stock) } : {}) }));
  };

  const setQty = (slot: StackSlotId, qty: number) => {
    const current = picks.find((p) => p.slot === slot);
    if (current) commit(sel, withPick(picks, qty > 1 ? { ...current, qty } : { slot, slug: current.slug, variantId: current.variantId }));
  };

  /** "Igualar duración": tamaños y cantidades para que todo se termine junto. Devuelve qué cambió (para avisarlo). */
  const equalize = () => {
    const result = equalizeDuration(picks, catalog);
    if (result.changed.length) commit(sel, result.picks);
    return result;
  };

  return {
    ready,
    goals: sel.goals,
    sport: sel.sport,
    /** Objetivos que sumó el deporte (los demás los eligió la persona). */
    added: sel.added,
    capped,
    catalog,
    gear: sportGear(sel.sport, catalog),
    summary: stackSummary(picks, catalog, rule),
    load,
    toggleGoal: toggle,
    pickSport,
    pickProduct,
    pickVariant,
    setQty,
    equalize,
    /** Lo que haría "Igualar duración" con el estante de ahora (sin aplicarlo). */
    equalized: equalizeDuration(picks, catalog),
    clearSlot: (slot: StackSlotId) => commit(sel, picks.filter((p) => p.slot !== slot)),
    /** Link absoluto (con el dominio y el basePath de Pages) para compartir este estante. */
    shareUrl: () => `${window.location.origin}${withBase("/crear/")}?${encodeStack(sel.goals, picks, sel.sport)}`,
  };
}
