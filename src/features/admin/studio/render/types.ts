import type { StudioProduct, StudioTexts } from "@/demo/admin/studio/content";
import type { StudioGame, StudioStack } from "@/demo/admin/studio/templates";
import type { StudioFormat, StudioTemplate } from "@/demo/fixtures/studio";
import type { AmbientLayer } from "@/features/themes/ambient";

/** Imagen ya cargada para dibujar en el canvas. */
export type Img = HTMLImageElement;

/** Colores y partículas de la temática (o de la marca, sin temática). */
export interface StudioLook {
  from: string;
  to: string;
  /** Halo de energía detrás de los potes (plasma en la marca; el tono de la temática si hay). */
  glow: string;
  accent: string;
  accentInk: string;
  layers: AmbientLayer[];
  /** Imágenes de las partículas que son decoraciones de la temática, por tipo. */
  particleImgs: Record<string, Img>;
}

/** Todo lo que necesita una plantilla para dibujarse en un instante t. */
export interface StudioScene {
  template: StudioTemplate;
  format: StudioFormat;
  W: number;
  H: number;
  look: StudioLook;
  texts: StudioTexts;
  /** `photo`: la foto propia del dueño en lugar del envase. */
  products: { data: StudioProduct; img: Img | null; photo: boolean }[];
  offer: { label: string; code: string; condition: string | null } | null;
  showPrice: boolean;
  showOffer: boolean;
  /** Total con el descuento stack (plantilla "Stack del mes"). */
  stack: StudioStack | null;
  /** Niveles de premio de Shaker Rush (plantilla "Cupón del juego"). */
  game: StudioGame | null;
  steps: string[];
  duration: number;
}
