import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TONES, displaySize, splitChars, type Tone } from "./kit";

export interface TitleProps { eyebrow?: string; lines: string[]; accentLine?: number; tone?: Tone }

/**
 * Título cinético (de `origin`/`statement` de kinetic-studio): el rótulo aparece, cada letra sube desde atrás de su
 * línea con la curva de Eclipse y al final todo sale hacia arriba. Duración libre (mínimo ~1,6 s).
 */
export const title = defineRecipe<TitleProps>({
  id: "title",
  Component: ({ props, ratio }) => {
    const tone = TONES[props.tone ?? "night"];
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center" style={{ background: tone.bg, color: tone.fg }}>
        {props.eyebrow && <p data-t="eyebrow" className="font-mono text-[28px] uppercase tracking-[0.3em]" style={{ color: tone.accent }}>{props.eyebrow}</p>}
        {props.lines.map((line, i) => (
          <p key={i} data-t="line" className="font-display uppercase leading-[0.86]"
            style={{ fontSize: displaySize(ratio, 200, 150), color: i === props.accentLine ? tone.accent : undefined }}>{line}</p>
        ))}
      </div>
    );
  },
  cues: () => [{ t: 0.1, voice: "whoosh", dur: 0.5, vel: 0.45 }],
  build: ({ q, dur }) => {
    const tl = gsap.timeline();
    const chars = splitChars(q('[data-t="line"]'));
    const eyebrow = q('[data-t="eyebrow"]');
    tl.fromTo(eyebrow, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "trl.expo" }, 0);
    tl.fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: 0.8, stagger: 0.022, ease: "trl.expo" }, 0.12);
    const out = Math.max(dur - 0.42, 1.1);
    tl.to(chars, { yPercent: -115, duration: 0.36, stagger: 0.008, ease: "power3.in", immediateRender: false }, out);
    tl.to(eyebrow, { autoAlpha: 0, duration: 0.25, immediateRender: false }, out);
    return tl;
  },
});
