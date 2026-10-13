import { defaultPack, type PackStyle } from "@/components/illustrations/supplements";
import { stockState, type StockState } from "@/demo/admin/stock";
import { getProduct, productHref, unitPrice } from "@/demo/engine/catalog";
import { nextCadeteDay } from "@/demo/engine/delivery";
import { firstOutLot, formatExpiry } from "@/demo/engine/lots";
import { quoteCart } from "@/demo/engine/pricing";
import { bestValueSize, pricePerServing } from "@/demo/engine/servings";
import { DEMO_TODAY, orderSeeds } from "@/demo/fixtures/admin-orders";
import { workshopSettings } from "@/demo/fixtures/workshop";
import type { ArtKey, Product, ProductBadge } from "@/demo/types";
import { whenDay } from "@/lib/date";

/**
 * Datos de la maqueta, todos del catálogo y del engine de la demo (nada escrito a mano en la UI). Son objetos planos
 * para pasar a componentes cliente.
 */
export interface VariantFacts {
  id: string;
  flavor?: string;
  hex?: string;
  size?: string;
  servings?: number;
  price: number;
  transfer: number;
  perServing: number | null;
  stock: number;
  state: StockState;
  lot?: string;
  expires?: string;
}

export interface FlavorLight { name: string; hex?: string; units: number; state: StockState }

export interface RackItem {
  slug: string;
  name: string;
  brand: string;
  short: string;
  art: ArtKey;
  pack: PackStyle;
  href: string;
  badges: ProductBadge[];
  /** La presentación en stock con mejor precio por servicio: la que manda en la tarjeta. */
  lead: VariantFacts;
  variants: VariantFacts[];
  flavors: FlavorLight[];
  units: number;
  bestSize: string | null;
}

function facts(product: Product): VariantFacts[] {
  return product.variants.map((v) => {
    const price = unitPrice(product, v);
    const transfer = quoteCart([{ id: v.id, productSlug: product.slug, variantId: v.id, quantity: 1 }], { paymentMethod: "BANK_TRANSFER" }).total;
    const lot = firstOutLot(v) ?? product.lot;
    return {
      id: v.id, flavor: v.color, hex: v.colorHex, size: v.size, servings: v.servings, price, transfer,
      perServing: pricePerServing(price, v.servings), stock: v.stock, state: stockState(v.stock),
      lot: lot?.code, expires: lot ? formatExpiry(lot.expires) : undefined,
    };
  });
}

function flavorLights(variants: VariantFacts[]): FlavorLight[] {
  const by = new Map<string, FlavorLight>();
  for (const v of variants) {
    const name = v.flavor ?? v.size ?? "Único";
    const prev = by.get(name);
    const units = (prev?.units ?? 0) + Math.max(0, v.stock);
    by.set(name, { name, hex: v.hex, units, state: stockState(units) });
  }
  return [...by.values()];
}

export function rackItem(slug: string): RackItem {
  const product = getProduct(slug);
  if (!product) throw new Error(`Propuesta A: falta el producto ${slug} en el catálogo de la demo`);
  const variants = facts(product);
  const inStock = variants.filter((v) => v.stock !== 0);
  const pool = inStock.length ? inStock : variants;
  const lead = [...pool].sort((a, b) => (a.perServing ?? a.price) - (b.perServing ?? b.price))[0]!;
  return {
    slug, name: product.name, brand: product.brand, short: product.short, art: product.art,
    pack: product.pack ?? defaultPack(product.art), href: productHref(slug), badges: product.badges ?? [],
    lead, variants, flavors: flavorLights(variants), units: variants.reduce((n, v) => n + Math.max(0, v.stock), 0),
    bestSize: bestValueSize(product),
  };
}

/** Cuándo llega lo que está en stock con el cadete (calendario y cupo reales de la demo). */
export function cadeteWhen(): { day: string; text: string } {
  const day = nextCadeteDay(DEMO_TODAY, orderSeeds, workshopSettings);
  return { day, text: whenDay(day, DEMO_TODAY) };
}

export const HERO_SLUG = "ionic-whey";
export const RACK_SLUGS = ["creatina-monohidrato", "isolate-zero", "overvolt-pre", "proteina-vegana"] as const;
export const FICHA_SLUG = "ionic-whey";
