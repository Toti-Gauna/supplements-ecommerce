"use client";
import { useState } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import type { ArtView, Product } from "@/demo/types";
import { cn } from "@/lib/cn";
import { ArenaPack } from "./ArenaPack";
import s from "./arena.module.css";

const VIEW_LABEL: Record<ArtView, string> = { front: "Frente", detail: "Detalle", context: "En el box" };

interface ArenaGalleryProps {
  product: Product;
  tint?: string;
  className?: string;
}

/** Galería como cámaras de transmisión: CAM 01, 02, 03. La principal es el escenario; las otras, las vistas del arte. */
export function ArenaGallery({ product, tint, className }: ArenaGalleryProps) {
  const [view, setView] = useState<ArtView>(product.gallery[0] ?? "front");
  const camOf = (v: ArtView) => String(product.gallery.indexOf(v) + 1).padStart(2, "0");
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className={cn(s.cut, "relative aspect-square overflow-hidden bg-[var(--a-stage)]")}>
        <div aria-hidden="true" className={s.haze} />
        <div aria-hidden="true" className={cn(s.beam, "left-[22%] h-[120%] w-[56%]")} />
        <div aria-hidden="true" className={s.floor} />
        {view === "front" ? (
          <ArenaPack product={product} tint={tint} className="absolute inset-[6%]" />
        ) : (
          <ProductArt art={product.art} pack={product.pack} tint={tint} view={view} label={product.name} showBadge={false} className="absolute inset-0" />
        )}
        <p className={cn(s.mono, "absolute left-4 top-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]")}>
          <span aria-hidden="true" className={cn(s.ledDot, "text-[var(--a-ember)]")} />CAM {camOf(view)} · {VIEW_LABEL[view]}
        </p>
        <p className={cn(s.mono, "absolute bottom-3 right-4 text-[10px] uppercase tracking-[0.18em] text-[var(--a-muted)]")}>Imagen ilustrativa</p>
      </div>
      <div role="group" aria-label="Vistas del producto" className="grid grid-cols-3 gap-2">
        {product.gallery.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={v === view}
            onClick={() => setView(v)}
            className={cn(
              s.cut, s.cutSm,
              s.focusCut, "flex items-center justify-between gap-2 px-3 py-2.5 text-left",
              v === view ? "bg-[var(--a-ink)] text-black" : "bg-[var(--a-stage)] text-[var(--a-ink)] hover:bg-[#1a1a21]",
            )}
          >
            <span className={cn(s.display, s.num, "text-2xl")}>{camOf(v)}</span>
            <span className={cn(s.mono, "text-[10.5px] font-bold uppercase tracking-[0.1em]")}>{VIEW_LABEL[v]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
