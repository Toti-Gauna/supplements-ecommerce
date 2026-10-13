"use client";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { RackShot } from "@/components/illustrations/RackShot";
import { HERO_LIMITS } from "@/demo/admin/content-hero";
import { imageFrame } from "@/demo/admin/content-images";
import type { HeroFeature, Product } from "@/demo/types";
import { cn } from "@/lib/cn";

interface Props {
  features: HeroFeature[];
  products: Product[];
  selected: number;
  withErrors: Set<string>;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

/** Lista compacta de destacados: elegir uno lo muestra en la vista previa y abre su editor. El primero es la estrella. */
export function HeroFeatureList({ features, products, selected, withErrors, onSelect, onAdd }: Props) {
  return (
    <section aria-labelledby="hero-list-title" className="flex min-w-0 flex-col gap-3">
      <h2 id="hero-list-title" className="text-lg font-extrabold">Destacados <span className="text-sm font-bold text-muted">({features.length} de {HERO_LIMITS.max})</span></h2>
      <ol className="flex flex-col gap-2">
        {features.map((f, i) => {
          const p = products.find((x) => x.slug === f.productSlug);
          const visible = f.active !== false;
          return (
            <li key={f.id}>
              <button type="button" aria-pressed={i === selected} onClick={() => onSelect(f.id)}
                aria-label={`Destacado ${i + 1}: ${f.headline || "sin titular"}, ${p?.name ?? "sin producto"}, ${visible ? "visible" : "oculto"}${withErrors.has(f.id) ? ", con errores" : ""}`}
                className={cn("flex w-full items-center gap-3 rounded-sm p-2 text-left ring-1 transition-colors", i === selected ? "bg-accent ring-primary" : "bg-surface ring-ink/[0.06] hover:bg-accent/50")}>
                <span aria-hidden="true" className="rack-bay h-12 w-12 shrink-0 overflow-hidden">
                  {f.image
                    // eslint-disable-next-line @next/next/no-img-element -- Data URL local, no requiere loader.
                    ? <img src={f.image.src} alt="" width={48} height={48} className="h-full w-full object-cover" style={{ objectPosition: `${imageFrame(f.image.frame).x}% ${imageFrame(f.image.frame).y}%`, transform: `scale(${imageFrame(f.image.frame).zoom})` }} />
                    : p && <RackShot items={[{ art: p.art, pack: p.pack, tint: p.variants[0]?.colorHex }]} label="" />}
                </span>
                <span aria-hidden="true" className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-muted">{String(i + 1).padStart(2, "0")}{i === 0 ? " · estrella" : ""}{visible ? "" : " · oculto"}</span>
                  <span className="block truncate font-bold">{f.headline || "Sin titular"}</span>
                </span>
                {withErrors.has(f.id) && <AlertCircle size={18} aria-hidden="true" className="shrink-0 text-danger" />}
              </button>
            </li>
          );
        })}
      </ol>
      {features.length < HERO_LIMITS.max && <Button variant="secondary" size="sm" className="self-start" onClick={onAdd}><Plus size={16} aria-hidden="true" />Agregar destacado</Button>}
    </section>
  );
}
