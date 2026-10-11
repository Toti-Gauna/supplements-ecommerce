"use client";
import { useAdmin } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { lowStockRows } from "@/demo/admin/stock";
import { isLate } from "@/demo/admin/order-groups";
import { materialRows } from "@/demo/admin/workshop/materials";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { NavBadge } from "./nav";

const IN_PROGRESS = new Set(["PAID", "IN_PRODUCTION", "READY", "SHIPPED"]);

/** Contadores de la navegación: pedidos en marcha, comprobantes por revisar, reclamos abiertos y variantes para reponer. */
export function useNavCounts(): Record<NavBadge, number> {
  const hydrated = useHydrated();
  const orders = useAdmin((s) => s.orders);
  const claims = useAdmin((s) => s.claims);
  const data = useAdmin((s) => s.data);
  const workshop = useAdmin((s) => s.workshop);
  if (!hydrated) return { orders: 0, payments: 0, claims: 0, stock: 0, late: 0, materials: 0 };
  return {
    orders: orders.filter((o) => IN_PROGRESS.has(o.status)).length,
    payments: orders.filter((o) => o.status === "PAYMENT_REVIEW").length,
    claims: claims.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS").length,
    stock: lowStockRows(data.products, data.categories, data.settings.lowStockThreshold).length,
    late: orders.filter((o) => isLate(o, DEMO_TODAY)).length,
    materials: materialRows(workshop.materials, orders, workshop.recipes).filter((m) => m.state !== "ok").length,
  };
}
