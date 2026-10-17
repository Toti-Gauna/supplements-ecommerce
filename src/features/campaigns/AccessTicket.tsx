"use client";
import { Check, Copy, Ticket } from "lucide-react";
import { ticketBars, ticketSerial } from "@/demo/engine/campaign-drop";
import type { SeasonalTheme } from "@/demo/types";
import { cn } from "@/lib/cn";
import { useThemeCoupon } from "../themes/useThemeCoupon";
import s from "./campaign.module.css";

interface AccessTicketProps {
  theme: Pick<SeasonalTheme, "name" | "startsOn" | "couponCode" | "sport">;
  /** Condición del cupón ("Desde $ 40.000 de compra"). */
  condition: string | null;
  className?: string;
}

const ACTION = "inline-flex min-h-11 items-center justify-center gap-1.5 px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] disabled:opacity-100";

/**
 * El cupón de la campaña como ticket de acceso: talón con la serie (decorativa), troquel, el código con su condición,
 * un código de barras de adorno (no se escanea) y dos acciones: copiar el código o dejarlo puesto en el carrito (el
 * engine lo valida igual al pagar). Papel tiza sobre la noche del escenario; la fecha solo pinta el talón.
 */
export function AccessTicket({ theme, condition, className }: AccessTicketProps) {
  const { copy, apply, applied } = useThemeCoupon();
  const code = theme.couponCode;
  const on = applied === code;
  return (
    <div data-access-ticket={code} className={cn(s.ticket, "relative flex min-h-[4.5rem] w-full max-w-[30rem] items-stretch bg-on-night text-night shadow-[0_18px_40px_-18px_rgb(0_0_0/0.9)]", className)}>
      <div className="flex w-(--stub) shrink-0 items-center justify-center gap-1 bg-(--season-accent) px-1 text-(--season-accent-ink)">
        <Ticket size={16} aria-hidden="true" className="shrink-0" />
        <span className={cn(s.serial, s.mono, "text-[9px] font-bold uppercase tracking-[0.14em]")}>{ticketSerial(theme)}</span>
      </div>
      <span aria-hidden="true" className={s.perf} />
      <div className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-4 pr-2">
        <div className="min-w-0 flex-1">
          <p className={cn(s.mono, "text-[9.5px] font-bold uppercase tracking-[0.16em] text-night/70")}>{theme.sport ? "Pase del día" : "Ticket de acceso"}</p>
          <p className={cn(s.mono, "truncate text-base font-extrabold tracking-[0.08em] sm:text-lg")}>{code}</p>
          <p className="truncate text-[11px] leading-tight text-night/75">{condition ?? "Sin mínimo de compra"}</p>
        </div>
        <span aria-hidden="true" className="hidden h-9 shrink-0 items-stretch gap-px sm:flex">
          {ticketBars(code, 22).map((w, i) => <span key={i} className="bg-night" style={{ width: w }} />)}
        </span>
        <button type="button" onClick={() => copy(code)} aria-label={`Copiar el código ${code}`} className={cn(ACTION, "w-11 shrink-0 border border-night/25 px-0 hover:bg-night/10")}>
          <Copy size={16} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => apply(code)} disabled={on} aria-label={on ? "Cupón en tu carrito" : `Usar ${code}`} className={cn(ACTION, "shrink-0 bg-night text-on-night hover:bg-night/85")}>
          {on ? <><Check size={16} aria-hidden="true" />En tu carrito</> : "Usar"}
        </button>
      </div>
    </div>
  );
}
