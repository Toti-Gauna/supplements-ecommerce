import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TONES, displaySize, type Tone } from "./kit";

export interface TypewriterProps { text: string; perChar?: number; tone?: Tone }

/**
 * Una frase que se escribe sola con el cursor titilando (de `typewriter` de kinetic-studio). Las letras salen de un
 * contador atado al tiempo; el cursor titila con repeticiones finitas: el cuadro siempre es el mismo al saltar.
 */
export const typewriter = defineRecipe<TypewriterProps>({
  id: "typewriter",
  Component: ({ props, ratio }) => {
    const tone = TONES[props.tone ?? "night"];
    return (
      <div className="absolute inset-0 flex items-center justify-center px-24" style={{ background: tone.bg, color: tone.fg }}>
        <p className="font-display uppercase leading-[0.95]" style={{ fontSize: displaySize(ratio, 130, 96) }}>
          <span data-t="typed" />
          <span data-t="caret" className="ml-2 inline-block w-[0.12em] translate-y-[0.08em]" style={{ height: "0.85em", background: tone.accent }} />
        </p>
      </div>
    );
  },
  cues: (props) => Array.from(props.text, (ch, i) => ({ t: 0.25 + i * (props.perChar ?? 0.055), voice: "tick" as const, midi: i, vel: ch === " " ? 0 : 0.8 })).filter((c) => c.vel > 0),
  build: ({ q, props, dur }) => {
    const tl = gsap.timeline();
    const typed = q('[data-t="typed"]')[0]!;
    const caret = q('[data-t="caret"]')[0]!;
    const per = props.perChar ?? 0.055;
    const counter = { n: 0 };
    tl.fromTo(counter, { n: 0 }, { n: props.text.length, duration: props.text.length * per, ease: "none", onUpdate: () => { typed.textContent = props.text.slice(0, Math.floor(counter.n)); } }, 0.25);
    const blinks = Math.max(Math.floor(dur / 0.5) - 1, 1);
    tl.fromTo(caret, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25, ease: "steps(1)", repeat: blinks, yoyo: true, repeatDelay: 0.25 }, 0);
    return tl;
  },
});
