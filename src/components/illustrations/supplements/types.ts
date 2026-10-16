/** Envases y accesorios de la librería SVG (todos dibujados en un lienzo de 400 × 400, piso en y = 330). */
export type ContainerKind =
  | "tub" | "tub-tall" | "jar" | "pouch" | "caps" | "gummies" | "bottle"
  | "bar" | "box" | "sachet" | "gel" | "spread" | "shaker" | "chalk"
  | "straps" | "wraps" | "gloves" | "belt" | "sleeves" | "rope" | "bands" | "bottle-sport" | "gym-bag";

/** Dibujo del rótulo: cada marca de muestra tiene el suyo. */
export type LabelPattern = "bolt" | "stripes" | "wave" | "grid";

/** Estilo del envase de una marca: con esto un producto nuevo del panel tiene su ilustración sin diseñar nada. */
export interface PackStyle {
  /** Envase. */
  body: string;
  /** Tapa (si no, un tono del envase). */
  lid?: string;
  /** Fondo del rótulo. */
  band: string;
  /** Texto del rótulo. */
  ink: string;
  /** Acento de la marca (dibujo del rótulo, sello). */
  accent: string;
  /** Marca corta, arriba del rótulo ("VOLTA LAB"). */
  mark: string;
  /** Línea grande del rótulo ("WHEY", "CREATINA"). */
  line: string;
  /** Rótulo chico de abajo ("2 LB · 30 SERV"). */
  sub?: string;
  pattern: LabelPattern;
}

export interface ContainerProps {
  pack: PackStyle;
  /** Color del sabor (franja del rótulo, polvo, cápsulas, líquido) o, en accesorios, el color del producto. */
  tint: string;
}
