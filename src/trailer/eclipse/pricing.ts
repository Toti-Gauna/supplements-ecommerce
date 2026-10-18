/**
 * Libro de precios genérico de Eclipse (puro, con tests): toma el tarifario aprobado y las ofertas del kit de emails
 * (`eclipse-email-kit/data/offers/*.json`) y arma las páginas del bloque final, en pesos con el dólar debajo. Sirve para
 * cualquier producto de Eclipse: cambian el nombre del producto, las ofertas y su orden.
 */
export interface Extra { name: string; price: number; scope: string }
export interface Plan { id: string; name: string; monthly: number; thirdPartyBudget: number; scope: string }
export interface Prices {
  version: string; currency: string; adaptation: number; pack: number; depositRatio: number;
  extras: Record<string, Extra>; plans: Plan[]; migration: { min: number; max: number }; operationalModuleFrom: number; monthlyHours: number;
}
export interface Offer {
  id: string; type: "adaptation" | "pack"; selectedPlan: string; includedExtras: string[]; recommendedExtras: string[]; landingIncluded: boolean;
  promotion: { enabled: boolean; months: number; creditPlan: string; note?: string };
  /** Frases del guiño de cierre del teaser; `{months}` y `{product}` se completan con los datos de la oferta. */
  teaser?: { title: string; italic: string; item: string };
}

export interface Money { ars: number; usd: number }
export interface PriceRow { name: string; detail?: string; price: Money | null; tag?: string; unit?: "único" | "por mes"; credit?: boolean }
/** Guiño de una oferta: titular, renglón con su precio y la letra chica (todo sale del tarifario y de la oferta). */
export interface Teaser { title: string; italic: string; item: string; price: Money; fine: string }
export interface PriceSection { id: string; eyebrow: string; title: string; italic: string; rows: PriceRow[]; note?: string; teaser?: Teaser }
export interface PriceBook { product: string; rate: number; version: string; sections: PriceSection[] }

const money = (usd: number, rate: number): Money => ({ usd, ars: Math.round(usd * rate) });

function offerSection(o: Offer, p: Prices, rate: number, product: string): PriceSection {
  const plan = p.plans.find((x) => x.id === o.promotion.creditPlan);
  const pack = o.type === "pack";
  const rows: PriceRow[] = [{ name: pack ? `Pack ${product}` : `Adaptación de ${product}`, detail: pack ? "Producto listo con tu marca, más la puesta en marcha." : "Tu marca y tu contenido sobre un producto que ya funciona.", price: money(pack ? p.pack : p.adaptation, rate), unit: "único" }];
  if (o.landingIncluded) rows.push({ name: p.extras.landing!.name, detail: "Incluida en el pack.", price: null, tag: `Incluida · vale ${fmtUsd(p.extras.landing!.price)}` });
  for (const id of o.includedExtras) rows.push({ name: p.extras[id]!.name, detail: p.extras[id]!.scope, price: null, tag: `Incluida · vale ${fmtUsd(p.extras[id]!.price)}` });
  if (o.promotion.enabled && plan) rows.push({ name: `${o.promotion.months} meses del plan ${plan.name} bonificados`, price: money(-o.promotion.months * plan.monthly, rate), credit: true });
  for (const id of o.recommendedExtras) rows.push({ name: p.extras[id]!.name, detail: p.extras[id]!.scope, price: money(p.extras[id]!.price, rate), unit: "único", tag: "Opcional" });
  const credit = plan && o.promotion.enabled ? plan : undefined;
  const teaser = o.teaser && credit ? teaserOf(o, p, credit, rate, product) : undefined;
  return {
    id: o.id, eyebrow: pack ? "Pack de lanzamiento" : "Campaña de lanzamiento", title: pack ? "Todo listo," : "Empezá con", italic: pack ? "de una." : "asesoría incluida.",
    rows, note: `Seña del ${Math.round(p.depositRatio * 100)} % para empezar${o.promotion.note ? " · sujeto a disponibilidad" : ""}.`, teaser,
  };
}

function teaserOf(o: Offer, p: Prices, plan: Plan, rate: number, product: string): Teaser {
  const t = o.teaser!, fill = (s: string) => s.replace("{months}", String(o.promotion.months)).replace("{product}", product);
  const fine = [`Incluye ${o.promotion.months} meses del plan ${plan.name} (${fmtArs(money(plan.monthly, rate).ars)}/mes)`, ...(o.promotion.note ? ["sujeto a disponibilidad"] : []), `dólar a $ ${rate.toLocaleString("es-AR")}`];
  return { title: fill(t.title), italic: fill(t.italic), item: fill(t.item), price: money(o.type === "pack" ? p.pack : p.adaptation, rate), fine: fine.join(" · ") };
}

export function buildPriceBook({ prices, offers, product, rate }: { prices: Prices; offers: Offer[]; product: string; rate: number }): PriceBook {
  const sections = offers.map((o) => offerSection(o, prices, rate, product));
  sections.push({
    id: "planes", eyebrow: "Planes mensuales", title: "Siempre", italic: "funcionando.", note: `Incluyen ${prices.monthlyHours} h por mes y el presupuesto de terceros.`,
    rows: prices.plans.map((pl) => ({ name: pl.name, detail: pl.scope, price: money(pl.monthly, rate), unit: "por mes", tag: `Terceros hasta ${fmtUsd(pl.thirdPartyBudget)}` })),
  });
  sections.push({
    id: "extras", eyebrow: "Para sumar", title: "Crecé con", italic: "lo que necesites.", note: `Migración ${fmtUsd(prices.migration.min)}–${prices.migration.max} · módulos operativos desde ${fmtUsd(prices.operationalModuleFrom)}.`,
    rows: ["growth", "economics", "both", "whatsapp", "chatbot", "voice"].filter((id) => prices.extras[id]).map((id) => ({ name: prices.extras[id]!.name, detail: prices.extras[id]!.scope, price: money(prices.extras[id]!.price, rate), unit: "único" as const })),
  });
  return { product, rate, version: prices.version, sections };
}

/** "$ 750.000" (pesos, sin decimales) y "USD 500". */
export const fmtArs = (n: number) => `${n < 0 ? "−" : ""}$ ${Math.abs(n).toLocaleString("es-AR")}`;
export const fmtUsd = (n: number) => `USD ${n.toLocaleString("es-AR")}`;
