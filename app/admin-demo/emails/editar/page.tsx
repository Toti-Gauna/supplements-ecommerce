import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { EmailEditor } from "@/features/admin/emails/EmailEditor";

export const metadata: Metadata = { title: "Editar email" };

export default function AdminEmailEditPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><EmailEditor /></Suspense>;
}
