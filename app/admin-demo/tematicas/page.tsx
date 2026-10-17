import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Campañas" };

/** Temáticas pasó a ser Campañas (R3): el enlace viejo lleva al calendario nuevo. */
export default function AdminThemesPage() {
  return <Suspense><ModuleMoved to="/admin-demo/campanas/" label="Campañas" /></Suspense>;
}
