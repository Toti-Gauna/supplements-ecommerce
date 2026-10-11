import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { PaymentsQueue } from "@/features/admin/payments/PaymentsQueue";

export const metadata: Metadata = { title: "Pagos manuales" };

export default function AdminPaymentsPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><PaymentsQueue /></Suspense>;
}
