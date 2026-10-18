import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Promos" };

/** Cupones y ruleta ahora es Promos, con una pestaña por herramienta. */
export default function AdminCuponesMovedPage() {
  return <ModuleMoved from="/admin-demo/cupones" />;
}
