import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { AfterSale } from "@/features/admin/aftersale/AfterSale";

export const metadata: Metadata = { title: "Postventa" };

/** Pedidos → Postventa → Seguimiento (R4b): en camino, en reclamo y entregados hace poco. */
export default function AdminAfterSalePage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><AfterSale /></Suspense>;
}
