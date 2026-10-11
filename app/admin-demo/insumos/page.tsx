import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { MaterialsTable } from "@/features/admin/workshop/MaterialsTable";

export const metadata: Metadata = { title: "Insumos" };

export default function AdminMaterialsPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><MaterialsTable /></Suspense>;
}
