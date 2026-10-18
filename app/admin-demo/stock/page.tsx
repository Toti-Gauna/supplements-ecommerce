import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Productos y stock" };

/** Stock es ahora la vista por variante de Productos y stock (8.3.19); ?vista=reponer sigue llegando filtrado. */
export default function AdminStockMovedPage() {
  return <ModuleMoved from="/admin-demo/stock" />;
}
