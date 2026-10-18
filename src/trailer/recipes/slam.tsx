import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TONES, displaySize, type Tone } from "./kit";

export interface SlamProps { words: Array<{ text: string; tone: Tone }>; beat: number }

/**
 * Una palabra por pulso a pantalla completa (de `slam` de kinetic-studio): corte de color, la palabra entra de costado
 * con inclinación y un círculo golpea detrás. La duración de la escena debería ser `words.length × beat`.
 */
export const slam = defineRecipe<SlamProps>({
  id: "slam",
  Component: ({ props, ratio }) => (
    <>
      {props.words.map((w, i) => {
        const tone = TONES[w.tone];
        return (
          <div key={i} data-t="layer" className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ background: tone.bg, zIndex: i }}>
            <span data-t="shape" className="absolute rounded-full" style={{ width: 720, height: 720, background: tone.accent, opacity: 0.12 }} />
            <span data-t="word" className="font-display relative uppercase leading-none" style={{ fontSize: displaySize(ratio, 300, 190), color: tone.fg }}>{w.text}</span>
          </div>
        );
      })}
    </>
  ),
  build: ({ q, props }) => {
    const tl = gsap.timeline();
    const layers = q('[data-t="layer"]'), words = q('[data-t="word"]'), shapes = q('[data-t="shape"]');
    tl.set(layers, { autoAlpha: 0 }, 0);
    layers.forEach((layer, i) => {
      const at = i * props.beat;
      tl.set(layer, { autoAlpha: 1 }, at);
      tl.fromTo(words[i]!, { xPercent: i % 2 ? 40 : -40, skewX: i % 2 ? -18 : 18, autoAlpha: 0 }, { xPercent: 0, skewX: 0, autoAlpha: 1, duration: 0.32, ease: "trl.expo" }, at);
      tl.fromTo(shapes[i]!, { scale: 0.2 }, { scale: 1, duration: 0.5, ease: "trl.punch" }, at);
    });
    return tl;
  },
});
