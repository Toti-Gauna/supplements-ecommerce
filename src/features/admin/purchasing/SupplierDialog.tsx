"use client";
import { useState } from "react";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { checkSupplier, supplierDraft, type SupplierDraft, type SupplierField } from "@/demo/admin/workshop/purchase-orders";
import type { Supplier } from "@/demo/fixtures/suppliers";
import { useAdmin } from "@/stores/admin";
import { EditDialog } from "../detail/EditDialog";
import { useDemoSave } from "../useDemoSave";

const DAYS = [{ d: 1, label: "Lunes" }, { d: 2, label: "Martes" }, { d: 3, label: "Miércoles" }, { d: 4, label: "Jueves" }, { d: 5, label: "Viernes" }, { d: 6, label: "Sábado" }];

/** Proveedor en un modal (8.3.17): contacto, teléfono, pedido mínimo y días de reparto; nada se guarda hasta "Guardar". */
export function SupplierDialog({ supplier, onClose }: { supplier: Supplier | null; onClose: () => void }) {
  const saveSupplier = useAdmin((s) => s.saveSupplier);
  const save = useDemoSave();
  const [draft, setDraft] = useState<SupplierDraft | null>(() => (supplier ? supplierDraft(supplier) : null));
  const [errors, setErrors] = useState<Partial<Record<SupplierField, string>>>({});
  if (!supplier || !draft) return null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(supplierDraft(supplier));
  const set = (patch: Partial<SupplierDraft>) => { setDraft({ ...draft, ...patch }); setErrors({}); };
  const submit = () => {
    const { errors: found, value } = checkSupplier(draft);
    if (!value) { setErrors(found); return; }
    save(`${supplier.name} guardado`, () => saveSupplier({ ...supplier, ...value }));
    onClose();
  };
  const text = (k: "contact" | "phone" | "minOrder", label: string, hint?: string) => (
    <Field id={`s-${k}`} label={label} error={errors[k]} hint={hint}>
      <Input id={`s-${k}`} value={draft[k]} inputMode={k === "contact" ? "text" : "numeric"} onChange={(e) => set({ [k]: e.target.value })} aria-invalid={!!errors[k]} aria-describedby={describedBy(`s-${k}`, errors[k], !!hint)} />
    </Field>
  );
  return (
    <EditDialog open title={`Proveedor ${supplier.name}`} heading={supplier.name} dirty={dirty} onSave={submit} onClose={onClose}
      intro={`Trae ${supplier.brands.join(" y ")}. El pedido mínimo y los días de reparto se usan en la compra sugerida.`}>
      <div className="@container grid gap-4 @min-[36rem]:grid-cols-2">
        {text("contact", "Contacto")}
        {text("phone", "Teléfono o WhatsApp")}
        {text("minOrder", "Pedido mínimo al costo (pesos)", "Vacío o 0 = sin mínimo.")}
        <fieldset aria-describedby={errors.days ? "s-days-e" : undefined} className="@min-[36rem]:col-span-2">
          <legend className="mb-2 text-sm font-bold">Días de reparto</legend>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(({ d, label }) => (
              <label key={d} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-surface px-3.5 text-sm font-semibold ring-1 ring-ink/10 has-[:checked]:ring-primary">
                <input type="checkbox" className="h-4 w-4 accent-primary" checked={draft.days.includes(d)} onChange={(e) => set({ days: e.target.checked ? [...draft.days, d] : draft.days.filter((x) => x !== d) })} />{label}
              </label>
            ))}
          </div>
          {errors.days && <p id="s-days-e" role="alert" className="mt-1 text-xs font-semibold text-danger">{errors.days}</p>}
        </fieldset>
      </div>
    </EditDialog>
  );
}
