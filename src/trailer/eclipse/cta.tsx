import { AXIS_Y } from "../core/grid";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TR, splitChars } from "../recipes/kit";
import { HAIR } from "../recipes/tpl";
import { SectionMark, SerifTitle } from "./Mark";
import { DawnSky } from "./sky";
import { CONTACT, EC, FONT } from "./tokens";

/** `axis`: continúa el eje volt de la escena anterior (T1): pasa a corona en ⅛ de tiempo y se apaga en 1 mientras amanece. */
export interface CtaProps { n?: string; url?: string; phone?: string; axis?: boolean; pitch?: Pitch }
/** Versión de venta (T1, 19/10/2026): qué hace Eclipse como titular, una bajada que invita a ver la demo y el contacto a la derecha. */
export interface Pitch { label: string; title: string; italic: string; italic2?: string; sub: string }

/**
 * "Probalo en vivo" + "Contactanos": la noche se vuelve amanecer (el `SkyTransition` de eclipse-web), sube el sol detrás
 * del horizonte y aparecen el link de la demo y el teléfono. Desde acá la estética es la de Eclipse. ~6 s.
 */
export const eclipseCta = defineRecipe<CtaProps>({
  id: "eclipse-cta",
  Component: ({ props, ratio }) => {
    const tall = ratio === "9x16";
    if (props.pitch) return <PitchView props={props} pitch={props.pitch} tall={tall} ratio={ratio} />;
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
    tl.fromTo([...one("sub"), ...one("url")], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.25 }, 1.5);
    tl.fromTo(one("horizon"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 1.4);
    tl.fromTo(one("contact"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1 }, 2.4);
    if (props.axis) {
      tl.fromTo(one("axis"), { backgroundColor: TR.volt }, { backgroundColor: EC.corona, duration: B / 8, ease: "none" }, 0);
      tl.fromTo(one("axis"), { autoAlpha: 1 }, { autoAlpha: 0, duration: B, ease: "power1.in" }, 0);
    }
    return tl;
  },
});

/** La cta de venta: titular de dos tonos a la izquierda (sobre la noche), bajada y link debajo, y el contacto abajo a la derecha (sobre el día). */
function PitchView({ props, pitch, tall, ratio }: { props: CtaProps; pitch: Pitch; tall: boolean; ratio: "16x9" | "9x16" }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: EC.night }}>
      <DawnSky ratio={ratio} />
      <div className="absolute flex flex-col" style={{ left: tall ? 90 : 170, top: tall ? 220 : 100, width: tall ? 900 : 1180, gap: tall ? 34 : 24 }}>
        <SectionMark n={props.n ?? "10"} label={pitch.label} dark />
        <SerifTitle text={pitch.title} italic={pitch.italic} italic2={pitch.italic2} size={tall ? 84 : 96} dark />
        <p data-t="sub" style={{ fontFamily: FONT.sans, fontSize: tall ? 36 : 34, lineHeight: 1.3, color: EC.dawn, maxWidth: tall ? 880 : 900 }}>{pitch.sub}</p>
        <p data-t="url" style={{ fontFamily: FONT.mono, fontSize: tall ? 30 : 32, color: EC.flare }}>{props.url ?? CONTACT.demoUrl}</p>
      </div>
      <div data-t="contact" className="absolute flex flex-col gap-2" style={tall ? { left: 90, top: 1300 } : { right: 170, top: 640, alignItems: "flex-end" }}>
        <p className="italic" style={{ fontFamily: FONT.serif, fontSize: tall ? 80 : 66, color: EC.ink }}>Contactanos</p>
        <p data-t="phone" className="tabular-nums" style={{ fontFamily: FONT.mono, fontSize: tall ? 96 : 80, fontWeight: 500, color: EC.ink, letterSpacing: "0.02em" }}>{props.phone ?? CONTACT.phone}</p>
        <p className="uppercase" style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: "0.22em", color: EC.muted }}>WhatsApp o llamada · Eclipse</p>
      </div>
      {props.axis && <div data-t="axis" aria-hidden="true" className="absolute inset-x-0" style={{ zIndex: 5, top: AXIS_Y[ratio] - HAIR / 2, height: HAIR, background: TR.volt }} />}
      <div data-t="horizon" className="absolute inset-x-0 h-[7px] origin-left" style={{ top: tall ? "92%" : "93.5%", background: `repeating-linear-gradient(90deg, ${EC.muted} 0 1px, transparent 1px 32px)`, borderTop: `1px solid ${EC.ink}` }} />
    </div>
  );
}
