import type { CSSProperties, ReactNode } from "react";
import { BadgeGlyph } from "@/components/illustrations/BadgeGlyph";
import type { StockState } from "@/demo/admin/stock";
import type { ProductBadge } from "@/demo/types";
import { cn } from "@/lib/cn";
import s from "./lab.module.css";

/** Rótulo chico entre bloques de la maqueta ("1 · Inicio"), con regla de plano. */
export function SectionPlate({ n, title, note }: { n: number; title: string; note: string }) {
  return (
    <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-4 pb-4 pt-14 sm:px-8">
      <span className={cn(s.tag, "bg-(--ink) px-2 py-1 text-(--paper)")}>{n} · {title}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-(--rule-2)" />
      <span className={cn(s.tag, "hidden text-(--ink-2) sm:block")}>{note}</span>
    </div>
  );
}

type Tone = "paper" | "night";

/** Lectura de laboratorio: código, cifra grande en mono y unidad. La cifra cae como un marcador (flip). */
export function Readout({ label, value, unit, note, code, delay = 0, tone = "paper", size = "lg", className, valueClass }: {
  label: string; value: string; unit?: string; note?: ReactNode; code?: string; delay?: number; tone?: Tone; size?: "md" | "lg" | "score"; className?: string; valueClass?: string;
}) {
  const muted = tone === "night" ? "text-(--night-muted)" : "text-(--ink-2)";
  const fs = { md: "text-[24px] sm:text-[26px]", lg: "text-[30px] sm:text-[40px]", score: "text-[24px] sm:text-[34px] lg:text-[40px]" }[size];
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className={cn(s.tag, "flex justify-between gap-2", muted)}><span>{label}</span>{code && <span aria-hidden="true" className="hidden sm:inline">{code}</span>}</span>
      <span className={cn(s.mono, "block overflow-hidden whitespace-nowrap font-semibold leading-none tracking-[-0.04em]", fs)} style={{ perspective: "400px" }}>
        <span className={cn(s.flip, valueClass)} style={{ "--d": `${delay}ms` } as CSSProperties}>{value}</span>
        {unit && <span className={cn("ml-1 text-[0.42em] font-medium tracking-normal", muted)}>{unit}</span>}
      </span>
      {note && <span className={cn("text-[12.5px] leading-snug", muted)}>{note}</span>}
    </div>
  );
}

const LIT: Record<StockState, number> = { ok: 3, low: 1, out: 0, "made-to-order": 0 };

/** Tres luces de stock (como las de un equipo): verdes = hay, una ámbar = poco, apagadas = sin stock. */
export function StockLeds({ state, text, className }: { state: StockState; text: string; className?: string }) {
  const lit = LIT[state];
  const on = state === "low" ? "bg-(--alert)" : "bg-(--ion) shadow-[0_0_6px_var(--ion)]";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden="true" className="flex gap-[3px]">
        {[0, 1, 2].map((i) => (
          <span key={i} data-on={i < lit} style={{ "--d": `${120 + i * 140}ms` } as CSSProperties}
            className={cn(s.led, "h-2.5 w-1.5 rounded-[1px]", i < lit ? on : "bg-(--rule)")} />
        ))}
      </span>
      <span className={cn(s.mono, "text-[12px] font-medium")}>{text}</span>
    </span>
  );
}

/** Sellos del rótulo como etiquetas de plano (rectas, con su ícono). */
export function Seals({ badges, className }: { badges: { key: ProductBadge; label: string }[]; className?: string }) {
  if (!badges.length) return null;
  return (
    <ul aria-label="Sellos" className={cn("flex flex-wrap gap-1", className)}>
      {badges.map((b) => (
        <li key={b.key} className={cn(s.tag, "inline-flex items-center gap-1 border border-(--ink) px-1.5 py-[3px] text-[9.5px] tracking-[0.08em]")}>
          <BadgeGlyph badge={b.key} className="h-3 w-3" />{b.label}
        </li>
      ))}
    </ul>
  );
}

/** Celda de la tira de datos; `signal` le prende la luz de voltio arriba. */
export function DataCell({ children, signal = false }: { children: ReactNode; signal?: boolean }) {
  return (
    <div className="relative border-b border-r border-(--ink) px-3 pb-3 pt-3.5 sm:px-3.5">
      {signal && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-(--volt)" />}
      {children}
    </div>
  );
}

/** Etiqueta de lote impresa: código, vencimiento y FEFO. */
export function LotTag({ code, expires, className }: { code: string; expires: string; className?: string }) {
  return (
    <span className={cn(s.mono, "inline-flex items-stretch border border-(--ink) text-[11.5px]", className)}>
      <span className="bg-(--ink) px-1.5 py-1 font-bold tracking-[0.1em] text-(--paper)">LOTE</span>
      <span className="px-2 py-1 font-semibold">{code}</span>
      <span className="border-l border-(--ink) px-2 py-1">VTO {expires}</span>
    </span>
  );
}
