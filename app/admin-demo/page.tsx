import type { Metadata } from "next";
import { Dashboard } from "@/features/admin/Dashboard";

export const metadata: Metadata = { title: "Inicio" };

export default function AdminDashboardPage() {
  return <Dashboard />;
}
