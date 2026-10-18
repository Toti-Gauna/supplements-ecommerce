import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TONES, ars, displaySize, type Tone } from "./kit";

export interface StatProps { value: number; prefix?: string; suffix?: string; label: string; note?: string; tone?: Tone }

/**
 * Una cifra que golpea y cuenta (de `statpunch` de kinetic-studio). **Solo cifras reales** de la demo. El conteo sale
 * del progreso del tween, así que saltar a cualquier segundo muestra el número correcto.
 */
export const statpunch = defineRecipe<StatProps>({
  id: "statpunch",
  Component: ({ props, ratio }) => {
    const tone = TONES[props.tone ?? "night"];
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center" style={{ background: tone.bg, color: tone.fg }}>
        <p data-t="figure" className="font-display tabular-nums leading-none" style={{ fontSize: displaySize(ratio, 340, 230), color: tone.accent }}>
          {props.prefix}<span data-t="value">0</span>{props.suffix}
        </p>
        <p data-t="label" className="font-mono text-[34px] uppercase tracking-[0.2em]">{props.label}</p>
        {props.note && <p data-t="note" className="text-[24px] opacity-70">{props.note}</p>}
      </div>
    );
  },
  build: ({ q, props }) => {
    const tl = gsap.timeline();
    const value = q('[data-t="value"]')[0]!;
    const counter = { v: 0 };
    tl.fromTo(q('[data-t="figure"]'), { scale: 1.35, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "trl.punch" }, 0);
    tl.fromTo(counter, { v: 0 }, { v: props.value, duration: 1.1, ease: "power3.out", onUpdate: () => { value.textContent = ars(counter.v); } }, 0.05);
    tl.fromTo(q('[data-t="label"], [data-t="note"]'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.12, ease: "trl.expo" }, 0.35);
    return tl;
  },
});
