import { motion } from "motion/react";
import { brand } from "@/config/brand";

/** Lienzo del estante (800 × 400): cuatro lugares de 200 de ancho y el piso de la repisa en y = 312. */
export const SHELF_W = 800;
export const FLOOR = 312;
export const BAY_X = [100, 300, 500, 700] as const;

/** IDs propios de cada estante (useId): puede haber más de uno en la página y ninguno depende del otro. */
export function shelfIds(uid: string) {
  const id = (name: string) => `shelf-${uid}-${name}`;
  return { wall: id("wall"), dots: id("dots"), plasma: id("plasma"), cone: id("cone"), plank: id("plank"), edge: id("edge"), spill: id("spill"), pool: id("pool"), pulse: id("pulse"), led: id("led") };
}
export type ShelfIds = ReturnType<typeof shelfIds>;

export function ShelfDefs({ ids }: { ids: ShelfIds }) {
  return (
    <defs>
      <linearGradient id={ids.wall} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#171c26" /><stop offset=".72" stopColor="#0c0f15" /><stop offset="1" stopColor="#06080b" />
      </linearGradient>
      <pattern id={ids.dots} width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="#fff" opacity=".09" /></pattern>
      <radialGradient id={ids.plasma} cx=".5" cy=".82" r=".62">
        <stop offset="0" stopColor={brand.signature.plasma} stopOpacity=".34" /><stop offset=".6" stopColor={brand.signature.plasma} stopOpacity=".07" /><stop offset="1" stopColor={brand.signature.plasma} stopOpacity="0" />
      </radialGradient>
      {/* Cono de luz de cada lugar: blanco voltio arriba, se apaga antes de la repisa. */}
      <radialGradient id={ids.cone} cx=".5" cy="0" r="1.15" gradientTransform="matrix(.55 0 0 1 .225 0)">
        <stop offset="0" stopColor={brand.signature.voltSoft} stopOpacity=".5" /><stop offset=".45" stopColor={brand.signature.volt} stopOpacity=".14" /><stop offset="1" stopColor={brand.signature.volt} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={ids.led} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={brand.signature.volt} stopOpacity=".3" /><stop offset="1" stopColor={brand.signature.volt} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={ids.plank} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#262d39" /><stop offset="1" stopColor="#151a22" />
      </linearGradient>
      <linearGradient id={ids.edge} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={brand.signature.plasma} /><stop offset=".5" stopColor={brand.signature.volt} /><stop offset="1" stopColor={brand.signature.ion} />
      </linearGradient>
      <linearGradient id={ids.spill} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={brand.signature.volt} stopOpacity=".2" /><stop offset=".35" stopColor={brand.signature.plasma} stopOpacity=".1" /><stop offset="1" stopColor={brand.signature.plasma} stopOpacity="0" />
      </linearGradient>
      <radialGradient id={ids.pool} cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor={brand.signature.voltSoft} stopOpacity=".7" /><stop offset=".5" stopColor={brand.signature.volt} stopOpacity=".22" /><stop offset="1" stopColor={brand.signature.volt} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={ids.pulse} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#f6ffd6" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

/** Parante del rack de sentadillas: acero con agujeros cada 22 unidades y un gancho J a la altura de la repisa. */
function RackUpright({ x, flip }: { x: number; flip?: boolean }) {
  const hook = flip ? `M${x} 290h-16v-14h-6v24h22Z` : `M${x + 22} 290h16v-14h6v24h-22Z`;
  return (
    <g>
      <rect x={x} y="6" width="22" height="394" fill="url(#rk-steel)" />
      <rect x={x} y="6" width="1.5" height="394" fill="#fff" opacity=".14" />
      <path d={`M${x + 11} 40V392`} stroke="#07080a" strokeWidth="7" strokeDasharray="9 13" />
      <path d={hook} fill="#3a4047" />
    </g>
  );
}

/**
 * Fondo del rack: pared con grilla de puntos y halo plasma, dos parantes con agujeros y ganchos, el travesaño de
 * arriba (barra de dominadas) y la tira de LED que ilumina los cuatro lugares.
 */
export function ShelfBackdrop({ ids }: { ids: ShelfIds }) {
  return (
    <g aria-hidden="true">
      <rect width={SHELF_W} height="400" fill={`url(#${ids.wall})`} />
      <rect width={SHELF_W} height={FLOOR} fill={`url(#${ids.dots})`} />
      <rect width={SHELF_W} height="400" fill={`url(#${ids.plasma})`} />
      <g stroke="#fff" strokeOpacity=".05">{[200, 400, 600].map((x) => <path key={x} d={`M${x} 40V302`} />)}</g>
      <rect x="24" y="30" width="752" height="80" fill={`url(#${ids.led})`} opacity=".5" />
      <RackUpright x={2} />
      <RackUpright x={776} flip />
      <rect x="2" y="8" width="796" height="16" fill="url(#rk-steel)" />
      <path d="M2 12H798" stroke="#fff" strokeOpacity=".16" strokeWidth="1.2" strokeDasharray="2 3" />
      <rect x="24" y="24" width="752" height="4" fill={brand.signature.volt} opacity=".85" />
      <rect x="24" y="24" width="752" height="1.4" fill="#f6ffd6" opacity=".9" />
    </g>
  );
}

/**
 * Repisa de vidrio oscuro con filo de neón. Con el descuento stack el filo se enciende en voltio y un pulso lo recorre
 * una vez (sin bucles; con "reducir movimiento", solo se enciende).
 */
export function ShelfPlank({ ids, complete, reduce }: { ids: ShelfIds; complete: boolean; reduce: boolean }) {
  return (
    <g aria-hidden="true">
      <rect x="4" y="334" width="792" height="66" fill={`url(#${ids.spill})`} />
      {[70, 730].map((x) => <path key={x} d={`M${x - 12} 334h24l-7 30h-10Z`} fill="#1a1f28" />)}
      <path d="M20 302H780L796 318H4Z" fill={`url(#${ids.plank})`} />
      <path d="M22 303H778" stroke="#fff" strokeOpacity=".12" />
      <rect x="4" y="318" width="792" height="16" fill="#0b0e13" />
      <rect x="4" y="318" width="792" height="2.5" fill={`url(#${ids.edge})`} opacity=".55" />
      <motion.g initial={false} animate={{ opacity: complete ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.5 }}>
        <rect x="4" y="310" width="792" height="18" fill={`url(#${ids.led})`} opacity=".9" transform="rotate(180 400 319)" />
        <rect x="4" y="318" width="792" height="3" fill={brand.signature.volt} />
        <rect x="4" y="321" width="792" height="22" fill={`url(#${ids.led})`} />
      </motion.g>
      {complete && !reduce && (
        <motion.rect y="315" width="160" height="9" rx="4.5" fill={`url(#${ids.pulse})`}
          initial={{ x: -170, opacity: 1 }} animate={{ x: SHELF_W + 10, opacity: [1, 1, 0] }} transition={{ duration: 1.1, ease: [0.45, 0, 0.2, 1] }} />
      )}
    </g>
  );
}
