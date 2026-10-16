import type { Product, Variant } from "../types";
import { pack } from "./brands";
import { FAQ } from "./variants";

/** Colores de equipamiento (muestra del selector y la ilustración). */
const COLOR = {
  negro: "#1b1d20", rojo: "#c8242f", azul: "#1f4fbf", gris: "#7b828a", blanco: "#eceef0", naranja: "#ff6a13",
  verde: "#2fbf71", violeta: "#7b4fe0", arena: "#c9b48a",
} as const;
type ColorName = keyof typeof COLOR;
const NAME: Record<ColorName, string> = {
  negro: "Negro", rojo: "Rojo", azul: "Azul", gris: "Gris", blanco: "Blanco", naranja: "Naranja", verde: "Verde", violeta: "Violeta", arena: "Arena",
};

/**
 * Variantes de equipamiento: color × talle (o medida), sin servicios ni lotes (no vence). `stock(color, talle)` da las
 * unidades y `delta` el recargo de un talle más grande. Costo de MUESTRA: ~55 % del precio.
 */
type Stock = Partial<Record<ColorName, number>> | ((c: ColorName, i: number) => number);

function gearGrid(prefix: string, base: number, colors: ColorName[], sizes: { size: string; delta?: number }[] | null, stock: Stock): Variant[] {
  const rows: { size?: string; delta?: number }[] = sizes ?? [{}];
  const units = (c: ColorName, i: number) => (typeof stock === "function" ? stock(c, i) : stock[c] ?? 0);
  return colors.flatMap((c) => rows.map((s, i) => ({
    id: `${prefix}-${c}${s.size ? `-${s.size.toLowerCase().replace(/[^a-z0-9]+/g, "")}` : ""}`,
    label: s.size ? `${NAME[c]} · ${s.size}` : NAME[c],
    color: NAME[c], colorHex: COLOR[c], size: s.size,
    priceDelta: s.delta ?? 0, stock: units(c, i), cost: Math.round(((base + (s.delta ?? 0)) * 0.55) / 100) * 100,
  })));
}

const TALLES = [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL", delta: 2000 }];
const garantia = { q: "¿Tiene garantía?", a: "Sí: 3 meses por fallas de fabricación (costuras, abrojos, hebillas). No cubre el desgaste normal del uso." };
const cambio = { q: "¿Lo puedo cambiar de talle?", a: "Sí, dentro de los 10 días, sin uso y con la etiqueta. El cambio de talle en Mar del Plata lo lleva el cadete sin costo." };

/** Equipamiento de marcas de MUESTRA (L2: la tienda vende marcas de terceros). Precios ORIENTATIVOS. */
export const gearProducts: Product[] = [
  {
    slug: "straps-algodon", name: "Straps de levantamiento", short: "Algodón reforzado de 60 cm para peso muerto y remo",
    description: "Par de straps de algodón trenzado con acolchado de neoprene en la muñeca. Sostienen la barra cuando el agarre se cansa antes que la espalda: peso muerto, remo, dominadas con lastre.",
    categorySlug: "accesorios", brand: "Hierro", basePrice: 14900, art: "straps", gallery: ["front", "context"],
    pack: pack.hierro({ line: "STRAPS", sub: "60 CM · PAR" }),
    variants: gearGrid("st", 14900, ["negro", "rojo", "naranja"], null, { negro: 22, rojo: 9, naranja: 4 }),
    goals: ["fuerza", "masa-muscular"], faqs: [{ q: "¿Sirven para competir?", a: "En powerlifting no se permiten; en el gimnasio y en strongman, sí." }, garantia],
    featured: true, isNew: true, soldCount: 142, tags: ["straps", "agarre", "peso muerto", "accesorio", "levantamiento"], optionNames: { color: "Color" },
    dims: { lengthCm: 60, widthCm: 4, heightCm: 2, weightG: 120 },
  },
  {
    slug: "cinturon-palanca", name: "Cinturón de palanca 10 mm", short: "Cuero de 10 mm con hebilla de palanca de acero",
    description: "Cinturón de levantamiento de cuero de 10 mm y 10 cm de ancho parejo, con palanca de acero que se ajusta y suelta en un segundo. Para sentadilla, peso muerto y press pesado.",
    categorySlug: "accesorios", brand: "Hierro", basePrice: 74900, art: "belt", gallery: ["front", "context"],
    pack: pack.hierro({ line: "CINTURÓN", sub: "10 MM · PALANCA" }),
    variants: gearGrid("cp", 74900, ["negro", "rojo"], TALLES, (c, i) => (c === "negro" ? [3, 6, 5, 2][i]! : [0, 2, 2, 1][i]!)),
    goals: ["fuerza"], faqs: [{ q: "¿Cómo elijo el talle?", a: "Medí la cintura a la altura del ombligo: S 65–80 cm, M 75–95 cm, L 90–110 cm, XL 105–125 cm." }, cambio, garantia],
    featured: true, isNew: false, soldCount: 61, tags: ["cinturón", "cinturon", "sentadilla", "peso muerto", "levantamiento"], optionNames: { color: "Color", size: "Talle" },
    dims: { lengthCm: 110, widthCm: 10, heightCm: 1, weightG: 980 },
  },
  {
    slug: "rodilleras-neoprene", name: "Rodilleras de neoprene 7 mm", short: "Par de rodilleras con calor y compresión para sentadilla",
    description: "Par de rodilleras de neoprene de 7 mm que mantienen la rodilla caliente y comprimida. Pensadas para sentadilla, CrossFit y halterofilia.",
    categorySlug: "accesorios", brand: "Hierro", basePrice: 42900, art: "sleeves", gallery: ["front", "context"],
    pack: pack.hierro({ line: "RODILLERAS", sub: "7 MM · PAR" }),
    variants: gearGrid("rn", 42900, ["negro", "gris"], TALLES, (c, i) => (c === "negro" ? [4, 7, 5, 2][i]! : [2, 3, 0, 1][i]!)),
    goals: ["fuerza", "resistencia"], faqs: [{ q: "¿Cómo elijo el talle?", a: "Medí la pierna 10 cm arriba de la rótula, estirada: S 30–34 cm, M 34–38 cm, L 38–42 cm, XL 42–46 cm." }, cambio, garantia],
    featured: false, isNew: true, soldCount: 47, tags: ["rodilleras", "neoprene", "sentadilla", "crossfit"], optionNames: { color: "Color", size: "Talle" },
  },
  {
    slug: "munequeras-abrojo", name: "Muñequeras con abrojo", short: "Firmeza en press y movimientos por encima de la cabeza",
    description: "Par de muñequeras elásticas de 45 cm con presilla para el pulgar y abrojo ancho. Estabilizan la muñeca en press de banca, press militar y arranque.",
    categorySlug: "accesorios", brand: "Hierro", basePrice: 16900, art: "wraps", gallery: ["front"],
    pack: pack.hierro({ line: "MUÑEQUERAS", sub: "45 CM · PAR" }),
    variants: gearGrid("mu", 16900, ["negro", "rojo", "azul"], null, { negro: 15, rojo: 6, azul: 3 }),
    goals: ["fuerza"], faqs: [garantia],
    featured: false, isNew: false, soldCount: 88, tags: ["muñequeras", "munequeras", "press", "accesorio"], optionNames: { color: "Color" },
  },
  {
    slug: "guantes-boxeo", name: "Guantes de boxeo", short: "Cuero sintético con espuma de doble densidad",
    description: "Guantes de entrenamiento con espuma de doble densidad, palma ventilada y cierre de abrojo ancho. 10 oz para bolsa y técnica; 14–16 oz para sparring.",
    categorySlug: "boxeo", brand: "Doce Rounds", basePrice: 59900, art: "gloves", gallery: ["front", "context"],
    pack: pack.doceRounds({ line: "PRO", sub: "TRAINING" }),
    variants: gearGrid("gb", 59900, ["rojo", "negro", "azul"], [{ size: "10 oz" }, { size: "12 oz" }, { size: "14 oz", delta: 3000 }, { size: "16 oz", delta: 5000 }], (c, i) => (c === "rojo" ? [4, 5, 3, 2][i]! : c === "negro" ? [3, 4, 4, 1][i]! : [1, 2, 0, 0][i]!)),
    goals: ["resistencia", "definicion"], faqs: [{ q: "¿Qué onzas me convienen?", a: "10 oz para bolsa y clases; 12 oz si pesás más de 70 kg; 14 o 16 oz para sparring." }, garantia],
    featured: true, isNew: true, soldCount: 96, tags: ["guantes", "boxeo", "kickboxing", "sparring", "combate"], optionNames: { color: "Color", size: "Peso" },
    dims: { lengthCm: 30, widthCm: 20, heightCm: 15, weightG: 680 },
  },
  {
    slug: "vendas-boxeo", name: "Vendas de boxeo 4,5 m", short: "Algodón elástico con presilla para el pulgar",
    description: "Par de vendas de 4,5 m de algodón semielástico con presilla para el pulgar y abrojo. Protegen nudillos y muñeca adentro del guante.",
    categorySlug: "boxeo", brand: "Doce Rounds", basePrice: 9900, art: "wraps", gallery: ["front"],
    pack: pack.doceRounds({ line: "VENDAS", sub: "4,5 M · PAR" }),
    variants: gearGrid("vb", 9900, ["negro", "rojo", "blanco"], null, { negro: 30, rojo: 14, blanco: 0 }),
    goals: ["resistencia"], faqs: [{ q: "¿Se lavan?", a: "Sí, a mano o en bolsa de red, con agua fría. Secalas a la sombra para que no pierdan elasticidad." }],
    featured: false, isNew: false, soldCount: 211, tags: ["vendas", "boxeo", "combate", "accesorio"], optionNames: { color: "Color" },
  },
  {
    slug: "soga-rulemanes", name: "Soga de saltar con rulemanes", short: "Cable de acero recubierto, largo regulable",
    description: "Soga de velocidad con cable de acero recubierto, mangos de aluminio y rulemanes. El largo se regula en segundos. Para dobles, HIIT y la entrada en calor.",
    categorySlug: "funcional", brand: "Pulso", basePrice: 18900, art: "rope", gallery: ["front", "context"],
    pack: pack.pulso({ line: "SPEED", sub: "3 M · REGULABLE" }),
    variants: gearGrid("sr", 18900, ["negro", "verde", "violeta"], null, { negro: 12, verde: 7, violeta: 5 }),
    goals: ["resistencia", "definicion"], faqs: [{ q: "¿Cómo la regulo?", a: "Pisala al medio: los mangos tienen que llegarte a las axilas. Cortá el sobrante y ajustá el tornillo." }, garantia],
    featured: false, isNew: true, soldCount: 74, tags: ["soga", "saltar", "cardio", "hiit", "crossfit", "funcional"], optionNames: { color: "Color" },
  },
  {
    slug: "bandas-elasticas", name: "Bandas elásticas x4", short: "Cuatro resistencias, de 5 a 40 kg",
    description: "Kit de 4 bandas de látex en loop: liviana, media, fuerte y extra fuerte. Para movilidad, asistencia en dominadas y trabajo de glúteos en casa o en el gym.",
    categorySlug: "funcional", brand: "Pulso", basePrice: 27900, art: "bands", gallery: ["front"],
    pack: pack.pulso({ line: "BANDS", sub: "5–40 KG · X4" }),
    variants: gearGrid("be", 27900, ["verde", "violeta", "negro"], null, { verde: 10, violeta: 6, negro: 4 }),
    goals: ["salud", "definicion", "recuperacion"], faqs: [{ q: "¿Sirven para dominadas?", a: "Sí: la fuerte y la extra fuerte te asisten hasta que las hacés solo." }, garantia],
    featured: false, isNew: false, soldCount: 58, tags: ["bandas", "elásticas", "movilidad", "glúteos", "funcional"], optionNames: { color: "Color del kit" },
  },
  {
    slug: "botella-1l", name: "Botella deportiva 1 L", short: "Tapa con pico, asa y marcas de hidratación",
    description: "Botella de 1 litro libre de BPA, con tapa a presión con pico, asa para llevar y marcas por hora para recordar tomar agua.",
    categorySlug: "shakers", brand: "Pulso", basePrice: 14900, art: "bottle-sport", gallery: ["front"],
    pack: pack.pulso({ line: "1 L", sub: "BPA FREE" }),
    variants: gearGrid("bt", 14900, ["negro", "verde", "arena"], null, { negro: 18, verde: 9, arena: 6 }),
    goals: ["salud", "resistencia"], faqs: [{ q: "¿Aguanta líquidos calientes?", a: "No: es para agua, bebidas frías o batidos. Para el mate, un termo." }],
    featured: false, isNew: false, soldCount: 133, tags: ["botella", "agua", "hidratación", "accesorio"], optionNames: { color: "Color" },
  },
  {
    slug: "bolso-40l", name: "Bolso de entrenamiento 40 L", short: "Bolsillo para zapatillas y compartimento húmedo",
    description: "Bolso de 40 litros con bolsillo ventilado para las zapatillas, compartimento impermeable para la ropa mojada y correa acolchada.",
    categorySlug: "shakers", brand: "Pulso", basePrice: 54900, art: "gym-bag", gallery: ["front", "context"],
    pack: pack.pulso({ line: "40 L", sub: "GYM BAG" }),
    variants: gearGrid("bo", 54900, ["negro", "gris", "verde"], null, { negro: 7, gris: 4, verde: 2 }),
    goals: [], faqs: [FAQ.envio, garantia],
    featured: true, isNew: true, soldCount: 39, tags: ["bolso", "mochila", "gym", "accesorio"], optionNames: { color: "Color" },
    dims: { lengthCm: 55, widthCm: 28, heightCm: 28, weightG: 900 },
  },
];
