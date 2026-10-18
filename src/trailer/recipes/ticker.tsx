import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { Grid, Sup, TPL } from "./tpl";

export interface TickerProps { phrase: string; text: string; rows?: number }

/** Filas de 160 px a −8°; durante 2 tiempos van a 120 px por tiempo, aceleran 1,5 tiempos (hasta ×4) y se congelan en seco. */
const ROW = 160, TILT = -8, CRUISE = 120, FREEZE = 3.5;
const D_CRUISE = CRUISE * 2, D_ACCEL = 180 * 2; // px del tramo constante (2 tiempos) y del que acelera (1,5 tiempos): 120·(1,5v + 1,5v³)
const TOTAL = D_CRUISE + D_ACCEL;
/** Avance (0–1) en función del avance del tiempo (0–1 sobre 3,5 tiempos): constante, después acelerado, sin sobrepasar. */
export const tickerEase = (p: number) => {
  const u = p * FREEZE;
  if (u <= 2) return (CRUISE * u) / TOTAL;
  const v = (u - 2) / 1.5;
  return (D_CRUISE + 180 * (v + v ** 3)) / TOTAL;
};

/**
 * Filas inclinadas de una frase que repiten "todas las tiendas dicen lo mismo" (de `ticker` de kinetic-studio):
 * alternan de sentido, aceleran y se congelan. El avance sale de una sola curva: saltar a cualquier segundo da el mismo cuadro.
 */
export const ticker = defineRecipe<TickerProps>({
  id: "ticker",
  Component: ({ props, ratio }) => {
    const rows = props.rows ?? 7;
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: TPL.bg }}>
        <Grid ratio={ratio} color={TPL.grid} />
        <div data-t="all" className="absolute inset-0">
          <div className="absolute" style={{ left: "50%", top: "50%", transform: `rotate(${TILT}deg)` }}>
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} data-t="row" data-dir={i % 2 ? 1 : -1} className="absolute whitespace-nowrap font-sans font-semibold leading-none"
                style={{ left: -5200, width: 10400, top: (i - rows / 2) * ROW, fontSize: 150, color: TPL.card }}>{`${props.phrase} · `.repeat(14)}</div>
            ))}
          </div>
        </div>
        <Sup text={props.text} ratio={ratio} />
      </div>
    );
  },
  build: ({ q, beat, reduced }) => {
    const tl = gsap.timeline();
    const rows = q('[data-t="row"]');
    if (reduced) {
      rows.forEach((r) => tl.set(r, { x: Number(r.dataset.dir) * TOTAL }, 0));
      tl.fromTo(q('[data-t="all"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: beat / 4 }, 0);
      return tl;
    }
    rows.forEach((r) => tl.fromTo(r, { x: 0 }, { x: Number(r.dataset.dir) * TOTAL, duration: FREEZE * beat, ease: tickerEase }, 0));
    return tl;
  },
});
