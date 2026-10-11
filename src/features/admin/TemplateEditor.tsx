"use client";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { fonts } from "@/demo/fixtures/templates";
import type { PersonalizationTemplate, PhotoMask } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { NumberField } from "./NumberField";
import { useDemoSave } from "./useDemoSave";

const KIND = { TEXT: "Texto, fuente y color", PHOTO: "Foto con encuadre y zoom", PHOTO_REFERENCE: "Foto de referencia + notas" };
const MASKS: { value: PhotoMask; label: string }[] = [{ value: "arch", label: "Arco (velador)" }, { value: "circle", label: "Círculo" }, { value: "rounded", label: "Rectángulo redondeado" }];

export function TemplateEditor({ template, usedBy }: { template: PersonalizationTemplate; usedBy: string[] }) {
  const saveTemplate = useAdmin((s) => s.saveTemplate);
  const save = useDemoSave();
  const [t, setT] = useState(template);
  const [color, setColor] = useState({ name: "", hex: "#3d4a2a" });
  const set = (p: Partial<PersonalizationTemplate>) => setT((x) => ({ ...x, ...p }));
  return (
    <form className="flex flex-col gap-3 rounded-3xl bg-surface shadow-[var(--shadow-card)] p-4" onSubmit={(e) => { e.preventDefault(); save(`Plantilla “${t.name}” guardada`, () => saveTemplate(t)); }}>
      <div>
        <h3 className="font-extrabold">{t.name}</h3>
        <p className="text-xs text-muted">{KIND[t.kind]} · usada por {usedBy.length ? usedBy.join(", ") : "ningún producto"}</p>
      </div>
      <NumberField id={`${t.id}-sur`} label="Recargo" suffix="ARS" value={t.surcharge} onChange={(n) => set({ surcharge: n })} />
      {t.kind === "TEXT" && (
        <>
          <NumberField id={`${t.id}-max`} label="Máximo de caracteres" value={t.maxChars} min={1} onChange={(n) => set({ maxChars: n })} />
          <fieldset><legend className="mb-1 text-sm font-bold">Tipografías disponibles</legend>
            <div className="flex flex-wrap gap-3">{fonts.map((f) => (
              <label key={f} className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={t.fonts?.includes(f) ?? false}
                  onChange={(e) => { const next = e.target.checked ? [...(t.fonts ?? []), f] : (t.fonts ?? []).filter((x) => x !== f); if (next.length) set({ fonts: next }); }} />
                {f}
              </label>
            ))}</div>
          </fieldset>
          <fieldset><legend className="mb-1 text-sm font-bold">Colores</legend>
            <ul className="flex flex-wrap gap-2">{(t.colors ?? []).map((c) => (
              <li key={c.hex + c.name} className="flex items-center gap-1.5 rounded-full border border-line py-1 pl-2 pr-1 text-sm">
                <span aria-hidden="true" className="h-4 w-4 rounded-full border border-black/15" style={{ background: c.hex }} />{c.name}
                <button type="button" aria-label={`Quitar ${c.name}`} disabled={(t.colors?.length ?? 0) <= 1} onClick={() => set({ colors: t.colors?.filter((x) => x !== c) })} className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent disabled:opacity-30"><X size={14} aria-hidden="true" /></button>
              </li>
            ))}</ul>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs font-bold">Nombre<Input value={color.name} onChange={(e) => setColor({ ...color, name: e.target.value })} className="w-36" /></label>
              <label className="flex flex-col gap-1 text-xs font-bold">Color<input type="color" value={color.hex} onChange={(e) => setColor({ ...color, hex: e.target.value })} className="h-11 w-14 rounded-xl border border-line" /></label>
              <Button variant="secondary" size="sm" disabled={!color.name.trim()} onClick={() => { set({ colors: [...(t.colors ?? []), { name: color.name.trim(), hex: color.hex }] }); setColor({ name: "", hex: color.hex }); }}><Plus size={16} aria-hidden="true" /> Agregar color</Button>
            </div>
          </fieldset>
        </>
      )}
      {t.kind === "PHOTO" && (
        <label className="flex flex-col gap-1 text-sm font-bold">Máscara (silueta que recorta la foto)
          <Select value={t.mask ?? "arch"} onChange={(e) => set({ mask: e.target.value as PhotoMask })}>{MASKS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</Select>
        </label>
      )}
      {t.kind === "PHOTO_REFERENCE" && (
        <label className="flex flex-col gap-1 text-sm font-bold">Texto de ayuda para las notas<Input value={t.notesPlaceholder ?? ""} onChange={(e) => set({ notesPlaceholder: e.target.value })} /></label>
      )}
      <p className="text-xs text-muted">La aprobación de la vista previa (“Así lo quiero”) es obligatoria en todas las plantillas.</p>
      <Button type="submit" size="sm" className="self-start">Guardar plantilla</Button>
    </form>
  );
}
