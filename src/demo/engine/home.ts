import { weeklySales, type WeeklySales } from "../fixtures/box-ranking";
import { sampleReviews, type ProductReviews } from "../fixtures/reviews";
import type { HeroFeature, Product, SeasonalTheme } from "../types";
import { bestSellers, getProduct, productsInCategory } from "./catalog";
import { rackFacts } from "./rack";
import { themeProducts } from "./themes";

/** Inicio (R1): qué va en el hero, la tabla "El más elegido del box" y las reseñas por atributo. Puro y testeado. */

export interface HeroPick {
  key: string;
  /** "campaign": la fecha vigente (va primero); "featured": un destacado del panel. */
  kind: "campaign" | "featured";
  product: Product;
  headline: string;
  pitch: string;
  image?: HeroFeature["image"];
}

const visible = (p: Product | undefined): p is Product => Boolean(p && p.active !== false);

/**
 * Lo que puede mostrar el hero, en orden: la campaña vigente (con su primer producto en oferta) y después los
 * destacados visibles del panel, sin repetir producto. Si no queda nada, el más vendido con su bajada.
 */
export function heroPicks(features: HeroFeature[], theme: SeasonalTheme | null): HeroPick[] {
  const picks: HeroPick[] = [];
  const lead = theme ? themeProducts(theme)[0] : undefined;
  if (theme && lead) {
    const image = features.find((f) => f.active !== false && f.productSlug === lead.slug)?.image;
    picks.push({ key: `campaign-${theme.id}`, kind: "campaign", product: lead, headline: theme.headline, pitch: theme.subtitle, image });
  }
  for (const f of features) {
    const product = getProduct(f.productSlug);
    if (f.active === false || !visible(product) || picks.some((p) => p.product.slug === product.slug)) continue;
    picks.push({ key: f.id, kind: "featured", product, headline: f.headline, pitch: f.pitch, image: f.image });
  }
  const top = bestSellers(1)[0];
  if (!picks.length && top) picks.push({ key: "best", kind: "featured", product: top, headline: top.name, pitch: top.short });
  return picks;
}

/**
 * Vecinos del destacado en el rack de la escena del carrusel: hasta `n` productos visibles de su misma categoría,
 * los más vendidos primero (a igual venta, por slug), prefiriendo envases distintos al suyo para que se lean como
 * otros productos. Sin otros en la categoría, el destacado queda solo.
 */
export function heroNeighbors(product: Product, n = 2): Product[] {
  const others = productsInCategory(product.categorySlug)
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => b.soldCount - a.soldCount || a.slug.localeCompare(b.slug));
  const distinct = others.filter((p) => p.art !== product.art);
  return [...distinct, ...others.filter((p) => p.art === product.art)].slice(0, Math.max(0, n));
}

export interface RankRow {
  rank: number;
  product: Product;
  week: number;
  /** Puestos que subió (+) o bajó (−) contra la semana anterior; 0 = igual. */
  move: number;
  perServing: number | null;
  /** Precio de la presentación principal (lo que se paga). */
  price: number;
}

/** Tabla de posiciones de la semana: unidades vendidas, cambio de puesto, precio y precio por servicio. */
export function boxLeaderboard(n = 5, sales: WeeklySales[] = weeklySales): RankRow[] {
  const live = sales.flatMap((s) => { const p = getProduct(s.productSlug); return visible(p) ? [{ ...s, product: p }] : []; });
  const byWeek = [...live].sort((a, b) => b.week - a.week || a.productSlug.localeCompare(b.productSlug));
  const prevRank = new Map([...live].sort((a, b) => b.prevWeek - a.prevWeek || a.productSlug.localeCompare(b.productSlug)).map((s, i) => [s.productSlug, i + 1]));
  return byWeek.slice(0, n).map((s, i) => {
    const facts = rackFacts(s.product);
    return { rank: i + 1, product: s.product, week: s.week, move: prevRank.get(s.productSlug)! - (i + 1), perServing: facts.perServing, price: facts.price };
  });
}

/** Reseñas de muestra de productos visibles, las de más reseñas primero. */
export function homeReviews(n = 3, list: ProductReviews[] = sampleReviews): (ProductReviews & { product: Product })[] {
  return list
    .flatMap((r) => { const p = getProduct(r.productSlug); return visible(p) ? [{ ...r, product: p }] : []; })
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/** Nota con una coma decimal, como se lee en Argentina ("4,7"). */
export const scoreText = (n: number) => n.toFixed(1).replace(".", ",");
