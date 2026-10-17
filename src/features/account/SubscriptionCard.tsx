"use client";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { ButtonLink } from "@/components/atoms/Button";
import { LedPrice } from "@/components/atoms/Led";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { quotePack } from "@/demo/engine/packs";
import { monthlyAmount, nextDelivery, SUBSCRIPTION_LABEL, type Subscription, type SubscriptionStatus } from "@/demo/engine/subscriptions";
import { closureFor, type WorkCalendar } from "@/demo/engine/workdays";
import type { Pack } from "@/demo/types";
import { formatDay } from "@/lib/date";
import { SubscriptionActions } from "./SubscriptionActions";

const TONE: Record<SubscriptionStatus, "success" | "warning" | "neutral"> = { active: "success", paused: "warning", cancelled: "neutral" };
const NO_CLOSURES: WorkCalendar = { closedWeekdays: [], closures: [] };
const DT = "eyebrow text-[10px] text-muted";

/** Una suscripción: pack, estado, próxima entrega (con el motivo si se corrió), lo que sale cada mes y qué llega. */
export function SubscriptionCard({ sub, pack, packs, cal }: { sub: Subscription; pack?: Pack; packs: Pack[]; cal: WorkCalendar }) {
  const next = nextDelivery(sub, DEMO_TODAY, cal);
  // El día pedido, antes de correrlo al próximo día hábil, y el motivo si ese día el local no despacha.
  const asked = nextDelivery(sub, DEMO_TODAY, NO_CLOSURES);
  const moved = next && asked && next !== asked ? closureFor(asked, cal)?.reason : undefined;
  const skipped = sub.skipNext && sub.status === "active" ? nextDelivery({ ...sub, skipNext: false }, DEMO_TODAY, cal) : null;
  const amount = monthlyAmount(sub, packs);
  const monthly = pack ? quotePack(pack, sub.choices).lines.filter((l) => l.recurring) : [];
  return (
    <li className="plate border border-line p-4 sm:p-6" data-subscription={sub.id}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-1.5 text-volt-ink"><CalendarClock size={14} aria-hidden="true" />Todos los meses · día {sub.day}</p>
          <h3 className="font-display mt-1 text-2xl leading-tight sm:text-3xl">{pack?.name ?? "Pack que ya no está"}</h3>
        </div>
        <Badge tone={TONE[sub.status]}>{SUBSCRIPTION_LABEL[sub.status]}</Badge>
      </header>
      <dl className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
        <div>
          <dt className={DT}>Próxima entrega</dt>
          <dd className="mt-1">
            <span className="font-display text-2xl leading-tight">{next ? formatDay(next, "long") : sub.status === "paused" ? "Pausada" : "Sin entregas"}</span>
            {moved && asked && <span className="mt-1 block text-xs text-muted">El {formatDay(asked, "dayMonth")} no hay despachos ({moved}): pasa al próximo día hábil.</span>}
            {skipped && <span className="mt-1 block text-xs font-bold text-warning">Salteás la del {formatDay(skipped, "dayMonth")}.</span>}
            {sub.status === "paused" && <span className="mt-1 block text-xs text-muted">No sale nada hasta que la reanudes.</span>}
          </dd>
        </div>
        <div>
          <dt className={DT}>Cada mes</dt>
          <dd className="mt-1">
            {amount !== null ? <LedPrice amount={amount} motion="none" className="h-8" signClassName="text-xl" /> : <span className="text-muted">—</span>}
            <span className="mt-1 block text-xs text-muted">Simulado: no se cobra ni se debita nada.</span>
          </dd>
        </div>
      </dl>
      {monthly.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className={DT}>Qué llega cada mes</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {monthly.map((l) => <li key={l.product.slug}>{l.item.qty} × {l.product.name} <span className="text-muted">· {l.variant.label}</span></li>)}
          </ul>
        </div>
      )}
      {sub.status === "cancelled" ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <p className="text-sm text-muted">Cancelaste esta suscripción: no te llega nada más.</p>
          {pack && <ButtonLink href={`/packs/?pack=${pack.id}`} size="sm" variant="secondary">Volver a suscribirme</ButtonLink>}
        </div>
      ) : <SubscriptionActions sub={sub} cal={cal} />}
    </li>
  );
}
