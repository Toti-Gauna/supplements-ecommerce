import { brand } from "@/config/brand";
import { HOUSE_SHAKER_SLUG } from "./house";
import { ORDER_PREFIX } from "./house";
/**
 * Datos de Operaciones para la demo: calendario de despachos, cupo del cadete, insumos de embalaje y costos. Las fichas
 * de clientes viven en `customers.ts`. Todo es de MUESTRA: costos, proveedores y fechas son inventados.
 */

export type ClosureKind = "feriado" | "no-laborable" | "cierre";

export interface Closure {
  /** AAAA-MM-DD */
  date: string;
  name: string;
  kind: ClosureKind;
}

export interface WorkshopSettings {
  /** Pedidos que el cadete reparte por día en Mar del Plata (retiro y envío al país no tienen cupo). */
  dailyCapacity: number;
  /** Días de la semana sin despachos (0 = domingo … 6 = sábado). */
  closedWeekdays: number[];
  /** Feriados, días no laborables y cierres propios (vacaciones, inventario). */
  closures: Closure[];
  /** Margen que Volta quiere ganar sobre el precio de venta, en %. */
  targetMarginPct: number;
}

/**
 * Feriados nacionales y días no laborables con fines turísticos de Argentina (Ley 27.399; 2026: Resolución 164/2025).
 * Los trasladables ya están en su fecha corrida. Para 2027 faltan los días turísticos, que se decretan cada año:
 * se agregan desde el panel.
 */
export const AR_HOLIDAYS: Closure[] = [
  { date: "2026-01-01", name: "Año Nuevo", kind: "feriado" },
  { date: "2026-02-16", name: "Carnaval", kind: "feriado" },
  { date: "2026-02-17", name: "Carnaval", kind: "feriado" },
  { date: "2026-03-23", name: "Día no laborable turístico", kind: "no-laborable" },
  { date: "2026-03-24", name: "Día de la Memoria", kind: "feriado" },
  { date: "2026-04-02", name: "Malvinas", kind: "feriado" },
  { date: "2026-04-03", name: "Viernes Santo", kind: "feriado" },
  { date: "2026-05-01", name: "Día del Trabajador", kind: "feriado" },
  { date: "2026-05-25", name: "Revolución de Mayo", kind: "feriado" },
  { date: "2026-06-15", name: "Paso a la Inmortalidad de Güemes", kind: "feriado" },
  { date: "2026-06-20", name: "Día de la Bandera", kind: "feriado" },
  { date: "2026-07-09", name: "Día de la Independencia", kind: "feriado" },
  { date: "2026-07-10", name: "Día no laborable turístico", kind: "no-laborable" },
  { date: "2026-08-17", name: "Paso a la Inmortalidad de San Martín", kind: "feriado" },
  { date: "2026-10-12", name: "Día de la Diversidad Cultural", kind: "feriado" },
  { date: "2026-11-23", name: "Día de la Soberanía Nacional", kind: "feriado" },
  { date: "2026-12-07", name: "Día no laborable turístico", kind: "no-laborable" },
  { date: "2026-12-08", name: "Inmaculada Concepción", kind: "feriado" },
  { date: "2026-12-25", name: "Navidad", kind: "feriado" },
  { date: "2027-01-01", name: "Año Nuevo", kind: "feriado" },
  { date: "2027-02-08", name: "Carnaval", kind: "feriado" },
  { date: "2027-02-09", name: "Carnaval", kind: "feriado" },
  { date: "2027-03-24", name: "Día de la Memoria", kind: "feriado" },
  { date: "2027-03-26", name: "Viernes Santo", kind: "feriado" },
  { date: "2027-04-02", name: "Malvinas", kind: "feriado" },
  { date: "2027-05-01", name: "Día del Trabajador", kind: "feriado" },
  { date: "2027-05-25", name: "Revolución de Mayo", kind: "feriado" },
  { date: "2027-06-21", name: "Paso a la Inmortalidad de Güemes", kind: "feriado" },
  { date: "2027-06-20", name: "Día de la Bandera", kind: "feriado" },
  { date: "2027-07-09", name: "Día de la Independencia", kind: "feriado" },
  { date: "2027-08-16", name: "Paso a la Inmortalidad de San Martín", kind: "feriado" },
  { date: "2027-10-11", name: "Día de la Diversidad Cultural", kind: "feriado" },
  { date: "2027-11-20", name: "Día de la Soberanía Nacional", kind: "feriado" },
  { date: "2027-12-08", name: "Inmaculada Concepción", kind: "feriado" },
  { date: "2027-12-25", name: "Navidad", kind: "feriado" },
];

/**
 * Entradas propias del calendario (Polish 8.3.15): tareas del local y notas de un pedido, con su fecha. Los cierres
 * no son entradas: viven en `closures`. De MUESTRA.
 */
export type CalendarEventKind = "tarea" | "pedido";

export interface CalendarEvent {
  id: string;
  /** AAAA-MM-DD */
  date: string;
  title: string;
  kind: CalendarEventKind;
  notes?: string;
  /** Pedido al que se refiere (solo "pedido"). */
  orderCode?: string;
}

export const calendarEvents: CalendarEvent[] = [
  { id: "ev-entrega-krono", date: "2026-10-06", title: "Recibir la entrega de Krono Nutrition", kind: "tarea", notes: "12 Isolate Zero y 20 BCAA (de muestra). Controlar lotes y vencimientos." },
  { id: "ev-retiro-113", date: "2026-10-08", title: "Ana retira el pedido del gimnasio", kind: "pedido", orderCode: `${ORDER_PREFIX}-000113`, notes: "Avisarle por WhatsApp cuando esté armado." },
];

export const workshopSettings: WorkshopSettings = {
  dailyCapacity: 2,
  closedWeekdays: [0, 6],
  closures: [...AR_HOLIDAYS, { date: "2026-11-06", name: "Inventario anual (local cerrado, de muestra)", kind: "cierre" }],
  targetMarginPct: 35,
};

/** Embalaje y regalos se cuentan por unidad; la cinta, por metro. */
export type MaterialUnit = "u" | "m";

export const UNIT_LABEL: Record<MaterialUnit, string> = { u: "unidades", m: "metros" };
export const UNIT_SHORT: Record<MaterialUnit, string> = { u: "u.", m: "m" };

export interface Material {
  id: string;
  name: string;
  unit: MaterialUnit;
  /** Pesos enteros por unidad de medida (por unidad o por metro). */
  costPerUnit: number;
  stock: number;
  /** Avisar para reponer con este stock o menos. */
  minStock: number;
  supplier?: string;
}

/** Insumos de MUESTRA (embalaje y regalos que se suman al preparar): precios y proveedores inventados. */
export const materials: Material[] = [
  { id: "caja-chica", name: "Caja de envío chica", unit: "u", costPerUnit: 650, stock: 80, minStock: 40, supplier: "Packaging (muestra)" },
  { id: "caja-grande", name: "Caja de envío grande", unit: "u", costPerUnit: 950, stock: 18, minStock: 20, supplier: "Packaging (muestra)" },
  { id: "bolsa", name: "Bolsa con logo", unit: "u", costPerUnit: 320, stock: 120, minStock: 50, supplier: "Packaging (muestra)" },
  { id: "folleto", name: "Folleto con tabla de dosis", unit: "u", costPerUnit: 90, stock: 300, minStock: 100, supplier: "Imprenta (muestra)" },
  { id: "sticker", name: `Sticker ${brand.mark}`, unit: "u", costPerUnit: 60, stock: 500, minStock: 100, supplier: "Imprenta (muestra)" },
  { id: "precinto", name: "Precinto de seguridad", unit: "u", costPerUnit: 40, stock: 400, minStock: 150 },
  { id: "cinta", name: "Cinta de embalar", unit: "m", costPerUnit: 12, stock: 600, minStock: 200 },
  { id: "sachet-muestra", name: "Sachet de muestra (regalo)", unit: "u", costPerUnit: 450, stock: 26, minStock: 30, supplier: "Distribuidora (muestra)" },
  { id: "shaker-regalo", name: "Shaker de regalo para combos", unit: "u", costPerUnit: 2100, stock: 6, minStock: 10, supplier: "Distribuidora (muestra)" },
];

export interface RecipeItem {
  materialId: string;
  /** Cantidad en la unidad del insumo (puede ser fracción en metros: 1,2 m de cinta). */
  qty: number;
}

/** Costo de un producto: lo que se le paga al proveedor y el embalaje que lleva al prepararlo. */
export interface Recipe {
  /** Costo de la mercadería al proveedor (presentación más barata), en pesos enteros. */
  supplierCost?: number;
  /** Costo propio de otras presentaciones (id de variante → pesos). Sin cargar, se estima en proporción al precio. */
  variantCosts?: Record<string, number>;
  /** Embalaje e insumos por unidad. */
  items: RecipeItem[];
}

/** Costos de MUESTRA por producto (la marca propia deja más margen). Los productos sin costo aparecen como "sin costo cargado". */
export const recipes: Record<string, Recipe> = {
  "ionic-whey": { supplierCost: 26400, variantCosts: { "iw-chocolate-5lb": 52800, "iw-vainilla-5lb": 52800, "iw-frutilla-5lb": 52800, "iw-cookies-cream-5lb": 52800 }, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "isolate-zero": { supplierCost: 43500, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "proteina-vegana": { supplierCost: 29300, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "night-casein": { supplierCost: 38900, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "mass-gainer": { supplierCost: 35300, items: [{ materialId: "caja-grande", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "creatina-monohidrato": { supplierCost: 14400, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "creatina-gomitas": { supplierCost: 16800, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "creatina-brava": { supplierCost: 15900, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "overvolt-pre": { supplierCost: 22100, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "pump-flow": { supplierCost: 22800, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "bcaa-211": { supplierCost: 16700, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "glutamina": { supplierCost: 12000, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "l-carnitina": { supplierCost: 13100, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "termo-cut": { supplierCost: 15500, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "multivitaminico": { supplierCost: 8100, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  "omega-3": { supplierCost: 11300, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  "magnesio-bisglicinato": { supplierCost: 10500, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  "colageno": { supplierCost: 14300, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }] },
  "barra-proteica": { supplierCost: 1400, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  "alfajor-proteico": { supplierCost: 9500, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  "mantequilla-mani": { supplierCost: 5900, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  "electrolitos": { supplierCost: 6200, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  "gel-energetico": { supplierCost: 7100, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  [HOUSE_SHAKER_SLUG]: { supplierCost: 4300, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  "magnesio-tiza": { supplierCost: 2400, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }] },
  // Equipamiento (L2): va en bolsa con el folleto, sin precinto (no es un alimento).
  "straps-algodon": { supplierCost: 8200, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
  "cinturon-palanca": { supplierCost: 41200, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
  "rodilleras-neoprene": { supplierCost: 23600, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
  "munequeras-abrojo": { supplierCost: 9300, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
  "guantes-boxeo": { supplierCost: 32900, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
  "vendas-boxeo": { supplierCost: 5400, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
  "soga-rulemanes": { supplierCost: 10400, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
  "bandas-elasticas": { supplierCost: 15300, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
  "botella-1l": { supplierCost: 8200, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
  "bolso-40l": { supplierCost: 30200, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }] },
};
