import type { ReactNode } from "react";

export type GlyphKind = "percent" | "truck" | "gift" | "engrave" | "coin";

/** Trazos de cada premio en una caja de 48×48, pensados para dibujarse con un degradé dorado. */
const PATHS: Record<GlyphKind, ReactNode> = {
  percent: (
    <>
      <path d="M24 4.5 28.6 8l5.7-.6 2.3 5.3 5.2 2.4-.6 5.7L44.5 24 41.2 28.6l.6 5.7-5.2 2.3-2.4 5.2-5.7-.6L24 44.5 19.4 41.2l-5.7.6-2.3-5.2-5.2-2.4.6-5.7L3.5 24l3.3-4.6-.6-5.7 5.2-2.3 2.4-5.2 5.7.6Z" />
      <path d="m17 31 14-14" />
      <circle cx="18" cy="18" r="2.6" />
      <circle cx="30" cy="30" r="2.6" />
    </>
  ),
  truck: (
    <>
      <path d="M4 13h23v19H4z" />
      <path d="M27 19h8.5l6.5 7v6H27" />
      <circle cx="13" cy="34.5" r="4" />
      <circle cx="35" cy="34.5" r="4" />
      <path d="M8 19h9M8 24h6" />
    </>
  ),
  gift: (
    <>
      <path d="M7 19h34v8H7zM10 27h28v15H10zM24 19v23" />
      <path d="M24 19c-3.5-6-11-7.5-11-2.5 0 3 5.5 2.5 11 2.5ZM24 19c3.5-6 11-7.5 11-2.5 0 3-5.5 2.5-11 2.5Z" />
    </>
  ),
  engrave: (
    <>
      <path d="m30 7 11 11-21 21-12 2 2-12Z" />
      <path d="m26 11 11 11M10 29l9 9" />
      <path d="M6 44h20" />
    </>
  ),
  coin: (
    <>
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="13" strokeDasharray="2 3" />
      <path d="M29 18.5c-1.2-1.6-3-2.5-5-2.5-3 0-5 1.6-5 3.8 0 5 10 2.6 10 7.8 0 2.3-2.2 4-5.2 4-2.2 0-4.2-1-5.4-2.7M24 13v22" />
    </>
  ),
};

/** Ícono de premio dentro de un SVG propio (para usar suelto) o como grupo dentro de otro SVG. */
export function RewardGlyph({ kind, size = 28, color = "url(#volta-gold)", standalone = true, className }: { kind: GlyphKind; size?: number; color?: string; standalone?: boolean; className?: string }) {
  const g = <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">{PATHS[kind]}</g>;
  if (!standalone) return g;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className={className}>
      <GoldGradient />
      {g}
    </svg>
  );
}

/** Degradé dorado compartido (id fijo: se repite sin problema en cada SVG). */
export function GoldGradient({ id = "volta-gold" }: { id?: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6e2b0" />
        <stop offset=".45" stopColor="#c8ff2e" />
        <stop offset="1" stopColor="#9a7434" />
      </linearGradient>
    </defs>
  );
}

/** Ícono según el tipo de premio o cupón. */
export function glyphFor(kind: "PERCENT" | "FIXED" | "FREE_SHIPPING", label = ""): GlyphKind {
  if (kind === "FREE_SHIPPING") return "truck";
  if (kind === "PERCENT") return "percent";
  if (/llavero|regalo/i.test(label)) return "gift";
  if (/grabado/i.test(label)) return "engrave";
  return "coin";
}

/** Valor corto para el talón del cupón o el gajo de la ruleta. */
export function shortValue(kind: "PERCENT" | "FIXED" | "FREE_SHIPPING", value: number, label = ""): string {
  if (kind === "FREE_SHIPPING") return "Envío";
  if (kind === "PERCENT") return `${value}%`;
  if (/llavero|regalo/i.test(label)) return "Regalo";
  if (/grabado/i.test(label)) return "Grabado";
  return `$${value.toLocaleString("es-AR")}`;
}
