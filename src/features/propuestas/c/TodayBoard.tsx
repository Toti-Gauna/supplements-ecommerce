import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { Scoreboard } from "./Scoreboard";
import type { todayBoard } from "./data";
import s from "./arena.module.css";

type Board = ReturnType<typeof todayBoard>;

/**
 * "Hoy en tu tienda" del panel con el mismo lenguaje: el marcador del día arriba (gira al entrar) y la hoja de
 * acciones como una lista de largada, cada una con su botón. Lo urgente lleva la luz ember.
 */
export function TodayBoard({ board, storeName }: { board: Board; storeName: string }) {
  const { score, actions } = board;
  const deltaText = score.weekDelta === null ? "sin semana anterior" : `${score.weekDelta > 0 ? "+" : ""}${score.weekDelta} % vs. semana anterior`;
  return (
    <section aria-labelledby="arena-hoy" className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:py-14">
      <p className={cn(s.mono, "mb-6 inline-flex items-center gap-2 border border-[var(--a-volt)]/50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--a-volt)]")}>
        <span aria-hidden="true" className={s.ledDot} />Panel de demostración · datos ficticios
      </p>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
        <h2 id="arena-hoy" className={cn(s.display, "text-[clamp(3rem,8vw,6.5rem)]")}>Hoy en <span className="text-[var(--a-volt)]">{storeName}</span></h2>
        <p className={cn(s.mono, "text-sm uppercase tracking-[0.12em] text-[var(--a-muted)]")}>{board.today}</p>
      </div>
      <Scoreboard
        flip
        size="xl"
        className="grid-cols-2 lg:grid-cols-4"
        cells={[
          { label: "Ventas 7 días", value: formatARS(score.week), tone: "volt", note: deltaText },
          { label: "Ticket promedio", value: formatARS(score.ticket), note: "pedidos pagados" },
          { label: "Pedidos en marcha", value: score.active, note: "pagados a enviados" },
          { label: "Comprobantes", value: score.review, tone: score.review > 0 ? "ember" : "ink", note: "transferencia y QR" },
        ]}
      />
      <h3 className={cn(s.mono, "mb-3 mt-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--a-muted)]")}>Lo que hay que hacer hoy · {actions.length}</h3>
      <ol className="flex flex-col gap-px bg-[var(--a-line)]">
        {actions.map((a, i) => (
          <li key={a.title} className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 bg-[var(--a-stage)] py-4 pl-5 pr-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-6 sm:pl-6">
            {a.hot && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--a-ember)] shadow-[0_0_16px_var(--a-ember)]" />}
            <span aria-hidden="true" className={cn(s.display, s.num, s.outline, "text-[2.6rem] leading-none sm:text-[3.4rem]", a.hot ? "text-[var(--a-ember)]" : "text-[var(--a-ink)]/60")}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-extrabold uppercase italic leading-tight sm:text-xl">{a.title}</span>
              <span className={cn(s.mono, "mt-1 block text-xs text-[var(--a-muted)] sm:truncate")}>{a.hot && <span className="text-[var(--a-ember)]">Urgente · </span>}{a.detail}</span>
            </span>
            <Link
              href={a.href}
              className={cn(s.slant, s.focusCut, "col-span-2 flex h-10 items-center sm:h-11 justify-between gap-3 px-6 text-sm font-extrabold uppercase italic tracking-[0.06em] sm:col-span-1 sm:min-w-44",
                a.hot ? "bg-[var(--a-volt)] text-black hover:bg-white" : "bg-[#1c1c24] text-[var(--a-ink)] hover:bg-[var(--a-ink)] hover:text-black")}
            >
              {a.cta}<ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
