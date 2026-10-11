import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { CategoriesAdmin } from "@/features/admin/CategoriesAdmin";

export const metadata: Metadata = { title: "Categorías y personalización" };

export default function AdminCategoriesPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><CategoriesAdmin /></Suspense>;
}
