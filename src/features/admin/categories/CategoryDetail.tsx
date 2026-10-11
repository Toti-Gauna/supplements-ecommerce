"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Save } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { describedBy, Field, Input, Textarea } from "@/components/atoms/Field";
import { Switch } from "@/components/atoms/Switch";
import { EmptyState } from "@/components/molecules/EmptyState";
import { categoryRows } from "@/demo/admin/categories";
import { DEFAULT_LOW_STOCK, productStockState, productStockTotal } from "@/demo/admin/stock";
import { categoryHref as shopHref } from "@/demo/engine/catalog";
import type { Category } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { minPrice, ProductThumb } from "../products/productColumns";
import { StockChip } from "../table/StockChip";
import { useDemoSave } from "../useDemoSave";

const card = "rounded-[1.75rem] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]";

function Details({ category }: { category: Category }) {
  const saveCategory = useAdmin((s) => s.saveCategory);
  const save = useDemoSave();
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const error = name.trim() ? undefined : "El nombre no puede quedar vacío.";
  const changed = name.trim() !== category.name || description.trim() !== category.description;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!error && changed) save("Categoría guardada", () => saveCategory({ ...category, name: name.trim(), description: description.trim() })); }} className={`${card} flex flex-col gap-4`}>
      <h2 className="text-lg font-extrabold">Datos</h2>
      <Field id="cd-name" label="Nombre" error={error}><Input id="cd-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!error} aria-describedby={describedBy("cd-name", error)} maxLength={60} /></Field>
      <Field id="cd-desc" label="Descripción" hint="Se ve arriba de la categoría en la tienda."><Textarea id="cd-desc" value={description} onChange={(e) => setDescription(e.target.value)} aria-describedby="cd-desc-hint" maxLength={200} className="min-h-20" /></Field>
      <div className="flex justify-end"><Button type="submit" disabled={!changed || !!error}><Save size={17} aria-hidden="true" /> Guardar cambios</Button></div>
    </form>
  );
}

/** Detalle completo de una categoría (8.3.22): datos, lugar en la tienda, productos, reposición y personalización. */
export function CategoryDetail() {
  const slug = useSearchParams().get("slug") ?? "";
  const { data, moveCategory, toggleCategoryFeatured } = useAdmin();
  const save = useDemoSave();
  const low = data.settings.lowStockThreshold ?? DEFAULT_LOW_STOCK;
  const category = data.categories.find((c) => c.slug === slug);
  const row = categoryRows(data.categories, data.products, low).find((c) => c.slug === slug);
  const back = <Link href="/admin-demo/categorias/" className="inline-flex items-center gap-1.5 self-start text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden="true" /> Categorías</Link>;
  if (!category || !row) return <div className="flex flex-col gap-4">{back}<EmptyState title="No encontramos esa categoría">Puede que la hayas renombrado en otra pestaña o que el enlace esté incompleto.</EmptyState></div>;
  const products = data.products.filter((p) => p.categorySlug === slug).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const templates = [...new Map(products.filter((p) => p.personalization).map((p) => [p.personalization!.id, p.personalization!])).values()];
  const btn = "inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm font-bold disabled:opacity-30";
  return (
    <div className="flex flex-col gap-6">
      {back}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-muted">Categoría · {row.position} de {data.categories.length} en la tienda</p>
          <h1 className="font-display text-4xl sm:text-5xl">{category.name} <span className="align-middle font-sans text-sm font-bold text-warning">(demo)</span></h1>
        </div>
        {row.active > 0 && <ButtonLink href={shopHref(slug)} variant="secondary"><ExternalLink size={16} aria-hidden="true" /> Ver en la tienda</ButtonLink>}
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <Details key={`${category.name}|${category.description}`} category={category} />
        <section aria-labelledby="cd-place" className={`${card} flex flex-col gap-4`}>
          <h2 id="cd-place" className="text-lg font-extrabold">En la tienda</h2>
          <p className="text-sm text-muted">{row.active > 0 ? `Se muestra con ${row.active} de ${row.total} productos activos.` : "No se muestra: no tiene productos activos."}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">Lugar {row.position}</span>
            <button type="button" className={btn} disabled={row.position === 1} onClick={() => save("Orden actualizado", () => moveCategory(slug, -1))}><ArrowUp size={16} aria-hidden="true" /> Subir</button>
            <button type="button" className={btn} disabled={row.position === data.categories.length} onClick={() => save("Orden actualizado", () => moveCategory(slug, 1))}><ArrowDown size={16} aria-hidden="true" /> Bajar</button>
          </div>
          <Switch checked={category.featured} onChange={() => save("Categoría destacada actualizada", () => toggleCategoryFeatured(slug))} label="Destacada" description="Se sugiere primero en el buscador de la tienda." />
          {row.reorder > 0 && <Link href={`/admin-demo/productos/?ver=variantes&categoria=${slug}&stock=reponer`} className="text-sm font-bold text-warning underline">{row.reorder} {row.reorder === 1 ? "variante para reponer" : "variantes para reponer"}</Link>}
        </section>
      </div>
      <section aria-labelledby="cd-products" className={card}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="cd-products" className="text-lg font-extrabold">Productos ({products.length})</h2>
          <Link href={`/admin-demo/productos/?categoria=${slug}`} className="text-sm font-bold text-primary underline">Ver en Productos y stock</Link>
        </div>
        {products.length === 0 ? <p className="text-sm text-muted">Todavía no hay productos en esta categoría. Movelos desde Productos y stock (acciones en lote → “Mover a…”).</p> : (
          <ul className="flex flex-col gap-2">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/admin-demo/productos/editar/?id=${p.slug}`} className="flex flex-wrap items-center gap-3 rounded-2xl bg-bg p-2.5 pr-4 text-sm hover:ring-1 hover:ring-primary">
                  <ProductThumb product={p} />
                  <span className="min-w-0 flex-1"><span className="block font-bold">{p.name}</span><span className="text-muted">desde {formatARS(minPrice(p))} · {p.active === false ? "Pausado" : "Visible"}</span></span>
                  <StockChip state={productStockState(p, low)} units={productStockTotal(p)} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="cd-tpl" className={card}>
        <h2 id="cd-tpl" className="text-lg font-extrabold">Personalización</h2>
        <p className="mt-1 text-sm text-muted">{templates.length ? `Sus productos usan ${templates.map((t) => `“${t.name}”`).join(", ")}.` : "Ningún producto de esta categoría es personalizable."} Las plantillas se ajustan en <Link href="/admin-demo/categorias/#tpls" className="font-bold text-primary underline">Categorías y personalización</Link>.</p>
      </section>
    </div>
  );
}
