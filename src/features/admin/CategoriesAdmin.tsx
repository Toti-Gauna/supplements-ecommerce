"use client";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { AdminPageHeader } from "./AdminPageHeader";
import { CategoriesTable } from "./categories/CategoriesTable";
import { CategoryCreateDialog, EMPTY_CATEGORY } from "./categories/CategoryCreateDialog";
import { GoalsEditor } from "./categories/GoalsEditor";
import { SportsEditor } from "./categories/SportsEditor";

export function CategoriesAdmin() {
  const excel = useSearchParams().get("formato") === "excel";
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_CATEGORY);
  // La vista Excel ocupa la pantalla con su propio encabezado.
  if (excel) return <CategoriesTable />;
  return (
    <>
      <AdminPageHeader title="Categorías y objetivos" actions={<Button onClick={() => setCreating(true)}><Plus size={18} aria-hidden="true" /> Nueva categoría</Button>}>
        Ordená las categorías, elegí las destacadas y editá los objetivos de entrenamiento y los deportes. Tocá una categoría para ver su detalle. Todo se refleja en la tienda de este navegador.
      </AdminPageHeader>
      <section aria-labelledby="cats"><h2 id="cats" className="mb-3 text-lg font-extrabold">Categorías</h2><CategoriesTable /></section>
      <GoalsEditor />
      <SportsEditor />
      <CategoryCreateDialog open={creating} draft={draft} onDraft={setDraft} onClose={() => setCreating(false)} />
    </>
  );
}
