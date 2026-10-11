"use client";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ArtKey, ArtView } from "@/demo/types";
import { getProduct } from "@/demo/engine/catalog";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { useQuickAdd } from "@/features/cart/useQuickAdd";
import { cn } from "@/lib/cn";
import { markProductHero } from "@/lib/viewTransition";
import { formatARS } from "@/lib/money";

export interface ProductCardData {
  slug: string;
  href: string;
  photoUrl?: string;
  alt: string;
  name: string;
  short: string;
  art: ArtKey;
  secondView?: ArtView;
  tint?: string;
  colors: string[];
  fromPrice: number;
  hasRange: boolean;
  isNew: boolean;
  madeToOrder: boolean;
  personalizable: boolean;
  stockNote: string;
  /** Oferta de temática: precio con el cupón y su sello (colores de la temática). */
  deal?: { price: number | null; label: string; bg: string; ink: string };
}

export function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const quickAdd = useQuickAdd();
  const full = getProduct(product.slug);
  // La segunda vista (al pasar el mouse) se dibuja recién la primera vez que entra el mouse: en el celular no existe
  // y en la grilla es un SVG entero de más por tarjeta.
  const [hovered, setHovered] = useState(false);
  return (
    <article data-product-card className="group relative flex flex-col gap-3" onPointerEnter={(e) => { if (e.pointerType === "mouse") setHovered(true); }}>
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-accent shadow-[var(--shadow-card)] transition-shadow duration-500 group-hover:shadow-[var(--shadow-lift)]">
        <div data-card-visual className="overflow-hidden rounded-[var(--radius-card)]">
          <ProductVisual art={product.art} tint={product.tint} photoUrl={product.photoUrl} label={product.alt}
            className="aspect-[4/5] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
        </div>
        {hovered && product.secondView && !product.photoUrl && (
          <ProductArt art={product.art} view={product.secondView} tint={product.tint} label="" showBadge={false}
            className="fade-from-0 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [&>svg]:h-full [&>svg]:object-cover" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.deal && <span className="rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-sm" style={{ background: product.deal.bg, color: product.deal.ink }}>{product.deal.label}</span>}
          {product.isNew && <span className="rounded-full bg-night px-2.5 py-1 text-[11px] font-bold text-[#f6f1e8]">Nuevo</span>}
          {product.personalizable && <span className="rounded-full bg-[#fffdf8]/90 px-2.5 py-1 text-[11px] font-bold text-[#1c2016] backdrop-blur">Personalizable</span>}
        </div>
        {full && (
          <button type="button" onClick={() => quickAdd(full)} aria-label={product.personalizable ? `Personalizar ${product.name}` : `Agregar ${product.name} al carrito`}
            className="absolute bottom-3 right-3 z-10 flex h-11 items-center gap-2 rounded-full bg-[#fffdf8] px-3.5 text-sm font-bold text-[#1c2016] shadow-[var(--shadow-card)] transition-all duration-300 hover:bg-primary hover:text-on-primary lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:focus-visible:translate-y-0 lg:focus-visible:opacity-100">
            {product.personalizable ? <Sparkles size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            <span className="max-lg:sr-only">{product.personalizable ? "Personalizar" : "Agregar"}</span>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink">
          <Link href={product.href} prefetch={priority} onClick={(e) => markProductHero(e.currentTarget.closest("[data-product-card]"), e)} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)] focus-visible:outline-none">{product.name}</Link>
        </h3>
        <p className="text-lg font-extrabold tabular-nums leading-tight">
          {product.hasRange && <span className="mr-1 text-xs font-semibold text-muted">desde</span>}
          {product.deal?.price ? (
            <>
              <span className="sr-only">Antes </span><s className="mr-1.5 text-sm font-semibold text-muted">{formatARS(product.fromPrice)}</s>
              <span className="sr-only">Con el cupón </span>{formatARS(product.deal.price)}
            </>
          ) : formatARS(product.fromPrice)}
        </p>
        <p className={cn("line-clamp-1 text-[13px]", product.stockNote.startsWith("¡Últimas") ? "font-bold text-danger" : "text-muted")}>{product.stockNote}</p>
      </div>
      {product.colors.length > 1 && (
        <p className="flex gap-1.5 px-1" aria-label={`${product.colors.length} colores`}>
          {product.colors.slice(0, 5).map((c) => <span key={c} aria-hidden="true" className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c }} />)}
        </p>
      )}
    </article>
  );
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.slug} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
