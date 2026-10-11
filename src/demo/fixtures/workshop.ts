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
  { id: "ev-filamento", date: "2026-10-06", title: "Retirar filamento PLA en el proveedor", kind: "tarea", notes: "3 rollos negros y 2 blancos (de muestra)." },
  { id: "ev-retiro-113", date: "2026-10-08", title: "Ana retira los souvenirs", kind: "pedido", orderCode: "VEL-000113", notes: "Avisarle por WhatsApp cuando estén listos." },
];

export const workshopSettings: WorkshopSettings = {
  dailyCapacity: 3,
  closedWeekdays: [0, 6],
  closures: [...AR_HOLIDAYS, { date: "2026-11-06", name: "Feria de diseño (taller cerrado, de muestra)", kind: "cierre" }],
  machineHourCost: 1500,
  handHourCost: 4500,
  targetMarginPct: 50,
  repurchaseDays: { velas: 45, hogar: 30 },
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

/** Insumos de MUESTRA: precios y proveedores inventados. */
export const materials: Material[] = [
  { id: "pla", name: "Filamento PLA", unit: "g", costPerUnit: 25, stock: 3200, minStock: 1000, supplier: "Proveedor 3D (muestra)" },
  { id: "petg", name: "Filamento PETG apto alimentos", unit: "g", costPerUnit: 32, stock: 900, minStock: 1000, supplier: "Proveedor 3D (muestra)" },
  { id: "mdf3", name: "MDF 3 mm (plancha 60 × 40)", unit: "plancha", costPerUnit: 3200, stock: 14, minStock: 6, supplier: "Maderera (muestra)" },
  { id: "pino", name: "Madera de pino cepillada", unit: "m", costPerUnit: 4800, stock: 6, minStock: 3, supplier: "Maderera (muestra)" },
  { id: "led", name: "Base LED con cable USB", unit: "u", costPerUnit: 2800, stock: 4, minStock: 5, supplier: "Electrónica (muestra)" },
  { id: "cera", name: "Cera de soja", unit: "g", costPerUnit: 12, stock: 5000, minStock: 2000, supplier: "Insumos velas (muestra)" },
  { id: "esencia", name: "Esencia aromática", unit: "ml", costPerUnit: 55, stock: 380, minStock: 250, supplier: "Insumos velas (muestra)" },
  { id: "lata", name: "Lata para vela", unit: "u", costPerUnit: 900, stock: 22, minStock: 10 },
  { id: "pabilo", name: "Pabilo con base", unit: "u", costPerUnit: 120, stock: 140, minStock: 40 },
  { id: "chip", name: "Chip NFC NTAG213", unit: "u", costPerUnit: 650, stock: 30, minStock: 15, supplier: "Electrónica (muestra)" },
  { id: "vinilo", name: "Impresión sobre vinilo", unit: "u", costPerUnit: 700, stock: 25, minStock: 10 },
  { id: "paracord", name: "Paracord 550", unit: "m", costPerUnit: 450, stock: 48, minStock: 20 },
  { id: "hebilla", name: "Hebilla y argolla", unit: "u", costPerUnit: 600, stock: 12, minStock: 10 },
  { id: "pintura", name: "Pintura acrílica", unit: "ml", costPerUnit: 18, stock: 600, minStock: 200 },
  { id: "bowl", name: "Bowl de acero inoxidable", unit: "u", costPerUnit: 3500, stock: 6, minStock: 4 },
  { id: "flores", name: "Flores secas", unit: "u", costPerUnit: 350, stock: 30, minStock: 20 },
  { id: "envase-spray", name: "Envase spray 250 ml", unit: "u", costPerUnit: 1200, stock: 20, minStock: 10 },
  { id: "envase-difusor", name: "Frasco y varillas", unit: "u", costPerUnit: 1800, stock: 9, minStock: 8 },
  { id: "packaging", name: "Caja y papel de seda", unit: "u", costPerUnit: 750, stock: 40, minStock: 20 },
];

export interface RecipeItem {
  materialId: string;
  /** Cantidad en la unidad del insumo (puede ser fracción: media plancha, 0,3 m). */
  qty: number;
}

/** Receta de costo de un producto: insumos por unidad, minutos de máquina y de trabajo a mano. */
export interface Recipe {
  items: RecipeItem[];
  machineMinutes: number;
  handMinutes: number;
}

/** Recetas de MUESTRA por producto. Los productos sin receta aparecen como "sin costo cargado". */
export const recipes: Record<string, Recipe> = {
  "comedero-perro-globo": { items: [{ materialId: "petg", qty: 180 }, { materialId: "packaging", qty: 1 }], machineMinutes: 300, handMinutes: 30 },
  "comedero-elevado-madera": { items: [{ materialId: "pino", qty: 0.6 }, { materialId: "bowl", qty: 2 }, { materialId: "packaging", qty: 1 }], machineMinutes: 45, handMinutes: 90 },
  "collar-con-nombre": { items: [{ materialId: "paracord", qty: 1.2 }, { materialId: "hebilla", qty: 1 }, { materialId: "pla", qty: 25 }, { materialId: "packaging", qty: 1 }], machineMinutes: 90, handMinutes: 40 },
  "placa-nfc": { items: [{ materialId: "pla", qty: 35 }, { materialId: "chip", qty: 1 }, { materialId: "vinilo", qty: 1 }, { materialId: "packaging", qty: 1 }], machineMinutes: 80, handMinutes: 15 },
  "placa-nfc-instagram": { items: [{ materialId: "pla", qty: 30 }, { materialId: "chip", qty: 1 }, { materialId: "vinilo", qty: 1 }], machineMinutes: 70, handMinutes: 10 },
  "velador-con-foto": { items: [{ materialId: "pla", qty: 160 }, { materialId: "led", qty: 1 }, { materialId: "packaging", qty: 1 }], machineMinutes: 600, handMinutes: 30 },
  "velador-pintado-a-mano": { items: [{ materialId: "pla", qty: 220 }, { materialId: "led", qty: 1 }, { materialId: "pintura", qty: 40 }, { materialId: "packaging", qty: 1 }], machineMinutes: 720, handMinutes: 300 },
  "colgador-de-correa": { items: [{ materialId: "mdf3", qty: 0.5 }, { materialId: "pintura", qty: 15 }, { materialId: "packaging", qty: 1 }], machineMinutes: 25, handMinutes: 45 },
  "salchicha-geometrico": { items: [{ materialId: "mdf3", qty: 0.4 }], machineMinutes: 20, handMinutes: 25 },
  "figura-persona-y-perro": { items: [{ materialId: "mdf3", qty: 0.6 }, { materialId: "pintura", qty: 20 }], machineMinutes: 30, handMinutes: 40 },
  "vela-caniche": { items: [{ materialId: "cera", qty: 220 }, { materialId: "esencia", qty: 15 }, { materialId: "pabilo", qty: 1 }, { materialId: "mdf3", qty: 0.05 }], machineMinutes: 5, handMinutes: 25 },
  "vela-en-lata": { items: [{ materialId: "cera", qty: 180 }, { materialId: "esencia", qty: 12 }, { materialId: "pabilo", qty: 1 }, { materialId: "lata", qty: 1 }, { materialId: "pintura", qty: 8 }], machineMinutes: 0, handMinutes: 35 },
  "vela-souvenir-flores": { items: [{ materialId: "cera", qty: 90 }, { materialId: "esencia", qty: 5 }, { materialId: "pabilo", qty: 1 }, { materialId: "flores", qty: 2 }, { materialId: "pino", qty: 0.05 }], machineMinutes: 6, handMinutes: 15 },
  "home-spray": { items: [{ materialId: "esencia", qty: 25 }, { materialId: "envase-spray", qty: 1 }], machineMinutes: 0, handMinutes: 8 },
  "difusor": { items: [{ materialId: "esencia", qty: 30 }, { materialId: "envase-difusor", qty: 1 }], machineMinutes: 0, handMinutes: 8 },
  "pieza-i-love-mdp": { items: [{ materialId: "mdf3", qty: 0.25 }, { materialId: "pintura", qty: 12 }], machineMinutes: 12, handMinutes: 30 },
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

/** Fichas FICTICIAS por email (en minúsculas). Mascotas y fechas inventadas. */
export const customerProfiles: Record<string, CustomerProfile> = {
  "diego.a@ejemplo.com": { pets: [{ id: "p1", name: "Ñoqui", species: "perro", breed: "Mestizo", birthday: "10-09" }], notes: [{ at: "2026-09-29T10:00:00-03:00", text: "Prefiere que le escriban por WhatsApp a la tarde." }] },
  "julian.p@ejemplo.com": { pets: [{ id: "p2", name: "Kira", species: "perro", breed: "Ovejero alemán", birthday: "01-15" }], notes: [] },
  "vale.s@ejemplo.com": { pets: [{ id: "p3", name: "Tomate", species: "gato", breed: "Naranja", birthday: "10-21" }, { id: "p4", name: "Luna", species: "perro", breed: "Caniche", birthday: "03-02" }], notes: [{ at: "2026-09-28T09:30:00-03:00", text: "Tuvo un problema con el comedero: ofrecerle un cupón en la próxima." }], birthday: "11-12" },
  "martin.g@ejemplo.com": { pets: [{ id: "p5", name: "Pancho", species: "perro", breed: "Salchicha" }], notes: [] },
  "lucia.f@ejemplo.com": { pets: [{ id: "p6", name: "Mora", species: "gato", birthday: "10-30" }], notes: [] },
};
