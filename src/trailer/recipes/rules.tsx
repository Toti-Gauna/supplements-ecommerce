import { EC } from "../eclipse/tokens";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { DisplayLines, DevicePair, PAIR_CENTER } from "./device";
import { TR, splitChars } from "./kit";
import { Grid, HAIR } from "./tpl";

export interface RulesProps { prev: string[]; lines: string[] }

/** El "+" mide 160 px de punta a punta; sus rayas nacen de 1 px (2 en el escenario) y engordan a 16. */
const PLUS = { x: 887, y: 540, len: 160, fat: 16 }, K_FAT = HAIR / PLUS.fat;
/** Los equipos se achican a 0,6 y quedan centrados en x = 450 (columnas 1 a 5). */
const SHRINK = { scale: 0.6, x: 450 - PAIR_CENTER.x };
/** Corona: un radial de 1600 px al 35 % que sube de y + 900 a y + 600 detrás de los equipos. */
const GLOW = { size: 1600, from: 900, to: 600 };

/**
 * 15 · La asesoría (60–64): sale el super de "No es solo software", los equipos se achican a un costado y se traza un "+" que
 * engorda y pasa a corona mientras sube la luz de Eclipse por detrás. Las rayas son las únicas de la pieza que no son volt.
 */
export const rules = defineRecipe<RulesProps>({
  id: "rules",
  Component: ({ props, ratio }) => {
    const bar = (tag: string, w: number, h: number) => (
      <div data-t={tag} className="absolute" style={{ left: PLUS.x - w / 2, top: PLUS.y - h / 2, width: w, height: h, background: TR.volt, zIndex: 4 }} />
    );
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: TR.night }}>
        <Grid ratio={ratio} color={TR.volt} opacity={0.14} />
        <div data-t="glow" className="absolute rounded-full" style={{ left: 960 - GLOW.size / 2, top: 540 - GLOW.size / 2, width: GLOW.size, height: GLOW.size, background: `radial-gradient(closest-side, ${EC.corona}59, ${EC.corona}33 55%, transparent)` }} />
        <DevicePair ratio={ratio} ry={-6} />
        {bar("plus-h", PLUS.len, PLUS.fat)}
        {bar("plus-v", PLUS.fat, PLUS.len)}
        <DisplayLines lines={props.prev} ratio={ratio} col={1} row={2} size={130} tag="prev" />
        <DisplayLines lines={props.lines} ratio={ratio} col={7} row={3} size={110} />
      </div>
    );
  },
  build: ({ q, beat: B, reduced }) => {
    const tl = gsap.timeline();
    const one = (s: string) => q(`[data-t="${s}"]`);
    const hor = one("plus-h"), ver = one("plus-v"), bars = [...hor, ...ver], glow = one("glow"), pair = one("pair");
    const strokes = [...one("nb-line"), ...one("ph-line")];
    if (reduced) {
      tl.set(pair, { ...SHRINK }, 0);
      tl.set(bars, { backgroundColor: EC.corona }, 0);
      tl.set(glow, { y: GLOW.to }, 0);
      tl.set(strokes, { stroke: EC.corona }, 0);
      tl.set(one("prev"), { autoAlpha: 0 }, 0);
      return tl;
    }
    tl.fromTo(splitChars(one("prev")), { yPercent: 0 }, { yPercent: -110, duration: B / 4, ease: "power2.in" }, 0);
    tl.fromTo(pair, { scale: 1, x: 0 }, { scale: SHRINK.scale, x: SHRINK.x, duration: B, ease: "trl.expo" }, 0);
    tl.fromTo(splitChars(one("line")), { yPercent: 110 }, { yPercent: 0, duration: B / 4, ease: "trl.expo", stagger: 0.012 }, B / 2);
    // Las dos rayas de 1 px se trazan una tras otra y recién después engordan.
    tl.set(hor, { scaleY: K_FAT }, 0);
    tl.set(ver, { scaleX: K_FAT }, 0);
    tl.fromTo(hor, { scaleX: 0 }, { scaleX: 1, duration: B / 2, ease: "trl.expo" }, B / 2);
    tl.fromTo(ver, { scaleY: 0 }, { scaleY: 1, duration: B / 2, ease: "trl.expo" }, B);
    tl.to(hor, { scaleY: 1, backgroundColor: EC.corona, duration: B / 4, ease: "trl.expo", immediateRender: false }, 1.5 * B);
    tl.to(ver, { scaleX: 1, backgroundColor: EC.corona, duration: B / 4, ease: "trl.expo", immediateRender: false }, 1.5 * B);
    tl.to(strokes, { stroke: EC.corona, duration: B / 4, ease: "none", immediateRender: false }, 1.5 * B);
    tl.fromTo(glow, { autoAlpha: 0, y: GLOW.from }, { autoAlpha: 1, y: GLOW.to, duration: 2 * B, ease: "trl.rampa" }, 1.5 * B);
    return tl;
  },
});
