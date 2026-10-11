import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/atoms/Skeleton";
import { PanelProductView } from "@/features/product/PanelProductView";

export const metadata: Metadata = { title: "Producto (creado en el panel demo)" };

export default function PanelProductPage() {
  return (
    <div className="pb-36 sm:pb-0">
      <Suspense fallback={<DetailSkeleton />}><PanelProductView mode="detail" /></Suspense>
    </div>
  );
}
