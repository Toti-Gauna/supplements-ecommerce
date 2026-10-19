import type { SceneSpec } from "../core/types";
import { GROWTH_OFFER, offerPrices } from "../eclipse/offer";
import { fmtArs, fmtUsd } from "../eclipse/pricing";
import { CONTACT } from "../eclipse/tokens";

const words = (v: unknown) => (Array.isArray(v) ? v.join(" ") : typeof v === "string" ? v : "");

/**
 * Lo que cuenta T1 en texto, para lectores de pantalla (el escenario es imagen y música). Sale de los mismos datos que las
 * escenas: los supers y rótulos de `t1.ts`, la oferta de venta de Eclipse y su contacto.
 */
export function t1Summary(scenes: SceneSpec[]): string {
  const props = (id: string) => (scenes.find((s) => s.id === id)?.props ?? {}) as Record<string, unknown>;
  const chips = scenes.map((s) => (s.props as { chip?: [string, string] } | undefined)?.chip?.[1]).filter((c): c is string => Boolean(c));
  const secs = Math.round(scenes.reduce((t, s) => t + s.dur, 0));
  const slides = (props("sistema").slides as Array<{ lines: string[] }> | undefined) ?? [];
  const pitch = props("en-vivo").pitch as { title: string; italic: string; italic2?: string; sub: string } | undefined;
  const o = GROWTH_OFFER, p = offerPrices(o);
  return [
    `Trailer de Tu tienda, presentado por Eclipse: ${secs} segundos con música, sin voz.`,
    ["calcadas", "veinte", "potes", "plano", "latido"].map((id) => words(props(id).text)).join(" "),
    `Lo que hace tu negocio: ${new Intl.ListFormat("es", { type: "conjunction" }).format(chips).toLowerCase()}.`,
    `${words(props("software").lines)} Más ${words(props("asesoria").lines).toLowerCase()}`,
    slides.map((s) => s.lines.join(" ")).join(" "),
    words(props("promesa").lines),
    pitch ? `${pitch.title} ${pitch.italic} ${pitch.italic2 ?? ""} ${pitch.sub} ${CONTACT.demoUrl}. Contactanos al ${CONTACT.phone}, por WhatsApp o llamada.` : "",
    `El precio de hacer crecer tu negocio: ${o.name}, con ${o.maintenance.months} meses de mantenimiento bonificados, ${fmtArs(p.list.ars)} (${fmtUsd(p.list.usd)}).`,
    `Incluye: ${o.includes.map((i) => i.name.toLowerCase()).join(", ")}.`,
    `Al contado, ${fmtArs(p.cash.ars)}; o en ${p.installments} cuotas de ${fmtArs(p.installment.ars)}, con 20 % de recargo en cada cuota.`,
  ].filter(Boolean).join(" ");
}
