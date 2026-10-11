import type { Metadata } from "next";
import { ProductionBoard } from "@/features/admin/production/ProductionBoard";

export const metadata: Metadata = { title: "Cola de producción" };

export default function AdminProductionPage() {
  return <ProductionBoard />;
}
