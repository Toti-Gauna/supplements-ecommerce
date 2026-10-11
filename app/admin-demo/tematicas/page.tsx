import type { Metadata } from "next";
import { ThemesAdmin } from "@/features/admin/themes/ThemesAdmin";

export const metadata: Metadata = { title: "Temáticas" };

export default function AdminThemesPage() {
  return <ThemesAdmin />;
}
