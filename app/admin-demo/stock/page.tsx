import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Productos y stock" };

/** Stock es ahora la vista por variante de Productos y stock (8.3.19); ?vista=reponer sigue llegando filtrado. */
export default function AdminStockPage() {
  return <Suspense><ModuleMoved to="/admin-demo/productos/?ver=variantes" label="Productos y stock" carry={{ vista: "stock", q: "q" }} /></Suspense>;
}
