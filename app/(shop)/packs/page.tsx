import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/atoms/Skeleton";
import { PacksView } from "@/features/packs/PacksView";

export const metadata: Metadata = {
  title: "Packs",
  description: "Packs por objetivo o deporte con descuento por llevarlos juntos. Comprá una vez o recibilos todos los meses (simulado en la demo).",
};

/** Packs (L3): la grilla y, con `?pack=<id>`, el detalle. Una sola página estática: el pack sale de la URL en el navegador. */
export default function PacksPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={3} />}>
      <PacksView />
    </Suspense>
  );
}
