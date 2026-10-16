import type { Category } from "../types";

/**
 * Categorías de demo: suplementos y, desde L2, equipamiento (`kind: "gear"`) de una tienda deportiva multimarca.
 * "indumentaria" no tiene productos: demuestra que una categoría vacía no aparece.
 */
export const categories: Category[] = [
  { slug: "proteinas", name: "Proteínas", description: "Whey, aisladas, veganas y caseína para llegar a tu proteína del día.", art: "tub", featured: true, sortOrder: 1 },
  { slug: "creatinas", name: "Creatinas", description: "Monohidrato pura, en doypack o en gomitas. El suplemento con más evidencia.", art: "jar", featured: true, sortOrder: 2 },
  { slug: "pre-entrenos", name: "Pre-entrenos", description: "Energía, foco y bombeo. Con o sin cafeína.", art: "jar", featured: true, sortOrder: 3 },
  { slug: "aminoacidos", name: "Aminoácidos", description: "BCAA y glutamina para durante y después del entreno.", art: "pouch", featured: false, sortOrder: 4 },
  { slug: "ganadores", name: "Ganadores de peso", description: "Calorías y proteína para cuando no llegás con la comida.", art: "tub-tall", featured: false, sortOrder: 5 },
  { slug: "definicion", name: "Quemadores y definición", description: "L-carnitina y termogénicos para acompañar tu plan.", art: "bottle", featured: false, sortOrder: 6 },
  { slug: "salud", name: "Vitaminas y salud", description: "Multivitamínicos, omega 3, magnesio y colágeno.", art: "caps", featured: true, sortOrder: 7 },
  { slug: "snacks", name: "Barras y snacks", description: "Barras, alfajores proteicos y mantequilla de maní.", art: "bar", featured: false, sortOrder: 8 },
  { slug: "hidratacion", name: "Hidratación", description: "Electrolitos y geles para entrenamientos largos.", art: "sachet", featured: false, sortOrder: 9 },
  { slug: "accesorios", name: "Accesorios de gym", description: "Straps, cinturones, rodilleras, muñequeras, sogas, bandas y magnesio para el gym y el funcional.", art: "straps", featured: true, sortOrder: 10, kind: "gear" },
  { slug: "boxeo", name: "Boxeo y combate", description: "Guantes y vendas para la bolsa, el sparring y la clase.", art: "gloves", featured: true, sortOrder: 11, kind: "gear" },
  { slug: "shakers", name: "Shakers, botellas y bolsos", description: "Para llevar el batido, el agua y todo lo del gym.", art: "shaker", featured: false, sortOrder: 13, kind: "gear" },
  { slug: "indumentaria", name: "Indumentaria", description: "Próximamente.", art: "box", featured: false, sortOrder: 14 },
];
