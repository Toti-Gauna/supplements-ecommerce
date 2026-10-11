"use client";
import { useState } from "react";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { checkMaterial, materialDraft, type MaterialDraft, type MaterialField } from "@/demo/admin/workshop/edit-forms";
import { UNIT_LABEL, UNIT_SHORT, type Material, type MaterialUnit } from "@/demo/fixtures/workshop";
import { useAdmin } from "@/stores/admin";
import { EditDialog } from "../detail/EditDialog";
import { useDemoSave } from "../useDemoSave";

/**
 * Insumo en un modal (8.3.17): nombre, unidad, costo por unidad, mínimo y proveedor. Sirve para editar uno existente o
 * crear uno nuevo; nada se guarda hasta "Guardar" (y el insumo nuevo no existe hasta entonces). El stock se mueve en la tabla.
 */
export function MaterialDialog({ material, creating, onClose }: { material: Material | null; creating: boolean; onClose: () => void }) {
  const { saveMaterial, createMaterial } = useAdmin();
  const save = useDemoSave();
  const [draft, setDraft] = useState<MaterialDraft>(() => materialDraft(material ?? undefined));
  const [errors, setErrors] = useState<Partial<Record<MaterialField, string>>>({});
  const open = creating || !!material;
  const dirty = JSON.stringify(draft) !== JSON.stringify(materialDraft(material ?? undefined));
  const set = (patch: Partial<MaterialDraft>) => { setDraft({ ...draft, ...patch }); setErrors({}); };
  const submit = () => {
    const { errors: found, value } = checkMaterial(draft);
    if (!value) { setErrors(found); return; }
    if (material) save(`Insumo ${value.name} guardado`, () => saveMaterial({ ...material, ...value }));
    else save(`Insumo ${value.name} creado`, () => { createMaterial(value.name, value); });
    onClose();
  };
  const field = (k: "cost" | "min", label: string, hint: string) => (
    <Field id={`m-${k}`} label={label} error={errors[k]} hint={hint}>
      <Input id={`m-${k}`} inputMode="decimal" value={draft[k]} onChange={(e) => set({ [k]: e.target.value })} aria-invalid={!!errors[k]} aria-describedby={describedBy(`m-${k}`, errors[k], true)} />
    </Field>
  );
  return (
    <EditDialog open={open} title={material ? `Insumo ${material.name}` : "Nuevo insumo"} heading={material ? material.name : "Nuevo insumo"} dirty={dirty} canSave={dirty || !material} onSave={submit} onClose={onClose}
      intro="Actualizá unidad, costo por unidad, stock mínimo y proveedor. El costo se usa en Costos y margen; el mínimo, para avisar qué reponer.">
      <div className="@container grid gap-4 @min-[36rem]:grid-cols-2">
        <Field id="m-name" label="Nombre" error={errors.name}>
          <Input id="m-name" data-autofocus value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Filamento PLA" aria-invalid={!!errors.name} aria-describedby={describedBy("m-name", errors.name)} />
        </Field>
        <Field id="m-unit" label="Unidad de medida">
          <select id="m-unit" value={draft.unit} onChange={(e) => set({ unit: e.target.value as MaterialUnit })} className="h-12 rounded-2xl border border-ink/12 bg-surface px-3 text-base font-semibold">
            {(Object.keys(UNIT_LABEL) as MaterialUnit[]).map((u) => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
          </select>
        </Field>
        {field("cost", `Costo por ${UNIT_SHORT[draft.unit]} (pesos enteros)`, "Sin centavos, como el resto de la tienda.")}
        {field("min", `Avisar para reponer con (${UNIT_LABEL[draft.unit]})`, draft.unit === "m" || draft.unit === "plancha" ? "Acepta decimales con coma." : "Cantidad entera.")}
        <Field id="m-supplier" label="Proveedor (opcional)" className="@min-[36rem]:col-span-2">
          <Input id="m-supplier" value={draft.supplier} onChange={(e) => set({ supplier: e.target.value })} placeholder="Nombre o comercio" />
        </Field>
      </div>
    </EditDialog>
  );
}
