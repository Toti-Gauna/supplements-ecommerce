import type { ReactNode } from "react";
import { brand } from "@/config/brand";

/** Una rueda de bici con rayos (vista de costado). */
function Wheel({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 54)`}>
      <circle r="12" fill="none" stroke="#0b0e13" strokeWidth="3.6" />
      <circle r="12" fill="none" stroke="#9aa3ad" strokeWidth="1" />
      <path d="M0-10V10M-10 0H10M-7-7 7 7M-7 7 7-7" stroke="#9aa3ad" strokeWidth=".7" />
      <circle r="2" fill="#d9dee5" />
    </g>
  );
}

/**
 * El cadete de VOLTA en bici con la caja de envíos (mira hacia tu casa). La campera toma el color de la temática y el
 * adorno de la fecha (gorro, cuernitos, flor…) va arriba del casco, dentro de la caja del dibujo: el recorrido del
 * seguimiento recorta lo que se sale por arriba.
 */
export function Courier({ jacket, helmet, hat }: { jacket: string; helmet: string; hat?: ReactNode }) {
  return (
    <span className="relative block h-full w-full">
      <svg viewBox="0 -20 96 88" className="h-full w-full overflow-visible" aria-hidden="true">
        <Wheel x={20} /><Wheel x={76} />
        <path d="M20 54 38 33h28L44 54zM38 33l6 21M66 30l10 24" fill="none" stroke={brand.signature.volt} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M33 31h9M63 29h7" stroke="#1a1f27" strokeWidth="3" strokeLinecap="round" />
        <circle cx="44" cy="54" r="3.4" fill="#1a1f27" />
        <path d="M38 27 51 37 46 52M38 27 49 33 54 46" fill="none" stroke="#1a1f27" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38 27 58 13" stroke={jacket} strokeWidth="10" strokeLinecap="round" />
        <path d="M58 15 67 29" stroke={jacket} strokeWidth="4.6" strokeLinecap="round" />
        <circle cx="65" cy="8.5" r="5.6" fill="#f0c8a8" />
        <path d="M58.5 8a6.8 6.8 0 0 1 13.4-1.6L73 9H58.5z" fill={helmet} />
        <g transform="rotate(-10 34 15)">
          <rect x="22" y="4" width="22" height="21" rx="3" fill="#0b0e13" stroke={brand.signature.volt} strokeWidth="1.4" />
          <path d="M33.6 7.5h5.2l-4 6.7h2.2l-8.6 9.3 2.6-7h-1.9z" fill={brand.signature.volt} />
        </g>
      </svg>
      {hat && <span className="absolute left-[57%] top-0 block h-[30%] w-[24%] rotate-[10deg]">{hat}</span>}
    </span>
  );
}
