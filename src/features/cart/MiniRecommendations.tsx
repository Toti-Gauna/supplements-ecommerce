"use client";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { fromPrice, productHref } from "@/demo/engine/catalog";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useQuickAdd } from "./useQuickAdd";

export function MiniRecommendations({ title, products, onNavigate }: { title: string; products: Product[]; onNavigate?: () => void }) {
  const quickAdd = useQuickAdd();
  if (products.length === 0) return null;
  return (
    <section aria-label={title}>
      <p className="eyebrow mb-3 text-muted">{title}</p>
      <ul className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 pb-1">
        {products.map((p) => (
          <li key={p.slug} className="group relative w-36 shrink-0">
            <div className="relative">
              <ProductVisual art={p.art} photoUrl={p.photoDataUrl} tint={p.variants[0]?.colorHex} label={p.imageAlt || p.name} showBadge={false} className="aspect-square rounded-2xl transition-transform duration-500 group-hover:scale-[1.03]" />
              <button type="button" onClick={() => quickAdd(p)} aria-label={p.personalization ? `Personalizar ${p.name}` : `Agregar ${p.name}`}
                className="absolute bottom-2 right-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface text-primary shadow-[var(--shadow-card)] hover:bg-primary hover:text-on-primary">
                {p.personalization ? <Sparkles size={16} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
              </button>
            </div>
            {/* Toda la tarjeta lleva a la ficha (enlace estirado); el botón de agregar queda por encima. */}
            <Link href={productHref(p.slug)} onClick={onNavigate} className="mt-2 line-clamp-1 text-sm font-bold after:absolute after:inset-0 after:content-['']">{p.name}</Link>
            <p className="text-sm text-muted">{formatARS(fromPrice(p))}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
