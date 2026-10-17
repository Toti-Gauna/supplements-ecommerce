"use client";
import { useMemo } from "react";
import { myRackSummary, rackStackHref, rackToStack } from "@/demo/engine/my-rack";
import { createRackAlert, rackAlertStatus, type RackAlertStatus } from "@/demo/engine/rack-alerts";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import type { Product } from "@/demo/types";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useFavorites } from "@/stores/favorites";
import { useRackAlerts } from "@/stores/rackAlerts";
import { useToasts } from "@/stores/toast";
import { useUi } from "@/stores/ui";

/**
 * Mi rack: los favoritos con los datos de hoy (lo que el dueño cambió en el panel), el total y el pasaje al armador,
 * más los avisos simulados. Todo el cálculo sale del motor (`my-rack`, `rack-alerts`).
 */
export function useMyRack() {
  const catalog = useDemoData((d) => d.products);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  const slugs = useFavorites((s) => s.slugs);
  const toggleFavorite = useFavorites((s) => s.toggle);
  const alerts = useRackAlerts((s) => s.items);
  const { watch, remove } = useRackAlerts.getState();
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const toast = useToasts((s) => s.push);

  const summary = useMemo(() => myRackSummary(slugs, catalog, rule), [slugs, catalog, rule]);
  const stack = useMemo(() => rackToStack(slugs, catalog), [slugs, catalog]);
  const statusOf = (slug: string): RackAlertStatus | null => {
    const alert = alerts.find((a) => a.slug === slug);
    return alert ? rackAlertStatus(alert, catalog.find((p) => p.slug === slug)) : null;
  };
  const statuses = summary.items.map((i) => statusOf(i.product.slug));

  return {
    summary,
    stack,
    stackHref: rackStackHref(slugs, catalog),
    statusOf,
    watching: statuses.filter(Boolean).length,
    triggered: statuses.filter((s) => s?.kind === "triggered").length,
    addAll: () => {
      summary.buyable.forEach((i) => add({ productSlug: i.product.slug, variantId: i.variant.id, quantity: 1 }));
      openCart();
    },
    /** Pide el aviso o lo vuelve a armar con el precio y el stock de hoy (después de que saltó). */
    watch: (product: Product, again = false) => {
      watch(createRackAlert(product));
      toast({ tone: "success", title: again ? "Aviso armado de nuevo (simulado)" : "Aviso guardado (simulado)", description: `${product.name}: si baja el precio o vuelve el stock, lo ves acá. No se manda nada.` });
    },
    unwatch: (slug: string) => remove(slug),
    removeFromRack: (product: Product) => {
      toggleFavorite(product.slug);
      remove(product.slug);
      toast({ tone: "success", title: "Quitado de Mi rack", description: product.name });
    },
  };
}
