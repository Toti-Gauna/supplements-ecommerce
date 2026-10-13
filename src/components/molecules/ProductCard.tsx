"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { LedPrice } from "@/components/atoms/Led";
import { RackShot } from "@/components/illustrations/RackShot";
import type { StockState } from "@/demo/admin/stock";
import { getProduct } from "@/demo/engine/catalog";
import type { ArtKey, PackStyle, ProductBadge } from "@/demo/types";
import { useAddFlow } from "@/features/cart/useAddFlow";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { markProductHero } from "@/lib/viewTransition";
import { Stamps } from "./Stamps";
import { StockLights, type StockLightItem } from "./StockLights";

export interface ProductCardData {
  slug: string;
  href: string;
  photoUrl?: string;
  alt: string;
  name: string;
  brand?: string;
  art: ArtKey;
  pack?: PackStyle;
  tint?: string;
  perServing: number | null;
  /** Hay presentaciones con otro precio por servicio: "desde". */
  from: boolean;
  servings?: number;
  size?: string;
  /** Precio del pote de esa presentación. */
  price: number;
  /** El precio más bajo del producto (para el riel de ofertas). */
  fromPrice: number;
  badges: ProductBadge[];
  lights: StockLightItem[];
  state: StockState;
  stockText: string;
  flavors: number;
  isNew: boolean;
  clearance?: boolean;
  /** Oferta de temática: precio con el cupón (o null si pide un mínimo) y su insignia. */
  deal?: { price: number | null; label: string; bg: string; ink: string };
}

const TAG = "px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em]";

/**
 * "Ficha de rack": el envase en su estante y, abajo, lo que vende: precio por servicio en el marcador, servicios y
 * precio del pote, sellos, una luz de stock por variante y agregar. La caja de arriba va en su propia capa (z-[1], sin
 * puntero) y el botón en otra (z-[2]) por encima del link estirado del nombre (arreglo de R0, `motion.css`).
 */
export function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const full = getProduct(product.slug);
  const { add, sheet, choose } = useAddFlow(full);
  const out = product.state === "out";
  return (
    <article data-product-card className="group relative flex h-full flex-col border border-line bg-surface shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)] has-[h3_a:focus-visible]:outline-2 has-[h3_a:focus-visible]:outline-offset-2 has-[h3_a:focus-visible]:outline-primary">
      <div className="pointer-events-none relative z-[1]">
        <p className="plate flex h-7 items-center justify-between gap-2 px-2.5">
          <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{product.brand}</span>
          <span className="flex shrink-0 gap-1">
            {product.deal && <span className={TAG} style={{ background: product.deal.bg, color: product.deal.ink }}>{product.deal.label}</span>}
            {product.isNew && <span className={`${TAG} bg-volt text-night`}>Nuevo</span>}
            {product.clearance && <span className={`${TAG} bg-warning-soft text-warning`}>Liquidación</span>}
          </span>
        </p>
        <div data-card-visual className="rack-bay relative aspect-[5/4] overflow-hidden">
          {product.photoUrl
            // eslint-disable-next-line @next/next/no-img-element -- foto cargada en el panel demo (data URL local)
            ? <img src={product.photoUrl} alt={product.alt} className="h-full w-full object-cover" />
            : <RackShot items={[{ art: product.art, pack: product.pack, tint: product.tint }]} label={product.alt} className="transition-transform duration-300 group-hover:-translate-y-1" />}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
        <h3 className="font-display line-clamp-2 text-lg leading-[0.95] sm:text-[1.4rem]">
          <Link href={product.href} prefetch={priority} onClick={(e) => markProductHero(e.currentTarget.closest("[data-product-card]"), e)} className="after:absolute after:inset-0 focus-visible:outline-none">{product.name}</Link>
        </h3>
        <div>
          <p className="eyebrow text-[10px] text-muted">{product.perServing ? `Por servicio${product.from ? " · desde" : ""}` : "Precio"}</p>
          <div className="mt-1"><LedPrice amount={product.perServing ?? product.price} suffix={product.perServing ? " por servicio" : ""} motion="none" className="h-7 sm:h-8" signClassName="text-xl" /></div>
          <p className="mt-1.5 font-mono text-[11px] text-muted">
            {product.servings && product.servings > 1 ? `${product.servings} serv · ` : ""}{product.size ? `${product.size} · ` : ""}
            {product.deal?.price ? <><span className="sr-only">Antes </span><s>{formatARS(product.price)}</s> <span className="sr-only">Con el cupón </span><strong className="text-ink">{formatARS(product.deal.price)}</strong></> : <strong className="text-ink">{formatARS(product.price)}</strong>}
          </p>
        </div>
        <Stamps badges={product.badges} max={2} />
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-line pt-2.5 font-mono text-[11px]">
          <span className="flex min-w-0 items-center gap-2"><StockLights items={product.lights} /><span className={out ? "text-danger" : "text-ink"}>{product.stockText}</span></span>
          {product.flavors > 1 && <span className="text-muted">{plural(product.flavors, "sabor", "sabores")}</span>}
        </div>
        {full && (
          <button type="button" onClick={add} disabled={out} aria-label={`Agregar ${product.name} al carrito`} aria-haspopup={choose ? "dialog" : undefined}
            className="relative z-[2] flex h-11 items-center justify-center gap-2 bg-primary px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-on-primary shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)] hover:bg-primary-hover active:translate-y-px disabled:opacity-45 sm:justify-between">
            <span className="flex items-center gap-1.5"><Plus size={15} aria-hidden="true" />{out ? "Sin stock" : "Agregar"}</span>
            {!out && <span className="hidden tabular-nums sm:inline">{formatARS(product.deal?.price ?? product.price)}</span>}
          </button>
        )}
      </div>
      {sheet}
    </article>
  );
}

/** Aviso único de las imágenes de una sección (en lugar de un sello por tarjeta). */
export function IllustrativeNote({ className }: { className?: string }) {
  return <p className={`font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted ${className ?? ""}`}>Imágenes ilustrativas de la demo</p>;
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <li key={p.slug} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
      {products.length > 0 && <IllustrativeNote className="mt-4" />}
    </>
  );
}
