import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { EclipseMark, Starfield } from "./EclipseMark";
import { EC, FONT } from "./tokens";

export interface OutroProps { word?: string; line?: string }

/**
 * Cierre: el eclipse se cierra. Arranca con el sol a medio cubrir y la marca a la vista; la luna termina de taparlo,
 * destella el anillo de diamante, la corona y el brillo se apagan, se van las letras y queda la noche. ~4,7 s.
 */
export const eclipseOutro = defineRecipe<OutroProps>({
  id: "eclipse-outro",
  Component: ({ props, ratio }) => {
    const w = ratio === "16x9" ? 1920 : 1080, h = ratio === "16x9" ? 1080 : 1920;
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: `radial-gradient(ellipse at 50% 42%, ${EC.night} 0%, ${EC.void} 70%)` }}>
        <Starfield w={w} h={h} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <EclipseMark size={ratio === "16x9" ? 340 : 420} />
          <p className="mt-14 flex overflow-hidden pl-[0.5em] uppercase" style={{ fontFamily: FONT.sans, fontSize: 56, fontWeight: 500, letterSpacing: "0.5em", color: EC.dawn }}>
            {Array.from(props.word ?? "ECLIPSE").map((c, i) => <span key={i} data-t="letter" className="inline-block">{c}</span>)}
          </p>
          <p data-t="line" className="mt-6 max-w-[880px] px-10 text-center italic" style={{ fontFamily: FONT.serif, fontSize: ratio === "16x9" ? 46 : 52, lineHeight: 1.2, color: EC.mist }}>{props.line ?? "Desarrollo, IA y automatización para los que no pueden esperar."}</p>
        </div>
        <div data-t="night" className="absolute inset-0" style={{ background: EC.void }} />
      </div>
    );
  },
  build: ({ q, dur }) => {
    const tl = gsap.timeline({ defaults: { ease: "trl.expo" } });
    const one = (sel: string) => q(`[data-t="${sel}"]`);
    tl.set(one("night"), { autoAlpha: 0 }, 0);
    tl.set(one("glint"), { autoAlpha: 0 }, 0);
    tl.fromTo(one("moon"), { xPercent: 46, yPercent: -14 }, { xPercent: 0, yPercent: 0, duration: 2.2, ease: "power2.inOut" }, 0);
    tl.fromTo(one("glow"), { autoAlpha: 1, scale: 1.15 }, { autoAlpha: 0.9, scale: 1, duration: 2.2, ease: "power1.inOut" }, 0);
    tl.fromTo(one("glint"), { autoAlpha: 0, scale: 0 }, { keyframes: [{ autoAlpha: 1, scale: 1.25, duration: 0.3 }, { autoAlpha: 0, scale: 0.5, duration: 0.7 }] }, 1.95);
    tl.to(one("corona"), { autoAlpha: 0, scale: 0.8, rotate: 18, duration: 1.4, ease: "power2.in" }, 2.3);
    tl.to(one("glow"), { autoAlpha: 0, scale: 0.6, duration: 1.3, ease: "power2.in" }, 2.4);
    tl.to(one("sun"), { autoAlpha: 0, duration: 1.2, ease: "power2.in" }, 2.6);
    tl.to(one("letter"), { autoAlpha: 0, yPercent: -60, duration: 0.6, stagger: 0.05, ease: "power2.in" }, 2.7);
    tl.to(one("line"), { autoAlpha: 0, duration: 0.6 }, 2.9);
    tl.to(one("night"), { autoAlpha: 1, duration: 0.9, ease: "power1.in" }, Math.max(dur - 1, 3.4));
    return tl;
  },
});
