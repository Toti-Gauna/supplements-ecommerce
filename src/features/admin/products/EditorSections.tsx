"use client";
import type { ReactNode } from "react";
import { Input, Textarea } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { PRODUCT_STEPS, type StepCheck, type StepId } from "@/demo/admin/product-steps";
import { goalList } from "@/demo/engine/goals";
import type { Category, Product, ProductBadge } from "@/demo/types";
import { cn } from "@/lib/cn";
import { NumberField } from "../NumberField";
import { ProductMediaFields } from "../ProductMediaFields";
import { VariantsEditor } from "../VariantsEditor";
import { brand } from "@/config/brand";

interface StepProps { id: StepId; check: StepCheck; tried: boolean; children: ReactNode }

/** Un bloque del editor: número, título, errores (después de intentar guardar) y avisos que no bloquean. */
export function Step({ id, check, tried, children }: StepProps) {
  const i = PRODUCT_STEPS.findIndex((s) => s.id === id);
  const errors = tried ? check.errors : [];
  return (
    <section id={`paso-${id}`} data-step={id} aria-labelledby={`paso-${id}-t`}
      className={cn("flex scroll-mt-48 flex-col gap-4 rounded-[1.75rem] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 @min-[56rem]:scroll-mt-28", errors.length ? "ring-danger/40" : "ring-ink/[0.04]")}>
      <h2 id={`paso-${id}-t`} tabIndex={-1} className="flex items-center gap-2.5 text-lg font-extrabold focus:outline-none">
        <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs tabular-nums">{i + 1}</span>{PRODUCT_STEPS[i]!.label}
      </h2>
      {errors.length > 0 && <ul role="alert" className="rounded-2xl bg-danger-soft p-3 text-sm font-semibold text-danger">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      {check.warnings.length > 0 && id !== "revision" && <p className="text-xs font-semibold text-warning">{check.warnings.join(" ")}</p>}
      {children}
    </section>
  );
}

const BADGES: readonly (readonly [ProductBadge, string])[] = [["sin-tacc", "Sin TACC"], ["vegano", "Vegano"], ["sin-azucar", "Sin azúcar"], ["keto", "Keto"], ["marca-propia", "Marca propia"], ["sin-cafeina", "Sin cafeína"]];

/** Opciones múltiples como fichas (checkbox nativos con la estética del panel). */
function Chips({ legend, options, value, onChange }: { legend: string; options: readonly (readonly [string, string])[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([id, label]) => (
          <label key={id} className={cn("inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50", value.includes(id) ? "border-primary bg-primary text-on-primary" : "border-line bg-bg")}>
            <input type="checkbox" className="sr-only" checked={value.includes(id)} onChange={(e) => onChange(e.target.checked ? [...value, id] : value.filter((x) => x !== id))} />{label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface Props { d: Product; set: (p: Partial<Product>) => void; checks: Record<StepId, StepCheck>; tried: boolean; categories: Category[]; products: Product[]; onGo: (id: StepId) => void }

/** Los bloques del editor en el orden de 8.3.20: la foto primero; nada se pierde respecto del formulario anterior. */
export function EditorSections({ d, set, checks, tried, categories, products, onGo }: Props) {
  const dims = d.dims ?? { lengthCm: 0, widthCm: 0, heightCm: 0, weightG: 0 };
  const step = (id: StepId, children: ReactNode) => <Step id={id} check={checks[id]} tried={tried}>{children}</Step>;
  return (
    <>
      {step("foto", <ProductMediaFields draft={d} onChange={set} />)}
      {step("datos", (
        <>
          <label className="flex flex-col gap-1 text-sm font-bold">Nombre<Input value={d.name} onChange={(e) => set({ name: e.target.value })} aria-invalid={tried && checks.datos.errors.length > 0} placeholder="Whey protein 2 lb" /></label>
          <label className="flex flex-col gap-1 text-sm font-bold">Descripción corta<Input value={d.short} onChange={(e) => set({ short: e.target.value })} placeholder="Se ve debajo del nombre en la tienda" /></label>
          <label className="flex flex-col gap-1 text-sm font-bold">Descripción<Textarea value={d.description} onChange={(e) => set({ description: e.target.value })} /></label>
        </>
      ))}
      {step("venta", (
        <>
          <div className="@container grid gap-3 @min-[40rem]:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm font-bold">Categoría
              <Select value={d.categorySlug} onChange={(e) => set({ categorySlug: e.target.value })}>{[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select>
            </label>
            <NumberField id="p-price" label="Precio base ilustrativo" suffix="ARS" value={d.basePrice} onChange={(n) => set({ basePrice: n })} />
            <NumberField id="p-days" label="Plazo si es por encargo" suffix="días hábiles" value={d.madeToOrderDays} onChange={(n) => set({ madeToOrderDays: n || undefined })} hint="Lo que tarda en llegar al local desde el pago, para las variantes por encargo. Cuenta solo días hábiles y lo usa el calendario de despachos" />
          </div>
          <div className="flex flex-wrap gap-x-6">
            <Switch checked={d.active !== false} onChange={(v) => set({ active: v })} label="Visible en la tienda" />
            <Switch checked={d.featured} onChange={(v) => set({ featured: v })} label="Destacado" />
            <Switch checked={d.isNew} onChange={(v) => set({ isNew: v })} label="Nuevo" />
          </div>
        </>
      ))}
      {step("variantes", <VariantsEditor variants={d.variants} onChange={(variants) => set({ variants })} idPrefix={d.slug} />)}
      {step("envio", (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumberField id="d-l" label="Largo" suffix="cm" value={dims.lengthCm} onChange={(n) => set({ dims: { ...dims, lengthCm: n } })} />
          <NumberField id="d-w" label="Ancho" suffix="cm" value={dims.widthCm} onChange={(n) => set({ dims: { ...dims, widthCm: n } })} />
          <NumberField id="d-h" label="Alto" suffix="cm" value={dims.heightCm} onChange={(n) => set({ dims: { ...dims, heightCm: n } })} />
          <NumberField id="d-g" label="Peso" suffix="g" value={dims.weightG} onChange={(n) => set({ dims: { ...dims, weightG: n } })} />
        </div>
      ))}
      {step("suplemento", (
        <>
          <label className="flex flex-col gap-1 text-sm font-bold">Marca
            <Input value={d.brand} list="marcas" onChange={(e) => set({ brand: e.target.value })} placeholder={brand.houseBrand} />
            <datalist id="marcas">{[...new Set(products.map((p) => p.brand).filter(Boolean))].map((b) => <option key={b} value={b} />)}</datalist>
          </label>
          <Chips legend="Objetivos" options={goalList().map((g) => [g.id, g.name] as const)} value={d.goals ?? []} onChange={(v) => set({ goals: v as Product["goals"] })} />
          <Chips legend="Sellos del rótulo" options={BADGES} value={d.badges ?? []} onChange={(v) => set({ badges: v as ProductBadge[] })} />
          <p className="text-xs text-muted">La tabla nutricional y el uso vienen con la ficha del proveedor. Los lotes, vencimientos y costos se cargan en cada variante (o con la lista del proveedor en Importar Excel).</p>
        </>
      ))}
      {step("revision", (
        <ul className="flex flex-col gap-1.5 text-sm">
          {PRODUCT_STEPS.filter((s) => s.id !== "revision").map((s) => {
            const c = checks[s.id];
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-bg px-3 py-2">
                <span className="font-semibold">{s.label}</span>
                <span className="flex items-center gap-3">
                  <span className={cn("text-xs font-bold", c.errors.length ? "text-danger" : c.complete ? "text-success" : "text-warning")}>{c.errors.length ? "Falta completar" : c.complete ? "Listo" : "Opcional pendiente"}</span>
                  <button type="button" onClick={() => onGo(s.id)} className="text-xs font-bold text-primary underline">Ir</button>
                </span>
              </li>
            );
          })}
        </ul>
      ))}
    </>
  );
}
