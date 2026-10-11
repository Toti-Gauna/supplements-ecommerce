"use client";
import { useState } from "react";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { checkPrize, giftValue, makePrize, newPrizeId, prizeCondition, prizeDraft, prizeName, PRIZE_TEMPLATES, type PrizeDraft } from "@/demo/admin/wheel-prizes";
import type { WheelPrize } from "@/demo/fixtures/wheel";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { EditDialog } from "../detail/EditDialog";
import { useDemoSave } from "../useDemoSave";

function Pesos({ id, label, value, error, hint, onChange }: { id: string; label: string; value: number; error?: string; hint?: string; onChange: (n: number) => void }) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <Input id={id} type="number" inputMode="numeric" min={0} step={1} value={Number.isFinite(value) ? value : ""} aria-invalid={!!error} aria-describedby={describedBy(id, error, !!hint)}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
    </Field>
  );
}

/**
 * "Agregar premio" (8.3.25): se elige una plantilla de las que el engine ya convierte en cupón, se completan sus
 * campos y el premio queda en el catálogo, listo para elegir en un gajo. El nombre se arma solo.
 */
export function PrizeDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (p: WheelPrize) => void }) {
  const products = useAdmin((s) => s.data.products).filter((p) => p.active !== false);
  const { prizes = [], validDays } = useAdmin((s) => s.data.wheel);
  const addWheelPrize = useAdmin((s) => s.addWheelPrize);
  const save = useDemoSave();
  const [d, setD] = useState<PrizeDraft>(prizeDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (p: Partial<PrizeDraft>) => { setD({ ...d, ...p }); setErrors({}); };
  const close = () => { setD(prizeDraft()); setErrors({}); onClose(); };
  const gift = products.find((p) => p.slug === d.productSlug);
  const submit = () => {
    const found = checkPrize(d, products, prizes);
    setErrors(found);
    if (Object.keys(found).length) return;
    const prize = makePrize(d, products, newPrizeId());
    save(`Premio “${prize.name}” creado`, () => addWheelPrize(prize), "Ya se puede elegir en los gajos de la ruleta. Cambio guardado solo en esta demo.");
    onCreated?.(prize);
    close();
  };
  return (
    <EditDialog open={open} title="Agregar premio" heading="Nuevo premio" dirty={JSON.stringify(d) !== JSON.stringify(prizeDraft())} canSave onSave={submit} onClose={close}
      intro="Elegí qué tipo de premio es y completá sus datos. Se entrega como cupón de un uso con vencimiento, igual que los demás premios de la ruleta.">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">Tipo de premio</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRIZE_TEMPLATES.map((t) => (
            <label key={t.id} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-1 transition-colors", d.template === t.id ? "bg-primary/[0.07] ring-primary" : "bg-surface ring-ink/10 hover:bg-accent/40")}>
              <input type="radio" name="prize-template" value={t.id} checked={d.template === t.id} onChange={() => set(prizeDraft(t.id))} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" />
              <span><span className="block font-bold">{t.label}</span><span className="text-xs text-muted">{t.hint}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        {d.template === "percent" && <Pesos id="pz-value" label="Porcentaje (%)" value={d.value} error={errors.value} onChange={(value) => set({ value })} />}
        {d.template === "fixed" && <Pesos id="pz-value" label="Monto (ARS)" value={d.value} error={errors.value} onChange={(value) => set({ value })} />}
        {d.template === "engraving" && <Pesos id="pz-value" label="Valor del grabado (ARS)" value={d.value} error={errors.value} hint="Es lo que se descuenta del carrito." onChange={(value) => set({ value })} />}
        {d.template === "gift" && (
          <Field id="pz-product" label="Producto que se regala" error={errors.productSlug} hint={gift ? `Vale ${formatARS(giftValue(gift))} (precio desde): eso se descuenta.` : undefined}>
            <Select id="pz-product" value={d.productSlug} onChange={(e) => set({ productSlug: e.target.value })} aria-invalid={!!errors.productSlug}>
              <option value="">Elegí un producto…</option>
              {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </Select>
          </Field>
        )}
        <Pesos id="pz-min" label="Compra mínima (ARS)" value={d.minSubtotal} error={errors.minSubtotal} hint="0 = sin mínimo." onChange={(minSubtotal) => set({ minSubtotal })} />
      </div>
      {errors.template && <p role="alert" className="text-sm font-semibold text-danger">{errors.template}</p>}
      <p className="rounded-2xl bg-bg p-3 text-sm"><span className="block text-xs font-bold text-muted">Así se va a ver</span>
        <strong>{prizeName(d, products)}</strong> · cupón de un uso, vence a los {validDays} días, {prizeCondition({ minSubtotal: d.minSubtotal || undefined })}.</p>
    </EditDialog>
  );
}
