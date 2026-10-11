"use client";
import Link from "next/link";
import { Gift, MapPin, Package } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { MissionProgress } from "@/components/molecules/MissionProgress";
import { formatMissionValue, previewMission } from "@/demo/engine/missions";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { useDemoData } from "@/stores/admin";
import { formatARS } from "@/lib/money";
import type { DemoOrder } from "@/stores/checkout";
import { useWheelPrize } from "../club/useWheelPrize";
import { WheelPrizeTicket } from "../club/WheelPrizeTicket";

/** El premio de la ruleta, con su estado, primero en los premios de la cuenta (8.2.14). */
function WheelPrizeItem() {
  const { coupon } = useWheelPrize();
  return coupon ? <li className="sm:col-span-2"><WheelPrizeTicket badge="Ganado en la ruleta" /></li> : null;
}

export function OrdersSection({ lastOrder }: { lastOrder: DemoOrder | null }) {
  const orders = [
    ...(lastOrder ? [{ code: lastOrder.code, status: "Pendiente de pago", total: lastOrder.quote.total, href: `/pedido/${lastOrder.token}/` }] : []),
    { code: "VEL-DEMO-0000", status: "Entregado", total: 30400, href: "/pedido/demo-volta/" },
  ];
  return (
    <ul className="flex flex-col gap-2">
      {orders.map((o) => (
        <li key={o.code}>
          <Link href={o.href} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-primary">
            <Package size={20} aria-hidden="true" className="text-primary" />
            <span className="flex-1"><span className="block font-bold">{o.code}</span><span className="text-sm text-muted">{o.status} (muestra)</span></span>
            <span className="font-bold tabular-nums">{formatARS(o.total)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MissionsSection() {
  const all = useDemoData((d) => d.missions);
  const missions = all.filter((m) => m.active !== false);
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {missions.map((m) => {
        const p = previewMission(m, demoAccountProgress[m.id] ?? 0, { units: 0, total: 0 });
        return <MissionProgress key={m.id} title={m.title} reward={m.reward} pctFrom={0} pctTo={p.pctAfter} valueLabel={`${formatMissionValue(m, p.after)} / ${formatMissionValue(m, m.threshold)}`} status={p.alreadyComplete ? "complete" : "progress"} note={m.description} />;
      })}
    </div>
  );
}

const REWARDS = [
  { id: "r-grabado", title: "Grabado de nombre gratis", expires: "30/11/2026" },
  { id: "r-viejo", title: "10% en tu próxima compra", expires: "15/09/2026", expired: true },
];

/** Premios de misiones que todavía se pueden usar (no vencidos ni usados). */
export const availableRewards = (used: string[]) => REWARDS.filter((r) => !r.expired && !used.includes(r.id)).length;

export function RewardsSection({ used, onUse }: { used: string[]; onUse: (id: string) => void }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      <WheelPrizeItem />
      {REWARDS.map((r) => {
        const isUsed = used.includes(r.id);
        return (
          <li key={r.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
            <p className="flex items-center gap-2 font-bold"><Gift size={18} aria-hidden="true" className="text-primary" /> {r.title}</p>
            <p className="text-sm text-muted">{r.expired ? `Venció el ${r.expires}` : `Vence el ${r.expires}`} · un solo uso</p>
            {r.expired ? <Badge tone="neutral" className="self-start">Vencido</Badge> : isUsed ? <Badge tone="success" className="self-start">Usado: no se puede volver a aplicar</Badge> : (
              <Button size="sm" variant="secondary" className="self-start" onClick={() => onUse(r.id)}>Marcar como usado (demo)</Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function AddressesSection() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
      <MapPin size={20} aria-hidden="true" className="text-primary" />
      <div className="text-sm"><p className="font-bold">Casa</p><p className="text-muted">Calle de Muestra 1234, Mar del Plata (7600), Buenos Aires</p></div>
    </div>
  );
}
