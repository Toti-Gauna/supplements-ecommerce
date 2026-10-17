"use client";
import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { buttonClass } from "@/components/atoms/Button";
import { getProduct } from "@/demo/engine/catalog";
import { compareHref, compareSuggestions } from "@/demo/engine/compare";
import { compareAlternatives } from "@/demo/engine/sheet";
import type { Product } from "@/demo/types";
import { useDemoVersion } from "@/stores/admin";
import { toCard } from "../catalog/mappers";
import { ProductRail } from "../home/ProductRail";

/** La invitación al comparador: este producto y sus parecidos de la misma categoría, lado a lado con un toque. */
function CompareInvite({ product, similar }: { product: Product; similar: Product[] }) {
  const all = [product, ...similar];
  return (
    <div className="plate mt-6 flex flex-col gap-4 border border-line p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <span aria-hidden="true" className="flex shrink-0 -space-x-3">
        {all.map((p) => (
          <span key={p.slug} className="rack-bay grid size-14 place-items-center overflow-hidden border border-line sm:size-16">
            <ProductVisual art={p.art} pack={p.pack} photoUrl={p.photoDataUrl} tint={p.variants[0]?.colorHex} label="" showBadge={false} className="size-full" />
          </span>
        ))}
      </span>
      <p className="min-w-0 flex-1">
        <span className="eyebrow block text-volt-ink">Lado a lado</span>
        <span className="font-display mt-1 block text-xl leading-tight sm:text-2xl">{all.map((p) => p.name).join(" vs. ")}</span>
        <span className="mt-1 block text-sm text-muted">Precio, precio por servicio, proteína, cuánto te dura y vencimiento, con el mejor marcado.</span>
      </p>
      <Link href={compareHref(all.map((p) => p.slug))} className={buttonClass("primary", "md", "shrink-0")}>
        <GitCompareArrows size={16} aria-hidden="true" />Comparar {all.length === 2 ? "los 2" : `los ${all.length}`}
      </Link>
    </div>
  );
}

/**
 * "Comparalo con…": alternativas de la misma categoría (o del mismo objetivo), de la que más rinde por servicio a la
 * que menos, y el atajo al comparador con este producto y sus parecidos. Es la respuesta a "¿y cuál me conviene?" que
 * el dueño escribe por WhatsApp. Las tarjetas son las de siempre (con su "Comparar").
 */
export function CompareRail({ slug }: { slug: string }) {
  useDemoVersion();
  const product = getProduct(slug);
  if (!product) return null;
  const list = compareAlternatives(product, 4);
  const similar = compareSuggestions(product);
  if (list.length === 0 && similar.length === 0) return null;
  return (
    <div>
      <ProductRail id="relacionados" eyebrow="Antes de decidir" title="Comparalo" accent="con…" products={list.map(toCard)} />
      {similar.length > 0 && <CompareInvite product={product} similar={similar} />}
    </div>
  );
}
