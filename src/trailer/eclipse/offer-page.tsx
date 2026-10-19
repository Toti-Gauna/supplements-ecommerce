import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { SectionMark, SerifTitle } from "./Mark";
import { GROWTH_OFFER, offerPrices } from "./offer";
import { fmtArs, fmtUsd } from "./pricing";
import { EC, FONT } from "./tokens";

export interface OfferProps { n: string }

const pct = (r: number) => `${Math.round(r * 100)} %`;

/**
 * "El precio de hacer crecer tu negocio" (pedido de Ignacio, 19/10/2026): a la izquierda el titular; a la derecha el paquete con su precio,
 * lo que incluye y las dos formas de pagarlo (al contado con descuento y en cuotas con su recargo). Estética del libro de precios de Eclipse.
 */
export const eclipseOffer = defineRecipe<OfferProps>({
  id: "eclipse-offer",
  Component: ({ props, ratio }) => {
    const tall = ratio === "9x16", o = GROWTH_OFFER, p = offerPrices(o);
    const box = (tag: string, label: string, big: string, small: string, dark: boolean) => (
      <div data-t={tag} className="flex-1 rounded-[18px] border" style={{ padding: tall ? "26px 28px" : "22px 26px", background: dark ? EC.ink : "transparent", borderColor: EC.ink }}>
        <p className="uppercase" style={{ fontFamily: FONT.mono, fontSize: 17, letterSpacing: "0.16em", color: dark ? EC.corona : EC.deep }}>{label}</p>
        <p className="mt-2 tabular-nums" style={{ fontFamily: FONT.mono, fontSize: tall ? 54 : 50, fontWeight: 500, color: dark ? EC.dawn : EC.ink }}>{big}</p>
        <p className="mt-1" style={{ fontFamily: FONT.sans, fontSize: 19, lineHeight: 1.35, color: dark ? EC.dim : EC.muted }}>{small}</p>
      </div>
    );
    return (
      <div className={`absolute inset-0 flex ${tall ? "flex-col gap-12 px-[90px] pt-[170px]" : "gap-20 px-[150px] pt-[120px]"}`} style={{ background: EC.dawn }}>
        <div className={tall ? "" : "w-[600px] shrink-0"}>
          <SectionMark n={props.n} label="La inversión" />
          <div className="mt-10" style={{ maxWidth: tall ? 900 : 600 }}><SerifTitle text="El precio de" italic="hacer crecer tu negocio." size={tall ? 116 : 104} /></div>
        </div>
        <div className="min-w-0 flex-1">
          <div data-t="pack" className="border-t pt-6" style={{ borderColor: EC.ink }}>
            <p style={{ fontFamily: FONT.sans, fontSize: tall ? 32 : 30, fontWeight: 500, lineHeight: 1.25, color: EC.ink }}>{o.name}</p>
            <p className="mt-2 uppercase" style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: "0.14em", color: EC.deep }}>+ {o.maintenance.months} meses de mantenimiento bonificados</p>
            <div className="mt-4 flex items-baseline gap-5 tabular-nums">
              <p data-t="price" style={{ fontFamily: FONT.mono, fontSize: tall ? 92 : 84, fontWeight: 500, color: EC.ink }}>{fmtArs(p.list.ars)}</p>
              <p style={{ fontFamily: FONT.mono, fontSize: 24, color: EC.muted }}>{fmtUsd(p.list.usd)}</p>
            </div>
          </div>
          <p className="mt-6 uppercase" style={{ fontFamily: FONT.mono, fontSize: 17, letterSpacing: "0.18em", color: EC.muted }}>Incluye</p>
          <ul className="mt-2">
            {o.includes.map((it) => (
              <li key={it.name} data-t="inc" className="flex gap-4 border-b py-3" style={{ borderColor: EC.rulelight }}>
                <span className="mt-[12px] block size-3 shrink-0 rounded-full" style={{ background: EC.corona }} />
                <div>
                  <p style={{ fontFamily: FONT.sans, fontSize: tall ? 28 : 26, fontWeight: 500, color: EC.ink }}>{it.name}</p>
                  <p style={{ fontFamily: FONT.sans, fontSize: tall ? 21 : 19, color: EC.muted }}>{it.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className={`mt-6 flex gap-5 ${tall ? "flex-col" : ""}`}>
            {box("cash", `Al contado · ${pct(o.cashDiscount)} off`, fmtArs(p.cash.ars), `${fmtUsd(p.cash.usd)} · pagando todo de una vez`, true)}
            {box("cuotas", `Hasta ${p.installments} cuotas`, `${p.installments} × ${fmtArs(p.installment.ars)}`, `Recargo del ${pct(o.installments.surchargePerInstallment)} en cada cuota · total ${fmtArs(p.financed.ars)}`, false)}
          </div>
        </div>
        <p className="absolute uppercase" style={{ left: tall ? 90 : 150, bottom: tall ? 80 : 44, fontFamily: FONT.mono, fontSize: 16, letterSpacing: "0.18em", color: EC.muted }}>
          Tu tienda · Eclipse · dólar a $ 1.500
        </p>
      </div>
    );
  },
  cues: () => [...GROWTH_OFFER.includes.map((_, i) => ({ t: 1.3 + i * 0.35, voice: "tick" as const, midi: 76 + i * 2, vel: 0.35 })), { t: 2.6, voice: "shimmer" as const, midi: 84, vel: 0.45 }],
  build: ({ q, reduced }) => {
    const tl = gsap.timeline({ defaults: { ease: "trl.expo" } });
    const one = (sel: string) => q(`[data-t="${sel}"]`);
    if (reduced) { tl.fromTo([...one("mark"), ...one("title-line"), ...one("pack"), ...one("inc"), ...one("cash"), ...one("cuotas")], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" }, 0); return tl; }
    tl.fromTo(one("mark"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.05);
    tl.fromTo(one("mark-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 0.1);
    tl.fromTo(one("title-line"), { autoAlpha: 0, yPercent: 40 }, { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.12 }, 0.15);
    tl.fromTo(one("pack"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.6);
    tl.fromTo(one("inc"), { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.35 }, 1.3);
    tl.fromTo(one("cash"), { autoAlpha: 0, y: 24, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 }, 2.6);
    tl.fromTo(one("cuotas"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 3.2);
    return tl;
  },
});
