// src/trailer/recipes/<nombre>.tsx (o src/trailer/eclipse/ si es de la firma). Copiar, renombrar y completar.
// Registrar en `src/trailer/recipes/index.ts` y agregar el id a la lista de `tests/unit/trailer-core.test.ts`.
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TONES, displaySize, splitChars, type Tone } from "./kit";

export interface NombreProps { /* lo que el storyboard le pasa en `props` */ tone?: Tone }

/**
 * Qué muestra, en una línea, y de qué receta de kinetic-studio viene (biblia/referencias.md §3). Duración mínima y máxima.
 */
export const nombre = defineRecipe<NombreProps>({
  id: "nombre",
  // 1) DOM estático, en coordenadas del escenario (1920×1080 / 1080×1920). Nada de prefijos responsivos de Tailwind:
  //    usá `ratio === "9x16"` para el layout vertical. Cada pieza que se anima lleva `data-t="..."`. Colores: solo de `TONES`/`TR`.
  Component: ({ props, ratio }) => {
    const tone = TONES[props.tone ?? "night"];
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: tone.bg, color: tone.fg }}>
        <p data-t="titulo" className="font-display uppercase" style={{ fontSize: displaySize(ratio, 200, 150) }}>Texto</p>
      </div>
    );
  },
  // 2) Timeline RELATIVO (0 = inicio de la escena), determinista: nada de `delay`, `repeat: -1`, `delayedCall`, tweens
  //    sueltos ni `tl.call()` para sonidos. Estado de entrada con `fromTo`; el segundo `to` de la misma propiedad lleva
  //    `immediateRender: false`. Textos que cuentan o se escriben salen del progreso de un tween (`onUpdate`).
  build: ({ q, dur }) => {
    const tl = gsap.timeline({ defaults: { ease: "trl.expo" } });
    const chars = splitChars(q('[data-t="titulo"]'));
    tl.fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: 0.8, stagger: 0.02 }, 0.1);
    tl.to(chars, { yPercent: -115, duration: 0.35, immediateRender: false }, Math.max(dur - 0.4, 1));
    return tl;
  },
  // 3) Sonidos atados a lo que se ve (segundos relativos a la escena). Ningún toque sin sonido ni sonido sin toque.
  cues: () => [{ t: 0.1, voice: "whoosh", dur: 0.4, vel: 0.5 }],
});
