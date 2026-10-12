import type { Metadata } from "next";
import { PreparationBoard } from "@/features/admin/preparation/PreparationBoard";

export const metadata: Metadata = { title: "Preparación de pedidos" };

export default function AdminPreparationPage() {
  return <PreparationBoard />;
}
