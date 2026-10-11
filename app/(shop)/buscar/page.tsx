import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/atoms/Skeleton";
import { PageHeader } from "@/components/templates/PageHeader";
import { SearchView } from "@/features/catalog/SearchView";

export const metadata: Metadata = { title: "Buscar", description: "Buscá en todo el catálogo." };

export default function SearchPage() {
  return (
    <>
      <PageHeader title="Buscar" />
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <SearchView />
      </Suspense>
    </>
  );
}
