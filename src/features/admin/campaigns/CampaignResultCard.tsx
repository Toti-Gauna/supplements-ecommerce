"use client";
import { campaignResult } from "@/demo/admin/campaign-results";
import type { SeasonalTheme } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";

/** Resultados del cupón de esta campaña (con el cupón guardado o el elegido en el borrador). */
export function CampaignResultCard({ theme }: { theme: SeasonalTheme }) {
  const coupons = useAdmin((s) => s.data.coupons);
  const orders = useAdmin((s) => s.orders);
  const r = campaignResult(theme, coupons, orders);
  const cells = [
    { label: "Usos del cupón", value: String(r.uses) },
    { label: "Pedidos", value: String(r.orders) },
    { label: "Descuento dado", value: formatARS(r.discount) },
    { label: "Vendido con el cupón", value: formatARS(r.revenue) },
  ];
  return (
    <section aria-labelledby="cmp-res" data-campaign-results className="rounded-sm bg-surface p-4 shadow-[var(--shadow-card)]">
      <h2 id="cmp-res" className="text-sm font-bold">Resultados de {r.code} <span className="font-normal text-muted">(simulados)</span></h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cells.map((c) => (
          <div key={c.label} className="min-w-0 rounded-xs bg-bg p-3">
            <dt className="text-xs text-muted">{c.label}</dt>
            <dd className="font-mono text-lg font-extrabold tabular-nums">{c.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
