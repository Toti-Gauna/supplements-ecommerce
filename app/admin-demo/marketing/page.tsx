import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Campañas" };

/** Marketing se repartió: Campañas, Promos y Ajustes. */
export default function AdminMarketingMovedPage() {
  return <ModuleMoved from="/admin-demo/marketing" />;
}
