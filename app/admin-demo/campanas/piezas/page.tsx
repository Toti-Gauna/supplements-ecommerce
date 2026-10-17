import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { CampaignPieces } from "@/features/admin/campaigns/pieces/CampaignPieces";

export const metadata: Metadata = { title: "Piezas de la campaña" };

export default function AdminCampaignPiecesPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><CampaignPieces /></Suspense>;
}
