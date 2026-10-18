import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Campañas" };

/** Temáticas pasó a ser Campañas (R3): el enlace viejo lleva al calendario nuevo. */
export default function AdminTematicasMovedPage() {
  return <ModuleMoved from="/admin-demo/tematicas" />;
}
