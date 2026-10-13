import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Led, LedPrice } from "./Led";
import type { panelToday } from "./panel-data";
import { focusRing } from "./styles";
import s from "./box.module.css";

type Today = ReturnType<typeof panelToday>;

/**
 * "Hoy en tu tienda": el marcador del día arriba (vendido, por cobrar, para armar, sale hoy y stock en riesgo) y la
 * lista de acciones por urgencia, cada una con su botón. Lo urgente lleva la cinta de seguridad; lo demás, la luz.
 */
export function PanelToday({ data }: { data: Today }) {
  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-20 pt-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-(--bx-dim)">{data.day}</p>
          <h3 className={cn(s.display, "mt-2 text-[clamp(48px,7vw,88px)]")}>Hoy en tu tienda</h3>
        </div>
        <p className="flex items-stretch border border-(--bx-amber)/60 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
          <span aria-hidden="true" className={cn(s.hazard, "w-3")} />
          <span className="px-3 py-2 text-(--bx-amber)">Panel de demostración · datos ficticios</span>
        </p>
      </div>
      <dl className="mt-6 grid grid-cols-6 gap-px bg-(--bx-carbon) lg:grid-cols-[1.3fr_1.3fr_1fr_1fr_1fr]">
        {data.score.map((c) => (
          <div key={c.key} className={cn(s.steel, "flex min-w-0 flex-col gap-3 p-3 sm:p-4 lg:col-span-1", c.money ? "col-span-6 sm:col-span-3" : "col-span-2")}>
            <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-(--bx-dim)">{c.label}</dt>
            <dd>
              {c.money
                ? <LedPrice amount={c.amount} tone={c.tone} className="h-10 sm:h-11" signClassName="text-3xl" />
                : <Led value={String(c.amount).padStart(2, "0")} label={String(c.amount)} tone={c.tone} className="h-9 sm:h-11" />}
            </dd>
            <dd className="font-mono text-[11px] text-(--bx-dim)">{c.hint}</dd>
          </div>
        ))}
      </dl>
      <h4 className="mt-10 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-(--bx-dim)">Para hacer hoy · por urgencia</h4>
      <ol className="mt-3 flex flex-col gap-px bg-(--bx-carbon)">
        {data.actions.map((a, i) => (
          <li key={a.key} className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 bg-(--bx-graphite) py-4 pl-6 pr-4 sm:grid-cols-[2.5rem_auto_minmax(0,1fr)_auto] sm:pl-7">
            <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-2", a.urgent ? s.hazard : "bg-(--bx-steel)")} />
            <span aria-hidden="true" className="hidden font-mono text-[11px] font-bold text-(--bx-dim) sm:block">{String(i + 1).padStart(2, "0")}</span>
            <Led value={String(a.count).padStart(2, "0")} label={`${a.count}`} tone={a.urgent ? "amber" : "volt"} motion="none" className="h-8" />
            <div className="min-w-0">
              <p className="font-mono text-[13px] font-bold uppercase tracking-[0.06em]">
                {a.title}
                {a.urgent && <span className="ml-2 align-middle text-[10px] text-(--bx-amber)">Urgente</span>}
              </p>
              <p className="mt-0.5 truncate text-sm text-(--bx-dim)">{a.detail}</p>
            </div>
            <a href={a.href} className={cn("col-span-2 flex h-11 items-center justify-between gap-3 px-4 font-mono text-[12px] font-bold uppercase tracking-[0.08em] sm:col-span-1 sm:min-w-[13rem]", a.urgent ? "bg-(--bx-volt) text-(--bx-volt-ink)" : "border border-(--bx-steel-hi)/50 hover:border-(--bx-chalk)", focusRing)}>
              {a.cta} <ArrowRight size={15} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
