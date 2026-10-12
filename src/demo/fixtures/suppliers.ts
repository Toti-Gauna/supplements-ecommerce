/**
 * Proveedores y niveles de stock de MUESTRA (Fase 7): distribuidoras inventadas de las marcas del catálogo. Nombres,
 * contactos, teléfonos, emails y montos son ficticios (teléfonos 223 555-01xx, emails @ejemplo.com).
 */
export interface Supplier {
  id: string;
  name: string;
  /** Marcas del catálogo que trae, como figuran en el producto. */
  brands: string[];
  contact: string;
  phone: string;
  email: string;
  /** Días de la semana en que reparte (0 = domingo … 6 = sábado). */
  deliveryWeekdays: number[];
  /** Pedido mínimo al costo, en pesos enteros. */
  minOrder: number;
  notes?: string;
}

export const suppliers: Supplier[] = [
  {
    id: "lab-costa", name: "Laboratorio Costa (muestra)", brands: ["VOLTA Lab"], contact: "Paula Ríos", phone: "223 555-0181",
    email: "pedidos.labcosta@ejemplo.com", deliveryWeekdays: [2, 4], minOrder: 500000, notes: "Fabrica la marca propia. Pedir con dos días de anticipación.",
  },
  {
    id: "atlantica", name: "Distribuidora Atlántica (muestra)", brands: ["Krono Nutrition", "Ozono"], contact: "Martina Gil", phone: "223 555-0182",
    email: "ventas.atlantica@ejemplo.com", deliveryWeekdays: [1, 4], minOrder: 400000,
  },
  {
    id: "sur", name: "Sur Suplementos (muestra)", brands: ["Brava Sport", "Forja"], contact: "Germán Paz", phone: "223 555-0183",
    email: "pedidos.sur@ejemplo.com", deliveryWeekdays: [3], minOrder: 800000, notes: "Reparte en Mar del Plata los miércoles a la mañana.",
  },
];

/** Stock mínimo y objetivo de una variante: con el mínimo o menos se sugiere comprar hasta llegar al objetivo. */
export interface StockLevel {
  min: number;
  target: number;
}

/** Nivel de las variantes que no tienen uno propio. */
export const DEFAULT_STOCK_LEVEL: StockLevel = { min: 4, target: 10 };

/** Niveles propios de MUESTRA (clave `producto::variante`): los potes de 5 lb rotan menos y las barras sueltas, más. */
export const stockLevels: Record<string, StockLevel> = {
  "ionic-whey::iw-chocolate-5lb": { min: 2, target: 6 },
  "ionic-whey::iw-vainilla-5lb": { min: 2, target: 6 },
  "ionic-whey::iw-frutilla-5lb": { min: 2, target: 6 },
  "ionic-whey::iw-cookies-cream-5lb": { min: 2, target: 6 },
  "barra-proteica::bp-chocolate-u": { min: 15, target: 40 },
  "barra-proteica::bp-mani-u": { min: 15, target: 40 },
  "barra-proteica::bp-cookies-cream-u": { min: 15, target: 40 },
};
