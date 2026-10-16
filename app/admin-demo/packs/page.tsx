import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { PacksModule } from "@/features/admin/packs/PacksModule";

export const metadata: Metadata = { title: "Packs y suscripciones" };

export default function AdminPacksPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><PacksModule /></Suspense>;
}
