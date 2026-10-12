import type { DecorKind } from "@/components/illustrations/seasonal/Decor";
import type { StudioProduct, StudioTexts } from "@/demo/admin/studio/content";
import type { StudioGame, StudioStack } from "@/demo/admin/studio/templates";
import type { ThemeOffer } from "@/demo/engine/themes";
import { STUDIO_FORMATS, STUDIO_GAME_STEPS, STUDIO_STEPS, type StudioFormat, type StudioTemplate } from "@/demo/fixtures/studio";
import type { SeasonId } from "@/demo/types";
import { AMBIENT, type AmbientLayer } from "@/features/themes/ambient";
import { skinOf } from "@/features/themes/skins";
import type { AssetRequest, StudioAssets } from "./assets";
import type { StudioLook, StudioScene } from "./render/types";

/** Sin temática: el laboratorio de la marca (grafito, halo plasma y acento voltio) con chispas voltio que titilan. */
const BRAND_LOOK = { from: "#06080b", to: "#1c2230", glow: "#8b72ff", accent: "#c8ff2e", accentInk: "#0a0c10" };
const BRAND_LAYERS: AmbientLayer[] = [{ particles: [{ dot: "#c8ff2e" }, { dot: "#e3ff8f" }], motion: "twinkle", count: 18, size: [3, 7], duration: [3, 6], opacity: 0.8 }];

export function layersFor(themeId: SeasonId | null): AmbientLayer[] {
  return themeId ? AMBIENT[themeId] : BRAND_LAYERS;
}

/** Decoraciones que aparecen como partículas de la temática (para pasarlas a imagen). */
export function particleKinds(layers: AmbientLayer[]): DecorKind[] {
  return [...new Set(layers.flatMap((l) => l.particles.flatMap((p) => ("decor" in p ? [p.decor] : []))))];
}

export function assetRequest(themeId: SeasonId | null, products: StudioProduct[]): AssetRequest {
  return { products, particles: particleKinds(layersFor(themeId)) };
}

export interface SceneInput {
  template: StudioTemplate;
  themeId: SeasonId | null;
  format: StudioFormat;
  texts: StudioTexts;
  products: StudioProduct[];
  offer: ThemeOffer | null;
  showPrice: boolean;
  showOffer: boolean;
  stack: StudioStack | null;
  game: StudioGame | null;
  duration: number;
  /** Foto del dueño: reemplaza el envase del primer producto. */
  photo: HTMLImageElement | null;
}

export function buildScene(input: SceneInput, assets: StudioAssets): StudioScene {
  const skin = input.themeId ? skinOf(input.themeId) : null;
  const [W, H] = STUDIO_FORMATS.find((f) => f.id === input.format)!.size;
  const look: StudioLook = skin
    ? { from: skin.from, to: skin.to, glow: skin.to, accent: skin.accent, accentInk: skin.accentInk, layers: layersFor(input.themeId), particleImgs: assets.particles }
    : { ...BRAND_LOOK, layers: BRAND_LAYERS, particleImgs: assets.particles };
  return {
    template: input.template, format: input.format, W, H, look, texts: input.texts,
    products: input.products.map((data, i) => {
      const photo = i === 0 && input.photo ? input.photo : null;
      return { data, img: photo ?? assets.products[data.slug] ?? null, photo: Boolean(photo) || assets.photos.has(data.slug) };
    }),
    offer: input.offer ? { label: input.offer.label, code: input.offer.coupon.code, condition: input.offer.condition } : null,
    showPrice: input.showPrice, showOffer: input.showOffer, stack: input.stack, game: input.game,
    steps: input.template === "game" ? STUDIO_GAME_STEPS : STUDIO_STEPS, duration: input.duration,
  };
}
