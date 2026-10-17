"use client";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Input, Textarea } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { isGearProduct } from "@/demo/admin/label-checks";
import { PRODUCT_STEPS, type StepCheck, type StepId } from "@/demo/admin/product-steps";
import { goalList } from "@/demo/engine/goals";
import type { Recipe } from "@/demo/fixtures/workshop";
import type { Category, Product, ProductBadge } from "@/demo/types";
import { cn } from "@/lib/cn";
import { brand } from "@/config/brand";
import { NumberField } from "../NumberField";
import { ProductMediaFields } from "../ProductMediaFields";
import { VariantsEditor } from "../VariantsEditor";
import { Chips } from "./Chips";
import { LabelFields } from "./LabelFields";
import { OptionNamesField } from "./OptionNamesField";

interface StepProps { id: StepId; check: StepCheck; tried: boolean; children: ReactNode }

/** Un bloque del editor: número, título, errores (después de intentar guardar) y avisos que no bloquean. */
export function Step({ id, check, tried, children }: StepProps) {
  const i = PRODUCT_STEPS.findIndex((s) => s.id === id);
  const errors = tried ? check.errors : [];
  return (
    <section id={`paso-${id}`} data-step={id} aria-labelledby={`paso-${id}-t`}
      className={cn("flex scroll-mt-48 flex-col gap-4 rounded-sm bg-surface p-5 shadow-[var(--shadow-card)] ring-1 @min-[56rem]:scroll-mt-28", errors.length ? "ring-danger/40" : "ring-ink/[0.04]")}>
      <h2 id={`paso-${id}-t`} tabIndex={-1} className="flex items-center gap-2.5 text-lg font-extrabold focus:outline-none">
        <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-sm bg-accent text-xs tabular-nums">{i + 1}</span>{PRODUCT_STEPS[i]!.label}
        {check.skipped && <span className="ml-auto rounded-sm bg-bg px-2 py-1 text-xs font-bold text-muted ring-1 ring-line">No aplica</span>}
      </h2>
      {errors.length > 0 && <ul role="alert" className="rounded-sm bg-danger-soft p-3 text-sm font-semibold text-danger">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      {check.warnings.length > 0 && id !== "revision" && <p className="text-xs font-semibold text-warning">{check.warnings.join(" ")}</p>}
      {children}
    </section>
  );
}

const BADGES: readonly (readonly [ProductBadge, string])[] = [["sin-tacc", "Sin TACC"], ["vegano", "Vegano"], ["sin-azucar", "Sin azúcar"], ["keto", "Keto"], ["marca-propia", "Marca propia"], ["sin-cafeina", "Sin cafeína"]];

interface Props { d: Product; set: (p: Partial<Product>) => void; checks: Record<StepId, StepCheck>; tried: boolean; categories: Category[]; products: Product[]; recipe?: Recipe; onGo: (id: StepId) => void }

/**
 * Los bloques del editor "hoja técnica" (R2): primero lo que vende (datos, presentaciones con su precio, rótulo y
 * sellos); la foto y las medidas de envío (plegadas) al final. Nada se pierde respecto del formulario anterior. El
 * equipamiento no lleva rótulo, servicios, lotes ni sellos del rótulo: su paso "Rótulo" dice que no aplica.
 */
export function EditorSections({ d, set, checks, tried, categories, products, recipe, onGo }: Props) {
  const gear = isGearProduct(d, categories);
  const dims = d.dims ?? { lengthCm: 0, widthCm: 0, heightCm: 0, weightG: 0 };
  const step = (id: StepId, children: ReactNode) => <Step id={id} check={checks[id]} tried={tried}>{children}</Step>;
  return (
    <>
      {step("datos", (
        <>
          <label className="flex flex-col gap-1 text-sm font-bold">Nombre<Input value={d.name} onChange={(e) => set({ name: e.target.value })} aria-invalid={tried && checks.datos.errors.length > 0} placeholder="Whey protein 2 lb" /></label>
          <label className="flex flex-col gap-1 text-sm font-bold">Descripción corta<Input value={d.short} onChange={(e) => set({ short: e.target.value })} placeholder="Se ve debajo del nombre en la tienda" /></label>
          <label className="flex flex-col gap-1 text-sm font-bold">Descripción<Textarea value={d.description} onChange={(e) => set({ description: e.target.value })} /></label>
        </>
      ))}
      {step("venta", (
        <>
          <div className="@container grid gap-3 @min-[40rem]:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-bold">Categoría
              <Select value={d.categorySlug} onChange={(e) => set({ categorySlug: e.target.value })}>{[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select>
            </label>
            <NumberField id="p-days" label="Plazo si es por encargo" suffix="días hábiles" value={d.madeToOrderDays} onChange={(n) => set({ madeToOrderDays: n || undefined })} hint="Lo que tarda en llegar al local desde el pago, para las presentaciones por encargo. Cuenta solo días hábiles y lo usa el calendario de despachos" />
          </div>
          <div className="flex flex-wrap gap-x-6">
            <Switch checked={d.active !== false} onChange={(v) => set({ active: v })} label="Visible en la tienda" />
            <Switch checked={d.featured} onChange={(v) => set({ featured: v })} label="Destacado" />
            <Switch checked={d.isNew} onChange={(v) => set({ isNew: v })} label="Nuevo" />
          </div>
        </>
      ))}
      {step("variantes", (
        <>
          <div className="max-w-md"><OptionNamesField value={d.optionNames} onChange={(optionNames) => set({ optionNames })} /></div>
          <VariantsEditor product={d} onChange={set} gear={gear} recipe={recipe} />
        </>
      ))}
      {step("rotulo", gear
        ? <p className="rounded-sm bg-bg px-4 py-3 text-sm text-muted">No aplica al equipamiento: no lleva tabla nutricional, RNPA, modo de uso ni servicios. Si es un suplemento, cambiá la categoría en el paso 2.</p>
        : <LabelFields d={d} set={set} errors={tried ? checks.rotulo.errors : []} />)}
      {step("suplemento", (
        <>
          <label className="flex flex-col gap-1 text-sm font-bold">Marca
            <Input value={d.brand} list="marcas" onChange={(e) => set({ brand: e.target.value })} placeholder={brand.houseBrand} />
            <datalist id="marcas">{[...new Set(products.map((p) => p.brand).filter(Boolean))].map((b) => <option key={b} value={b} />)}</datalist>
          </label>
          <Chips legend="Objetivos" options={goalList().map((g) => [g.id, g.name] as const)} value={d.goals ?? []} onChange={(v) => set({ goals: v as Product["goals"] })} />
          {!gear && <Chips legend="Sellos del rótulo" options={BADGES} value={d.badges ?? []} onChange={(v) => set({ badges: v as ProductBadge[] })} />}
        </>
      ))}
      {step("foto", <ProductMediaFields draft={d} onChange={set} />)}
      {step("envio", (
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-bold text-primary [&::-webkit-details-marker]:hidden">
            <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open:rotate-180" />Largo, ancho, alto y peso del envase
            <span className="font-normal text-muted">{dims.heightCm > 0 ? `· ${dims.lengthCm}×${dims.widthCm}×${dims.heightCm} cm, ${dims.weightG} g` : "· sin cargar"}</span>
          </summary>
          <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4">
            <NumberField id="d-l" label="Largo" suffix="cm" value={dims.lengthCm} onChange={(n) => set({ dims: { ...dims, lengthCm: n } })} />
            <NumberField id="d-w" label="Ancho" suffix="cm" value={dims.widthCm} onChange={(n) => set({ dims: { ...dims, widthCm: n } })} />
            <NumberField id="d-h" label="Alto" suffix="cm" value={dims.heightCm} onChange={(n) => set({ dims: { ...dims, heightCm: n } })} />
            <NumberField id="d-g" label="Peso" suffix="g" value={dims.weightG} onChange={(n) => set({ dims: { ...dims, weightG: n } })} />
          </div>
          <p className="pt-2 text-xs text-muted">Sirven para cotizar envíos; el alto y el ancho también dibujan las cotas del pote en la ficha.</p>
        </details>
      ))}
      {step("revision", (
        <ul className="flex flex-col gap-1.5 text-sm">
          {PRODUCT_STEPS.filter((s) => s.id !== "revision").map((s) => {
            const c = checks[s.id];
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-bg px-3 py-2">
                <span className="font-semibold">{s.label}</span>
                <span className="flex items-center gap-3">
                  <span className={cn("text-xs font-bold", c.errors.length ? "text-danger" : c.skipped ? "text-muted" : c.complete ? "text-success" : "text-warning")}>{c.errors.length ? "Falta completar" : c.skipped ? "No aplica" : c.complete ? "Listo" : "Opcional pendiente"}</span>
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
