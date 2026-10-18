import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TONES, displaySize } from "./kit";

export interface ThemeFlipProps { title: string; body: string; origin?: [number, number] }

/**
 * Claro → oscuro (de `uitheme` de kinetic-studio): el botón del tema late, recibe el click y el modo oscuro se abre
 * como un círculo desde ese punto. En los trailers reales, las dos capas son la misma pantalla de la app en cada modo.
 */
export const themeflip = defineRecipe<ThemeFlipProps>({
  id: "themeflip",
  Component: ({ props, ratio }) => {
    const panel = (tone: "paper" | "night", t: string) => (
      <div data-t={t} className="absolute inset-0 flex flex-col items-start justify-center gap-6 px-32" style={{ background: TONES[tone].bg, color: TONES[tone].fg }}>
        <p className="font-mono text-[26px] uppercase tracking-[0.3em]" style={{ color: TONES[tone].accent }}>{tone === "paper" ? "Modo claro" : "Modo oscuro"}</p>
        <p className="font-display uppercase leading-[0.9]" style={{ fontSize: displaySize(ratio, 170, 120) }}>{props.title}</p>
        <p className="max-w-[1100px] text-[34px] opacity-80">{props.body}</p>
      </div>
    );
    const [x, y] = props.origin ?? (ratio === "16x9" ? [1740, 140] : [920, 160]);
    return (
      <>
        {panel("paper", "light")}
        {panel("night", "dark")}
        <span data-t="toggle" className="absolute grid size-24 place-items-center rounded-full border-4" style={{ left: x - 48, top: y - 48, borderColor: TONES.paper.fg }}>
          <span className="size-10 rounded-full" style={{ background: TONES.paper.fg, boxShadow: `inset -14px -6px 0 ${TONES.paper.bg}` }} />
        </span>
      </>
    );
  },
  cues: () => [{ t: 1.05, voice: "click", vel: 0.9 }, { t: 1.1, voice: "whoosh", dur: 0.8, vel: 0.6 }],
  build: ({ q, props, ratio }) => {
    const tl = gsap.timeline();
    const [x, y] = props.origin ?? (ratio === "16x9" ? [1740, 140] : [920, 160]);
    const dark = q('[data-t="dark"]')[0]!, toggle = q('[data-t="toggle"]')[0]!;
    tl.set(dark, { clipPath: `circle(0px at ${x}px ${y}px)` }, 0);
    tl.fromTo(toggle, { scale: 1 }, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" }, 0.3);
    tl.to(toggle, { scale: 0.86, duration: 0.08, ease: "power2.in" }, 1.05);
    tl.to(dark, { clipPath: `circle(2400px at ${x}px ${y}px)`, duration: 0.9, ease: "trl.expo" }, 1.12);
    tl.to(toggle, { autoAlpha: 0, duration: 0.2 }, 1.2);
    return tl;
  },
});
