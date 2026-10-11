"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { describedBy, Field, Input, Textarea } from "@/components/atoms/Field";
import { Switch } from "@/components/atoms/Switch";
import { Sheet } from "@/components/motion/Sheet";
import { hasCategoryNamed } from "@/demo/admin/categories";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";

export interface CategoryDraft { name: string; description: string; featured: boolean }
export const EMPTY_CATEGORY: CategoryDraft = { name: "", description: "", featured: false };

interface Props {
  open: boolean;
  draft: CategoryDraft;
  onDraft: (draft: CategoryDraft) => void;
  onClose: () => void;
}

/**
 * Nueva categoría en un modal centrado (8.3.22). El borrador vive en la pantalla: cancelar o cerrar lo conserva y
 * crear lo limpia. Nombre obligatorio; un nombre repetido se permite como antes, pero se avisa.
 */
export function CategoryCreateDialog({ open, draft, onDraft, onClose }: Props) {
  const categories = useAdmin((s) => s.data.categories);
  const createCategory = useAdmin((s) => s.createCategory);
  const save = useDemoSave();
  const [error, setError] = useState<string | undefined>();
  const repeated = hasCategoryNamed(categories, draft.name);
  const set = (patch: Partial<CategoryDraft>) => { onDraft({ ...draft, ...patch }); if (patch.name?.trim()) setError(undefined); };
  const submit = () => {
    if (!draft.name.trim()) { setError("Escribí un nombre para la categoría."); return; }
    save(`Categoría “${draft.name.trim()}” creada`, () => { createCategory(draft.name, { description: draft.description, featured: draft.featured }); });
    onDraft(EMPTY_CATEGORY);
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Nueva categoría" side="center" className="bg-bg">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-4 p-6 pt-7" noValidate>
        <div className="pr-12">
          <h2 className="font-display text-3xl">Nueva categoría</h2>
          <p className="mt-1 text-sm text-muted">Agrupa productos en la tienda. Se suma al final del orden; después la movés con Subir y Bajar.</p>
        </div>
        <Field id="cat-name" label="Nombre" error={error} hint={repeated ? "Ya hay una categoría con ese nombre: se va a crear otra aparte." : undefined}>
          <Input id="cat-name" data-autofocus value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Mates y cocina" aria-invalid={!!error} aria-describedby={describedBy("cat-name", error, repeated)} maxLength={60} />
        </Field>
        <Field id="cat-desc" label="Descripción (opcional)" hint="Se ve arriba de la categoría en la tienda.">
          <Textarea id="cat-desc" value={draft.description} onChange={(e) => set({ description: e.target.value })} aria-describedby="cat-desc-hint" maxLength={200} className="min-h-20" />
        </Field>
        <Switch checked={draft.featured} onChange={(featured) => set({ featured })} label="Destacada" description="Se sugiere primero en el buscador de la tienda." />
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit"><Plus size={17} aria-hidden="true" /> Crear categoría</Button>
        </div>
      </form>
    </Sheet>
  );
}
