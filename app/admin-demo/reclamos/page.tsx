import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { ClaimsAdmin } from "@/features/admin/ClaimsAdmin";

export const metadata: Metadata = { title: "Reclamos" };

export default function Page() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><ClaimsAdmin /></Suspense>;
}
