import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Preparación de pedidos" };

/** La cola de producción del taller de Velmar es ahora la preparación de pedidos (Fase 7). */
export default function AdminProduccionMovedPage() {
  return <ModuleMoved from="/admin-demo/produccion" />;
}
