"use client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { setVariantLots } from "@/demo/admin/lots";
import { marginInfo } from "@/demo/admin/product-metrics";
import { editorServingPrice, finalPrice, withVariantPrice } from "@/demo/admin/variant-prices";
import type { Recipe } from "@/demo/fixtures/workshop";
import type { Product, Variant } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { LotsEditor } from "./lots/LotsEditor";
import { NumberField } from "./NumberField";

/**
 * Presentaciones (R2): sabor/tamaño (o color/talle en equipamiento, L2), **precio final propio**, servicios con el
 * precio por servicio calculado al escribir, costo con su margen, stock y lotes. El precio se guarda como base +
 * diferencia (variant-prices.ts) sin que el dueño lo vea. Stock -1 = a pedido; con lotes, el stock es su suma. El
 * equipamiento no vence ni rinde servicios: sin lotes ni servicios.
 */
interface Props { product: Product; onChange: (patch: Partial<Product>) => void; gear?: boolean; recipe?: Recipe }

export function VariantsEditor({ product: p, onChange, gear = false, recipe }: Props) {
  const { variants } = p;
  const colorLabel = p.optionNames?.color ?? (gear ? "Color" : "Sabor");
  const sizeLabel = p.optionNames?.size ?? (gear ? "Talle o medida" : "Tamaño");
  const setVariants = (next: Variant[]) => onChange({ variants: next });
  const patch = (i: number, x: Partial<Variant>) => setVariants(variants.map((v, k) => (k === i ? { ...v, ...x } : v)));
  // Volver de "a pedido" con lotes cargados: el stock vuelve a ser la suma de los lotes.
  const setMadeToOrder = (i: number, on: boolean) => { const v = variants[i]!; patch(i, on ? { stock: -1 } : setVariantLots({ ...v, stock: 0 }, v.lots ?? [])); };
  const setPrice = (i: number, price: number) => { const next = withVariantPrice(p, i, price); onChange({ basePrice: next.basePrice, variants: next.variants }); };
  return (
    <div className="flex flex-col gap-3">
      {variants.map((v, i) => {
        const id = `${p.slug}-${i}`;
        const madeToOrder = v.stock < 0;
        const name = v.label || `Presentación ${i + 1}`;
        const price = finalPrice(p, v);
        const pps = editorServingPrice(p, v);
        const m = marginInfo(p, v, recipe);
        return (
          <details key={v.id} open={variants.length === 1} className="group rounded-sm border border-line">
            <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 px-3 py-2 [&::-webkit-details-marker]:hidden">
              <span className="font-extrabold">{name}</span>
              <span className="font-lab text-sm text-muted">{price > 0 ? formatARS(price) : "sin precio"}{pps ? ` · ${formatARS(pps)}/serv.` : ""} · {madeToOrder ? "a pedido" : v.stock === 0 ? "sin stock" : `${v.stock} u.`}</span>
              <span className="ml-auto text-sm font-bold text-primary group-open:hidden">Editar</span>
            </summary>
            <fieldset className="grid gap-3 border-t border-line p-3 sm:grid-cols-2 lg:grid-cols-3">
              <legend className="sr-only">{name}</legend>
              <label className="flex flex-col gap-1 text-sm font-bold">Nombre visible<Input value={v.label} onChange={(e) => patch(i, { label: e.target.value })} /></label>
              <label className="flex flex-col gap-1 text-sm font-bold">{colorLabel}<Input value={v.color ?? ""} onChange={(e) => patch(i, { color: e.target.value || undefined })} placeholder={gear ? "Negro" : "Chocolate"} /></label>
              <label className="flex flex-col gap-1 text-sm font-bold">Muestra de color
                <input type="color" value={v.colorHex ?? "#8b72ff"} onChange={(e) => patch(i, { colorHex: e.target.value })} className="h-11 w-full rounded-sm border border-line bg-surface" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">{sizeLabel}<Input value={v.size ?? ""} onChange={(e) => patch(i, { size: e.target.value || undefined })} placeholder={gear ? "M" : "2 lb (907 g)"} /></label>
              <NumberField id={`${id}-price`} label="Precio final" suffix="ARS" value={price} onChange={(n) => setPrice(i, n)} hint="El precio de lista de esta presentación, como se ve en la tienda" />
              {!gear && (
                <div className="flex flex-col gap-1">
                  <NumberField id={`${id}-serv`} label="Servicios" suffix="por envase" value={v.servings} onChange={(n) => patch(i, { servings: n || undefined })} />
                  <p className={cn("font-lab text-xs font-bold", !v.servings && "text-warning")} aria-live="polite">{pps ? `${formatARS(pps)} por servicio` : v.servings ? "Un solo servicio: no muestra precio por servicio" : "Cargá los servicios: de ahí sale el precio por servicio"}</p>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <NumberField id={`${id}-cost`} label="Costo del proveedor" suffix="ARS" value={v.cost} onChange={(n) => patch(i, { cost: n || undefined })} hint="Lo actualiza la lista de precios del proveedor (Importar Excel)" />
                <p className={cn("font-lab text-xs font-bold", m && m.margin < 0 && "text-danger")} aria-live="polite">
                  {m ? `Margen ${m.margin} %${v.cost ? "" : ` · costo ${m.estimated ? "estimado " : ""}${formatARS(m.cost)} (de Costos)`}` : "Sin costo: no calcula el margen"}
                </p>
              </div>
              <NumberField id={`${id}-lead`} label="Plazo propio" suffix="días hábiles" value={v.leadDays} onChange={(n) => patch(i, { leadDays: n || undefined })} hint="Vacío o 0 = el del producto (o 1 día si está en stock)" />
              <div className="flex flex-col gap-2">
                <label className="flex min-h-11 items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={madeToOrder} onChange={(e) => setMadeToOrder(i, e.target.checked)} className="h-5 w-5 accent-[var(--color-primary)]" />
                  A pedido (sin límite)
                </label>
                {!madeToOrder && (v.lots?.length
                  ? <p className="text-sm"><strong className="tabular-nums">{v.stock}</strong> unidades <span className="text-muted">(suma de los lotes)</span></p>
                  : <NumberField id={`${id}-stock`} label="Stock" suffix="unidades" value={v.stock} onChange={(n) => patch(i, { stock: n })} hint="0 = sin stock: la tienda no deja agregarla" />)}
              </div>
              {!gear && <div className="sm:col-span-full"><LotsEditor lots={v.lots ?? []} idPrefix={id} name={name} onChange={(lots) => setVariants(variants.map((x, k) => (k === i ? setVariantLots(x, lots) : x)))} /></div>}
              {variants.length > 1 && (
                <Button variant="danger" size="sm" className="self-end sm:col-span-full sm:justify-self-end" onClick={() => setVariants(variants.filter((_, k) => k !== i))}>
                  <Trash2 size={16} aria-hidden="true" /> Quitar presentación
                </Button>
              )}
            </fieldset>
          </details>
        );
      })}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => setVariants([...variants, { id: `${p.slug}-${Date.now().toString(36)}`, label: "Nueva presentación", priceDelta: 0, stock: -1 }])}>
        <Plus size={16} aria-hidden="true" /> Agregar presentación
      </Button>
    </div>
  );
}
