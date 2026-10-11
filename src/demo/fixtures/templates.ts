import type { PersonalizationTemplate } from "../types";
import { collarSpec } from "./collar";

const petColors = [
  { name: "Verde oliva", hex: "#3d4a2a" },
  { name: "Blanco", hex: "#ffffff" },
  { name: "Negro", hex: "#1f1f1f" },
  { name: "Rosa", hex: "#d9667f" },
  { name: "Celeste", hex: "#3f7fb5" },
];

export const fonts = ["Redondeada", "Clásica", "Manuscrita"] as const;

export const nameTemplate: PersonalizationTemplate = {
  id: "t-nombre", name: "Nombre impreso", kind: "TEXT", maxChars: 10, fonts: [...fonts], colors: petColors, surcharge: 0,
};

/** Collar con nombre: el nombre con fuente y color de letras, más el configurador (formato, cordón, dije, talle). */
export const collarTemplate: PersonalizationTemplate = {
  id: "t-collar", name: "Collar con nombre", kind: "TEXT", maxChars: 8, fonts: [...fonts], surcharge: 0, collar: collarSpec,
  // Letras impresas en 3D: primero las que contrastan con la mayoría de los cordones.
  colors: [{ name: "Blanco", hex: "#ffffff" }, { name: "Crema", hex: "#f3e7cf" }, { name: "Negro", hex: "#1f1f1f" }, { name: "Rosa", hex: "#d9667f" }, { name: "Celeste", hex: "#3f7fb5" }, { name: "Verde oliva", hex: "#3d4a2a" }],
};

export const engravingTemplate: PersonalizationTemplate = {
  id: "t-grabado", name: "Grabado láser", kind: "TEXT", maxChars: 14, fonts: [...fonts], colors: [{ name: "Grabado natural", hex: "#6b4a2b" }, { name: "Negro", hex: "#1f1f1f" }], surcharge: 2500,
};

export const photoLampTemplate: PersonalizationTemplate = { id: "t-foto", name: "Foto en velador", kind: "PHOTO", mask: "arch", surcharge: 0 };

export const photoPlateTemplate: PersonalizationTemplate = { id: "t-placa", name: "Imagen en placa NFC", kind: "PHOTO", mask: "rounded", surcharge: 0 };

export const referenceTemplate: PersonalizationTemplate = {
  id: "t-referencia", name: "Pintado desde referencia", kind: "PHOTO_REFERENCE",
  surcharge: 0,
  notesPlaceholder: "Contanos pose, ropa, fondo y colores que querés que respetemos.",
};

/** Zona de texto sobre la ilustración (coordenadas del viewBox 400×400). cover "tint" = color de la variante. */
export interface TextZone {
  x: number;
  y: number;
  w: number;
  h: number;
  cover?: string;
}

export const textZones: Record<string, TextZone> = {
  "bowl-dog": { x: 125, y: 252, w: 150, h: 36 },
  collar: { x: 118, y: 273, w: 164, h: 38, cover: "#ffffff" },
  "bowl-wood": { x: 96, y: 203, w: 208, h: 28, cover: "tint" },
  "leash-hanger": { x: 84, y: 180, w: 232, h: 32, cover: "tint" },
};

export const FONT_FAMILIES: Record<string, string> = {
  Redondeada: "'Manrope Variable', ui-rounded, system-ui, sans-serif",
  Clásica: "Georgia, 'Times New Roman', serif",
  Manuscrita: "Caveat, 'Segoe Script', cursive",
};

export const baseTemplates: PersonalizationTemplate[] = [nameTemplate, collarTemplate, engravingTemplate, photoLampTemplate, photoPlateTemplate, referenceTemplate];
