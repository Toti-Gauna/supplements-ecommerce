import { tutienda } from "@/config/brands/tutienda";
import { logoPaths, LOGO_VIEWBOX } from "@/config/logo";
import { AXIS_Y, colEnd } from "../core/grid";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { DisplayLines } from "./device";
import { TR, splitChars } from "./kit";
import { Grid, HAIR } from "./tpl";

export interface StackProps { lines: string[] }

const MARK_H = 64, GRID_VOLT = 0.14;

/** La marca real de la tienda (el rayo de su ficha y su nombre) a 64 px de alto, alineada a la derecha de la columna 12. */
function ShopMark({ ratio }: { ratio: "16x9" | "9x16" }) {
  const { bolt, stroke } = logoPaths(tutienda);
  return (
    <div data-t="mark" className="absolute flex items-center" style={{ right: (ratio === "16x9" ? 1920 : 1080) - colEnd(ratio, ratio === "16x9" ? 12 : 6), top: ratio === "16x9" ? 900 : AXIS_Y[ratio] + 40, height: MARK_H, gap: 12 }}>
      <svg viewBox={LOGO_VIEWBOX} aria-hidden="true" height={MARK_H} width={MARK_H}>
        {stroke && <path d={stroke} fill={TR.onNight} />}
        <path d={bolt} fill={TR.volt} />
      </svg>
      <span className="font-display uppercase leading-none" style={{ fontSize: 50, color: TR.onNight }}>{tutienda.name}</span>
    </div>
  );
}

/**
 * 16 · La promesa (64–68): "Para que la tuya venda más." entra renglón por renglón con máscara sobre la grilla volt, la
 * cámara empuja un 3 % y aparece la marca de la tienda. En 67,5 se corta todo menos el eje, que sigue solo en el silencio
 * y es el que la escena siguiente pasa a corona.
 */
export const stack = defineRecipe<StackProps>({
  id: "stack",
  Component: ({ props, ratio }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: TR.night }}>
      <div data-t="cam" className="absolute inset-0">
        <Grid ratio={ratio} color={TR.volt} opacity={GRID_VOLT} />
        <DisplayLines lines={props.lines} ratio={ratio} col={1} row={2} size={200} />
        <ShopMark ratio={ratio} />
      </div>
      <div data-t="axis" aria-hidden="true" className="absolute inset-x-0" style={{ top: AXIS_Y[ratio] - HAIR / 2, height: HAIR, background: TR.volt }} />
    </div>
  ),
  build: ({ q, beat: B, reduced }) => {
    const tl = gsap.timeline();
    const one = (s: string) => q(`[data-t="${s}"]`);
    if (reduced) { tl.fromTo(one("cam"), { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 4, ease: "none" }, 0); return tl; }
    // Un renglón por cada ⅛ de tiempo, cada 1/4: 64,0, 64,25 y 64,5.
    one("line").forEach((line, i) => tl.fromTo(splitChars([line]), { yPercent: 110 }, { yPercent: 0, duration: B / 8, ease: "trl.expo", stagger: 0.008 }, (i * B) / 4));
    tl.fromTo(one("mark"), { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 2, ease: "none" }, B);
    tl.fromTo(one("cam"), { scale: 1 }, { scale: 1.03, duration: 3 * B, ease: "trl.rampa" }, B / 2);
    tl.set(one("cam"), { autoAlpha: 0 }, 3.5 * B);
    return tl;
  },
});
