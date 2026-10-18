import type { SceneSpec } from "../core/types";
import { TU_TIENDA_BOOK } from "../eclipse/book";
import { fmtArs, fmtUsd } from "../eclipse/pricing";
import { CONTACT } from "../eclipse/tokens";

const words = (v: unknown) => (Array.isArray(v) ? v.join(" ") : typeof v === "string" ? v : "");

/**
 * Lo que cuenta T1 en texto, para lectores de pantalla (el escenario es imagen y música). Sale de los mismos datos que las
 * escenas: los supers y rótulos de `t1.ts`, el contacto de Eclipse y el guiño del libro de precios.
 */
export function t1Summary(scenes: SceneSpec[]): string {
  const props = (id: string) => (scenes.find((s) => s.id === id)?.props ?? {}) as Record<string, unknown>;
  const chips = scenes.map((s) => (s.props as { chip?: [string, string] } | undefined)?.chip?.[1]).filter((c): c is string => Boolean(c));
  const t = TU_TIENDA_BOOK.sections.find((s) => s.id === "base-campaign")?.teaser;
  return [
    "Trailer de Tu tienda, presentado por Eclipse: 45 segundos con música, sin voz.",
    ["calcadas", "veinte", "potes", "plano", "latido"].map((id) => words(props(id).text)).join(" "),
    `Lo que hace la tuya: ${new Intl.ListFormat("es", { type: "conjunction" }).format(chips).toLowerCase()}.`,
    `${words(props("software").lines)} Más ${words(props("asesoria").lines).toLowerCase()} ${words(props("promesa").lines)}`,
    `Probalo en vivo en ${CONTACT.demoUrl}. Contactanos al ${CONTACT.phone}, por WhatsApp o llamada.`,
    t ? `${t.title} ${t.italic} ${t.item}: ${fmtArs(t.price.ars)} (${fmtUsd(t.price.usd)}). ${t.fine}.` : "",
  ].filter(Boolean).join(" ");
}
