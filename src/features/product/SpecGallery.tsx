"use client";
import { useEffect, useState } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { TestBench } from "@/components/illustrations/TestBench";
import type { ArtView, Product } from "@/demo/types";
import { cn } from "@/lib/cn";
import { heroArrivedRecently } from "@/lib/viewTransition";
import { LabelPlate } from "./LabelPlate";

type View = "photo" | "bench" | "label" | Exclude<ArtView, "front">;
const NAME: Record<View, string> = { photo: "Foto", bench: "Banco", label: "Rótulo", detail: "Detalle", context: "En el box" };

/** Vistas de la galería: la foto del panel (si hay), el pote en el banco con cotas, el rótulo y las escenas del producto. */
function viewsOf(p: Product): View[] {
  const scenes = p.gallery.filter((v): v is Exclude<ArtView, "front"> => v !== "front");
  return [...(p.photoDataUrl ? ["photo" as const] : []), "bench", ...(p.nutrition ? ["label" as const] : []), ...scenes];
}

/**
 * Galería de la hoja técnica: placas numeradas abajo y un escenario grande. El rótulo nutricional es una vista más (lo
 * que más se busca antes de comprar). El escenario lleva el nombre de la transición solo si se llega desde una tarjeta.
 */
export function SpecGallery({ product: p, tint }: { product: Product; tint?: string }) {
  const views = viewsOf(p);
  const [active, setActive] = useState<View>(views[0]!);
  const view = views.includes(active) ? active : views[0]!;
  const [hero, setHero] = useState(heroArrivedRecently);
  useEffect(() => {
    if (!hero) return;
    const t = window.setTimeout(() => setHero(false), 900);
    return () => window.clearTimeout(t);
  }, [hero]);
  const alt = p.imageAlt || p.name;
  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-sm border border-line bg-line">
      <div data-vt-hero className={cn("relative aspect-[5/4] bg-surface lg:aspect-auto lg:h-[calc(100dvh-16rem)] lg:max-h-[38rem] lg:min-h-[22rem]", view === "bench" && "lab-grid", hero && "vt-hero")}>
        {view === "photo" && <ProductVisual art={p.art} pack={p.pack} photoUrl={p.photoDataUrl} label={alt} className="h-full w-full" />}
        {view === "bench" && <TestBench art={p.art} pack={p.pack} tint={tint} label={alt} dims={p.dims} className="p-2" />}
        {view === "label" && p.nutrition && <LabelPlate nutrition={p.nutrition} />}
        {(view === "detail" || view === "context") && <ProductArt art={p.art} pack={p.pack} view={view} tint={tint} label={`${p.name}, ${NAME[view].toLowerCase()}`} showBadge={false} className="h-full w-full [&>svg]:h-full" />}
        {view !== "label" && view !== "photo" && (
          <span className="pointer-events-none absolute left-3 top-3 font-lab text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Imagen ilustrativa</span>
        )}
      </div>
      <div role="group" aria-label="Vistas del producto" className="grid gap-px" style={{ gridTemplateColumns: `repeat(${views.length}, minmax(0, 1fr))` }}>
        {views.map((v, i) => (
          <button key={v} type="button" aria-pressed={view === v} onClick={() => setActive(v)}
            className="plate relative flex h-14 min-w-0 flex-col items-start justify-center gap-0.5 px-2.5 text-left sm:px-3">
            {view === v && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-volt-ink" />}
            <span className={cn("font-lab text-[10px] font-bold", view === v ? "text-volt-ink" : "text-muted")} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <span className="w-full truncate font-lab text-[10.5px] font-bold uppercase tracking-[0.04em] sm:text-[11px] sm:tracking-[0.08em]">{NAME[v]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
