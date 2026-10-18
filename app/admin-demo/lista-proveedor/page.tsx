import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { SupplierListPage } from "@/features/admin/supplier-list/SupplierListPage";

export const metadata: Metadata = { title: "Lista del proveedor" };

export default function Page() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><SupplierListPage /></Suspense>;
}
