/** Piezas publicadas en /trailer/<id>/ (sin GSAP: lo usa la ruta para generar las páginas estáticas). */
export const PIECE_IDS = ["demo", "firma", "t1-avance"] as const;
export type PieceId = (typeof PIECE_IDS)[number];
