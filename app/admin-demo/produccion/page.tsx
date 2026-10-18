import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Para armar" };

/** La cola de producción del taller de Velmar es ahora Pedidos → Para armar (Fase 7, R4b). */
export default function AdminProduccionMovedPage() {
  return <ModuleMoved from="/admin-demo/produccion" />;
}
