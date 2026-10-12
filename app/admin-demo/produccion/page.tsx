import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Preparación de pedidos" };

/** La cola de producción del taller de Velmar es ahora la preparación de pedidos (Fase 7). */
export default function AdminProductionPage() {
  return <Suspense><ModuleMoved to="/admin-demo/preparacion/" label="Preparación de pedidos" /></Suspense>;
}
