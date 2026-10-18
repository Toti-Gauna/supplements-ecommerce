import type { Metadata } from "next";
import { QuickQuery } from "@/features/admin/counter/QuickQuery";

export const metadata: Metadata = { title: "Consulta rápida" };

export default function AdminQuickQueryPage() {
  return <QuickQuery />;
}
