"use client";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import type { CostBreakdown } from "@/demo/admin/workshop/costs";
import type { RecipeDraft } from "@/demo/admin/workshop/edit-forms";
import { UNIT_SHORT, type Material } from "@/demo/fixtures/workshop";
import { formatARS } from "@/lib/money";

interface Props {
  items: RecipeDraft["items"];
  materials: Material[];
  cost: CostBreakdown;
  errors: Record<string, string>;
  onChange: (items: RecipeDraft["items"]) => void;
}

/** Embalaje e insumos por unidad de un producto (caja, folleto, precinto, cinta…): se descuentan al preparar el pedido. */
export function PackagingItems({ items, materials, cost, errors, onChange }: Props) {
  const [add, setAdd] = useState("");
  const unused = materials.filter((m) => !items.some((i) => i.materialId === m.id));
  return (
    <>
      {items.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {items.map((it) => {
            const m = materials.find((x) => x.id === it.materialId);
            const err = errors[`item:${it.materialId}`];
            const line = cost.lines.find((l) => l.material.id === it.materialId);
            return (
              <li key={it.materialId} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                <span className="min-w-0 flex-1 basis-40 font-semibold">{m?.name ?? "Insumo que ya no está"}{m && <span className="block text-xs font-normal text-muted">{formatARS(m.costPerUnit)} por {UNIT_SHORT[m.unit]}</span>}</span>
                <span className="flex flex-col">
                  <span className="flex items-center gap-1.5">
                    <Input aria-label={`Cantidad de ${m?.name ?? it.materialId}`} inputMode="decimal" value={it.qty} aria-invalid={!!err} className="h-10 min-h-10! w-24! text-right"
                      onChange={(e) => onChange(items.map((x) => (x.materialId === it.materialId ? { ...x, qty: e.target.value } : x)))} />
                    <span className="w-8 text-xs text-muted">{m ? UNIT_SHORT[m.unit] : ""}</span>
                  </span>
                  {err && <span role="alert" className="mt-1 max-w-48 text-xs font-semibold text-danger">{err}</span>}
                </span>
                <span className="w-20 text-right font-bold tabular-nums">{line ? formatARS(line.cost) : "—"}</span>
                <button type="button" aria-label={`Quitar ${m?.name ?? it.materialId}`} onClick={() => onChange(items.filter((x) => x.materialId !== it.materialId))}
                  className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"><Trash2 size={15} aria-hidden="true" /></button>
              </li>
            );
          })}
        </ul>
      ) : <p className="text-sm text-muted">Todavía no tiene embalaje cargado.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <label htmlFor="r-add" className="sr-only">Insumo para agregar</label>
        <Select id="r-add" value={add} onChange={(e) => setAdd(e.target.value)} className="h-11 min-h-11! min-w-0 flex-1 basis-48 text-sm">
          <option value="">Elegí un insumo…</option>
          {unused.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Select>
        <Button variant="secondary" size="sm" disabled={!add} onClick={() => { onChange([...items, { materialId: add, qty: "1" }]); setAdd(""); }}><Plus size={16} aria-hidden="true" /> Agregar</Button>
      </div>
    </>
  );
}
