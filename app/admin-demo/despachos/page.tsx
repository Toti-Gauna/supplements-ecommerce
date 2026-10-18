import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { DispatchBoard } from "@/features/admin/dispatch/DispatchBoard";

export const metadata: Metadata = { title: "Despachos" };

/** Pedidos → Despachos (R4b): lista de armado consolidada y hoja de ruta del cadete del día. */
export default function AdminDispatchPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><DispatchBoard /></Suspense>;
}
