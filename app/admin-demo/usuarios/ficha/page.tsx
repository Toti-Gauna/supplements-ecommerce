import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { CustomerProfile } from "@/features/admin/customers/CustomerProfile";

export const metadata: Metadata = { title: "Ficha de cliente" };

export default function AdminCustomerProfilePage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><CustomerProfile /></Suspense>;
}
