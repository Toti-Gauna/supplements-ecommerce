import { hash01 } from "../core/grid";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { Grid, Pote, StoreDefs, Sup, TPL } from "./tpl";

export interface ClonesProps { variant: "tienda" | "catalogo"; text: string }

/** Tienda de 1440 × 810 en un mundo de 8 × 8 copias con paso de 1488 × 858; cada etapa suma un anillo (1 → 4 → 16 → 64). */
const PX = 1488, PY = 858, SYMBOL = "clon-tienda";
const RING_OF = (c: number, r: number) => { const m = Math.max(c, r); return m < 1 ? 0 : m < 2 ? 1 : m < 4 ? 2 : 3; };
const SIDE = [1, 2, 4, 8];
/** Escala de la cámara por etapa (la mitad cada vez) y centro del escenario según el formato. */
const SCALE = { "16x9": 1.2, "9x16": 0.7 } as const;
const CENTER = { "16x9": [960, 540], "9x16": [540, 960] } as const;

/** Catálogo: 7 columnas × 12 filas de potes iguales; la cinta sube y frena para que un pote quede justo en el centro. */
const COLS = 7, ROWS = 12, POT_X = 260, POT_Y = 330, POT_Y0 = 101.25, SCROLL_FAST = 2475, BRAKE = 56.25;
const CENTER_ROW = 9, CENTER_COL = 3;
/** Cuánto sube la cinta en total: con él, el pote de la fila 9 queda en el centro (101,25 + 9 × 330 − 2531,25 = 540). */
export const BELT_END = SCROLL_FAST + BRAKE;
/** Avance (0–1) de la cinta en 3 tiempos: 900 px por tiempo hasta 2,75 y el último cuarto frena con `power4.out`. */
export const beltEase = (p: number) => {
  const u = p * 3;
  return (u <= 2.75 ? 900 * u : SCROLL_FAST + BRAKE * (1 - (1 - (u - 2.75) / 0.25) ** 4)) / BELT_END;
};
export const beltPotCenter = (row: number) => POT_Y0 + row * POT_Y - BELT_END;
export const BELT_CENTER_ROW = CENTER_ROW;

export const clones = defineRecipe<ClonesProps>({
  id: "clones",
  Component: ({ props, ratio }) => {
    const [cx, cy] = CENTER[ratio];
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: TPL.bg }}>
        <Grid ratio={ratio} color={TPL.grid} />
        <div data-t="all" className="absolute inset-0">
          {props.variant === "tienda" ? (
            <>
              <StoreDefs id={SYMBOL} />
              <div data-t="world" className="absolute left-0 top-0" style={{ width: PX * 8, height: PY * 8, transformOrigin: "0 0" }}>
                {Array.from({ length: 64 }, (_, i) => {
                  const c = i % 8, r = Math.floor(i / 8), ring = RING_OF(c, r);
                  const dx = ring === 0 ? 0 : (hash01(i, 1) - 0.5) * 12, dy = ring === 0 ? 0 : (hash01(i, 2) - 0.5) * 12, rot = ring === 0 ? 0 : (hash01(i, 3) - 0.5) * 3;
                  return (
                    <svg key={i} data-t="tile" data-ring={ring} className="absolute" width={1440} height={810} viewBox="0 0 1440 810"
                      style={{ left: c * PX, top: r * PY, transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}><use href={`#${SYMBOL}`} /></svg>
                  );
                })}
              </div>
            </>
          ) : (
            <div data-t="belt" className="absolute left-0 top-0" style={{ width: 1920, height: POT_Y0 + ROWS * POT_Y }}>
              {Array.from({ length: COLS * ROWS }, (_, i) => {
                const c = i % COLS, r = Math.floor(i / COLS);
                return <Pote key={i} style={{ left: cx + (c - CENTER_COL) * POT_X - 90, top: cy - 540 + POT_Y0 + r * POT_Y - 120 }} />;
              })}
            </div>
          )}
        </div>
        <Sup text={props.text} ratio={ratio} />
      </div>
    );
  },
  build: ({ q, props, ratio, beat, reduced }) => {
    const tl = gsap.timeline();
    const all = q('[data-t="all"]');
    if (props.variant === "tienda") {
      const world = q('[data-t="world"]');
      const [cx, cy] = CENTER[ratio];
      const cam = (stage: number) => {
        const n = SIDE[stage]!, s = SCALE[ratio] / 2 ** stage;
        return { x: cx - (((n - 1) * PX) / 2 + 720) * s, y: cy - (((n - 1) * PY) / 2 + 405) * s, scale: s };
      };
      if (reduced) {
        tl.set(world, cam(3), 0);
        tl.fromTo(all, { autoAlpha: 0 }, { autoAlpha: 1, duration: beat / 4 }, 0);
        return tl;
      }
      tl.set(world, cam(0), 0);
      for (const ring of [1, 2, 3]) {
        const t = ring * beat;
        tl.set(q(`[data-ring="${ring}"]`), { autoAlpha: 0 }, 0);
        tl.set(q(`[data-ring="${ring}"]`), { autoAlpha: 1 }, t);
        tl.fromTo(world, cam(ring - 1), { ...cam(ring), duration: beat / 4, ease: "trl.expo", immediateRender: false }, t);
      }
      return tl;
    }
    // Catálogo: la cinta sube a 900 px por tiempo y frena en el tiempo 3 (`power4.out`); en 3,5 queda solo el pote central.
    const belt = q('[data-t="belt"]');
    const pots = q('[data-t="pot"]');
    const others = pots.filter((_, i) => i !== CENTER_ROW * COLS + CENTER_COL);
    if (reduced) {
      tl.set(belt, { y: -BELT_END }, 0);
      tl.set(others, { autoAlpha: 0 }, 0);
      tl.fromTo(all, { autoAlpha: 0 }, { autoAlpha: 1, duration: beat / 4 }, 0);
      return tl;
    }
    tl.fromTo(belt, { y: 0 }, { y: -BELT_END, duration: 3 * beat, ease: beltEase }, 0);
    tl.to(others, { autoAlpha: 0, duration: beat / 8, ease: "none" }, 3.5 * beat);
    return tl;
  },
});
