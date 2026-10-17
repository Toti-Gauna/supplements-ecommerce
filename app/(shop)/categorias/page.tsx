import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import { PageHeader } from "@/components/templates/PageHeader";
import { CategoryShelves } from "@/features/catalog/CategoryShelves";
import { AllProducts } from "@/features/catalog/CategoryProducts";
import { SearchTrigger } from "@/features/catalog/search/SearchTrigger";

export const metadata: Metadata = { title: "Categorías", description: "Todas las categorías de la tienda y el catálogo con filtros." };

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="Todas las categorías">Todo el catálogo, de las proteínas a los accesorios.</PageHeader>
      <div className="mb-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1"><SearchTrigger /></div>
        <a href="#catalogo" className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-volt-ink underline underline-offset-4">
          Todo con filtros <ArrowDown size={14} aria-hidden="true" />
        </a>
      </div>
      <CategoryShelves />
      <section id="catalogo" aria-labelledby="catalogo-titulo" className="mt-16 scroll-mt-24">
        <p className="eyebrow text-volt-ink">Marca, sabor, sellos y precio por servicio</p>
        <h2 id="catalogo-titulo" className="font-display mb-6 mt-2 text-4xl sm:text-5xl">Todo el catálogo</h2>
        <AllProducts />
      </section>
    </>
  );
}
