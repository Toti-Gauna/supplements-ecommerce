"use client";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/atoms/Button";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/templates/PageHeader";
import { useDemoData } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { CategoryProducts } from "./CategoryProducts";

/** Categoría creada en el panel (a mano o al importar un Excel): no tiene página estática, se resuelve en el navegador. */
export function PanelCategoryView() {
  const hydrated = useHydrated();
  const slug = useSearchParams().get("slug") ?? "";
  const category = useDemoData((d) => d.categories.find((c) => c.slug === slug));
  const count = useDemoData((d) => d.products.filter((p) => p.categorySlug === slug && p.active !== false).length);
  if (!hydrated) return <ListSkeleton rows={3} label="Cargando la categoría" />;
  if (!category) return <EmptyState title="Categoría no encontrada en esta demo" action={<ButtonLink href="/categorias/">Ver categorías</ButtonLink>}>Puede que se haya reiniciado la demo o que se creó en otro navegador.</EmptyState>;
  return (
    <>
      <PageHeader title={category.name} crumbs={[{ href: "/categorias/", label: "Categorías" }]}>{category.description}</PageHeader>
      <CategoryProducts categorySlug={slug} hadProducts={count > 0} />
    </>
  );
}
