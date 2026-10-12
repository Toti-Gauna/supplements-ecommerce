import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { GiftView } from "@/features/gifts/GiftView";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Tenés un regalo", description: `Abrí el regalo que te mandaron desde ${brand.name}.` };

export default function GiftPage() {
  return (
    <Suspense fallback={<HeroSkeleton label="Cargando regalo" />}>
      <GiftView />
    </Suspense>
  );
}
