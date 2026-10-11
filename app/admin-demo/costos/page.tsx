import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { CostsTable } from "@/features/admin/workshop/CostsTable";

export const metadata: Metadata = { title: "Costos y margen" };

export default function AdminCostsPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><CostsTable /></Suspense>;
}
