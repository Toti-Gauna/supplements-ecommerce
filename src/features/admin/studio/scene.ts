import type { DecorKind } from "@/components/illustrations/seasonal/Decor";
import { brand } from "@/config/brand";
import type { StudioProduct, StudioTexts } from "@/demo/admin/studio/content";
import type { ThemeOffer } from "@/demo/engine/themes";
import { STUDIO_FORMATS, STUDIO_STEPS, type StudioFormat } from "@/demo/fixtures/studio";
import type { SeasonId } from "@/demo/types";
import { AMBIENT, type AmbientLayer } from "@/features/themes/ambient";
import { skinOf, type ThemeSkin } from "@/features/themes/skins";
import type { AssetRequest, StudioAssets } from "./assets";
import type { StudioLook, StudioScene } from "./render/types";

/** Sin temática: la noche de la marca (colores de la configuración) con polvo dorado. */
const BRAND_SKIN: Pick<ThemeSkin, "from" | "to" | "accent" | "accentInk"> = { from: brand.colors.text, to: brand.colors.primary, accent: "#d2ad69", accentInk: brand.colors.text };
const BRAND_LAYERS: AmbientLayer[] = [{ particles: [{ dot: "#d2ad69" }, { dot: "#f6e7c4" }], motion: "twinkle", count: 18, size: [3, 7], duration: [3, 6], opacity: 0.8 }];

export function layersFor(themeId: SeasonId | null): AmbientLayer[] {
  return themeId ? AMBIENT[themeId] : BRAND_LAYERS;
}

/** Decoraciones que aparecen como partículas (para pasarlas a imagen). */
export function particleKinds(layers: AmbientLayer[]): DecorKind[] {
  return [...new Set(layers.flatMap((l) => l.particles.flatMap((p) => ("decor" in p ? [p.decor] : []))))];
}

export function assetRequest(themeId: SeasonId | null, products: StudioProduct[]): AssetRequest {
  const skin = themeId ? skinOf(themeId) : null;
  return {
    products, hero: skin ? skin.decor[0] ?? null : null,
    cast: (skin?.cast ?? []).map(({ who, outfit, flip, pup }) => ({ who, outfit, flip, pup })),
    particles: particleKinds(layersFor(themeId)),
  };
}

export interface SceneInput {
  themeId: SeasonId | null;
  format: StudioFormat;
  texts: StudioTexts;
  products: StudioProduct[];
  offer: ThemeOffer | null;
  showPrice: boolean;
  showOffer: boolean;
  duration: number;
  /** Foto del dueño: reemplaza la imagen del primer producto. */
  photo: HTMLImageElement | null;
}

export function buildScene(input: SceneInput, assets: StudioAssets): StudioScene {
  const skin = input.themeId ? skinOf(input.themeId) : BRAND_SKIN;
  const [W, H] = STUDIO_FORMATS.find((f) => f.id === input.format)!.size;
  const look: StudioLook = { from: skin.from, to: skin.to, accent: skin.accent, accentInk: skin.accentInk, layers: layersFor(input.themeId), particleImgs: assets.particles };
  return {
    format: input.format, W, H, look, texts: input.texts,
    products: input.products.map((data, i) => ({ data, img: i === 0 && input.photo ? input.photo : assets.products[data.slug] ?? null })),
    offer: input.offer ? { label: input.offer.label, code: input.offer.coupon.code, condition: input.offer.condition } : null,
    showPrice: input.showPrice, showOffer: input.showOffer, hero: assets.hero, cast: assets.cast, steps: STUDIO_STEPS, duration: input.duration,
  };
}
