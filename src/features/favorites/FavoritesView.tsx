"use client";
import { Heart } from "lucide-react";
import { ButtonLink } from "@/components/atoms/Button";
import { ProductGridSkeleton } from "@/components/atoms/Skeleton";
import { ProductCard } from "@/components/molecules/ProductCard";
import { getProduct } from "@/demo/engine/catalog";
import { useFavorites } from "@/stores/favorites";
import { useHydrated } from "@/stores/hydration";
import { toCard } from "../catalog/mappers";

/** Pantalla de favoritos: lo guardado con el corazón de cada ficha (en este navegador). */
export function FavoritesView() {
  const hydrated = useHydrated();
  const slugs = useFavorites((s) => s.slugs);
  if (!hydrated) return <ProductGridSkeleton count={4} />;
  const products = slugs.flatMap((s) => getProduct(s) ?? []);
  if (products.length === 0) return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-line px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-primary"><Heart size={26} aria-hidden="true" /></span>
      <p className="max-w-xs text-muted">Todavía no guardaste favoritos. Tocá el corazón en cualquier producto y aparece acá.</p>
      <ButtonLink href="/categorias/">Explorar la tienda</ButtonLink>
    </div>
  );
  return (
    <ul aria-label="Favoritos guardados" className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <li key={p.slug}><ProductCard product={toCard(p)} /></li>)}
    </ul>
  );
}
