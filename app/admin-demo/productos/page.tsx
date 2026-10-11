import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { ProductsTable } from "@/features/admin/products/ProductsTable";

export const metadata: Metadata = { title: "Productos y stock" };

export default function AdminProductsPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><ProductsTable /></Suspense>;
}
