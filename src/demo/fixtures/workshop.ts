/**
 * Datos del taller para la demo (pedido de Ignacio, fuera de la especificación): calendario, capacidad, insumos,
 * recetas de costo y fichas de clientes. Todo es de MUESTRA: costos, proveedores, mascotas y fechas son inventados.
 */

export type ClosureKind = "feriado" | "no-laborable" | "cierre";

export interface Closure {
  /** AAAA-MM-DD */
  date: string;
  name: string;
  kind: ClosureKind;
}

export interface WorkshopSettings {
  /** Pedidos que el taller puede terminar por día. */
  dailyCapacity: number;
  /** Días de la semana sin trabajo (0 = domingo … 6 = sábado). */
  closedWeekdays: number[];
  /** Feriados, días no laborables y cierres propios (vacaciones, ferias). */
  closures: Closure[];
  /** Costo de una hora de máquina (luz, desgaste, repuestos), en pesos. */
  machineHourCost: number;
  /** Costo de una hora de trabajo a mano (terminación, pintura, armado), en pesos. */
  handHourCost: number;
  /** Margen que Volta quiere ganar sobre el precio de venta, en %. */
  targetMarginPct: number;
  /** Días después de la compra para sugerir la recompra, por categoría (velas y aromas se terminan). */
  repurchaseDays: Record<string, number>;
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
 * Entradas propias del calendario (Polish 8.3.15): tareas del taller y notas de un pedido, con su fecha. Los cierres
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
  { id: "ev-filamento", date: "2026-10-06", title: "Recibir la entrega de Krono Nutrition", kind: "tarea", notes: "12 Isolate Zero y 20 BCAA (de muestra). Controlar lotes y vencimientos." },
  { id: "ev-retiro-113", date: "2026-10-08", title: "Ana retira el pedido del gimnasio", kind: "pedido", orderCode: "VOL-000113", notes: "Avisarle por WhatsApp cuando esté armado." },
];

export const workshopSettings: WorkshopSettings = {
  dailyCapacity: 3,
  closedWeekdays: [0, 6],
  closures: [...AR_HOLIDAYS, { date: "2026-11-06", name: "Inventario anual (local cerrado, de muestra)", kind: "cierre" }],
  machineHourCost: 0,
  handHourCost: 4500,
  targetMarginPct: 35,
  repurchaseDays: { proteinas: 30, creatinas: 60, "pre-entrenos": 30, aminoacidos: 30, ganadores: 20, salud: 60 },
};

export type MaterialUnit = "g" | "ml" | "u" | "m" | "plancha";

export const UNIT_LABEL: Record<MaterialUnit, string> = { g: "gramos", ml: "ml", u: "unidades", m: "metros", plancha: "planchas" };
export const UNIT_SHORT: Record<MaterialUnit, string> = { g: "g", ml: "ml", u: "u.", m: "m", plancha: "pl." };

export interface Material {
  id: string;
  name: string;
  unit: MaterialUnit;
  /** Pesos enteros por unidad de medida (por gramo, por ml, por unidad…). */
  costPerUnit: number;
  stock: number;
  /** Avisar para reponer con este stock o menos. */
  minStock: number;
  supplier?: string;
}

/** Insumos de MUESTRA (embalaje y regalos con la compra): precios y proveedores inventados. */
export const materials: Material[] = [
  { id: "caja-chica", name: "Caja de envío chica", unit: "u", costPerUnit: 650, stock: 80, minStock: 40, supplier: "Packaging (muestra)" },
  { id: "caja-grande", name: "Caja de envío grande", unit: "u", costPerUnit: 950, stock: 18, minStock: 20, supplier: "Packaging (muestra)" },
  { id: "bolsa", name: "Bolsa con logo", unit: "u", costPerUnit: 320, stock: 120, minStock: 50, supplier: "Packaging (muestra)" },
  { id: "folleto", name: "Folleto con tabla de dosis", unit: "u", costPerUnit: 90, stock: 300, minStock: 100, supplier: "Imprenta (muestra)" },
  { id: "sticker", name: "Sticker VOLTA", unit: "u", costPerUnit: 60, stock: 500, minStock: 100, supplier: "Imprenta (muestra)" },
  { id: "precinto", name: "Precinto de seguridad", unit: "u", costPerUnit: 40, stock: 400, minStock: 150 },
  { id: "cinta", name: "Cinta de embalar", unit: "m", costPerUnit: 12, stock: 600, minStock: 200 },
  { id: "sachet-muestra", name: "Sachet de muestra (regalo)", unit: "u", costPerUnit: 450, stock: 26, minStock: 30, supplier: "Distribuidora (muestra)" },
  { id: "shaker-regalo", name: "Shaker de regalo para combos", unit: "u", costPerUnit: 2100, stock: 6, minStock: 10, supplier: "Distribuidora (muestra)" },
];

export interface RecipeItem {
  materialId: string;
  /** Cantidad en la unidad del insumo (puede ser fracción: media plancha, 0,3 m). */
  qty: number;
}

/** Costo de un producto: lo que se le paga al proveedor, el embalaje y los minutos de armado. */
export interface Recipe {
  /** Costo de la mercadería al proveedor (variante más barata), en pesos enteros. */
  supplierCost?: number;
  items: RecipeItem[];
  machineMinutes: number;
  handMinutes: number;
}

/** Costos de MUESTRA por producto (la marca propia deja más margen). Los productos sin costo aparecen como "sin costo cargado". */
export const recipes: Record<string, Recipe> = {
  "ionic-whey": { supplierCost: 26400, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "isolate-zero": { supplierCost: 43500, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "proteina-vegana": { supplierCost: 29300, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "night-casein": { supplierCost: 38900, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "mass-gainer": { supplierCost: 35300, items: [{ materialId: "caja-grande", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "creatina-monohidrato": { supplierCost: 14400, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "creatina-gomitas": { supplierCost: 16800, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "creatina-brava": { supplierCost: 15900, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "overvolt-pre": { supplierCost: 22100, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "pump-flow": { supplierCost: 22800, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "bcaa-211": { supplierCost: 16700, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "glutamina": { supplierCost: 12000, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "l-carnitina": { supplierCost: 13100, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "termo-cut": { supplierCost: 15500, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "multivitaminico": { supplierCost: 8100, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
  "omega-3": { supplierCost: 11300, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
  "magnesio-bisglicinato": { supplierCost: 10500, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
  "colageno": { supplierCost: 14300, items: [{ materialId: "caja-chica", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }, { materialId: "cinta", qty: 1.2 }], machineMinutes: 0, handMinutes: 6 },
  "barra-proteica": { supplierCost: 1400, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
  "alfajor-proteico": { supplierCost: 9500, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
  "mantequilla-mani": { supplierCost: 5900, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
  "electrolitos": { supplierCost: 6200, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
  "gel-energetico": { supplierCost: 7100, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
  "shaker-volta": { supplierCost: 4300, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
  "magnesio-tiza": { supplierCost: 2400, items: [{ materialId: "bolsa", qty: 1 }, { materialId: "folleto", qty: 1 }, { materialId: "precinto", qty: 1 }], machineMinutes: 0, handMinutes: 3 },
};

export type PetSpecies = "perro" | "gato" | "otro";

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  /** Cumpleaños MM-DD (se repite cada año). */
  birthday?: string;
}

export interface CustomerNote {
  at: string;
  text: string;
}

export interface CustomerProfile {
  pets: Pet[];
  notes: CustomerNote[];
  /** Cumpleaños del cliente, MM-DD. */
  birthday?: string;
}

/** Fichas FICTICIAS por email (en minúsculas). Notas y fechas inventadas. */
export const customerProfiles: Record<string, CustomerProfile> = {
  "diego.a@ejemplo.com": { pets: [], notes: [{ at: "2026-09-29T10:00:00-03:00", text: "Prefiere que le escriban por WhatsApp a la tarde." }] },
  "julian.p@ejemplo.com": { pets: [], notes: [], birthday: "01-15" },
  "vale.s@ejemplo.com": { pets: [], notes: [{ at: "2026-09-28T09:30:00-03:00", text: "Le llegó un pote con el precinto roto: ofrecerle un cupón en la próxima." }], birthday: "11-12" },
  "martin.g@ejemplo.com": { pets: [], notes: [] },
  "lucia.f@ejemplo.com": { pets: [], notes: [], birthday: "10-30" },
};
