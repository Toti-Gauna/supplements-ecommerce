/**
 * Configurador del collar con nombre (pedido de Ignacio, fuera de la especificación). Opciones según la
 * investigación de la Fase 0 (docs/investigacion.md): estilo de las letras, adorno, material, patrón y color del
 * cordón, dije y talle por contorno de cuello. Precios de MUESTRA, en pesos enteros.
 *
 * Lo único que se vio en el Instagram de Volta (marca [V] de la investigación) es el collar de paracord trenzado
 * de un color, con letras 3D sueltas que cuelgan y dije de patita. Todo lo demás es criterio nuestro: va con
 * `demo: true`, la tienda lo muestra como "ejemplo de la demo" y no como algo que el taller ya fabrica (Polish 8.2).
 */

export type CollarFormat = "letters" | "inline" | "joined" | "tag";
export type CollarMaterial = "paracord" | "biothane" | "nylon";
export type CollarCharm = "none" | "paw" | "bone" | "heart" | "phone";
export type CollarPattern = "solid" | "twist" | "stripes" | "dots" | "edge";
export type CollarDesign = "none" | "paws" | "hearts" | "stars" | "bones";

export interface CollarOption<T extends string> {
  id: T;
  name: string;
  hint: string;
  /** Recargo en pesos enteros sobre el precio de la variante. */
  delta: number;
  /** Ejemplo de la demo que Volta todavía no confirmó: se marca y no se ofrece como algo que ya se fabrica. */
  demo?: boolean;
  /** Estilos de letras con los que va (si falta, con todos). */
  formats?: CollarFormat[];
}

/** Patrón del cordón; los de dos colores usan además un segundo color de la misma paleta. */
export interface CollarPatternOption extends CollarOption<CollarPattern> {
  twoTone: boolean;
}

export interface CollarSpec {
  formats: CollarOption<CollarFormat>[];
  designs: CollarOption<CollarDesign>[];
  materials: CollarOption<CollarMaterial>[];
  patterns: CollarPatternOption[];
  charms: CollarOption<CollarCharm>[];
  cordColors: { name: string; hex: string }[];
  /** Contorno de cuello por variante (cm, ambos incluidos). */
  sizes: { variantId: string; min: number; max: number }[];
}

export interface CollarConfig {
  format: CollarFormat;
  material: CollarMaterial;
  cordColor: string;
  cordColorName: string;
  charm: CollarCharm;
  /** Contorno de cuello medido (opcional): elige el talle. */
  neckCm?: number;
  /** Patrón del cordón (sin dato: liso) y su segundo color. Opcionales: los carritos guardados antes no los traen. */
  pattern?: CollarPattern;
  accentColor?: string;
  accentColorName?: string;
  /** Adorno a los costados del nombre (sin dato: ninguno). */
  design?: CollarDesign;
}

export const collarSpec: CollarSpec = {
  formats: [
    { id: "letters", name: "Letras sueltas", hint: "Cada letra cuelga por separado, como en el Instagram", delta: 0 },
    { id: "inline", name: "Letras en línea", hint: "Las letras pasan por el cordón, una al lado de la otra", delta: 0, demo: true },
    { id: "joined", name: "Nombre de corrido", hint: "El nombre en una sola pieza", delta: 1500, demo: true },
    { id: "tag", name: "Chapita con nombre", hint: "Hueso con el nombre y un teléfono", delta: 1000, demo: true },
  ],
  designs: [
    { id: "none", name: "Solo el nombre", hint: "", delta: 0 },
    { id: "paws", name: "Patitas", hint: "Una patita a cada lado del nombre", delta: 0, demo: true, formats: ["letters", "inline"] },
    { id: "hearts", name: "Corazones", hint: "Un corazón a cada lado del nombre", delta: 0, demo: true, formats: ["letters", "inline"] },
    { id: "stars", name: "Estrellas", hint: "Una estrella a cada lado del nombre", delta: 0, demo: true, formats: ["letters", "inline"] },
    { id: "bones", name: "Huesitos", hint: "Un huesito a cada lado del nombre", delta: 0, demo: true, formats: ["letters", "inline"] },
  ],
  materials: [
    { id: "paracord", name: "Paracord trenzado", hint: "El clásico de Volta, trenzado a mano", delta: 0 },
    { id: "biothane", name: "Biothane", hint: "Impermeable, ideal para la playa", delta: 3000, demo: true },
    { id: "nylon", name: "Nylon 20 mm", hint: "Liviano y suave", delta: 0, demo: true },
  ],
  patterns: [
    { id: "solid", name: "Liso", hint: "Un solo color", delta: 0, twoTone: false },
    { id: "twist", name: "Espiral", hint: "Dos colores trenzados en espiral", delta: 0, twoTone: true, demo: true },
    { id: "stripes", name: "Rayas", hint: "Franjas finas de otro color", delta: 0, twoTone: true, demo: true },
    { id: "dots", name: "Lunares", hint: "Puntitos a lo largo del cordón", delta: 0, twoTone: true, demo: true },
    { id: "edge", name: "Ribete", hint: "Bordes de otro color", delta: 0, twoTone: true, demo: true },
  ],
  charms: [
    { id: "paw", name: "Patita", hint: "Incluido", delta: 0 },
    { id: "bone", name: "Hueso", hint: "Incluido", delta: 0, demo: true },
    { id: "heart", name: "Corazón", hint: "Incluido", delta: 0, demo: true },
    { id: "phone", name: "Chapita con teléfono", hint: "Por si se pierde", delta: 1500, demo: true },
    { id: "none", name: "Sin dije", hint: "", delta: 0 },
  ],
  cordColors: [
    { name: "Verde oliva", hex: "#5a6b3a" },
    { name: "Negro", hex: "#26282a" },
    { name: "Rosa", hex: "#e38aa3" },
    { name: "Celeste", hex: "#7fb2dc" },
    { name: "Terracota", hex: "#c0643f" },
    { name: "Crema", hex: "#efe2c6" },
  ],
  sizes: [
    { variantId: "col-xs", min: 20, max: 27 },
    { variantId: "col-s", min: 28, max: 35 },
    { variantId: "col-m", min: 36, max: 45 },
    { variantId: "col-l", min: 46, max: 55 },
    { variantId: "col-xl", min: 56, max: 65 },
  ],
};

export const defaultCollarConfig: CollarConfig = { format: "letters", material: "paracord", cordColor: "#5a6b3a", cordColorName: "Verde oliva", charm: "paw", pattern: "solid", design: "none" };

/** Combinaciones listas para inspirarse y pedir con un toque (galería de la ficha). Nombres de muestra. */
export interface CollarPreset {
  id: string;
  title: string;
  name: string;
  font: string;
  letterColor: string;
  letterColorName: string;
  config: CollarConfig;
}

export const collarPresets: CollarPreset[] = [
  { id: "olivia", title: "Clásico oliva", name: "Olivia", font: "Redondeada", letterColor: "#ffffff", letterColorName: "Blanco", config: { format: "letters", material: "paracord", cordColor: "#5a6b3a", cordColorName: "Verde oliva", charm: "paw" } },
  { id: "mora", title: "Rosa y corazón", name: "Mora", font: "Manuscrita", letterColor: "#ffffff", letterColorName: "Blanco", config: { format: "letters", material: "paracord", cordColor: "#e38aa3", cordColorName: "Rosa", charm: "heart", design: "hearts" } },
  { id: "pancho", title: "Playa todo el año", name: "Pancho", font: "Redondeada", letterColor: "#1f1f1f", letterColorName: "Negro", config: { format: "joined", material: "biothane", cordColor: "#7fb2dc", cordColorName: "Celeste", charm: "bone", pattern: "edge", accentColor: "#efe2c6", accentColorName: "Crema" } },
  { id: "kira", title: "Negro elegante", name: "Kira", font: "Clásica", letterColor: "#d9667f", letterColorName: "Rosa", config: { format: "letters", material: "paracord", cordColor: "#26282a", cordColorName: "Negro", charm: "phone" } },
  { id: "simba", title: "Terracota", name: "Simba", font: "Redondeada", letterColor: "#ffffff", letterColorName: "Blanco", config: { format: "tag", material: "nylon", cordColor: "#c0643f", cordColorName: "Terracota", charm: "none" } },
  { id: "luna", title: "Crema en espiral", name: "Luna", font: "Manuscrita", letterColor: "#3d4a2a", letterColorName: "Verde oliva", config: { format: "inline", material: "paracord", cordColor: "#efe2c6", cordColorName: "Crema", charm: "paw", pattern: "twist", accentColor: "#5a6b3a", accentColorName: "Verde oliva", design: "paws" } },
];
