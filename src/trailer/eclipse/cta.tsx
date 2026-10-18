import { AXIS_Y } from "../core/grid";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TR, splitChars } from "../recipes/kit";
import { HAIR } from "../recipes/tpl";
import { SectionMark, SerifTitle } from "./Mark";
import { DawnSky } from "./sky";
import { CONTACT, EC, FONT } from "./tokens";

/** `axis`: continúa el eje volt de la escena anterior (T1): pasa a corona en ⅛ de tiempo y se apaga en 1 mientras amanece. */
export interface CtaProps { n?: string; url?: string; phone?: string; axis?: boolean }

/**
 * "Probalo en vivo" + "Contactanos": la noche se vuelve amanecer (el `SkyTransition` de eclipse-web), sube el sol detrás
 * del horizonte y aparecen el link de la demo y el teléfono. Desde acá la estética es la de Eclipse. ~6 s.
 */
export const eclipseCta = defineRecipe<CtaProps>({
  id: "eclipse-cta",
  Component: ({ props, ratio }) => {
    const tall = ratio === "9x16";
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: EC.night }}>
        <DawnSky ratio={ratio} />
        <div className="absolute inset-x-0 flex flex-col" style={{ top: tall ? 260 : 110, paddingInline: tall ? 90 : 170, gap: tall ? 40 : 26 }}>
          <SectionMark n={props.n ?? "10"} label="Próximo paso" dark />
          <SerifTitle text="Probalo" italic="en vivo." size={tall ? 200 : 190} dark />
          <p data-t="url" style={{ fontFamily: FONT.mono, fontSize: tall ? 30 : 34, color: EC.flare }}>{props.url ?? CONTACT.demoUrl}</p>
          <div data-t="contact" className="flex flex-col gap-2" style={{ marginTop: tall ? 110 : 24 }}>
            <p className="italic" style={{ fontFamily: FONT.serif, fontSize: tall ? 84 : 70, color: EC.ink }}>Contactanos</p>
            <p data-t="phone" className="tabular-nums" style={{ fontFamily: FONT.mono, fontSize: tall ? 100 : 88, fontWeight: 500, color: EC.ink, letterSpacing: "0.02em" }}>{props.phone ?? CONTACT.phone}</p>
            <p className="uppercase" style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: "0.22em", color: EC.muted }}>WhatsApp o llamada · Eclipse</p>
          </div>
        </div>
        {props.axis && <div data-t="axis" aria-hidden="true" className="absolute inset-x-0" style={{ zIndex: 5, top: AXIS_Y[ratio] - HAIR / 2, height: HAIR, background: TR.volt }} />}
        <div data-t="horizon" className="absolute inset-x-0 h-[7px] origin-left" style={{ top: tall ? "92%" : "93.5%", background: `repeating-linear-gradient(90deg, ${EC.muted} 0 1px, transparent 1px 32px)`, borderTop: `1px solid ${EC.ink}` }} />
      </div>
    );
  },
  cues: () => [{ t: 0, voice: "whoosh", dur: 1.6, vel: 0.5 }, { t: 0.75, voice: "shimmer", midi: 84, vel: 0.5 }],
  build: ({ q, beat: B, props }) => {
    const tl = gsap.timeline({ defaults: { ease: "trl.expo" } });
    const one = (sel: string) => q(`[data-t="${sel}"]`);
    tl.fromTo(one("dawn"), { yPercent: 70 }, { yPercent: 0, duration: 2.4, ease: "power2.inOut" }, 0);
    tl.fromTo(one("sun"), { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 2.6, ease: "power2.out" }, 0.3);
    tl.fromTo(one("mark"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.5);
    tl.fromTo(one("mark-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, 0.6);
    tl.fromTo(splitChars(one("title-line")), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.03 }, 0.75);
    tl.fromTo(one("url"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.5);
    tl.fromTo(one("horizon"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 1.4);
    tl.fromTo(one("contact"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1 }, 2.4);
    if (props.axis) {
      tl.fromTo(one("axis"), { backgroundColor: TR.volt }, { backgroundColor: EC.corona, duration: B / 8, ease: "none" }, 0);
      tl.fromTo(one("axis"), { autoAlpha: 1 }, { autoAlpha: 0, duration: B, ease: "power1.in" }, 0);
    }
    return tl;
  },
});
