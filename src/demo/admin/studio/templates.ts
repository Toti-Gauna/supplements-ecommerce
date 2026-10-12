import { bestSellers, getCategory } from "../../engine/catalog";
import { sortedTiers } from "../../engine/game-prize";
import { stackDiscount, type StackRule } from "../../engine/stack";
import type { GamePrizeConfig } from "../../fixtures/game";
import { STUDIO_BRAND, STUDIO_TEMPLATES, type StudioTemplate } from "../../fixtures/studio";
import type { Product, SeasonalTheme } from "../../types";
import { stackRuleExample } from "../stack-rule";
import { offerProducts, type StudioProduct, type StudioTexts } from "./content";

/**
 * Plantillas del Estudio (Fase 7): qué productos arranca cada una, sus textos y los datos que dibuja (total del
 * stack, niveles del juego). Todo sale del engine y de lo guardado en el panel: nada de precios ni premios fijos.
 */
export const templateMeta = (id: StudioTemplate) => STUDIO_TEMPLATES.find((t) => t.id === id)!;

/** Productos con los que arranca la plantilla (el dueño los cambia). */
export function templateProducts(template: StudioTemplate, theme: SeasonalTheme | null, catalog: Product[], rule: StackRule): string[] {
  if (template === "offer") return offerProducts(theme);
  if (template === "product") return bestSellers(1).map((p) => p.slug);
  if (template === "stack") return stackRuleExample({ ...rule, minCategories: Math.min(3, Math.max(2, rule.minCategories)) }, catalog).products.map((p) => p.slug);
  return [];
}

/** Resumen del stack de la pieza: con la misma regla que el carrito (precio "desde" de cada pote). */
export interface StudioStack { pct: number; subtotal: number; discount: number; total: number; applies: boolean; missing: number }

export function studioStack(products: Pick<StudioProduct, "slug" | "categorySlug" | "price">[], rule: StackRule): StudioStack {
  const r = stackDiscount(products.map((p) => ({ product: p, lineTotal: p.price })), rule);
  const subtotal = products.reduce((s, p) => s + p.price, 0);
  return { pct: rule.pct, subtotal, discount: r.discount, total: subtotal - r.discount, applies: r.discount > 0, missing: r.missing };
}

/** Niveles del juego para la pieza (los guardados en Premios del juego). */
export interface StudioGame { active: boolean; tiers: { label: string; minScore: number }[]; best: string | null }

export function studioGame(config: GamePrizeConfig): StudioGame {
  const tiers = sortedTiers(config.tiers).map((t) => ({ label: t.label, minScore: t.minScore }));
  return { active: config.active && tiers.length > 0, tiers, best: tiers.at(-1)?.label ?? null };
}

/** "Proteínas + creatinas + pre-entrenos". */
const plus = (items: string[]) => items.map((n, i) => (i ? n.toLowerCase() : n)).join(" + ");

/** Textos con los que arranca cada plantilla (con la temática, si hay, en la bajada de la oferta). */
export function templateTexts(template: StudioTemplate, theme: SeasonalTheme | null, ctx: { products: StudioProduct[]; stack: StudioStack; game: StudioGame }): StudioTexts {
  const cta = STUDIO_BRAND.cta;
  if (template === "offer") {
    if (!theme) return { eyebrow: STUDIO_BRAND.eyebrow, title: STUDIO_BRAND.title, subtitle: STUDIO_BRAND.subtitle, cta };
    return { eyebrow: `Especial ${theme.name}`, title: theme.headline, subtitle: theme.subtitle, cta };
  }
  if (template === "product") {
    const p = ctx.products[0];
    return { eyebrow: p ? `Destacado · ${p.brand}` : "Producto destacado", title: p?.name ?? "Elegí un producto", subtitle: p?.short ?? "", cta };
  }
  if (template === "stack") {
    const names = ctx.products.map((p) => getCategory(p.categorySlug)?.name ?? p.categorySlug);
    const deal = ctx.stack.applies ? `Juntos tienen ${ctx.stack.pct} % off con el descuento stack.` : "Armalo a tu medida en la tienda.";
    return { eyebrow: "Stack del mes", title: names.length ? plus(names) : "Tu stack del mes", subtitle: deal, cta };
  }
  const best = ctx.game.best ? ctx.game.best.replace(/^Envío/, "envío") : "un descuento";
  return {
    eyebrow: "Juego del Club · Shaker Rush", title: "Jugá y ganá tu cupón",
    subtitle: ctx.game.active ? `Atrapá scoops, esquivá la chatarra: según tu puntaje ganás hasta ${best}. Un cupón por día.` : "Atrapá scoops y esquivá la chatarra: superá tu récord.",
    cta: "Jugalo en la tienda · link en la bio",
  };
}
