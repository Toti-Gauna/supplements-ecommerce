"use client";
import { useMemo } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { useDemoVersion } from "@/stores/admin";
import { CatalogBrowser } from "./browse/CatalogBrowser";

/** Productos de una categoría con los filtros de máquina y el orden (sin el filtro de categoría: ya estás adentro). */
export function CategoryProducts({ categorySlug, hadProducts }: { categorySlug: string; hadProducts: boolean }) {
  const data = useDemoVersion();
  const scope = useMemo(() => data.products.filter((p) => p.categorySlug === categorySlug && p.active !== false), [data.products, categorySlug]);
  if (scope.length === 0 || !hadProducts) {
    return <EmptyState title="Todavía no hay productos acá" action={<ButtonLink href="/categorias/">Ver otras categorías</ButtonLink>}>Estamos sumando productos nuevos.</EmptyState>;
  }
  return <CatalogBrowser scope={scope} withCategory={false} label="Filtros de la categoría" />;
}

/** Todo el catálogo (/categorias/), con el filtro de categoría. */
export function AllProducts() {
  const data = useDemoVersion();
  const scope = useMemo(() => data.products.filter((p) => p.active !== false), [data.products]);
  return <CatalogBrowser scope={scope} withCategory label="Filtros del catálogo" />;
}
