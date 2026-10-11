import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { EmailsAdmin } from "@/features/admin/emails/EmailsAdmin";

export const metadata: Metadata = { title: "Emails automáticos" };

export default function AdminEmailsPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><EmailsAdmin /></Suspense>;
}
