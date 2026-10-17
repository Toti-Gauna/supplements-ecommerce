"use client";
import { TriangleAlert } from "lucide-react";
import { fakeDiscounts, type FakeDiscount } from "@/demo/engine/price-history";
import { GAME_COUPON_PREFIX } from "@/demo/engine/game-prize";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { Coupon } from "@/demo/types";
import { useAdmin } from "@/stores/admin";

/**
 * Cupones activos de porcentaje cuyo descuento no es real en algún producto. El de una campaña se mira contra los
 * productos de esa campaña; el resto, contra todo el catálogo (vale para cualquier compra). Los premios de la ruleta y
 * del juego no se anuncian como rebaja y los vencidos ya no se usan: no se miran.
 */
export function useCouponFakeMap(coupons: Coupon[]): Map<string, FakeDiscount[]> {
  const { products, themes, priceChanges } = useAdmin((s) => s.data);
  const out = new Map<string, FakeDiscount[]>();
  for (const c of coupons) {
    if (c.active === false || c.type !== "PERCENT" || c.code.startsWith("RULETA") || c.code.startsWith(GAME_COUPON_PREFIX) || (c.endsAt && c.endsAt < DEMO_TODAY)) continue;
    const slugs = themes.filter((t) => t.couponCode === c.code).flatMap((t) => t.productSlugs);
    const scope = slugs.length ? products.filter((p) => slugs.includes(p.slug)) : products;
    const hits = fakeDiscounts(scope, c, priceChanges ?? [], DEMO_TODAY);
    if (hits.length) out.set(c.code, hits);
  }
  return out;
}

/** Resumen arriba de la lista de cupones: cuáles no rebajan de verdad y en qué productos. */
export function FakeCouponsSummary({ map }: { map: Map<string, FakeDiscount[]> }) {
  if (!map.size) return null;
  return (
    <div role="alert" data-real-discount className="mb-4 flex flex-col gap-2 rounded-sm border border-warning/50 bg-warning-soft p-4 text-sm text-ink">
      <p className="flex items-start gap-2 font-bold text-warning"><TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />{map.size === 1 ? "Un cupón no da un descuento real" : `${map.size} cupones no dan un descuento real`}</p>
      <p>Con el cupón, el precio no baja del más bajo de los últimos 30 días (se subió el precio antes de la rebaja).</p>
      <ul className="flex flex-col gap-1">
        {[...map].map(([code, hits]) => (
          <li key={code}><strong className="font-mono">{code}</strong> <span className="text-muted">en {hits.map((h) => h.name).slice(0, 4).join(", ")}{hits.length > 4 ? ` y ${hits.length - 4} más` : ""}</span></li>
        ))}
      </ul>
    </div>
  );
}
