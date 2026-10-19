import offer from "./data/oferta-crecimiento.json";
import prices from "./data/prices.v2026-10-16.json";
import { fmtUsd, USD_RATE, type Money, type PriceBook, type Prices } from "./pricing";

/**
 * La oferta de venta de T1 (pedido de Ignacio, 19/10/2026): el paquete de crecimiento con lo que incluye, el precio al contado y en
 * cuotas, el mantenimiento bonificado y las piezas para sumar. Todo sale de `data/oferta-crecimiento.json` y del tarifario aprobado.
 */
export interface GrowthOffer {
  id: string; name: string; usd: number; maintenance: { plan: string; months: number };
  includes: Array<{ name: string; detail: string }>; cashDiscount: number; installments: { max: number; surchargePerInstallment: number };
}

const money = (usd: number, rate = USD_RATE): Money => ({ usd, ars: Math.round(usd * rate) });

/** Precio de lista, al contado (con su descuento) y en cuotas (cada cuota con su recargo). */
export function offerPrices(o: GrowthOffer, rate = USD_RATE) {
  const n = o.installments.max, each = (o.usd / n) * (1 + o.installments.surchargePerInstallment);
  return { list: money(o.usd, rate), cash: money(o.usd * (1 - o.cashDiscount), rate), installment: money(each, rate), financed: money(each * n, rate), installments: n };
}

export const GROWTH_OFFER = offer as GrowthOffer;
const P = prices as Prices;
const plan = P.plans.find((p) => p.id === GROWTH_OFFER.maintenance.plan)!;

/**
 * Páginas de venta que se muestran con la receta `eclipse-prices`: el mantenimiento (qué es, qué cubre y cuánto sale después de los
 * meses bonificados) y las piezas para seguir creciendo. La capacidad (usuarios y datos) la confirma Ignacio: no se inventa.
 */
export const SALES_BOOK: PriceBook = {
  product: "Tu tienda", rate: USD_RATE, version: P.version,
  sections: [
    {
      id: "mantenimiento", eyebrow: "Mantenimiento", title: "Tu negocio,", italic: "siempre andando.",
      note: `Los primeros ${GROWTH_OFFER.maintenance.months} meses van bonificados. Después, plan ${plan.name}.`,
      rows: [
        { name: `${GROWTH_OFFER.maintenance.months} meses de mantenimiento bonificados`, detail: "Tu tienda online, actualizada y funcionando desde el primer día.", price: null, tag: "Incluido en el paquete" },
        { name: "Ajustes y configuración priorizada", detail: `${P.monthlyHours} h por mes para cambios, nuevas fechas y promos.`, price: null, tag: "Todos los meses" },
        { name: "Servidor y servicios de terceros", detail: `Cubiertos hasta ${fmtUsd(plan.thirdPartyBudget)} por mes.`, price: null, tag: "Incluidos" },
        { name: `Después, plan ${plan.name}`, detail: plan.scope, price: money(plan.monthly), unit: "por mes" },
      ],
    },
    {
      id: "piezas", eyebrow: "Para seguir creciendo", title: "Sumá lo que", italic: "tu negocio necesite.",
      note: "Cada pieza se suma cuando la necesites.",
      rows: [
        { name: "Más mensajes automáticos de WhatsApp", detail: "Ampliá los 100 iniciales cuando tu base de clientes crezca.", price: null, tag: "Se suman a pedido" },
        ...(["chatbot", "voice", "economics", "landing"] as const).map((id) => ({ name: P.extras[id]!.name, detail: P.extras[id]!.scope, price: money(P.extras[id]!.price), unit: "único" as const })),
      ],
    },
  ],
};
