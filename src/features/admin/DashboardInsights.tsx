"use client";
import { Gamepad2, Gift, Ticket, Target } from "lucide-react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { topProducts } from "@/demo/admin/metrics";
import type { AdminOrder, AuditEntry } from "@/demo/admin/types";
import { getProduct } from "@/demo/engine/catalog";
import { formatDateTime } from "@/lib/date";
import { useDemoData } from "@/stores/admin";
import { GAME_COUPON_PREFIX } from "@/demo/engine/game-prize";

export function TopProducts({ orders }: { orders: AdminOrder[] }) {
  const top = topProducts(orders, 5);
  const max = Math.max(1, ...top.map((t) => t.units));
  return (
    <section aria-labelledby="top" className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)]">
      <h2 id="top" className="font-display mb-4 text-2xl">Más pedidos <span className="font-sans text-sm text-muted">(unidades, demo)</span></h2>
      <ol className="flex flex-col gap-3">
        {top.map((t, i) => {
          const p = getProduct(t.slug);
          return (
            <li key={t.slug} className="flex items-center gap-3">
              <span className="font-display w-5 text-lg text-muted">{i + 1}</span>
              {p && <ProductArt art={p.art} pack={p.pack} tint={p.variants[0]?.colorHex} label="" showBadge={false} className="h-11 w-11 shrink-0 rounded-xl" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p?.name ?? t.slug}</p>
                <div className="mt-1 h-1.5 rounded-full bg-accent" aria-hidden="true"><div className="h-full rounded-full bg-primary" style={{ width: `${(t.units / max) * 100}%` }} /></div>
              </div>
              <span className="text-sm font-extrabold tabular-nums">{t.units} u.</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ClubPerformance() {
  const missions = useDemoData((d) => d.missions);
  const coupons = useDemoData((d) => d.coupons);
  const wheel = useDemoData((d) => d.wheel);
  const prizes = coupons.filter((c) => c.code.startsWith("RULETA"));
  const gamePrizes = coupons.filter((c) => c.code.startsWith(GAME_COUPON_PREFIX));
  const rows = [
    { icon: Target, label: "Misiones completadas", value: missions.reduce((s, m) => s + (m.completedCount ?? 0), 0), note: `${missions.filter((m) => m.active !== false).length} activas` },
    { icon: Ticket, label: "Usos de cupones", value: coupons.reduce((s, c) => s + (c.usedCount ?? 0), 0), note: `${coupons.filter((c) => c.active !== false).length} activos` },
    { icon: Gift, label: "Premios de ruleta emitidos", value: prizes.length, note: wheel.active ? "ruleta activa" : "ruleta pausada" },
    { icon: Gamepad2, label: "Premios de Shaker Rush", value: gamePrizes.length, note: "uno por día y navegador" },
  ];
  return (
    <section aria-labelledby="club" className="rounded-3xl bg-night p-5 text-on-night">
      <h2 id="club" className="font-display mb-4 text-2xl">Club Volta <span className="font-sans text-sm text-night-muted">(demo)</span></h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map(({ icon: Icon, label, value, note }) => (
          <li key={label} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-volt text-night"><Icon size={18} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1 text-sm"><span className="block font-bold">{label}</span><span className="text-xs text-night-muted">{note}</span></span>
            <span className="font-display text-3xl tabular-nums">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ActivityFeed({ audit }: { audit: AuditEntry[] }) {
  return (
    <section aria-labelledby="act" className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)]">
      <h2 id="act" className="font-display mb-4 text-2xl">Actividad reciente</h2>
      <ol className="flex flex-col gap-0 border-l-2 border-line pl-4">
        {audit.slice(0, 7).map((a) => (
          <li key={a.id} className="relative pb-3 text-sm">
            <span aria-hidden="true" className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-volt" />
            <p className="font-bold">{a.action}</p>
            <p className="text-xs text-muted">{a.entity} · {formatDateTime(a.at)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
