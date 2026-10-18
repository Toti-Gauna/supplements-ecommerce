import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { LiveCostsTable } from "@/features/admin/live-costs/LiveCostsTable";

export const metadata: Metadata = { title: "Costos vivos" };

export default function Page() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><LiveCostsTable /></Suspense>;
}
