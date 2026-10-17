"use client";
import { AlertCircle } from "lucide-react";
import { useId } from "react";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { HERO_LIMITS } from "@/demo/admin/content-hero";
import type { HeroFeature, Product } from "@/demo/types";
import { ListControls } from "../ListControls";
import { CountedField } from "./CountedField";
import { HeroImageField } from "./HeroImageField";

interface Props {
  feature: HeroFeature;
  index: number;
  total: number;
  products: Product[];
  errors: string[];
  onChange: (p: Partial<HeroFeature>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

/** Editor de UN destacado del hero: el producto que va en el rack, el titular de póster, la bajada y si se ve. */
export function HeroFeatureForm({ feature, index, total, products, errors, onChange, onMove, onRemove }: Props) {
  const n = index + 1;
  const productId = useId();
  return (
    <section aria-labelledby="hero-form-title" className="@container flex min-w-0 flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="hero-form-title" className="min-w-0 flex-1 text-lg font-extrabold">Destacado {n}{index === 0 ? " · estrella" : ""}</h2>
        <ListControls index={index} length={total} label={`destacado ${n}`} onMove={onMove} />
        {total > 1 && (
          <ConfirmButton variant="danger" size="sm" title={`Quitar el destacado ${n}`} confirmLabel="Quitar" description="Sale del borrador; en la tienda deja de verse cuando guardes el carrusel." onConfirm={onRemove}>Quitar</ConfirmButton>
        )}
      </div>
      {errors.length > 0 && (
        <div role="alert" className="flex gap-2 rounded-sm bg-danger-soft p-3 text-sm font-semibold text-danger">
          <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          <ul className="flex flex-col gap-0.5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <HeroImageField key={feature.id} feature={feature} onChange={onChange} />
      <div className="grid gap-3 @min-[40rem]:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={productId} className="text-sm font-bold">Producto en el rack</label>
          <Select id={productId} value={feature.productSlug} onChange={(e) => onChange({ productSlug: e.target.value })}>
            {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}{p.active === false ? " (oculto)" : ""}</option>)}
          </Select>
          <span className="text-xs text-muted">El precio por servicio, el stock y el cadete salen solos del catálogo.</span>
        </div>
        <CountedField label="Titular" value={feature.headline} max={HERO_LIMITS.headline} onChange={(headline) => onChange({ headline })} />
        <div className="@min-[40rem]:col-span-2"><CountedField label="Bajada" multiline value={feature.pitch} max={HERO_LIMITS.pitch} onChange={(pitch) => onChange({ pitch })} /></div>
        <Switch checked={feature.active !== false} onChange={(active) => onChange({ active })} label="Visible en la tienda" description="Oculto: queda guardado pero no sale en el inicio." />
      </div>
    </section>
  );
}
