import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { ClaimDetail } from "@/features/admin/claims/ClaimDetail";

export const metadata: Metadata = { title: "Reclamo" };

export default function AdminClaimDetailPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><ClaimDetail /></Suspense>;
}
