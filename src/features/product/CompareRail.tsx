"use client";
import { getProduct } from "@/demo/engine/catalog";
import { compareAlternatives } from "@/demo/engine/sheet";
import { useDemoVersion } from "@/stores/admin";
import { toCard } from "../catalog/mappers";
import { ProductRail } from "../home/ProductRail";

/**
 * "Comparalo con…": alternativas de la misma categoría (o del mismo objetivo), de la que más rinde por servicio a la
 * que menos. Es la respuesta a "¿y cuál me conviene?" que el dueño escribe por WhatsApp. Las tarjetas son las de siempre.
 */
export function CompareRail({ slug }: { slug: string }) {
  useDemoVersion();
  const product = getProduct(slug);
  if (!product) return null;
  const list = compareAlternatives(product, 4);
  if (list.length === 0) return null;
  return <ProductRail id="relacionados" eyebrow="Antes de decidir" title="Comparalo" accent="con…" products={list.map(toCard)} />;
}
