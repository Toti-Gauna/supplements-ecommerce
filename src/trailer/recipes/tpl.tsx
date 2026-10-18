import type { CSSProperties } from "react";
import { colX, gridLines } from "../core/grid";
import type { Ratio } from "../core/types";
import { TR } from "./kit";

/**
 * Piezas comunes de la pieza T1: la tienda "de template" (gris, sin marca ni nombre), la grilla suiza y el super de
 * plantilla. Los grises son a propósito de nadie: son el mundo de las tiendas calcadas, no de la tienda ni de Eclipse.
 */
export const TPL = { bg: "#0b0d0e", grid: "#1c1f22", store: "#15181a", bar: "#2a2e32", panel: "#24282c", card: "#3a3f44", ink: "#5b6066", text: "#9aa0a6" } as const;
/** Trazo fino de la pieza (1 px en el máster; 2 px en el escenario para que sobreviva al MP4). */
export const HAIR = 2;

export function Grid({ ratio, color, opacity = 1, tag = "grid" }: { ratio: Ratio; color: string; opacity?: number; tag?: string }) {
  const { xs, ys } = gridLines(ratio);
  const w = ratio === "16x9" ? 1920 : 1080, h = ratio === "16x9" ? 1080 : 1920;
  return (
    <svg data-t={tag} aria-hidden="true" className="absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity }} fill={color} shapeRendering="crispEdges">
      {xs.map((x) => <rect key={`x${x}`} x={x} y={0} width={1} height={h} />)}
      {ys.map((y) => <rect key={`y${y}`} x={0} y={y} width={w} height={1} />)}
    </svg>
  );
}

/** Super de plantilla: letra de template (sans gris, minúscula de oración) sobre un degradé al pie, en la columna 1. */
export function Sup({ text, ratio }: { text: string; ratio: Ratio }) {
  const tall = ratio === "9x16";
  const style: CSSProperties = { zIndex: 11, left: colX(ratio, 1), bottom: tall ? 140 : 80, fontSize: tall ? 56 : 64, maxWidth: tall ? 960 : 1500, color: TPL.text };
  return (
    <>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0" style={{ height: tall ? 420 : 300, background: `linear-gradient(transparent, ${TPL.bg}f0)`, zIndex: 10 }} />
      <p data-t="sup" className="absolute font-sans leading-none" style={style}>{text}</p>
    </>
  );
}

/** Tienda gris de 1440 × 810: cabecera con un logo-mancha, banner "20 % OFF", cuatro potes lisos y un botón. Va una vez (`<symbol>`) y se copia con `<use>`. */
export function StoreDefs({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" width={0} height={0} className="absolute">
      <symbol id={id} viewBox="0 0 1440 810">
        <rect width={1440} height={810} fill={TPL.store} />
        <rect width={1440} height={72} fill={TPL.bar} />
        <rect x={40} y={22} width={120} height={28} rx={6} fill={TPL.card} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={560 + i * 130} y={28} width={96} height={16} rx={8} fill={TPL.card} />)}
        <rect x={40} y={110} width={1360} height={300} fill={TPL.panel} />
        <text x={120} y={300} fontSize={140} fontWeight={600} fill={TPL.ink} fontFamily="inherit">20 % OFF</text>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={140 + i * 320} y={440} width={200} height={250} rx={30} fill={TPL.card} />
            <rect x={140 + i * 320} y={416} width={200} height={34} rx={8} fill={TPL.bar} />
            <rect x={170 + i * 320} y={712} width={140} height={20} fill={TPL.bar} />
          </g>
        ))}
        <rect x={1060} y={740} width={320} height={44} rx={8} fill={TPL.card} />
      </symbol>
    </svg>
  );
}

/** Pote liso de la tienda genérica (sin etiqueta ni rayo), en HTML para poder moverlo en bloque. */
export function Pote({ style }: { style: CSSProperties }) {
  return (
    <div data-t="pot" className="absolute" style={{ width: 180, height: 240, borderRadius: "26px 26px 10px 10px", background: TPL.card, ...style }}>
      <div className="absolute inset-x-0" style={{ top: -24, height: 30, borderRadius: 8, background: TPL.bar }} />
      <div className="absolute" style={{ left: 30, right: 30, bottom: -44, height: 18, background: TPL.bar }} />
    </div>
  );
}

/** Rótulo de la ráfaga ("01 · Pantallas de carga por fecha"): mono de la tienda en un chip de noche, con su raya de 1 px. */
export function Chip({ n, text, bottom = false, light = false }: { n: string; text: string; bottom?: boolean; light?: boolean }) {
  const pos: CSSProperties = bottom ? { left: 96, bottom: 60 } : { left: 96, top: 60 };
  return (
    <div data-t="chip" className="absolute font-mono uppercase" style={{ ...pos, zIndex: 20, padding: "14px 22px 18px", fontSize: 34, letterSpacing: "0.12em", fontWeight: 500,
      background: light ? TR.paper : TR.night, color: light ? TR.ink : TR.onNight, opacity: 0.94 }}>
      <b style={{ color: light ? TR.ink : TR.volt, fontWeight: 600 }}>{n}</b> · {text}
      <span data-t="chip-rule" className="absolute" style={{ left: 22, right: 22, bottom: 8, height: HAIR, background: light ? TR.ink : TR.volt, transformOrigin: "0 50%" }} />
    </div>
  );
}
