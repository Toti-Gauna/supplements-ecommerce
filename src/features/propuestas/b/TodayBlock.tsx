import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { DEMO_DAY_LABEL } from "./data";
import { InView } from "./InView";
import { ACTIONS, SCORE, type TodayAction } from "./panel-data";
import { Readout } from "./parts";
import s from "./lab.module.css";

const TONE = { volt: "text-(--volt)", ion: "text-(--ion)", alert: "text-(--alert)" } as const;

/** Cinta de seguridad: solo para lo que está atrasado. */
const TAPE = "repeating-linear-gradient(-45deg, var(--alert) 0 8px, var(--ink) 8px 16px)";

/**
 * Bloque 4: "Hoy en tu tienda" del panel. Marcador en la banda noche y, abajo, la hoja de acciones del día con su
 * botón, ordenadas como una lista de control. Datos ficticios del estado inicial del panel demo.
 */
export function TodayBlock() {
  return (
    <section aria-labelledby="b-today" className="border-y border-(--ink)">
      <div className={s.night}>
        <div className="mx-auto max-w-[1360px] px-4 pb-8 pt-8 sm:px-8 lg:pb-10 lg:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={cn(s.tag, "text-(--night-muted)")}>Panel · {DEMO_DAY_LABEL}</p>
              <h2 id="b-today" className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.04em] sm:text-[48px]">Hoy en tu tienda</h2>
            </div>
            <p className={cn(s.tag, "border border-(--alert) px-2 py-1 text-(--alert)")}>Panel de demostración · datos ficticios</p>
          </div>
          <InView className="mt-7 grid grid-cols-2 border-l border-t border-(--night-rule) lg:grid-cols-4">
            {SCORE.map((c, i) => (
              <div key={c.code} className="border-b border-r border-(--night-rule) px-3 py-4 sm:px-5">
                <Readout tone="night" label={c.label} code={c.code} value={c.value} unit={c.unit} note={c.note} delay={i * 110} size="score"
                  valueClass={c.tone ? TONE[c.tone] : "text-(--on-night)"} />
              </div>
            ))}
          </InView>
        </div>
      </div>
      <div className="bg-(--paper)">
        <ol className="mx-auto max-w-[1360px] px-4 py-6 sm:px-8 lg:py-8">
          {ACTIONS.map((a, i) => <ActionRow key={a.code} action={a} index={i + 1} />)}
        </ol>
      </div>
    </section>
  );
}

function ActionRow({ action: a, index }: { action: TodayAction; index: number }) {
  const done = a.count === 0;
  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 border-b border-(--ink) py-4 pl-4 first:border-t sm:gap-x-6 md:grid-cols-[3rem_4.5rem_minmax(0,1fr)_6rem_10rem]">
      {a.urgent && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5" style={{ background: TAPE }} />}
      <span className={cn(s.mono, "text-[12px] text-(--ink-2)")}>{String(index).padStart(2, "0")}</span>
      <span className={cn(s.tag, "hidden w-fit border border-(--ink) px-1.5 py-0.5 md:block")}>{a.code}</span>
      <span className="min-w-0">
        <span className="block text-[16.5px] font-semibold leading-tight sm:text-[18px]">{a.title}</span>
        <span className={cn(s.mono, "mt-1 block text-[12px] md:truncate", a.urgent ? "font-semibold text-(--danger)" : "text-(--ink-2)")}>{a.detail}</span>
      </span>
      <span className={cn(s.mono, "text-right text-[34px] font-semibold leading-none tracking-[-0.04em] sm:text-[40px]", done && "text-(--ink-2)")}>{a.count}</span>
      {done ? (
        <span className={cn(s.tag, "col-span-3 text-(--ink-2) md:col-span-1 md:text-right")}>Al día</span>
      ) : (
        <Link href={a.href} aria-label={`${a.cta}: ${a.title.toLowerCase()}`} className={cn(s.buy, "col-span-3 flex h-11 items-center justify-center gap-2 rounded-[3px] text-[14.5px] font-semibold md:col-span-1")}>
          {a.cta}<ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      )}
    </li>
  );
}
