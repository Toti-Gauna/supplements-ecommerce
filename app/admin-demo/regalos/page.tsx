import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { GiftsAdmin } from "@/features/admin/gifts/GiftsAdmin";

export const metadata: Metadata = { title: "Regalos y gift cards" };

export default function AdminGiftsPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><GiftsAdmin /></Suspense>;
}
