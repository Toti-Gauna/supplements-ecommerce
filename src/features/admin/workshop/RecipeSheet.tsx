"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { checkRecipe, checkTrialPrice, recipeDraft, type RecipeDraft } from "@/demo/admin/workshop/edit-forms";
import { marginPct, marginState, MARGIN_LABEL, recipeCost, suggestedPrice } from "@/demo/admin/workshop/costs";
import { productMinPrice } from "@/demo/admin/stock";
import type { Recipe } from "@/demo/fixtures/workshop";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { EditDialog } from "../detail/EditDialog";
import { useDemoSave } from "../useDemoSave";
import { PackagingItems } from "./PackagingItems";
import { MARGIN_TONE, VariantCosts } from "./VariantCosts";

const EMPTY: Recipe = { items: [] };
const block = "rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]";

/**
 * Costo de un producto en un modal (8.3.17, Fase 7): costo del proveedor, el de otras presentaciones, embalaje por
 * unidad, cálculo y resultado con precio de prueba. Todo es borrador hasta "Guardar": los costos y, si lo elegiste, el
 * precio nuevo se guardan juntos una sola vez.
 */
export function RecipeSheet({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { materials, recipes, settings } = useAdmin((s) => s.workshop);
  const { saveRecipe, applyPrice } = useAdmin();
  const save = useDemoSave();
  const saved = (product && recipes[product.slug]) || EMPTY;
  const [draft, setDraft] = useState<RecipeDraft>(() => recipeDraft(saved));
  const [trial, setTrial] = useState("");
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!product) return <EditDialog open={false} title="Costo" heading="" intro="" dirty={false} onSave={() => {}} onClose={onClose}><span /></EditDialog>;
  const price = productMinPrice(product);
  const checked = checkRecipe(draft);
  const recipe = checked.value ?? saved;
  const cost = recipeCost(recipe, materials);
  const trialCheck = trial ? checkTrialPrice(trial) : null;
  const test = trialCheck?.ok ? trialCheck.value : newPrice ?? price;
  const margin = marginPct(test, cost.total);
  const state = recipe.supplierCost !== undefined ? marginState(margin, settings.targetMarginPct) : "missing";
  const suggested = suggestedPrice(cost.total, settings.targetMarginPct);
  const dirty = JSON.stringify(draft) !== JSON.stringify(recipeDraft(saved)) || newPrice !== null;
  const set = (patch: Partial<RecipeDraft>) => { setDraft({ ...draft, ...patch }); setErrors({}); };
  const submit = () => {
    if (!checked.value) { setErrors(checked.errors); return; }
    const recipeValue = checked.value;
    save(newPrice !== null ? `Precio de ${product.name}: desde ${formatARS(newPrice)}` : "Costos guardados", () => {
      if (JSON.stringify(recipeValue) !== JSON.stringify(saved)) saveRecipe(product.slug, recipeValue);
      if (newPrice !== null && newPrice !== price) applyPrice(product.slug, newPrice);
    });
    onClose();
  };
  const row = (label: string, value: number, strong = false) => <p className={cn("flex justify-between gap-3", strong && "border-t border-line pt-2 font-extrabold")}><span className={strong ? "" : "text-muted"}>{label}</span><span className="tabular-nums">{formatARS(value)}</span></p>;
  return (
    <EditDialog open title={`Costo de ${product.name}`} heading={product.name} dirty={dirty} onSave={submit} onClose={onClose}
      intro="Cargá lo que le pagás al proveedor y el embalaje que lleva; probá precios para ver el margen. Nada se guarda hasta que tocás Guardar.">
      <div className="@container grid gap-4 @min-[44rem]:grid-cols-2">
        <section aria-labelledby="r-supplier" className={cn(block, "@min-[44rem]:col-span-2")}>
          <h3 id="r-supplier" className="mb-2 font-bold">Mercadería</h3>
          <Field id="r-supplier-cost" label="Costo del proveedor por unidad (pesos)" error={errors.supplier} hint={`De la presentación más barata (desde ${formatARS(price)}). Lo que le pagás a la marca o a la distribuidora.`}>
            <Input id="r-supplier-cost" inputMode="numeric" value={draft.supplier} onChange={(e) => set({ supplier: e.target.value })} aria-invalid={!!errors.supplier} aria-describedby={describedBy("r-supplier-cost", errors.supplier, true)} />
          </Field>
          <VariantCosts product={product} recipe={recipe} materials={materials} target={settings.targetMarginPct} values={draft.variants} errors={errors}
            onChange={(id, text) => set({ variants: { ...draft.variants, [id]: text } })} />
        </section>
        <section aria-labelledby="r-items" className={cn(block, "@min-[44rem]:col-span-2")}>
          <h3 id="r-items" className="mb-2 font-bold">Embalaje e insumos por unidad</h3>
          <PackagingItems items={draft.items} materials={materials} cost={cost} errors={errors} onChange={(items) => set({ items })} />
        </section>
        <section aria-labelledby="r-calc" className={cn(block, "flex flex-col gap-1.5 text-sm @min-[44rem]:col-span-2")}>
          <h3 id="r-calc" className="mb-1 text-base font-bold">Cálculo</h3>
          {row("Mercadería (proveedor)", cost.merchandise)}
          {row("Embalaje e insumos", cost.materials)}
          {row("Costo por unidad", cost.total, true)}
          {cost.missing.length > 0 && <p className="text-xs font-bold text-warning">Hay insumos del embalaje que ya no están en la lista.</p>}
        </section>
        <section aria-labelledby="r-result" className={cn(block, "@min-[44rem]:col-span-2")}>
          <h3 id="r-result" className="mb-2 font-bold">Resultado</h3>
          <div className="grid gap-3 @min-[30rem]:grid-cols-2">
            <Field id="r-trial" label="Probar con el precio (pesos)" error={trialCheck && !trialCheck.ok ? trialCheck.error : undefined} hint={`Precio actual: desde ${formatARS(price)}. Probar no cambia nada.`}>
              <Input id="r-trial" inputMode="numeric" value={trial} placeholder={String(newPrice ?? price)} onChange={(e) => setTrial(e.target.value)} aria-describedby={describedBy("r-trial", trialCheck && !trialCheck.ok ? trialCheck.error : undefined, true)} />
            </Field>
            <div className="rounded-2xl bg-bg p-3">
              <p className="text-xs font-bold text-muted">Margen con {formatARS(test)}</p>
              <p className={cn("text-2xl font-extrabold tabular-nums", MARGIN_TONE[state])}>{margin === null || state === "missing" ? "—" : `${margin}%`}</p>
              <p className={cn("text-xs font-bold", MARGIN_TONE[state])}>{MARGIN_LABEL[state]} · ganancia {formatARS(test - cost.total)}</p>
              {test < cost.total && <p className="mt-1 text-xs font-bold text-danger">Con ese precio perdés plata en cada unidad.</p>}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">Margen sobre el precio de venta, sin impuestos ni comisiones de cobro. Objetivo: {settings.targetMarginPct}%.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {suggested !== price && recipe.supplierCost !== undefined && <Button size="sm" variant={newPrice === suggested ? "primary" : "secondary"} onClick={() => { setNewPrice(suggested); setTrial(""); }}>Usar precio sugerido: {formatARS(suggested)}</Button>}
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
