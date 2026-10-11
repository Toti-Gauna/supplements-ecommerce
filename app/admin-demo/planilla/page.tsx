import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Productos y stock" };

/** La Planilla es ahora "Ver en formato Excel" de Productos y stock (8.3.19). */
export default function AdminSheetPage() {
  return <Suspense><ModuleMoved to="/admin-demo/productos/?formato=excel" label="Productos y stock · formato Excel" carry={{ q: "q" }} /></Suspense>;
}
