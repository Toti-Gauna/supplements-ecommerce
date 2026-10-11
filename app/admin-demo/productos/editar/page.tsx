import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { ProductEditor } from "@/features/admin/ProductEditor";

export const metadata: Metadata = { title: "Editar producto" };

export default function AdminProductEditPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><ProductEditor /></Suspense>;
}
