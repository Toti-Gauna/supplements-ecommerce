import type { Metadata } from "next";
import { CouponsHub } from "@/features/admin/coupons/CouponsHub";

export const metadata: Metadata = { title: "Cupones y ruleta" };

export default function AdminCouponsPage() {
  return <CouponsHub />;
}
