"use client";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/atoms/Button";
import { DetailSkeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { useDemoData } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { ProductDetail } from "./ProductDetail";

/** Producto creado desde el panel demo: no tiene página estática propia, se resuelve en el navegador. */
export function PanelProductView({ mode }: { mode: "detail" | "personalize" }) {
  const hydrated = useHydrated();
  const slug = useSearchParams().get("slug") ?? "";
  const product = useDemoData((d) => d.products.find((p) => p.slug === slug));
  if (!hydrated) return <DetailSkeleton />;
  if (!product || (mode === "personalize" && !product.personalization)) {
    return <EmptyState title="Producto no encontrado en esta demo" action={<ButtonLink href="/">Ir a la tienda</ButtonLink>}>Puede que se haya reiniciado la demo o que el producto se creó en otro navegador.</EmptyState>;
  }
  return <ProductDetail product={product} />;
}
