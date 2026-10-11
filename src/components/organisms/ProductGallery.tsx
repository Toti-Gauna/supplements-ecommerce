"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type PointerEvent, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import type { ArtKey, ArtView } from "@/demo/types";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { cn } from "@/lib/cn";
import { heroArrivedRecently } from "@/lib/viewTransition";

const VIEW_LABEL: Record<ArtView, string> = { front: "Frente", detail: "Detalle", context: "En casa" };

interface Props {
  art: ArtKey; views: ArtView[]; tint?: string; name: string; photoUrl?: string; alt?: string;
  /** Vista previa en vivo de la personalización: ocupa la primera posición de la galería. */
  live?: ReactNode;
}

/** Galería: fundido entre vistas y zoom que sigue al cursor (solo mouse). Con `live`, la primera vista es "Tu diseño". */
export function ProductGallery({ art, views, tint, name, photoUrl, alt, live }: Props) {
  const [active, setActive] = useState(live ? -1 : 0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  // Nombre de la transición solo al llegar desde una tarjeta, y se suelta cuando la imagen ya aterrizó.
  const [hero, setHero] = useState(heroArrivedRecently);
  useEffect(() => {
    if (!hero) return;
    const t = window.setTimeout(() => setHero(false), 900);
    return () => window.clearTimeout(t);
  }, [hero]);
  const showLive = Boolean(live) && active === -1;
  const view = views[Math.max(0, active)] ?? "front";
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || showLive) return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  if (photoUrl && !live) return <div data-vt-hero className={cn(hero && "vt-hero")}><ProductVisual art={art} photoUrl={photoUrl} label={alt || name} className="aspect-square rounded-[2rem] shadow-[var(--shadow-card)]" /></div>;
  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:justify-end">
      {/* En escritorio la galería queda fija mientras se eligen las opciones: su alto no pasa del espacio que deja el
          header (si no, en una pantalla baja la parte de abajo nunca se ve). */}
      <div data-vt-hero onPointerMove={onMove} onPointerLeave={() => setZoom(null)} className={cn("relative aspect-square flex-1 overflow-hidden rounded-[2rem] bg-accent shadow-[var(--shadow-card)] lg:max-w-[calc(100dvh-12rem)]", hero && "vt-hero", !showLive && "lg:cursor-zoom-in")}>
        {showLive && (
          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-night px-3 py-1.5 text-xs font-bold text-[#f6f1e8] shadow-[var(--shadow-card)]">
            <Sparkles size={13} aria-hidden="true" className="text-brass" />Vista previa en vivo
          </span>
        )}
        {/* La vista en vivo queda montada aunque se mire otra foto: el lienzo de la foto se exporta al agregar. */}
        {live && <div aria-hidden={!showLive} className={cn("absolute inset-0 transition-opacity duration-500", showLive ? "opacity-100" : "pointer-events-none opacity-0")}>{live}</div>}
        <AnimatePresence initial={false} mode="popLayout">
          {showLive ? null : photoUrl ? (
            <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <ProductVisual art={art} photoUrl={photoUrl} label={alt || name} className="h-full w-full" />
            </motion.div>
          ) : (
          <motion.div key={`${view}-${tint}`} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }} className="absolute inset-0">
            <div className="h-full w-full transition-transform duration-300 ease-out" style={zoom ? { transform: "scale(1.7)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
              <ProductArt art={art} view={view} tint={tint} label={`${name}, vista ${VIEW_LABEL[view].toLowerCase()}`} className="h-full w-full [&>svg]:h-full" />
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
      {(views.length > 1 || live) && (
        <div role="group" aria-label="Fotos del producto" className="no-scrollbar flex gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain p-1 lg:flex-col">
          {live && (
            <button type="button" onClick={() => setActive(-1)} aria-pressed={showLive} aria-label="Ver tu diseño"
              className={cn("grid aspect-square w-20 shrink-0 place-items-center rounded-2xl bg-night text-[#f6f1e8] transition-all duration-300 lg:w-24", showLive ? "ring-2 ring-primary ring-offset-2 ring-offset-bg" : "opacity-80 hover:opacity-100")}>
              <span className="flex flex-col items-center gap-1 text-[11px] font-bold"><Sparkles size={18} aria-hidden="true" className="text-brass" />Tu diseño</span>
            </button>
          )}
          {(photoUrl ? [] : views).map((v, i) => (
            <button key={v} type="button" onClick={() => setActive(i)} aria-pressed={i === active} aria-label={`Ver ${VIEW_LABEL[v].toLowerCase()}`}
              className={cn("relative w-20 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 lg:w-24", i === active ? "ring-2 ring-primary ring-offset-2 ring-offset-bg" : "opacity-70 hover:opacity-100")}>
              <ProductArt art={art} view={v} tint={tint} label="" showBadge={false} className="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
