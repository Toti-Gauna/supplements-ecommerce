import { Caps, Gummies, Bottle } from "./bottles";
import { Chalk, Shaker } from "./gear";
import { Bar, Box, Gel, Pouch, Sachet } from "./packs";
import { Jar, Spread, Tub, TubTall } from "./tubs";
import type { ContainerKind, ContainerProps, PackStyle } from "./types";

export type { ContainerKind, PackStyle, LabelPattern } from "./types";

export const CONTAINERS: Record<ContainerKind, (p: ContainerProps) => React.JSX.Element> = {
  tub: Tub, "tub-tall": TubTall, jar: Jar, pouch: Pouch, caps: Caps, gummies: Gummies, bottle: Bottle,
  bar: Bar, box: Box, sachet: Sachet, gel: Gel, spread: Spread, shaker: Shaker, chalk: Chalk,
};

/** Nombre de cada envase para el panel (elegir la ilustración de un producto). */
export const CONTAINER_LABEL: Record<ContainerKind, string> = {
  tub: "Pote ancho", "tub-tall": "Pote alto", jar: "Frasco chico", pouch: "Doypack", caps: "Frasco de cápsulas",
  gummies: "Frasco de gomitas", bottle: "Botella", bar: "Barra", box: "Caja", sachet: "Sobres", gel: "Geles",
  spread: "Frasco de vidrio", shaker: "Shaker", chalk: "Magnesio en bloque",
};

/** Rótulo por defecto de cada envase (categorías, banners y productos sin estilo propio). */
const DEFAULT_LINE: Record<ContainerKind, string> = {
  tub: "WHEY", "tub-tall": "MASS", jar: "CREA", pouch: "VEGAN", caps: "CAPS", gummies: "GUMMY", bottle: "L-CARN",
  bar: "BAR", box: "BOX", sachet: "HYDRO", gel: "GEL", spread: "MANÍ", shaker: "VOLTA", chalk: "MAGNESIO",
};

/** Estilo de la marca propia (VOLTA Lab): grafito con voltio. */
export function defaultPack(kind: ContainerKind): PackStyle {
  return { body: "#101318", band: "#101318", ink: "#eef1f5", accent: "#c8ff2e", mark: "VOLTA LAB", line: DEFAULT_LINE[kind], pattern: "bolt" };
}

/** Escala de cada envase para que todos llenen el cuadro parecido (el piso queda en y = 330). */
export const FRAME_SCALE: Record<ContainerKind, number> = {
  tub: 1.3, "tub-tall": 1.17, jar: 1.5, pouch: 1.24, caps: 1.46, gummies: 1.38, bottle: 1.34,
  bar: 1.2, box: 1.3, sachet: 1.26, gel: 1.28, spread: 1.42, shaker: 1.3, chalk: 1.3,
};
