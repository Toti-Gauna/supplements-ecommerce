import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { PanelCategoryView } from "@/features/catalog/PanelCategoryView";

export const metadata: Metadata = { title: "Categoría (creada en el panel demo)" };

export default function PanelCategoryPage() {
  return <Suspense fallback={<ListSkeleton rows={3} />}><PanelCategoryView /></Suspense>;
}
