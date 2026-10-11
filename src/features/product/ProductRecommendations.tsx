"use client";
import { getProduct } from "@/demo/engine/catalog";
import { recommendForProduct } from "@/demo/engine/recommend";
import { useDemoVersion } from "@/stores/admin";
import { toCard } from "../catalog/mappers";
import { ProductRail } from "../home/ProductRail";

export function ProductRecommendations({ slug }: { slug: string }) {
  useDemoVersion();
  const product = getProduct(slug);
  if (!product) return null;
  const recs = recommendForProduct(product, 4);
  if (recs.length === 0) return null;
  return <ProductRail id="relacionados" eyebrow="Te puede gustar" title="Completá" accent="el set" products={recs.map(toCard)} />;
}
