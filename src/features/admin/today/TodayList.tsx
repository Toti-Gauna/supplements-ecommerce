"use client";
import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { groupByTier, TIER_LABEL, type TodayAction, type TodaySnapshot, type TodayTier } from "@/demo/engine/today";
import { expiringLots, type LotRow } from "@/demo/admin/lots";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { ClearanceSheet } from "../lots/ClearanceSheet";
import { RepurchaseSheet } from "./RepurchaseSheet";
import { TodayRow } from "./TodayRow";

const TIER_TEXT: Record<TodayTier, string> = { atrasado: "text-danger", hoy: "text-warning", semana: "text-volt-ink", despues: "text-muted" };

/** Nada atrasado ni para hoy: un estado que se siente bien, no una caja vacía. */
function AllClear({ everything }: { everything: boolean }) {
  return (
    <div data-today-clear className="plate relative flex items-center gap-4 overflow-hidden rounded-sm border border-line p-4 sm:p-5">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-success" />
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-sm bg-success-soft text-success"><CheckCheck size={24} aria-hidden="true" /></span>
      <div>
        <p className="font-display text-2xl leading-none">Todo al día</p>
        <p className="mt-1 text-sm text-muted">
          {everything ? "No queda nada pendiente: ni comprobantes, ni pedidos, ni avisos. Buen momento para mirar la próxima campaña." : "Nada atrasado y nada que tenga que salir hoy. Lo que sigue es de la semana."}
        </p>
      </div>
    </div>
  );
}

/**
 * La lista del día por urgencia (R4a): Atrasado, Para hoy, Esta semana y Más adelante, numerada de corrido. Liquidar un
 * lote y avisar recompras se abren acá mismo; aprobar y despachar piden confirmación en su diálogo.
 */
export function TodayList({ actions, snapshot }: { actions: TodayAction[]; snapshot: TodaySnapshot }) {
  const [lot, setLot] = useState<(LotRow & { suggestedPct: number }) | null>(null);
  const [notify, setNotify] = useState<string[] | null>(null);
  const groups = groupByTier(actions);
  const urgent = actions.some((a) => a.tier === "atrasado" || a.tier === "hoy");
  const openLot = (key: string, pct: number) => {
    const row = expiringLots(snapshot.data.products, DEMO_TODAY).find((r) => r.key === key);
    if (row) setLot({ ...row, suggestedPct: pct });
  };
  return (
    <section aria-labelledby="para-hoy" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="para-hoy" className="font-display text-3xl sm:text-4xl">Para hacer</h2>
        <p className="eyebrow text-muted">Por urgencia · {actions.length} {actions.length === 1 ? "cosa" : "cosas"}</p>
      </div>
      {!urgent && <AllClear everything={actions.length === 0} />}
      {groups.map((g) => (
        <section key={g.tier} aria-labelledby={`nivel-${g.tier}`} data-tier={g.tier}>
          <h3 id={`nivel-${g.tier}`} className={cn("eyebrow mb-2 flex items-center gap-2", TIER_TEXT[g.tier])}>
            {TIER_LABEL[g.tier]} <span className="text-muted">· {g.actions.length}</span>
          </h3>
          <ol className="flex flex-col gap-px overflow-hidden rounded-sm border border-line bg-line">
            {g.actions.map((a) => <TodayRow key={a.id} action={a} index={actions.indexOf(a) + 1} onClearance={openLot} onRepurchase={setNotify} />)}
          </ol>
        </section>
      ))}
      <ClearanceSheet lot={lot} suggestedPct={lot?.suggestedPct} onClose={() => setLot(null)} />
      <RepurchaseSheet keys={notify} snapshot={snapshot} onClose={() => setNotify(null)} />
    </section>
  );
}
