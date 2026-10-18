import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { EclipseMark, Starfield } from "./EclipseMark";
import { EC, FONT } from "./tokens";

export interface IntroProps { word?: string; line?: string }

/**
 * Apertura "Eclipse · Presenta…": la secuencia del loader de eclipse-web (components/loader) en versión cine. Sale el
 * sol, la luna se desliza encima, se abren el brillo y la corona con el anillo de diamante, sube ECLIPSE letra por letra
 * y debajo la frase; al final la luz se difunde (desenfoque y un poco más grande) y deja paso al trailer. ~5,6 s.
 */
export const eclipseIntro = defineRecipe<IntroProps>({
  id: "eclipse-intro",
  Component: ({ props, ratio }) => {
    const w = ratio === "16x9" ? 1920 : 1080, h = ratio === "16x9" ? 1080 : 1920;
    return (
      <div data-t="sky" className="absolute inset-0 overflow-hidden" style={{ background: `radial-gradient(ellipse at 50% 42%, ${EC.night} 0%, ${EC.void} 70%)` }}>
        <Starfield w={w} h={h} />
        <div data-t="scene" className="absolute inset-0 flex flex-col items-center justify-center">
          <EclipseMark size={ratio === "16x9" ? 380 : 460} />
          <p data-t="word" className="mt-14 flex overflow-hidden pl-[0.5em] uppercase" style={{ fontFamily: FONT.sans, fontSize: 64, fontWeight: 500, letterSpacing: "0.5em", color: EC.dawn }}>
            {Array.from(props.word ?? "ECLIPSE").map((c, i) => <span key={i} data-t="letter" className="inline-block">{c}</span>)}
          </p>
          <p data-t="line" className="mt-6 italic" style={{ fontFamily: FONT.serif, fontSize: 58, color: EC.mist }}>{props.line ?? "Presenta…"}</p>
        </div>
      </div>
    );
  },
  build: ({ q, dur }) => {
    const tl = gsap.timeline({ defaults: { ease: "trl.expo" } });
    const one = (sel: string) => q(`[data-t="${sel}"]`);
    tl.fromTo(one("stars"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power1.out" }, 0);
    tl.fromTo(one("sun"), { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1.1 }, 0.1);
    tl.fromTo(one("moon"), { xPercent: -78, yPercent: 26 }, { xPercent: 0, yPercent: 0, duration: 1.9, ease: "trl.moon" }, 0.2);
    tl.fromTo(one("glow"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 2 }, 1.6);
    tl.fromTo(one("corona"), { autoAlpha: 0, scale: 0.72, rotate: -20 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 2.1 }, 1.7);
    tl.fromTo(one("glint"), { autoAlpha: 0, scale: 0, rotate: -35 }, { keyframes: [{ autoAlpha: 1, scale: 1.18, rotate: 0, duration: 0.45 }, { autoAlpha: 0.85, scale: 0.72, rotate: 12, duration: 0.95 }], ease: "trl.glint" }, 1.95);
    tl.fromTo(one("letter"), { autoAlpha: 0, yPercent: 90 }, { autoAlpha: 1, yPercent: 0, duration: 1.1, stagger: 0.08 }, 1.25);
    tl.fromTo(one("line"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 2.35);
    const out = Math.max(dur - 1.1, 3.6);
    tl.to(one("scene"), { autoAlpha: 0, filter: "blur(14px)", scale: 1.06, duration: 1, ease: "power2.inOut", immediateRender: false }, out);
    tl.to(one("sky"), { backgroundColor: EC.void, duration: 1, immediateRender: false }, out);
    tl.to(one("stars"), { autoAlpha: 0, duration: 0.9, immediateRender: false }, out + 0.1);
    return tl;
  },
});
