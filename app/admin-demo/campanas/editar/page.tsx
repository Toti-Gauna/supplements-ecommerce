import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { CampaignEditor } from "@/features/admin/campaigns/CampaignEditor";

export const metadata: Metadata = { title: "Editar campaña" };

export default function AdminCampaignEditPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><CampaignEditor /></Suspense>;
}
