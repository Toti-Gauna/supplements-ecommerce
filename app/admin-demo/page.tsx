import type { Metadata } from "next";
import { TodayHome } from "@/features/admin/today/TodayHome";

export const metadata: Metadata = { title: "Hoy en tu tienda" };

export default function AdminTodayPage() {
  return <TodayHome />;
}
