import type { Metadata } from "next";
import { WheelAdmin } from "@/features/admin/coupons/WheelAdmin";

export const metadata: Metadata = { title: "Configuración de ruleta" };

export default function AdminWheelPage() {
  return <WheelAdmin />;
}
