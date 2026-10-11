import type { Category } from "../types";

/** Categorías de demo. "tablas" no tiene productos: demuestra que una categoría vacía no aparece. */
export const categories: Category[] = [
  { slug: "placas-nfc", name: "Placas NFC", description: "Placas con la imagen que quieras y chip NFC que abre el link que elijas.", art: "nfc-plate", featured: true, sortOrder: 1 },
  { slug: "comederos", name: "Comederos", description: "Comederos impresos en 3D y de madera, en el color de tu casa.", art: "bowl-dog", featured: true, sortOrder: 2 },
  { slug: "collares", name: "Collares", description: "Collares con el nombre de tu mascota y dijes de patita.", art: "collar", featured: true, sortOrder: 3 },
  { slug: "iluminacion", name: "Iluminación", description: "Veladores con foto y piezas pintadas a mano con luz LED.", art: "lamp-photo", featured: false, sortOrder: 4 },
  { slug: "deco", name: "Deco", description: "Madera y MDF cortados con láser para colgar, apoyar y regalar.", art: "dachshund", featured: false, sortOrder: 5 },
  { slug: "velas", name: "Velas", description: "Velas con forma, en lata pintada y souvenirs con nombre.", art: "candle-poodle", featured: false, sortOrder: 6 },
  { slug: "hogar", name: "Aromas para el hogar", description: "Home spray y difusores de la línea nueva.", art: "diffuser", featured: false, sortOrder: 7 },
  { slug: "souvenirs", name: "Souvenirs", description: "Piezas de Mar del Plata pintadas a mano.", art: "mdp-sign", featured: false, sortOrder: 8 },
  { slug: "emprendedores", name: "Para emprendedores", description: "Herramientas impresas en 3D para otros talleres, como la guía para etiquetar velas.", art: "label-guide", featured: false, sortOrder: 9 },
  { slug: "tablas", name: "Tablas de madera", description: "Próximamente.", art: "bowl-wood", featured: false, sortOrder: 10 },
];
