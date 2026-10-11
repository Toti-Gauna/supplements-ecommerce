import type { ReactNode } from "react";
import { VoltaPup } from "@/components/illustrations/characters";
import { Decor, type DecorKind } from "@/components/illustrations/seasonal/Decor";
import type { SeasonId } from "@/demo/types";
import { skinOf } from "@/features/themes/skins";

/** Quién lleva el pedido por el recorrido: lo que se dibuja, cómo se nombra y qué estalla al llegar. */
export interface Traveler {
  node: ReactNode;
  label: string;
  /** Vuela (se mece arriba y abajo) en lugar de caminar o saltar. */
  motion: "fly" | "walk" | "hop" | "bob";
  burst: DecorKind[];
}

/** Papá Noel en su trineo, con un reno adelante (mira hacia tu casa). */
function Sleigh() {
  return (
    <svg viewBox="0 0 132 64" className="h-full w-full overflow-visible" aria-hidden="true">
      <path d="M78 34 102 26" stroke="#c9a77a" strokeWidth="1.6" />
      <g transform="translate(96 14)">
        <path d="M14 4c2-5 6-6 8-3M18 6c4-3 8-2 8 2M11 4c-1-5-5-6-7-3" fill="none" stroke="#7a5230" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="6" cy="22" rx="14" ry="7" fill="#9a6a3c" />
        <circle cx="19" cy="12" r="6.5" fill="#a8743f" /><circle cx="25" cy="13" r="2.4" fill="#e04848" />
        <circle cx="18" cy="10" r="1.1" fill="#2a1a0f" />
        <path d="M-4 27l-3 10M2 28l-1 10M10 28l2 10M16 26l4 10" stroke="#7a5230" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <path d="M8 52c10 6 52 6 70-2" fill="none" stroke="#e9c27a" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 32h58c4 0 8 4 8 9v1c0 5-5 8-11 8H22C14 50 8 43 10 32z" fill="#c8343c" />
      <path d="M12 34h56" stroke="#f3c84c" strokeWidth="2" />
      <circle cx="40" cy="22" r="11" fill="#d23d3d" />
      <circle cx="44" cy="14" r="6.5" fill="#f2c9a7" />
      <path d="M38 16c2 8 10 8 12 0-2 2-10 2-12 0z" fill="#fff" />
      <path d="M38 11c2-8 10-9 14-3l-3 1c-3-3-7-2-9 2z" fill="#d23d3d" /><circle cx="53" cy="9" r="2.4" fill="#fff" />
      <rect x="22" y="22" width="12" height="10" rx="2" fill="#3f7fb5" /><path d="M28 22v10" stroke="#f3c84c" strokeWidth="1.6" />
    </svg>
  );
}

/** Una bruja en su escoba (mira hacia tu casa). */
function Witch() {
  return (
    <svg viewBox="0 0 120 64" className="h-full w-full overflow-visible" aria-hidden="true">
      <path d="M6 44 106 34" stroke="#8a5a2b" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M2 40c-4 6-2 12 2 14l14-6c-2-4-8-8-16-8z" fill="#d9a441" />
      <path d="M48 40c2-14 8-20 18-20s14 8 12 18z" fill="#5b2a86" />
      <circle cx="70" cy="18" r="7" fill="#9bd36b" /><circle cx="73" cy="17" r="1.2" fill="#1a1124" />
      <path d="M58 13h26l-4 3H62z" fill="#1a1124" /><path d="M64 13 74-6l6 19z" fill="#1a1124" />
      <path d="M66 10h12" stroke="#ff8a1f" strokeWidth="2" />
      <path d="M60 36l-6 12M70 37l4 11" stroke="#1a1124" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const PATRIAS: SeasonId[] = ["revolucion-de-mayo", "dia-de-la-bandera", "dia-de-la-independencia"];

/**
 * El viajero del seguimiento según la temática (8.2.11). Sale del motor de temáticas: los personajes y
 * decoraciones de cada fecha (`skinOf`), y solo Navidad y Halloween tienen dibujo propio. Sin temática (Original)
 * no hay viajero: queda el punto dorado de siempre.
 */
export function travelerFor(themeId: SeasonId | null): Traveler | null {
  if (!themeId) return null;
  const skin = skinOf(themeId);
  if (themeId === "navidad") return { node: <Sleigh />, label: "Papá Noel en su trineo", motion: "fly", burst: skin.decor };
  if (themeId === "halloween") return { node: <Witch />, label: "una bruja en su escoba", motion: "fly", burst: skin.decor };
  if (skin.cast?.[0]) {
    const c = skin.cast[0];
    return { node: <VoltaPup who={c.who} pose="walk" outfit={c.outfit} animated className="h-full w-full" />, label: c.who === "lola" ? "Lola" : "Pancho", motion: "walk", burst: skin.decor };
  }
  if (themeId === "san-valentin") {
    return {
      node: <span className="relative block h-full w-full"><Decor kind="love-letter" className="h-full w-full" /><span className="trk-hearts" /></span>,
      label: "una carta de amor", motion: "fly", burst: ["heart", "heart", "love-letter"],
    };
  }
  if (themeId === "pascuas") return { node: <Decor kind="easter-egg" className="h-full w-full" />, label: "un huevo de Pascua", motion: "hop", burst: skin.decor };
  if (PATRIAS.includes(themeId)) return { node: <Decor kind="bandera" className="h-full w-full" />, label: "la bandera", motion: "bob", burst: ["escarapela", "star", "escarapela"] };
  return { node: <Decor kind={skin.topper} className="h-full w-full" />, label: "la temática", motion: "bob", burst: skin.decor };
}
