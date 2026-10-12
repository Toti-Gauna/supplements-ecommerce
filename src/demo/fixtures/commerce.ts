import type { CarouselSlide, Coupon, Mission, PaymentMethod, ShippingZone } from "../types";

export interface DemoSettings {
  transferDiscountPct: number;
  freeShippingFrom: number;
  pendingTransferHours: number;
  transferAlias: string;
  transferCbu: string;
  transferHolder: string;
  nationalTaxRate: number;
  enabledMethods: PaymentMethod[];
  /** null = no confirmado: el CTA abre WhatsApp sin destinatario. */
  whatsappNumber: string | null;
  brandColors: { primary: string; accent: string; background: string };
  legalName: string | null;
  cuit: string | null;
  /** Aviso de stock bajo desde estas unidades (las demos viejas no lo traen: se usa 3). */
  lowStockThreshold?: number;
  /** Descuento stack: % y cuántas categorías de suplementos distintas hacen falta. */
  stack?: { pct: number; minCategories: number };
}

/** Ajustes de cobro de MUESTRA. Ningún dato bancario real. */
export const demoSettings: DemoSettings = {
  transferDiscountPct: 10,
  stack: { pct: 10, minCategories: 3 },
  freeShippingFrom: 120000,
  pendingTransferHours: 48,
  transferAlias: "ALIAS.DE.MUESTRA",
  transferCbu: "0000000000000000000000",
  transferHolder: "Titular de muestra",
  nationalTaxRate: 0.21,
  enabledMethods: ["CHECKOUT_PRO", "BANK_TRANSFER", "QR_MANUAL"],
  whatsappNumber: null,
  brandColors: { primary: "#c8ff2e", accent: "#1a1f28", background: "#0a0c10" },
  legalName: null,
  cuit: null,
};

/** Bloque "Armá tu stack" del inicio (Contenido → Textos de inicio). Lo que va después de la coma se pinta en voltio. */
export const homeCta = {
  title: "Tu estante, según tu objetivo",
  text: "Tocá un objetivo y mirá el stack que te sugerimos.",
};

export const coupons: Coupon[] = [
  { code: "BIENVENIDA10", type: "PERCENT", value: 10, description: "10% en tu primera compra", active: true, usedCount: 23 },
  { code: "FERIA2000", type: "FIXED", value: 2000, minSubtotal: 20000, description: "$2.000 desde $20.000 (cupón del gimnasio amigo)", active: true, maxUses: 50, usedCount: 12 },
  { code: "ENVIOGRATIS", type: "FREE_SHIPPING", value: 0, onlyRegistered: true, description: "Envío gratis, solo con cuenta", active: true, usedCount: 7 },
  { code: "INVIERNO", type: "PERCENT", value: 15, endsAt: "2026-08-31", description: "Cupón vencido de ejemplo", active: true, maxUses: 100, usedCount: 41 },
];

export const missions: Mission[] = [
  { id: "m-dos-productos", title: "Comprá 2 productos", description: "En uno o varios pedidos pagados.", type: "UNITS_COUNT", threshold: 2, reward: "Shaker VOLTA de regalo", active: true, nextMissionId: "m-gasto", completedCount: 14 },
  { id: "m-primera", title: "Primera compra con cuenta", description: "Tu primer pedido pagado con cuenta.", type: "ORDERS_COUNT", threshold: 1, reward: "Envío gratis en la próxima compra", active: true, nextMissionId: null, completedCount: 31 },
  { id: "m-gasto", title: "Sumá $100.000", description: "Acumulado en pedidos pagados.", type: "SPEND_TOTAL", threshold: 100000, reward: "Creatina 300 g de regalo", active: true, nextMissionId: null, completedCount: 4 },
];

/** Progreso de muestra de la cuenta demo, antes del pedido actual. */
export const demoAccountProgress: Record<string, number> = { "m-dos-productos": 1, "m-primera": 0, "m-gasto": 58000 };

export const shippingZones: ShippingZone[] = [
  { id: "pickup", type: "PICKUP", name: "Retiro en el local", price: 0, etaText: "Listo en 1 hora en días hábiles" },
  { id: "local", type: "LOCAL_DELIVERY", name: "Cadete en Mar del Plata", price: 3500, etaText: "En el día si comprás antes de las 14 h", postalCodes: ["7600", "7601", "7602", "7603", "7604", "7605", "7606", "7607", "7608", "7609", "7610", "7611", "7612"] },
  { id: "national", type: "SHIPPING", name: "Envío al resto del país", price: 9800, etaText: "3–7 días hábiles por correo" },
];

export const slides: CarouselSlide[] = [
  { id: "s1", title: "Cargá tu mejor versión", subtitle: "Proteínas, creatinas y pre-entrenos con lote y vencimiento a la vista.", ctaLabel: "Ver proteínas", ctaHref: "/c/proteinas/", art: "tub" },
  { id: "s2", title: "Creatina: 5\u00a0g que se notan", subtitle: "La más estudiada para fuerza. Ahora también en gomitas.", ctaLabel: "Ver creatinas", ctaHref: "/c/creatinas/", art: "jar" },
  { id: "s3", title: "Entrená con todo, recuperá mejor", subtitle: "Electrolitos, magnesio y omega 3 para volver mañana como nuevo.", ctaLabel: "Ver vitaminas y salud", ctaHref: "/c/salud/", art: "shaker" },
];

export const DEMO_TRACKING_TOKEN = "demo-volta";
export const DEMO_ORDER_CODE = "VOL-DEMO-0001";
