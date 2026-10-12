import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { PurchasingPage } from "@/features/admin/purchasing/PurchasingPage";

export const metadata: Metadata = { title: "Proveedores y compras" };

export default function AdminSuppliersPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><PurchasingPage /></Suspense>;
}
