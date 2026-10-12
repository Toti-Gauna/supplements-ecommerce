import { categories } from "../fixtures/categories";
import { coupons, demoSettings, homeCta, missions, shippingZones, slides, type DemoSettings } from "../fixtures/commerce";
import { storeFaqs } from "../fixtures/content";
import { goals, type GoalInfo } from "../fixtures/goals";
import { gamePrizes, type GamePrizeConfig } from "../fixtures/game";
import { products } from "../fixtures/products";
import { seasonalThemes, themeCoupons, themeSettings } from "../fixtures/themes";
import { defaultWheel, type WheelConfig } from "../fixtures/wheel";
import type { CarouselSlide, Category, Coupon, Faq, Mission, Product, SeasonalTheme, ShippingZone, ThemeSettings } from "../types";

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
  content: { slides: CarouselSlide[]; homeCta: { title: string; text: string }; faqs: Faq[] };
  themes: SeasonalTheme[];
  themeSettings: ThemeSettings;
  /** Objetivos de entrenamiento (nombre, bajada y color se editan en el panel → Categorías). */
  goals: GoalInfo[];
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
    content: { slides: slides.map((s) => ({ ...s, active: true })), homeCta, faqs: storeFaqs },
    themes: seasonalThemes,
    themeSettings,
    goals,
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
