import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { CollectQueue } from "@/features/admin/collect/CollectQueue";

export const metadata: Metadata = { title: "Por cobrar" };

/** Pedidos → Por cobrar (R4b). La ruta es la de los viejos Pagos manuales: los enlaces y filtros de antes siguen. */
export default function AdminPaymentsPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><CollectQueue /></Suspense>;
}
