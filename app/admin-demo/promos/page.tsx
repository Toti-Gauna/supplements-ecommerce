import type { Metadata } from "next";
import { CouponsList } from "@/features/admin/coupons/CouponsList";

export const metadata: Metadata = { title: "Promos" };

/** Promos: la primera pestaña es la lista de cupones; las demás herramientas tienen su ruta (ver `menu.ts`). */
export default function AdminPromosPage() {
  return <CouponsList />;
}
