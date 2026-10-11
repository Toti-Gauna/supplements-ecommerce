import type { Metadata } from "next";
import { PrizesAdmin } from "@/features/admin/coupons/PrizesAdmin";

export const metadata: Metadata = { title: "Premios disponibles" };

export default function AdminPrizesPage() {
  return <PrizesAdmin />;
}
