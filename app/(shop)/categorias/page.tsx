import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { SearchForm } from "@/components/molecules/SearchForm";
import { CategoriesGrid } from "@/features/catalog/CategoriesGrid";

export const metadata: Metadata = { title: "Categorías", description: "Todas las categorías de la tienda." };

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="Buscar más cosas">Todo el catálogo por categoría.</PageHeader>
      <div className="mb-8 max-w-xl"><SearchForm /></div>
      <CategoriesGrid />
    </>
  );
}
