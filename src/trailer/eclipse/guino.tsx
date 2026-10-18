import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { splitChars } from "../recipes/kit";
import { BOOKS } from "./book";
import { SectionMark, SerifTitle } from "./Mark";
import { fmtArs, fmtUsd } from "./pricing";
import { DawnSky } from "./sky";
import { CONTACT, EC, FONT } from "./tokens";

export interface GuinoProps { book: string; section: string; n: string }

/**
 * El guiño del teaser (80–86): la campaña de lanzamiento en una sola página con la estética de Eclipse. Todo sale del libro de
 * precios (`teaser` de la sección): el titular, el renglón con su precio en pesos y el dólar debajo, y la letra chica con el
 * plan bonificado, la disponibilidad y el dólar de referencia. Al final cae la noche, que es donde entra el cierre.
 */
export const eclipseGuino = defineRecipe<GuinoProps>({
  id: "eclipse-guino",
  Component: ({ props, ratio }) => {
    const s = BOOKS[props.book]!.sections.find((x) => x.id === props.section)!;
    const t = s.teaser;
    if (!t) throw new Error(`La sección ${props.section} del libro ${props.book} no tiene teaser`);
    const tall = ratio === "9x16", px = tall ? 90 : 150;
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: EC.dawn }}>
        <div data-t="bridge" className="absolute inset-0"><DawnSky ratio={ratio} /></div>
        <div className="absolute inset-x-0 flex flex-col" style={{ top: tall ? 260 : 110, paddingInline: px }}>
          <SectionMark n={props.n} label={s.eyebrow} />
          <div className="mt-10"><SerifTitle text={t.title} italic={t.italic} size={tall ? 150 : 150} /></div>
          <div className="relative" style={{ marginTop: tall ? 90 : 60 }}>
            <div data-t="rule" className="origin-left" style={{ height: 2, background: EC.rulelight }} />
            <div className="flex items-end justify-between gap-10" style={{ paddingBlock: 28 }}>
              <p data-t="item" style={{ fontFamily: FONT.sans, fontSize: tall ? 40 : 38, fontWeight: 500, lineHeight: 1.2, color: EC.ink, maxWidth: tall ? 520 : 760 }}>{t.item}</p>
              <div className="shrink-0 text-right tabular-nums">
                <p data-t="price" style={{ fontFamily: FONT.mono, fontSize: 64, fontWeight: 500, color: EC.ink }}>{fmtArs(t.price.ars)}</p>
                <p data-t="usd" style={{ fontFamily: FONT.mono, fontSize: 28, color: EC.muted }}>{fmtUsd(t.price.usd)}</p>
              </div>
            </div>
          </div>
          <p data-t="fine" style={{ fontFamily: FONT.mono, fontSize: 22, lineHeight: 1.5, color: EC.muted, maxWidth: tall ? 900 : 1500 }}>{t.fine}</p>
        </div>
        <p data-t="foot" className="absolute" style={{ left: px, bottom: tall ? 120 : 70, fontFamily: FONT.mono, fontSize: 26, letterSpacing: "0.04em", color: EC.ink }}>{CONTACT.phone} · WhatsApp o llamada</p>
        <div data-t="veil" className="absolute inset-0" style={{ background: EC.void }} />
      </div>
    );
  },
  build: ({ q, beat: B, reduced }) => {
    const tl = gsap.timeline({ defaults: { ease: "trl.expo" } });
    const one = (sel: string) => q(`[data-t="${sel}"]`);
    if (reduced) { tl.set([...one("veil"), ...one("bridge")], { autoAlpha: 0 }, 0); return tl; }
    // El cielo con el que termina la cta sigue subiendo y se va: queda el día pleno donde se lee la campaña.
    tl.fromTo(one("bridge"), { yPercent: 0 }, { yPercent: -100, duration: B / 2, ease: "trl.expo" }, 0);
    tl.fromTo(one("mark"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0);
    tl.fromTo(one("mark-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 0.05);
    tl.fromTo(splitChars(one("title-line")), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.03 }, 0);
    tl.fromTo(one("rule"), { scaleX: 0 }, { scaleX: 1, duration: B }, B / 2);
    tl.fromTo([...one("item"), ...one("price")], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7 }, B);
    tl.fromTo(one("usd"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.5 * B);
    tl.fromTo([...one("fine"), ...one("foot")], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "none" }, 2 * B);
    tl.fromTo(one("veil"), { autoAlpha: 0 }, { autoAlpha: 1, duration: B, ease: "power1.in" }, 5 * B);
    return tl;
  },
});
