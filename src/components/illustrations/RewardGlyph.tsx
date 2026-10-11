import type { ReactNode } from "react";

export type GlyphKind = "percent" | "truck" | "sample" | "shaker" | "gift" | "coin";
type CouponKind = "PERCENT" | "FIXED" | "FREE_SHIPPING";

/** Trazos de cada premio en una caja de 48×48 (dibujo propio, línea de 2,6 con puntas redondeadas). */
const PATHS: Record<GlyphKind, ReactNode> = {
  // Cupón con muescas y el signo de porcentaje.
  percent: (
    <>
      <path d="M6 13h36v7.5a3.5 3.5 0 0 0 0 7V35H6v-7.5a3.5 3.5 0 0 0 0-7Z" />
      <path d="m18.5 29.5 11-11" />
      <circle cx="18.5" cy="19" r="2.3" />
      <circle cx="29.5" cy="29" r="2.3" />
    </>
  ),
  // Camioneta del cadete con líneas de velocidad.
  truck: (
    <>
      <path d="M13 13h17v18H13" />
      <path d="M30 18h6.5l5.5 6.5V31H30" />
      <circle cx="18" cy="33.5" r="3.8" />
      <circle cx="35" cy="33.5" r="3.8" />
      <path d="M4 18h6M6 23.5h5M4 29h5" />
    </>
  ),
  // Sachet de muestra: bordes sellados en zigzag, muesca para abrir y el rayo.
  sample: (
    <>
      <path d="M13 9.5 15.2 7l2.2 2.5L19.6 7l2.2 2.5L24 7l2.2 2.5L28.4 7l2.2 2.5L32.8 7 35 9.5V38.5L32.8 41l-2.2-2.5-2.2 2.5-2.2-2.5L24 41l-2.2-2.5-2.2 2.5-2.2-2.5-2.2 2.5-2.2-2.5Z" />
      <path d="M13 13.5h22M13 34.5h22M35 17l-2.6 1.6L35 20.2" />
      <path d="m25.8 17.5-5.6 8.3h4.7L22.4 31l6-8.6h-4.8Z" />
    </>
  ),
  // Shaker: tapa con pico, cuerpo apenas cónico y marcas de medida.
  shaker: (
    <>
      <path d="M19.5 9V5.5h5.5l2.2 3.5" />
      <path d="M14 9.5h20v6H14Z" />
      <path d="M15 15.5 17.2 42h13.6L33 15.5" />
      <path d="M18.3 22.5h4M18.7 28h4M19.1 33.5h4" />
      <path d="m29.2 21.5-3 5.2h2.8l-1.4 4.8 3.4-5.6h-2.8Z" />
    </>
  ),
  // Caja de regalo (otro producto del catálogo).
  gift: (
    <>
      <path d="M7 19h34v8H7zM10 27h28v15H10zM24 19v23" />
      <path d="M24 19c-3.5-6-11-7.5-11-2.5 0 3 5.5 2.5 11 2.5ZM24 19c3.5-6 11-7.5 11-2.5 0 3-5.5 2.5-11 2.5Z" />
    </>
  ),
  // Monto fijo: moneda con canto marcado y una segunda detrás.
  coin: (
    <>
      <path d="M33.5 9.8A16 16 0 0 1 41 23.5" />
      <circle cx="21" cy="26" r="16" />
      <circle cx="21" cy="26" r="11.5" strokeDasharray="1.6 2.6" />
      <path d="M25.5 21c-1.1-1.4-2.7-2.2-4.5-2.2-2.7 0-4.5 1.4-4.5 3.4 0 4.5 9 2.3 9 7 0 2-2 3.6-4.7 3.6-2 0-3.8-.9-4.9-2.4M21 16.2v19.6" />
    </>
  ),
};

/** Ícono de premio dentro de un SVG propio (para usar suelto) o como grupo dentro de otro SVG. */
export function RewardGlyph({ kind, size = 28, color = "url(#volta-glyph)", standalone = true, className }: { kind: GlyphKind; size?: number; color?: string; standalone?: boolean; className?: string }) {
  const g = <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">{PATHS[kind]}</g>;
  if (!standalone) return g;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className={className}>
      <GlyphGradient />
      {g}
    </svg>
  );
}

/** Degradé eléctrico (voltio claro → voltio → ion) para íconos y guilloché sobre fondo noche. */
export function GlyphGradient({ id = "volta-glyph" }: { id?: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#e3ff8f" />
        <stop offset=".5" stopColor="#c8ff2e" />
        <stop offset="1" stopColor="#2ee6d6" />
      </linearGradient>
    </defs>
  );
}

/** @deprecated Nombre heredado de Velmar: hoy es el degradé eléctrico de `GlyphGradient`. */
export const GoldGradient = GlyphGradient;

const isShaker = (label: string) => /shaker/i.test(label);
const isSample = (label: string) => /muestra|sachet/i.test(label);
const isGift = (label: string) => /regalo/i.test(label);

/** Ícono según el tipo de premio o cupón (y su nombre, para las muestras y los productos de regalo). */
export function glyphFor(kind: CouponKind, label = ""): GlyphKind {
  if (kind === "FREE_SHIPPING") return "truck";
  if (kind === "PERCENT") return "percent";
  if (isShaker(label)) return "shaker";
  if (isSample(label)) return "sample";
  if (isGift(label)) return "gift";
  return "coin";
}

/** Valor corto para el talón del cupón o el gajo de la ruleta. */
export function shortValue(kind: CouponKind, value: number, label = ""): string {
  if (kind === "FREE_SHIPPING") return "Envío";
  if (kind === "PERCENT") return `${value}%`;
  if (isShaker(label)) return "Shaker";
  if (isSample(label)) return "Muestra";
  if (isGift(label)) return "Regalo";
  return `$${value.toLocaleString("es-AR")}`;
}
