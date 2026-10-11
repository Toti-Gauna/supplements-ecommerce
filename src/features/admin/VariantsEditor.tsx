"use client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import type { Variant } from "@/demo/types";
import { NumberField } from "./NumberField";

/** Variantes con color/tamaño, recargo y stock. Stock -1 = a pedido (sin cupo de fabricación). */
export function VariantsEditor({ variants, onChange, idPrefix }: { variants: Variant[]; onChange: (v: Variant[]) => void; idPrefix: string }) {
  const patch = (i: number, p: Partial<Variant>) => onChange(variants.map((v, k) => (k === i ? { ...v, ...p } : v)));
  return (
    <div className="flex flex-col gap-3">
      {variants.map((v, i) => {
        const id = `${idPrefix}-${i}`;
        const madeToOrder = v.stock < 0;
        return (
          <details key={v.id} open={variants.length === 1} className="group rounded-2xl border border-line">
            <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 px-3 py-2 [&::-webkit-details-marker]:hidden">
              <span className="font-extrabold">{v.label || `Variante ${i + 1}`}</span>
              <span className="text-sm text-muted">{madeToOrder ? "a pedido" : v.stock === 0 ? "sin stock" : `${v.stock} u.`}{v.priceDelta ? ` · +$${v.priceDelta.toLocaleString("es-AR")}` : ""}</span>
              <span className="ml-auto text-sm font-bold text-primary group-open:hidden">Editar</span>
            </summary>
            <fieldset className="grid gap-3 border-t border-line p-3 sm:grid-cols-2 lg:grid-cols-3">
            <legend className="sr-only">Variante {i + 1}</legend>
            <label className="flex flex-col gap-1 text-sm font-bold">Nombre visible<Input value={v.label} onChange={(e) => patch(i, { label: e.target.value })} /></label>
            <label className="flex flex-col gap-1 text-sm font-bold">Color<Input value={v.color ?? ""} onChange={(e) => patch(i, { color: e.target.value || undefined })} placeholder="Rosa" /></label>
            <label className="flex flex-col gap-1 text-sm font-bold">Muestra de color
              <input type="color" value={v.colorHex ?? "#c9a77a"} onChange={(e) => patch(i, { colorHex: e.target.value })} className="h-11 w-full rounded-xl border border-line bg-surface" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">Tamaño / opción<Input value={v.size ?? ""} onChange={(e) => patch(i, { size: e.target.value || undefined })} placeholder="Mediano" /></label>
            <NumberField id={`${id}-delta`} label="Recargo" suffix="ARS" value={v.priceDelta} onChange={(n) => patch(i, { priceDelta: n })} />
            <NumberField id={`${id}-lead`} label="Plazo propio" suffix="días hábiles" value={v.leadDays} onChange={(n) => patch(i, { leadDays: n || undefined })} hint="Vacío o 0 = el del producto (o 1 día si está en stock y no se personaliza). Usalo si, por ejemplo, el tamaño grande tarda más" />
            <div className="flex flex-col gap-2">
              <label className="flex min-h-11 items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={madeToOrder} onChange={(e) => patch(i, { stock: e.target.checked ? -1 : 0 })} className="h-5 w-5 accent-[var(--color-primary)]" />
                A pedido (sin límite)
              </label>
              {!madeToOrder && <NumberField id={`${id}-stock`} label="Stock" suffix="unidades" value={v.stock} onChange={(n) => patch(i, { stock: n })} hint="0 = sin stock: la tienda no deja agregarla" />}
            </div>
            {variants.length > 1 && (
              <Button variant="danger" size="sm" className="self-end sm:col-span-full sm:justify-self-end" onClick={() => onChange(variants.filter((_, k) => k !== i))}>
                <Trash2 size={16} aria-hidden="true" /> Quitar variante
              </Button>
            )}
            </fieldset>
          </details>
        );
      })}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => onChange([...variants, { id: `${idPrefix}-${Date.now().toString(36)}`, label: "Nueva variante", priceDelta: 0, stock: -1 }])}>
        <Plus size={16} aria-hidden="true" /> Agregar variante
      </Button>
    </div>
  );
}
