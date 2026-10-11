import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { PaymentDetail } from "@/features/admin/payments/PaymentDetail";

export const metadata: Metadata = { title: "Pago manual" };

export default function AdminPaymentDetailPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><PaymentDetail /></Suspense>;
}
