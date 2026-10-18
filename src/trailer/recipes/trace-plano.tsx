import { lineY } from "../core/grid";
import type { Ratio } from "../core/types";
import { gsap } from "../engine/gsap";
import type { SceneCtx } from "../engine/recipe";
import { Pote, TPL, HAIR } from "./tpl";

/** Cuadro del cursor de plantilla: una flecha gris chica. */
const CURSOR = "M0 0 L0 34 L9 26 L15 40 L22 37 L16 24 L28 23 Z";
const STAGE_W = { "16x9": 1920, "9x16": 1080 } as const;
const STAGE_H = { "16x9": 1080, "9x16": 1920 } as const;

/**
 * "Y después de comprar, nada" (24–28): un click en un botón gris sin texto, el pote cae en una caja que se cierra,
 * la caja se va por la derecha y queda una línea plana. Todo en coordenadas del centro del escenario.
 */
export function PlanoView({ ratio }: { ratio: Ratio }) {
  const cx = STAGE_W[ratio] / 2, cy = STAGE_H[ratio] / 2;
  const flap = { top: cy + 72, height: 16, width: 180, background: TPL.ink } as const;
  return (
    <>
      <div data-t="group" className="absolute inset-0">
        <div data-t="box" className="absolute inset-0" style={{ zIndex: 1 }}>
          <div className="absolute" style={{ left: cx - 180, top: cy + 80, width: 360, height: 330, background: TPL.grid }} />
        </div>
        <div data-t="potwrap" className="absolute inset-0" style={{ zIndex: 2 }}>
          <Pote style={{ left: cx - 90, top: cy - 120 }} />
        </div>
        <div data-t="box" className="absolute inset-0" style={{ zIndex: 3 }}>
          <div className="absolute" style={{ left: cx - 180, top: cy + 80, width: 360, height: 330, background: TPL.bar, borderTop: `${HAIR}px solid ${TPL.ink}` }} />
          <div data-t="flap-l" className="absolute" style={{ ...flap, left: cx - 180, transformOrigin: "0 50%" }} />
          <div data-t="flap-r" className="absolute" style={{ ...flap, left: cx, transformOrigin: "100% 50%" }} />
        </div>
      </div>
      <div data-t="button" className="absolute flex items-center justify-center rounded-xl font-sans text-[28px] font-semibold" style={{ left: cx - 160, top: cy + 188, width: 320, height: 64, background: TPL.card, color: TPL.bg }}>COMPRAR</div>
      <svg data-t="cursor" aria-hidden="true" className="absolute left-0 top-0" width={30} height={42} viewBox="0 0 30 42"><path d={CURSOR} fill={TPL.text} stroke={TPL.bg} strokeWidth={2} /></svg>
      <div data-t="line" className="absolute left-0" style={{ top: lineY(ratio) - HAIR / 2, width: STAGE_W[ratio], height: HAIR, background: TPL.ink }} />
    </>
  );
}

export function buildPlano({ q, beat, reduced, ratio }: SceneCtx<object>) {
  const tl = gsap.timeline();
  const one = (s: string) => q(`[data-t="${s}"]`);
  const gone = [...one("potwrap"), ...one("box"), ...one("button"), ...one("cursor")];
  if (reduced) { tl.set(gone, { autoAlpha: 0 }, 0); return tl; }
  const cx = STAGE_W[ratio] / 2, cy = STAGE_H[ratio] / 2, B = beat;
  tl.set(one("line"), { scaleX: 0 }, 0);
  tl.set(one("box"), { y: 760 }, 0);
  tl.set(one("flap-l"), { rotate: -90 }, 0);
  tl.set(one("flap-r"), { rotate: 90 }, 0);
  // El cursor llega al botón, aprieta y los dos se van.
  tl.fromTo(one("cursor"), { x: cx + 340, y: cy + 360 }, { x: cx + 30, y: cy + 235, duration: B, ease: "power2.out" }, 0);
  tl.to(one("button"), { y: 2, duration: 0.1, ease: "power1.out", immediateRender: false }, B);
  tl.to(one("cursor"), { scale: 0.88, duration: 0.1, immediateRender: false }, B);
  tl.to([...one("button"), ...one("cursor")], { autoAlpha: 0, duration: 0.08, ease: "none", immediateRender: false }, 1.25 * B);
  // La caja sube, el pote cae adentro (aterriza en el tiempo 2) y las tapas se cierran en un cuarto de tiempo.
  tl.to(one("box"), { y: 0, duration: 0.5 * B, ease: "trl.expo", immediateRender: false }, B);
  tl.to(one("potwrap"), { y: 230, duration: 0.5 * B, ease: "power2.in", immediateRender: false }, 1.5 * B);
  tl.to([...one("flap-l"), ...one("flap-r")], { rotate: 0, duration: 0.25 * B, ease: "power2.out", immediateRender: false }, 2 * B);
  // La caja se va por la derecha (expo.in) y la línea se estira desde el centro hasta los dos bordes.
  tl.to(one("group"), { x: 1400, duration: 0.5 * B, ease: "expo.in", immediateRender: false }, 2.5 * B);
  tl.to(one("line"), { scaleX: 1, duration: 0.5 * B, ease: "power2.out", immediateRender: false }, 2.5 * B);
  return tl;
}
