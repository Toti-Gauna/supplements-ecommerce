/** Ruleta de cupones de MUESTRA. Pesos relativos; editable desde el panel demo. */

/** Plantillas de premio que el engine ya sabe convertir en cupón (8.3.25): todas terminan en PERCENT, FIXED o envío gratis. */
export type PrizeTemplate = "percent" | "fixed" | "shipping" | "engraving" | "gift";
export type PrizeKind = "PERCENT" | "FIXED" | "FREE_SHIPPING";

/** Premio del catálogo, con ID estable. Su nombre sale de la plantilla y los datos, no de un texto libre. */
export interface WheelPrize {
  id: string;
  template: PrizeTemplate;
  name: string;
  kind: PrizeKind;
  value: number;
  minSubtotal?: number;
  /** Producto que se regala (plantilla "gift"). */
  productSlug?: string;
}

/** Un gajo de la ruleta: qué premio da y con qué peso. Lleva copia del premio para el sorteo y el cupón. */
export interface WheelSegment {
  id: string;
  /** Premio del catálogo (desde 8.3.25). */
  prizeId?: string;
  label: string;
  kind: PrizeKind;
  value: number;
  minSubtotal?: number;
  weight: number;
  active: boolean;
}

export interface WheelConfig {
  active: boolean;
  validDays: number;
  segments: WheelSegment[];
  /** Catálogo de premios (desde 8.3.25; los datos guardados antes se completan desde los gajos). */
  prizes?: WheelPrize[];
}

const PRIZES: WheelPrize[] = [
  { id: "p-5", template: "percent", name: "5% OFF", kind: "PERCENT", value: 5 },
  { id: "p-envio", template: "shipping", name: "Envío gratis", kind: "FREE_SHIPPING", value: 0 },
  { id: "p-grabado", template: "engraving", name: "Grabado gratis", kind: "FIXED", value: 2500 },
  { id: "p-10", template: "percent", name: "10% OFF", kind: "PERCENT", value: 10 },
  { id: "p-3000", template: "fixed", name: "$3.000 OFF", kind: "FIXED", value: 3000, minSubtotal: 25000 },
  { id: "p-llavero", template: "gift", name: "Llavero de regalo", kind: "FIXED", value: 9900, minSubtotal: 30000 },
  { id: "p-15", template: "percent", name: "15% OFF", kind: "PERCENT", value: 15 },
];

const slot = (id: string, prizeId: string, weight: number): WheelSegment => {
  const p = PRIZES.find((x) => x.id === prizeId)!;
  return { id, prizeId, label: p.name, kind: p.kind, value: p.value, ...(p.minSubtotal ? { minSubtotal: p.minSubtotal } : {}), weight, active: true };
};

export const defaultWheel: WheelConfig = {
  active: true,
  validDays: 7,
  prizes: PRIZES,
  segments: [
    slot("w5", "p-5", 26), slot("wship", "p-envio", 20), slot("wgrab", "p-grabado", 16), slot("w10", "p-10", 12),
    slot("w3000", "p-3000", 12), slot("wkey", "p-llavero", 6), slot("w15", "p-15", 4), slot("wship2", "p-envio", 4),
  ],
};
