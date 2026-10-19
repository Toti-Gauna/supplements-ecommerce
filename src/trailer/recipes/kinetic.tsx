import type { Ratio } from "../core/types";
import { EC } from "../eclipse/tokens";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TR, splitChars } from "./kit";

type Tone = "night" | "paper" | "volt";
export interface KineticSlide { lines: string[]; tone: Tone; beats: number }
export interface KineticProps { slides: KineticSlide[] }

/** Fondo, texto y acento (el último renglón) de cada tono. */
const TONE: Record<Tone, { bg: string; ink: string; accent: string }> = {
  night: { bg: TR.night, ink: TR.onNight, accent: TR.volt },
  paper: { bg: EC.dawn, ink: EC.ink, accent: EC.deep },
  volt: { bg: TR.volt, ink: "#060707", accent: "#060707" },
};
const SIZE: Record<Ratio, { x: number; size: number }> = { "16x9": { x: 96, size: 150 }, "9x16": { x: 60, size: 112 } };

/**
 * Pantallas de solo texto con cambio de color (estilo kinetic): cada placa entra con corte seco en su tiempo, con su fondo (noche,
 * papel o volt) y sus renglones que suben letra por letra. Nunca más de un cambio de fondo por tiempo (≈ 2 por segundo, debajo del
 * límite de destellos de WCAG 2.3.1).
 */
export const kinetic = defineRecipe<KineticProps>({
  id: "kinetic",
  Component: ({ props, ratio }) => {
    const L = SIZE[ratio];
    return (
      <div className="absolute inset-0 overflow-hidden">
        {props.slides.map((s, i) => {
          const t = TONE[s.tone];
          return (
            <div key={i} data-t="slide" data-i={i} className="absolute inset-0 flex flex-col justify-center" style={{ background: t.bg, paddingLeft: L.x, paddingRight: L.x }}>
              <p className="font-display uppercase" style={{ fontSize: L.size, color: t.ink }}>
                {s.lines.map((l, k) => (
                  <span key={k} data-t={`line-${i}`} className="block" style={{ lineHeight: 1.15, marginBlock: "-0.145em", ...(k === s.lines.length - 1 && s.lines.length > 1 ? { color: t.accent } : {}) }}>{l}</span>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    );
  },
  build: ({ q, props, beat: B, reduced }) => {
    const tl = gsap.timeline();
    const slides = q('[data-t="slide"]');
    tl.set(slides, { autoAlpha: 0 }, 0);
    let at = 0;
    props.slides.forEach((s, i) => {
      tl.set(slides[i]!, { autoAlpha: 1 }, at);
      if (i > 0) tl.set(slides[i - 1]!, { autoAlpha: 0 }, at);
      if (!reduced) tl.fromTo(splitChars(q(`[data-t="line-${i}"]`)), { yPercent: 110 }, { yPercent: 0, duration: B / 4, ease: "trl.expo", stagger: 0.012 }, at);
      at += s.beats * B;
    });
    return tl;
  },
});
