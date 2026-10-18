import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Productos y stock" };

/** La Planilla es ahora “Ver en formato Excel” de Productos y stock (8.3.19). */
export default function AdminPlanillaMovedPage() {
  return <ModuleMoved from="/admin-demo/planilla" />;
}
