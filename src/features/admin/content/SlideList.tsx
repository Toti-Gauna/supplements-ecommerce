"use client";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { ProductArt } from "@/components/illustrations/ProductArt";
import type { CarouselSlide } from "@/demo/types";
import { cn } from "@/lib/cn";

interface Props { slides: CarouselSlide[]; selected: number; withErrors: Set<string>; onSelect: (id: string) => void; onAdd: () => void }

/** Lista compacta de diapositivas (8.3.28): elegir una la muestra arriba y abre su editor. */
export function SlideList({ slides, selected, withErrors, onSelect, onAdd }: Props) {
  return (
    <section aria-labelledby="slides-title" className="flex min-w-0 flex-col gap-3">
      <h2 id="slides-title" className="text-lg font-extrabold">Diapositivas <span className="text-sm font-bold text-muted">({slides.length})</span></h2>
      <ol className="flex flex-col gap-2">
        {slides.map((s, i) => {
          const visible = s.active !== false;
          return (
            <li key={s.id}>
              <button type="button" aria-pressed={i === selected} onClick={() => onSelect(s.id)}
                aria-label={`Diapositiva ${i + 1}: ${s.title || "sin título"}, ${visible ? "visible" : "oculta"}${withErrors.has(s.id) ? ", con errores" : ""}`}
                className={cn("flex w-full items-center gap-3 rounded-2xl p-2 text-left ring-1 transition-colors", i === selected ? "bg-accent ring-primary" : "bg-surface ring-ink/[0.06] hover:bg-accent/50")}>
                <span aria-hidden="true" className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-accent">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL local del panel demo */}
                  {s.image ? <img src={s.image.src} alt="" className="h-full w-full object-cover" /> : <ProductArt art={s.art} label="" showBadge={false} className="h-full w-full" />}
                </span>
                <span aria-hidden="true" className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-muted">Diapositiva {i + 1}{visible ? "" : " · oculta"}</span>
                  <span className="block truncate font-bold">{s.title || "Sin título"}</span>
                </span>
                {withErrors.has(s.id) && <AlertCircle size={18} aria-hidden="true" className="shrink-0 text-danger" />}
              </button>
            </li>
          );
        })}
      </ol>
      <Button variant="secondary" size="sm" className="self-start" onClick={onAdd}><Plus size={16} aria-hidden="true" />Agregar diapositiva</Button>
    </section>
  );
}
