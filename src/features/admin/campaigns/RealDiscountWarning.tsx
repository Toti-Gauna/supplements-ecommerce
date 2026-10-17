"use client";
import { TriangleAlert } from "lucide-react";
import { fakeDiscounts, type FakeDiscount } from "@/demo/engine/price-history";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { Coupon } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";

/** Productos donde el cupón no rebaja de verdad (el precio final no baja del más bajo de 30 días). `slugs` null = todo el catálogo. */
export function useFakeDiscounts(coupon: Pick<Coupon, "type" | "value"> | null | undefined, slugs: string[] | null): FakeDiscount[] {
  const products = useAdmin((s) => s.data.products);
  const changes = useAdmin((s) => s.data.priceChanges);
  if (!coupon) return [];
  const scope = slugs ? products.filter((p) => slugs.includes(p.slug)) : products;
  return fakeDiscounts(scope, coupon, changes ?? [], DEMO_TODAY);
}

/**
 * Aviso "Descuento real" (R3): si se subió el precio antes de la rebaja, el precio con el cupón queda igual o por
 * encima del más bajo de los últimos 30 días y la oferta no es real. Lista los productos y variantes afectados.
 */
export function RealDiscountWarning({ hits, what }: { hits: FakeDiscount[]; what: string }) {
  if (!hits.length) return null;
  const shown = hits.slice(0, 6);
  return (
    <div role="alert" data-real-discount className="flex flex-col gap-2 rounded-sm border border-warning/50 bg-warning-soft p-4 text-sm text-ink">
      <p className="flex items-start gap-2 font-bold text-warning"><TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />El descuento de {what} no es real en {hits.length} {hits.length === 1 ? "producto" : "productos"}</p>
      <p>El precio con el cupón no baja del más bajo de los últimos 30 días: se subió el precio antes de la rebaja. Bajá el precio, subí el descuento o sacá estos productos.</p>
      <ul className="flex flex-col gap-1">
        {shown.map((h) => {
          const v = h.variants[0]!;
          return (
            <li key={h.slug} className="flex flex-wrap gap-x-2">
              <strong>{h.name}</strong>
              <span className="text-muted">{h.variants.length > 1 ? `${h.variants.length} variantes, ej. ${v.label}` : v.label}: con cupón {formatARS(v.final)} · más bajo en 30 días {formatARS(v.lowest)}</span>
            </li>
          );
        })}
      </ul>
      {hits.length > shown.length && <p className="text-muted">Y {hits.length - shown.length} más.</p>}
    </div>
  );
}
