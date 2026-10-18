import type { CSSProperties } from "react";
import { SplashStage } from "@/components/organisms/splash/SplashStage";
import { tutienda } from "@/config/brands/tutienda";
import { logoPaths, LOGO_VIEWBOX } from "@/config/logo";
import { seasonalThemes, themeCoupons } from "@/demo/fixtures/themes";
import type { SeasonId } from "@/demo/types";
import { splashMarks } from "@/features/splash/marks";
import { BASE_PATH } from "@/lib/base-path";
import { FRAME } from "../core/grid";
import { cssAnimations, setCssTime } from "../engine/css-clock";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { displaySize, splitChars, TR } from "./kit";
import { Chip, Grid, HAIR } from "./tpl";

export interface SplashLiveProps { dates: SeasonId[]; carry: string[]; chip: [string, string] }

const BOLT = logoPaths(tutienda).bolt;
/** Una fecha de las fixtures como la marca el script del <head>: escena, ruedas del descuento y variables (capas, nombre, acento). */
const marksFor = (id: SeasonId) => {
  const t = seasonalThemes.find((x) => x.id === id)!;
  return splashMarks({ id, name: t.name, coupon: themeCoupons.find((c) => c.code === t.couponCode) ?? null }, BASE_PATH);
};
/** Clímax de las otras fechas (la persiana arriba, el árbol cargado, el marcador prendido). */
const CLIMAX_MS = 1500;

/**
 * 01 · Pantallas de carga por fecha (30–34): la pantalla de carga REAL de la tienda adentro del marco del latido. La primera
 * fecha cuenta 3 · 2 · 1 en corcheas (sus 220 ms se estiran a 234), el "1" se congela medio tiempo y el "ya" es el drop; en
 * los tiempos 3 y 3,5 corta a las otras fechas en su clímax. Las animaciones CSS de la app las maneja el reloj del trailer.
 */
export const splashLive = defineRecipe<SplashLiveProps>({
  id: "splash-live",
  Component: ({ props, ratio }) => {
    const f = FRAME[ratio], tall = ratio === "9x16";
    const art = Math.min(f.w - 120, ((f.h - 190) * 4) / 3);
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: TR.night }}>
        <Grid ratio={ratio} color={TR.volt} opacity={0.14} />
        <div className="absolute" style={{ left: f.x, top: f.y, width: f.w, height: f.h, boxShadow: `inset 0 0 0 ${HAIR}px ${TR.volt}` }}>
          {props.dates.map((id, i) => {
            const m = marksFor(id);
            return (
              <div key={id} data-t="date" data-i={i} className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 18 }}>
                <div className="flex items-center" style={{ gap: 14 }}>
                  <svg viewBox={LOGO_VIEWBOX} width={52} height={52} aria-hidden="true"><path d={BOLT} fill={TR.volt} /></svg>
                  <span className="font-display uppercase leading-none" style={{ fontSize: 46, letterSpacing: "0.04em", color: TR.onNight }}>{tutienda.name}</span>
                </div>
                <SplashStage scene={m.scene ?? undefined} digits={m.digits ?? undefined} style={{ ...(m.vars as CSSProperties), width: art }} />
                {/* Precarga del arte de la fecha: el motor espera a que se decodifique antes de armar. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {Object.entries(m.vars).filter(([k]) => k.startsWith("--sl")).map(([k, v]) => <img key={k} alt="" aria-hidden="true" className="hidden" src={v.slice(5, -2)} />)}
              </div>
            );
          })}
        </div>
        <p data-t="carry" className="font-display absolute uppercase leading-[0.86]" style={{ left: tall ? 60 : 96, top: tall ? f.y + f.h + 110 : 388, fontSize: displaySize(ratio, 150, 150), color: TR.onNight }}>
          {props.carry.map((line, i) => <span key={i} data-t="carry-line" className="block" style={i === props.carry.length - 1 ? { color: TR.volt } : undefined}>{line}</span>)}
        </p>
        <Chip n={props.chip[0]} text={props.chip[1]} />
      </div>
    );
  },
  build: ({ q, beat, reduced }) => {
    const tl = gsap.timeline();
    const dates = q('[data-t="date"]');
    const anims = dates.map((d) => cssAnimations([d]));
    const chip = q('[data-t="chip"]'), rule = q('[data-t="chip-rule"]');
    // Reloj de la primera fecha en ms del CSS: 3 en 0, 2 en ½, 1 en 1 tiempo; congelado en el "1" de 1,4 a 2; el "ya" en 2.
    const clock = (t: number) => (t < 1.4 ? 260 + t * 440 : t < 2 ? 880 : 920 + (t - 2) * 440);
    const proxy = { t: 0 };
    tl.set(dates.slice(1), { autoAlpha: 0 }, 0);
    anims.slice(1).forEach((a) => setCssTime(a, CLIMAX_MS));
    if (reduced) {
      tl.set(q('[data-t="carry"]'), { autoAlpha: 0 }, 0);
      tl.fromTo(chip, { autoAlpha: 0 }, { autoAlpha: 1, duration: beat / 4 }, beat);
      return tl;
    }
    tl.fromTo(proxy, { t: 0 }, { t: 4, duration: 4 * beat, ease: "none", onUpdate: () => setCssTime(anims[0]!, clock(proxy.t)) }, 0);
    // "La tuya, no." sigue del latido hasta el tiempo 1 y sale hacia arriba; entra el rótulo con su raya.
    tl.to(splitChars(q('[data-t="carry-line"]')), { yPercent: -115, duration: 0.3, stagger: 0.01, ease: "power3.in" }, beat - 0.3);
    tl.fromTo(chip, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, beat);
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: beat / 4, ease: "trl.expo" }, beat);
    // Drop en el "ya" (tiempo 2): la cámara empuja un 2 %; en 3 y 3,5 corta a las otras fechas.
    tl.fromTo(q('[data-t="date"]'), { scale: 1 }, { scale: 1.02, duration: 2 * beat, ease: "sine.out" }, 2 * beat);
    dates.slice(1).forEach((d, i) => { tl.set(dates[i]!, { autoAlpha: 0 }, (3 + i * 0.5) * beat); tl.set(d, { autoAlpha: 1 }, (3 + i * 0.5) * beat); });
    return tl;
  },
});
