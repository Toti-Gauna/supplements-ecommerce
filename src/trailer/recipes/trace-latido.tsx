import { FRAME, lineY } from "../core/grid";
import type { Ratio } from "../core/types";
import type { CSSProperties } from "react";
import { gsap } from "../engine/gsap";
import type { SceneCtx } from "../engine/recipe";
import { TR, displaySize, splitChars } from "./kit";
import { Grid, HAIR, TPL } from "./tpl";

const STAGE_W = { "16x9": 1920, "9x16": 1080 } as const;
const STAGE_H = { "16x9": 1080, "9x16": 1920 } as const;
/** La grilla volt queda al 14 %: un fondo, no una capa de líneas. */
const GRID_VOLT = 0.14;
const FLAT = "900,0 930,0 952,0 975,0 998,0 1020,0", SPIKE = "900,0 930,0 952,-120 975,40 998,0 1020,0";
const pts = (s: string, y: number) => s.split(" ").map((p) => { const [x, dy] = p.split(","); return `${x},${y + Number(dy)}`; }).join(" ");

/**
 * "La tuya, no." (28–30): la línea plana late (un pico), se vuelve volt desde el pico hacia los bordes y se abre como un
 * diafragma en un marco 4:3 donde va a vivir la pantalla de carga. El fondo y la grilla pasan de gris a la noche de la tienda.
 */
export function LatidoView({ ratio, text }: { ratio: Ratio; text: string[] }) {
  const f = FRAME[ratio], y = lineY(ratio), W = STAGE_W[ratio], H = STAGE_H[ratio], tall = ratio === "9x16";
  const seg = (x: number, w: number, top = y): CSSProperties => ({ left: x, width: w, top: top - HAIR / 2, height: HAIR });
  const volt = TR.volt;
  return (
    <>
      <div data-t="bg-night" className="absolute inset-0" style={{ background: TR.night }} />
      <Grid ratio={ratio} color={TPL.grid} tag="grid-gray" />
      <Grid ratio={ratio} color={volt} opacity={GRID_VOLT} tag="grid-volt" />
      <div data-t="gray" className="absolute" style={{ ...seg(0, W), background: TPL.ink }} />
      <div data-t="volt-l" className="absolute" style={{ ...seg(0, W / 2), background: volt, transformOrigin: "100% 50%" }} />
      <div data-t="volt-r" className="absolute" style={{ ...seg(W / 2, W / 2), background: volt, transformOrigin: "0 50%" }} />
      <svg aria-hidden="true" className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`}><polyline data-t="pulse" points={pts(FLAT, y)} fill="none" stroke={volt} strokeWidth={HAIR} strokeLinejoin="round" /></svg>
      <div data-t="seg-l" className="absolute" style={{ ...seg(0, f.x), background: volt, transformOrigin: "100% 50%" }} />
      <div data-t="seg-r" className="absolute" style={{ ...seg(f.x + f.w, W - f.x - f.w), background: volt, transformOrigin: "0 50%" }} />
      <div data-t="seg-top" className="absolute" style={{ ...seg(f.x, f.w), background: volt }} />
      <div data-t="seg-bot" className="absolute" style={{ ...seg(f.x, f.w), background: volt }} />
      <div data-t="side-l" className="absolute" style={{ left: f.x, top: f.y, width: HAIR, height: f.h, background: volt }} />
      <div data-t="side-r" className="absolute" style={{ left: f.x + f.w - HAIR, top: f.y, width: HAIR, height: f.h, background: volt }} />
      <p data-t="super" className="font-display absolute uppercase leading-[0.86]" style={{ left: tall ? 60 : 96, top: tall ? f.y + f.h + 110 : 388, fontSize: displaySize(ratio, 150, 150), color: TR.onNight }}>
        {text.map((line, i) => <span key={i} data-t="line" className="block" style={i === text.length - 1 ? { color: volt } : undefined}>{line}</span>)}
      </p>
    </>
  );
}

export function buildLatido({ q, beat, reduced, ratio }: SceneCtx<object>) {
  const tl = gsap.timeline();
  const one = (s: string) => q(`[data-t="${s}"]`);
  const f = FRAME[ratio], y = lineY(ratio), B = beat;
  const scratch = [...one("gray"), ...one("volt-l"), ...one("volt-r"), ...one("pulse"), ...one("seg-l"), ...one("seg-r")];
  const chars = splitChars(one("line"));
  if (reduced) {
    tl.set([...scratch, ...one("grid-gray")], { autoAlpha: 0 }, 0);
    tl.fromTo([...one("bg-night"), ...one("seg-top"), ...one("seg-bot"), ...one("side-l"), ...one("side-r"), ...one("super")], { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 4 }, 0);
    tl.fromTo(one("grid-volt"), { autoAlpha: 0 }, { autoAlpha: GRID_VOLT, duration: B / 4 }, 0);
    tl.set(one("seg-top"), { y: f.y - y }, 0); // el marco ya abierto: las dos rayas arriba y abajo, los laterales a la vista
    tl.set(one("seg-bot"), { y: f.y + f.h - y }, 0);
    return tl;
  }
  tl.set([...one("volt-l"), ...one("volt-r")], { scaleX: 0 }, 0);
  tl.set([...one("seg-l"), ...one("seg-r"), ...one("seg-top"), ...one("seg-bot"), ...one("side-l"), ...one("side-r")], { autoAlpha: 0 }, 0);
  tl.set([...one("side-l"), ...one("side-r")], { scaleY: 0 }, 0);
  // Fondo y grilla pasan de gris a la noche de la tienda.
  tl.fromTo(one("bg-night"), { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 4, ease: "none" }, 0);
  tl.fromTo(one("grid-volt"), { autoAlpha: 0 }, { autoAlpha: GRID_VOLT, duration: B / 4, ease: "none" }, 0);
  tl.to(one("grid-gray"), { autoAlpha: 0, duration: B / 4, ease: "none", immediateRender: false }, 0);
  // El latido: sube a −120, baja a +40 y vuelve; el volt corre desde el pico hasta los dos bordes (llega en 0,5 tiempos).
  tl.set(one("pulse"), { autoAlpha: 0 }, 0);
  tl.set(one("pulse"), { autoAlpha: 1 }, 0.002);
  tl.fromTo(one("pulse"), { attr: { points: pts(FLAT, y) } }, { attr: { points: pts(SPIKE, y) }, duration: B / 4, ease: "power4.out" }, 0);
  tl.to(one("pulse"), { attr: { points: pts(FLAT, y) }, duration: B / 4, ease: "power2.inOut", immediateRender: false }, B / 4);
  tl.to([...one("volt-l"), ...one("volt-r")], { scaleX: 1, duration: B / 2, ease: "power2.out", immediateRender: false }, 0);
  tl.fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: B / 2, stagger: 0.02, ease: "trl.expo" }, 0);
  // Diafragma: el tramo del marco se parte en dos rayas que viajan arriba y abajo mientras se dibujan los laterales.
  const open = 0.5 * B, span = B;
  tl.set([...one("gray"), ...one("volt-l"), ...one("volt-r"), ...one("pulse")], { autoAlpha: 0 }, open);
  tl.set([...one("seg-l"), ...one("seg-r"), ...one("seg-top"), ...one("seg-bot"), ...one("side-l"), ...one("side-r")], { autoAlpha: 1 }, open);
  tl.fromTo(one("seg-top"), { y: 0 }, { y: f.y - y, duration: span, ease: "power3.inOut", immediateRender: false }, open);
  tl.fromTo(one("seg-bot"), { y: 0 }, { y: f.y + f.h - y, duration: span, ease: "power3.inOut", immediateRender: false }, open);
  tl.fromTo([...one("side-l"), ...one("side-r")], { scaleY: 0 }, { scaleY: 1, duration: span, ease: "power3.inOut", immediateRender: false }, open);
  tl.fromTo([...one("seg-l"), ...one("seg-r")], { scaleX: 1 }, { scaleX: 0, duration: span, ease: "power3.inOut", immediateRender: false }, open);
  return tl;
}
