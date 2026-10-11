"use client";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { templatesFrom } from "@/demo/admin/templates";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "./AdminPageHeader";
import { CategoriesTable } from "./categories/CategoriesTable";
import { CategoryCreateDialog, EMPTY_CATEGORY } from "./categories/CategoryCreateDialog";
import { TemplateEditor } from "./TemplateEditor";
import { TextZoneEditor } from "./TextZoneEditor";

export function CategoriesAdmin() {
  const products = useAdmin((s) => s.data.products);
  const excel = useSearchParams().get("formato") === "excel";
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_CATEGORY);
  const templates = templatesFrom(products);
  // La vista Excel ocupa la pantalla con su propio encabezado; las plantillas vuelven al salir.
  if (excel) return <CategoriesTable />;
  return (
    <>
      <AdminPageHeader title="Categorías y personalización" actions={<Button onClick={() => setCreating(true)}><Plus size={18} aria-hidden="true" /> Nueva categoría</Button>}>
        Ordená las categorías, elegí las destacadas y ajustá las plantillas del personalizador. Tocá una categoría para ver su detalle. Todo se refleja en la tienda de este navegador.
      </AdminPageHeader>
      <section aria-labelledby="cats" className="mb-8"><h2 id="cats" className="mb-3 text-lg font-extrabold">Categorías</h2><CategoriesTable /></section>
      <section aria-labelledby="tpls-title" id="tpls" className="mb-8 scroll-mt-24">
        <h2 id="tpls-title" className="mb-3 text-lg font-extrabold">Plantillas de personalización</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {templates.map((t) => <TemplateEditor key={`${t.id}-${JSON.stringify(t)}`} template={t} usedBy={products.filter((p) => p.personalization?.id === t.id).map((p) => p.name)} />)}
        </div>
      </section>
      <section aria-labelledby="zone"><h2 id="zone" className="mb-3 text-lg font-extrabold">Zona de texto sobre la foto base</h2><TextZoneEditor /></section>
      <CategoryCreateDialog open={creating} draft={draft} onDraft={setDraft} onClose={() => setCreating(false)} />
    </>
  );
}
