import type { StudioProduct, StudioTexts } from "@/demo/admin/studio/content";
import type { StudioFormat } from "@/demo/fixtures/studio";
import type { AmbientLayer } from "@/features/themes/ambient";

/** Imagen ya cargada para dibujar en el canvas. */
export type Img = HTMLImageElement;

/** Colores y partículas de la temática (o de la marca, sin temática). */
export interface StudioLook {
  from: string;
  to: string;
  accent: string;
  accentInk: string;
  layers: AmbientLayer[];
  /** Imágenes de las partículas que son decoraciones (corazones, escarapelas…), por tipo. */
  particleImgs: Record<string, Img>;
}

/** Todo lo que necesita una plantilla para dibujarse en un instante t. */
export interface StudioScene {
  format: StudioFormat;
  W: number;
  H: number;
  look: StudioLook;
  texts: StudioTexts;
  products: { data: StudioProduct; img: Img | null }[];
  offer: { label: string; code: string; condition: string | null } | null;
  showPrice: boolean;
  showOffer: boolean;
  /** Decoración protagonista de la temática y personajes (si la temática los tiene). */
  hero: Img | null;
  cast: Img[];
  steps: string[];
  duration: number;
}
