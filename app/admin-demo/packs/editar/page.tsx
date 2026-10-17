import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { PackEditor } from "@/features/admin/packs/PackEditor";

export const metadata: Metadata = { title: "Editar pack" };

export default function AdminPackEditPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><PackEditor /></Suspense>;
}
