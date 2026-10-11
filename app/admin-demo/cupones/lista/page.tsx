import type { Metadata } from "next";
import { CouponsList } from "@/features/admin/coupons/CouponsList";

export const metadata: Metadata = { title: "Cupones" };

export default function AdminCouponsListPage() {
  return <CouponsList />;
}
