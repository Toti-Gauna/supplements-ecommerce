"use client";
import { Percent } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Field, Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Sheet } from "@/components/motion/Sheet";
import { brandsOf, parsePct, previewPriceChange, priceChangeLabel, ROUNDING_LABEL, scopeLabel, type Rounding } from "@/demo/admin/bulk-price";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useMarginChange } from "./useMarginChange";
import { PricePreview } from "./PricePreview";
import { chip, ScopeFields, toScope, type ScopeState } from "./ScopeFields";

const ROUNDINGS: Rounding[] = [100, 500, 1];
type Mode = "pct" | "margin";
const MODES: { id: Mode; label: string }[] = [{ id: "pct", label: "Un % parejo" }, { id: "margin", label: "Al margen de la marca" }];

/**
 * Aumento masivo de precios por % (Fase 6): marca, categoría o todo; % positivo o negativo; redondeo; vista previa por
 * variante y confirmación antes de aplicar. El último aumento se deshace desde Productos y stock.
 */
export function PriceIncreaseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Aumentar precios" side="dialog" className="bg-bg sm:max-w-3xl">
      {open && <PriceIncreaseForm onClose={onClose} />}
    </Sheet>
  );
}

function PriceIncreaseForm({ onClose }: { onClose: () => void }) {
  const { data, applyBulkPrice } = useAdmin();
  const push = useToasts((s) => s.push);
  const brands = brandsOf(data.products);
  const cats = [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder).filter((c) => data.products.some((p) => p.categorySlug === c.slug));
  const [mode, setMode] = useState<Mode>("pct");
  const [scopeState, setScopeState] = useState<ScopeState>({ kind: "brand", brand: brands[0] ?? "", category: cats[0]?.slug ?? "" });
  const [pctText, setPctText] = useState("8");
  const [step, setStep] = useState<Rounding>(100);
  /** Lo que se pidió confirmar: si después se cambia algo del formulario, la confirmación deja de valer. */
  const [askedFor, setAskedFor] = useState<string | null>(null);
  const scope = toScope(scopeState);
  const pct = parsePct(pctText);
  const lines = pct.ok ? previewPriceChange(data.products, scope, pct.value, step) : [];
  const label = pct.ok ? priceChangeLabel(scope, pct.value, data.categories) : "";
  const changes = lines.filter((l) => l.to !== l.from).length;
  const signature = `${label}|${step}|${lines.length}`;
  const asking = askedFor === signature;
  const apply = () => {
    if (!pct.ok) return;
    applyBulkPrice(scope, pct.value, step, label);
    push({ tone: "success", title: `Precios actualizados: ${label}`, description: `${lines.length} variantes. Podés deshacerlo desde Productos y stock. Solo en esta demo.` });
    onClose();
  };
  const margin = useMarginChange(scope, scopeLabel(scope, data.categories), onClose);
  const head = (
    <>
      <div className="pr-12">
        <h2 className="font-display text-3xl">Aumentar precios</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">Subí o bajá los precios de una marca, una categoría o todo el catálogo: por porcentaje o llevándolos al margen que fijaste para cada marca. Ves cada precio nuevo antes de aplicarlo y podés deshacerlo.</p>
      </div>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Cómo calcular el precio nuevo</legend>
        {MODES.map((m) => (
          <label key={m.id} className={cn(chip, mode === m.id ? "border-primary bg-primary text-on-primary" : "border-line bg-surface")}>
            <input type="radio" name="price-mode" value={m.id} checked={mode === m.id} onChange={() => { setMode(m.id); setAskedFor(null); }} className="sr-only" />{m.label}
          </label>
        ))}
      </fieldset>
      <ScopeFields value={scopeState} onChange={(v) => { setScopeState(v); setAskedFor(null); }} brands={brands} categories={cats} />
    </>
  );
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); if (mode === "margin") margin.submit(); else if (pct.ok && changes > 0) setAskedFor(signature); }} className="flex max-h-[94dvh] flex-col sm:max-h-[90dvh]">
      <div className="flex flex-col gap-5 overflow-y-auto p-5 pt-7 sm:p-7">
        {head}
        {mode === "margin" ? margin.body : <>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
          <Field id="price-pct" label="Porcentaje" hint="Con signo menos baja los precios (−10). Acepta decimales: 7,5." error={pct.ok ? undefined : pct.error}>
            <span className="relative block">
              <Input id="price-pct" inputMode="decimal" value={pctText} onChange={(e) => setPctText(e.target.value)} aria-invalid={!pct.ok} aria-describedby={pct.ok ? "price-pct-hint" : "price-pct-error"} className="pr-10" />
              <Percent size={16} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
            </span>
          </Field>
          <Field id="price-round" label="Redondeo" hint="Al múltiplo más cercano.">
            <Select id="price-round" value={step} aria-describedby="price-round-hint" onChange={(e) => setStep(Number(e.target.value) as Rounding)}>
              {ROUNDINGS.map((r) => <option key={r} value={r}>{ROUNDING_LABEL[r]}</option>)}
            </Select>
          </Field>
        </div>
        {pct.ok && <PricePreview lines={lines} />}
        </>}
      </div>
      <div className="border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
        {mode === "margin" ? margin.footer : asking ? (
          <div role="alertdialog" aria-label="Confirmar el aumento" className="flex flex-wrap items-center justify-end gap-2">
            <p className="mr-auto text-sm font-bold">¿Aplicar {label} a {lines.length} variantes? Se puede deshacer.</p>
            <Button variant="ghost" onClick={() => setAskedFor(null)}>Volver</Button>
            <Button onClick={apply} autoFocus>Sí, aplicar</Button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!pct.ok || changes === 0}>Aplicar a {lines.length} {lines.length === 1 ? "variante" : "variantes"}</Button>
          </div>
        )}
      </div>
    </form>
  );
}
