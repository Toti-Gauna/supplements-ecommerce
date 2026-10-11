"use client";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { checkRecipe, checkTrialPrice, recipeDraft, type RecipeDraft } from "@/demo/admin/workshop/edit-forms";
import { marginPct, marginState, MARGIN_LABEL, recipeCost, suggestedPrice } from "@/demo/admin/workshop/costs";
import { productMinPrice } from "@/demo/admin/stock";
import { UNIT_SHORT, type Recipe } from "@/demo/fixtures/workshop";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { EditDialog } from "../detail/EditDialog";
import { useDemoSave } from "../useDemoSave";

const EMPTY: Recipe = { items: [], machineMinutes: 0, handMinutes: 0 };
export const MARGIN_TONE = { ok: "text-success", low: "text-warning", loss: "text-danger", missing: "text-muted" } as const;
const block = "rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]";

/**
 * Costo de un producto en un modal (8.3.17): insumos por unidad, tiempos, cálculo y resultado con precio de prueba.
 * Todo es borrador hasta "Guardar": la receta y, si lo elegiste, el precio nuevo se guardan juntos una sola vez.
 */
export function RecipeSheet({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { materials, recipes, settings } = useAdmin((s) => s.workshop);
  const { saveRecipe, applyPrice } = useAdmin();
  const save = useDemoSave();
  const saved = (product && recipes[product.slug]) || EMPTY;
  const [draft, setDraft] = useState<RecipeDraft>(() => recipeDraft(saved));
  const [add, setAdd] = useState("");
  const [trial, setTrial] = useState("");
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!product) return <EditDialog open={false} title="Costo" heading="" intro="" dirty={false} onSave={() => {}} onClose={onClose}><span /></EditDialog>;
  const price = productMinPrice(product);
  const checked = checkRecipe(draft);
  const recipe = checked.value ?? saved;
  const cost = recipeCost(recipe, materials, settings);
  const trialCheck = trial ? checkTrialPrice(trial) : null;
  const test = trialCheck?.ok ? trialCheck.value : newPrice ?? price;
  const margin = marginPct(test, cost.total);
  const state = recipe.items.length || recipe.machineMinutes || recipe.handMinutes ? marginState(margin, settings.targetMarginPct) : "missing";
  const suggested = suggestedPrice(cost.total, settings.targetMarginPct);
  const dirty = JSON.stringify(draft) !== JSON.stringify(recipeDraft(saved)) || newPrice !== null;
  const set = (patch: Partial<RecipeDraft>) => { setDraft({ ...draft, ...patch }); setErrors({}); };
  const unused = materials.filter((m) => !draft.items.some((i) => i.materialId === m.id));
  const submit = () => {
    if (!checked.value) { setErrors(checked.errors); return; }
    const recipeValue = checked.value;
    save(newPrice !== null ? `Precio de ${product.name}: desde ${formatARS(newPrice)}` : "Receta de costo guardada", () => {
      if (JSON.stringify(recipeValue) !== JSON.stringify(saved)) saveRecipe(product.slug, recipeValue);
      if (newPrice !== null && newPrice !== price) applyPrice(product.slug, newPrice);
    });
    onClose();
  };
  const row = (label: string, value: number, strong = false) => <p className={cn("flex justify-between gap-3", strong && "border-t border-line pt-2 font-extrabold")}><span className={strong ? "" : "text-muted"}>{label}</span><span className="tabular-nums">{formatARS(value)}</span></p>;
  return (
    <EditDialog open title={`Costo de ${product.name}`} heading={product.name} dirty={dirty} onSave={submit} onClose={onClose}
      intro="Modificá materiales, tiempos y precio de prueba para estimar el margen. Nada se guarda hasta que tocás Guardar.">
      <div className="@container grid gap-4 @min-[44rem]:grid-cols-2">
        <section aria-labelledby="r-items" className={cn(block, "@min-[44rem]:col-span-2")}>
          <h3 id="r-items" className="mb-2 font-bold">Insumos por unidad</h3>
          {draft.items.length ? (
            <ul className="flex flex-col divide-y divide-line">
              {draft.items.map((it) => {
                const m = materials.find((x) => x.id === it.materialId);
                const err = errors[`item:${it.materialId}`];
                const line = cost.lines.find((l) => l.material.id === it.materialId);
                return (
                  <li key={it.materialId} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 basis-40 font-semibold">{m?.name ?? "Insumo que ya no está"}{m && <span className="block text-xs font-normal text-muted">{formatARS(m.costPerUnit)} por {UNIT_SHORT[m.unit]}</span>}</span>
                    <span className="flex flex-col">
                      <span className="flex items-center gap-1.5">
                        <Input aria-label={`Cantidad de ${m?.name ?? it.materialId}`} inputMode="decimal" value={it.qty} aria-invalid={!!err} className="h-10 min-h-10! w-24 text-right"
                          onChange={(e) => set({ items: draft.items.map((x) => (x.materialId === it.materialId ? { ...x, qty: e.target.value } : x)) })} />
                        <span className="w-8 text-xs text-muted">{m ? UNIT_SHORT[m.unit] : ""}</span>
                      </span>
                      {err && <span role="alert" className="mt-1 max-w-48 text-xs font-semibold text-danger">{err}</span>}
                    </span>
                    <span className="w-20 text-right font-bold tabular-nums">{line ? formatARS(line.cost) : "—"}</span>
                    <button type="button" aria-label={`Quitar ${m?.name ?? it.materialId}`} onClick={() => set({ items: draft.items.filter((x) => x.materialId !== it.materialId) })}
                      className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"><Trash2 size={15} aria-hidden="true" /></button>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-muted">Todavía no tiene insumos cargados.</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <label htmlFor="r-add" className="sr-only">Insumo para agregar</label>
            <select id="r-add" value={add} onChange={(e) => setAdd(e.target.value)} className="h-11 min-w-0 flex-1 basis-48 rounded-2xl border border-ink/12 bg-bg px-3 text-sm font-semibold">
              <option value="">Elegí un insumo…</option>
              {unused.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <Button variant="secondary" size="sm" disabled={!add} onClick={() => { set({ items: [...draft.items, { materialId: add, qty: "1" }] }); setAdd(""); }}><Plus size={16} aria-hidden="true" /> Agregar</Button>
          </div>
        </section>
        <section aria-labelledby="r-time" className={block}>
          <h3 id="r-time" className="mb-2 font-bold">Tiempos</h3>
          <div className="grid gap-3 @min-[24rem]:grid-cols-2">
            {(["machine", "hand"] as const).map((k) => (
              <Field key={k} id={`r-${k}`} label={k === "machine" ? "Máquina (minutos)" : "Trabajo a mano (minutos)"} error={errors[k]} hint={`${formatARS(k === "machine" ? settings.machineHourCost : settings.handHourCost)} la hora`}>
                <Input id={`r-${k}`} inputMode="numeric" value={draft[k]} onChange={(e) => set({ [k]: e.target.value })} aria-invalid={!!errors[k]} aria-describedby={describedBy(`r-${k}`, errors[k], true)} />
              </Field>
            ))}
          </div>
        </section>
        <section aria-labelledby="r-calc" className={cn(block, "flex flex-col gap-1.5 text-sm")}>
          <h3 id="r-calc" className="mb-1 text-base font-bold">Cálculo</h3>
          {row("Insumos", cost.materials)}
          {row("Máquina", cost.machine)}
          {row("Trabajo a mano", cost.hand)}
          {row("Costo por unidad", cost.total, true)}
          {cost.missing.length > 0 && <p className="text-xs font-bold text-warning">Hay insumos de la receta que ya no están en la lista.</p>}
        </section>
        <section aria-labelledby="r-result" className={cn(block, "@min-[44rem]:col-span-2")}>
          <h3 id="r-result" className="mb-2 font-bold">Resultado</h3>
          <div className="grid gap-3 @min-[30rem]:grid-cols-2">
            <Field id="r-trial" label="Probar con el precio (pesos)" error={trialCheck && !trialCheck.ok ? trialCheck.error : undefined} hint={`Precio actual: desde ${formatARS(price)}. Probar no cambia nada.`}>
              <Input id="r-trial" inputMode="numeric" value={trial} placeholder={String(newPrice ?? price)} onChange={(e) => setTrial(e.target.value)} aria-describedby={describedBy("r-trial", trialCheck && !trialCheck.ok ? trialCheck.error : undefined, true)} />
            </Field>
            <div className="rounded-2xl bg-bg p-3">
              <p className="text-xs font-bold text-muted">Margen con {formatARS(test)}</p>
              <p className={cn("text-2xl font-extrabold tabular-nums", MARGIN_TONE[state])}>{margin === null ? "—" : `${margin}%`}</p>
              <p className={cn("text-xs font-bold", MARGIN_TONE[state])}>{MARGIN_LABEL[state]} · ganancia {formatARS(test - cost.total)}</p>
              {test < cost.total && <p className="mt-1 text-xs font-bold text-danger">Con ese precio perdés plata en cada unidad.</p>}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">Margen sobre el precio de venta, sin impuestos ni comisiones de cobro. Objetivo: {settings.targetMarginPct}%.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {suggested !== price && cost.total > 0 && <Button size="sm" variant={newPrice === suggested ? "primary" : "secondary"} onClick={() => { setNewPrice(suggested); setTrial(""); }}>Usar precio sugerido: {formatARS(suggested)}</Button>}
            {trialCheck?.ok && trialCheck.value !== price && <Button size="sm" variant="secondary" onClick={() => { setNewPrice(trialCheck.value); setTrial(""); }}>Usar {formatARS(trialCheck.value)}</Button>}
            {newPrice !== null && (
              <p role="status" className="text-sm font-bold">Al guardar, el precio pasa a desde {formatARS(newPrice)}. <button type="button" onClick={() => setNewPrice(null)} className="text-primary underline">Deshacer</button></p>
            )}
          </div>
        </section>
      </div>
    </EditDialog>
  );
}
