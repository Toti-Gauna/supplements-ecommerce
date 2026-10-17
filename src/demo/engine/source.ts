import { categories } from "../fixtures/categories";
import { coupons, demoSettings, heroFeatures, homeCta, missions, shippingZones, type DemoSettings } from "../fixtures/commerce";
import { storeFaqs } from "../fixtures/content";
import { goals, type GoalInfo } from "../fixtures/goals";
import { gamePrizes, type GamePrizeConfig } from "../fixtures/game";
import { sampleGiftCards, sampleGiftRecords } from "../fixtures/gift-cards";
import { packs } from "../fixtures/packs";
import { sports, type SportInfo } from "../fixtures/sports";
import { products } from "../fixtures/products";
import { seasonalThemes, themeCoupons, themeSettings } from "../fixtures/themes";
import { defaultWheel, type WheelConfig } from "../fixtures/wheel";
import type { GiftCardRecord } from "./gift-cards";
import type { GiftRecord } from "./gift-status";
import type { PriceChange } from "./price-history";
import type { Category, Coupon, HeroFeature, Mission, Pack, Product, SeasonalTheme, ShippingZone, StoreFaq, ThemeSettings } from "../types";

/**
 * Datos editables de la demo. La tienda los lee de acá; el panel demo los modifica
 * (estado local en este navegador). En producción todo esto vive en PostgreSQL.
 */
export interface DemoData {
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  missions: Mission[];
  zones: ShippingZone[];
  settings: DemoSettings;
  wheel: WheelConfig;
  /** Premios por puntaje de Shaker Rush (Marketing → Cupones y ruleta → Premios del juego). */
  game: GamePrizeConfig;
  content: { hero: HeroFeature[]; homeCta: { title: string; text: string }; faqs: StoreFaq[] };
  themes: SeasonalTheme[];
  themeSettings: ThemeSettings;
  /** Objetivos de entrenamiento (nombre, bajada y color se editan en el panel → Categorías). */
  goals: GoalInfo[];
  /** Packs mensuales (L3; Packs en el panel). */
  packs: Pack[];
  /** Deportes (L4): nombre, bajada, color y pack sugerido se editan en el panel → Categorías. */
  sports: SportInfo[];
  /** Cambios de precio hechos en el panel (R3, "Descuento real"): con la historia simulada dan el más bajo de 30 días. */
  priceChanges: PriceChange[];
  /** Gift cards emitidas con su saldo y sus usos (R3b; panel → Regalos). La tienda valida el saldo contra esta lista. */
  giftCards: GiftCardRecord[];
  /** Estado de cada regalo (enviado, abierto, elegido, canjeado) y lo que eligió quien lo recibió (R3b). */
  giftRecords: GiftRecord[];
}

export function defaultDemoData(): DemoData {
  return structuredClone({
    products: products.map((p) => ({ ...p, active: true, imageAlt: p.name })),
    categories,
    coupons: [...coupons, ...themeCoupons],
    missions,
    zones: shippingZones.map((z) => ({ ...z, active: true })),
    settings: demoSettings,
    wheel: defaultWheel,
    game: gamePrizes,
    content: { hero: heroFeatures.map((h) => ({ ...h, active: true })), homeCta, faqs: storeFaqs },
    themes: seasonalThemes,
    themeSettings,
    goals,
    packs: packs.map((p) => ({ ...p, active: true })),
    sports,
    priceChanges: [],
    giftCards: sampleGiftCards,
    giftRecords: sampleGiftRecords,
  });
}

let current: DemoData = defaultDemoData();

/** Lectura sin React (engine). Los componentes usan useDemoData para re-renderizar. */
export function demoData(): DemoData {
  return current;
}

export function setDemoData(next: DemoData): void {
  current = next;
}

/** Productos con página estática generada en build; los creados en el panel usan /p/demo/?slug=. */
export const STATIC_PRODUCT_SLUGS = new Set(products.map((p) => p.slug));

/** Categorías con página estática (las que tienen productos en los datos de muestra); las nuevas usan /c/demo/?slug=. */
export const STATIC_CATEGORY_SLUGS = new Set(categories.filter((c) => products.some((p) => p.categorySlug === c.slug)).map((c) => c.slug));
