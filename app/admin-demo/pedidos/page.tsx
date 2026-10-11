import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { OrdersTable } from "@/features/admin/orders/OrdersTable";

export const metadata: Metadata = { title: "Pedidos" };

export default function AdminOrdersPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><OrdersTable /></Suspense>;
}
