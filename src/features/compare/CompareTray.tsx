"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, X } from "lucide-react";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { bottomBarFor } from "@/components/organisms/bottomBars";
import { getProduct } from "@/demo/engine/catalog";
import { COMPARE_MAX } from "@/demo/engine/compare-tray";
import { cn } from "@/lib/cn";
import { useCompare } from "@/stores/compare";
import { useCompareTray } from "./useCompareTray";

/**
 * Bandeja del comparador: una placa chica, fija abajo a la derecha (en el celular, arriba del dock o de la barra de
 * compra), con los potes elegidos y "Comparar (2)". Solo aparece si hay algo elegido y no en el comparador, el carrito
 * ni el checkout.
 */
export function CompareTray() {
  const pathname = usePathname();
  const { slugs, href } = useCompareTray();
  const clear = useCompare((s) => s.clear);
  const bar = bottomBarFor(pathname);
  // En el armador, el celular ya tiene la placa del total arriba del dock (StackBuyBar).
  const builder = pathname.replace(/\/$/, "") === "/crear";
  if (!slugs.length || pathname.startsWith("/comparar") || bar === "cart" || bar === "none" || bar === "preview") return null;
  return (
    <aside aria-label="Comparación" data-compare-tray
      className={cn("fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-30 flex items-stretch border border-line bg-surface shadow-[inset_0_2px_0_var(--season-accent),var(--shadow-lift)] animate-fade-up lg:bottom-6 lg:right-6", builder && "max-lg:hidden")}>
      <Link href={href} className="flex min-h-12 items-center gap-2 py-1.5 pl-2 pr-3 hover:bg-accent">
        <span aria-hidden="true" className="hidden -space-x-2 sm:flex">
          {Array.from({ length: COMPARE_MAX }, (_, i) => {
            const p = slugs[i] ? getProduct(slugs[i]!) : undefined;
            return (
              <span key={i} className={cn("plate grid size-9 place-items-center overflow-hidden border border-line", !p && "border-dashed bg-bg")}>
                {p && <ProductVisual art={p.art} pack={p.pack} photoUrl={p.photoDataUrl} tint={p.variants[0]?.colorHex} label="" showBadge={false} className="size-full" />}
              </span>
            );
          })}
        </span>
        <GitCompareArrows size={16} aria-hidden="true" className="text-volt-ink" />
        <span className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink">Comparar ({slugs.length})</span>
      </Link>
      <button type="button" onClick={clear} aria-label="Vaciar la comparación" className="grid w-10 place-items-center border-l border-line text-muted hover:bg-accent hover:text-ink">
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  );
}
