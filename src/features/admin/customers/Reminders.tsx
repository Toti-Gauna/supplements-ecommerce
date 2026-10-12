"use client";
import Link from "next/link";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { remainingPct, WEEK_DAYS, type RepurchaseItem, type RepurchaseState } from "@/demo/admin/repurchase";
import { runOutLine } from "@/demo/admin/repurchase-text";
import { addDays } from "@/demo/engine/workdays";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { formatDay } from "@/lib/date";
import { NotifyActions } from "./NotifyActions";

export function profileHref(email: string): string {
  return `/admin-demo/usuarios/ficha/?email=${encodeURIComponent(email)}`;
}

const WHEN_TONE: Record<RepurchaseState, string> = { overdue: "text-danger", week: "text-ink", later: "text-muted" };

/**
 * "Se le termina" de la ficha: cada pote con la batería de lo que le queda (como en Mi cuenta), la fecha y el aviso.
 * Avisar solo aparece cuando corresponde: si se le termina esta semana o ya se le terminó.
 */
export function RepurchaseList({ items }: { items: RepurchaseItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const pct = remainingPct(item, DEMO_TODAY);
        return (
          <li key={item.key} className="@container rounded-2xl bg-bg p-3">
            {/* 8.3.13: las acciones van debajo del texto si no entran al costado. */}
            <div className="flex flex-col gap-3 @min-[36rem]:flex-row @min-[36rem]:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{item.product}</p>
                <p className="text-sm text-muted">
                  {item.variant} · <Link href={`/admin-demo/pedidos/detalle/?codigo=${item.orderCode}`} className="underline hover:text-ink">{item.orderCode}</Link>
                </p>
                <p className={cn("mt-1 text-sm font-bold", WHEN_TONE[item.state])}>{runOutLine(item)}</p>
                <BatteryMeter pct={pct} label={`Le queda cerca del ${pct} % de ${item.product}`} tone={pct <= 20 ? "danger" : "volt"} className="mt-2 max-w-44" />
              </div>
              {item.state === "later"
                ? <p className="text-sm text-muted @min-[36rem]:max-w-44 @min-[36rem]:text-right">Avisale desde el {formatDay(addDays(item.runsOutOn, 1 - WEEK_DAYS))}</p>
                : <NotifyActions item={item} className="@min-[36rem]:shrink-0" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
