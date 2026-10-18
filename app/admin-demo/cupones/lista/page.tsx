import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Promos" };

/** La lista de cupones es la pestaña “Cupones” de Promos. */
export default function AdminCuponesListaMovedPage() {
  return <ModuleMoved from="/admin-demo/cupones/lista" />;
}
