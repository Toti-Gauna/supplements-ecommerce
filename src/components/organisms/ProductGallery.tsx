"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type PointerEvent } from "react";
import type { ArtKey, ArtView, PackStyle } from "@/demo/types";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { cn } from "@/lib/cn";
import { heroArrivedRecently } from "@/lib/viewTransition";

const VIEW_LABEL: Record<ArtView, string> = { front: "Frente", detail: "Detalle", context: "En el gym" };

interface Props {
  art: ArtKey; pack?: PackStyle; views: ArtView[]; tint?: string; name: string; photoUrl?: string; alt?: string;
}

/** Galería: fundido entre vistas (estudio, detalle, gimnasio) y zoom que sigue al cursor (solo mouse). */
export function ProductGallery({ art, pack, views, tint, name, photoUrl, alt }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  // Nombre de la transición solo al llegar desde una tarjeta, y se suelta cuando la imagen ya aterrizó.
  const [hero, setHero] = useState(heroArrivedRecently);
  useEffect(() => {
    if (!hero) return;
    const t = window.setTimeout(() => setHero(false), 900);
    return () => window.clearTimeout(t);
  }, [hero]);
  const view = views[Math.max(0, active)] ?? "front";
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  if (photoUrl) return <div data-vt-hero className={cn(hero && "vt-hero")}><ProductVisual art={art} pack={pack} photoUrl={photoUrl} label={alt || name} className="aspect-square rounded-sm shadow-[var(--shadow-card)]" /></div>;
  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:justify-end">
      {/* En escritorio la galería queda fija mientras se eligen las opciones: su alto no pasa del espacio que deja el
          header (si no, en una pantalla baja la parte de abajo nunca se ve). */}
      <div data-vt-hero onPointerMove={onMove} onPointerLeave={() => setZoom(null)} className={cn("relative aspect-square flex-1 overflow-hidden rounded-sm bg-accent shadow-[var(--shadow-card)] lg:max-w-[calc(100dvh-12rem)]", hero && "vt-hero", "lg:cursor-zoom-in")}>
        <AnimatePresence initial={false} mode="popLayout">
          {photoUrl ? (
            <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <ProductVisual art={art} pack={pack} photoUrl={photoUrl} label={alt || name} className="h-full w-full" />
            </motion.div>
          ) : (
          <motion.div key={`${view}-${tint}`} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }} className="absolute inset-0">
            <div className="h-full w-full transition-transform duration-300 ease-out" style={zoom ? { transform: "scale(1.7)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
              <ProductArt art={art} pack={pack} view={view} tint={tint} label={`${name}, vista ${VIEW_LABEL[view].toLowerCase()}`} className="h-full w-full [&>svg]:h-full" />
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
      {views.length > 1 && (
        <div role="group" aria-label="Fotos del producto" className="no-scrollbar flex gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain p-1 lg:flex-col">
          {(photoUrl ? [] : views).map((v, i) => (
            <button key={v} type="button" onClick={() => setActive(i)} aria-pressed={i === active} aria-label={`Ver ${VIEW_LABEL[v].toLowerCase()}`}
              className={cn("relative w-20 shrink-0 overflow-hidden rounded-sm transition-all duration-300 lg:w-24", i === active ? "ring-2 ring-primary ring-offset-2 ring-offset-bg" : "opacity-70 hover:opacity-100")}>
              <ProductArt art={art} pack={pack} view={v} tint={tint} label="" showBadge={false} className="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
