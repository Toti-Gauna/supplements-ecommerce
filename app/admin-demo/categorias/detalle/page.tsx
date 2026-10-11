import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { CategoryDetail } from "@/features/admin/categories/CategoryDetail";

export const metadata: Metadata = { title: "Categoría" };

export default function AdminCategoryDetailPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><CategoryDetail /></Suspense>;
}
