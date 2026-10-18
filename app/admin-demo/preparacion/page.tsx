import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { PackingList } from "@/features/admin/packing/PackingList";

export const metadata: Metadata = { title: "Para armar" };

/** Pedidos → Para armar (R4b): checklist de dos pasos por pedido, en la ruta de la vieja Preparación de pedidos. */
export default function AdminPreparationPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><PackingList /></Suspense>;
}
