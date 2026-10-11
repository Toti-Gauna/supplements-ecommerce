import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { CustomersTable } from "@/features/admin/customers/CustomersTable";

export const metadata: Metadata = { title: "Clientes" };

export default function Page() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><CustomersTable /></Suspense>;
}
