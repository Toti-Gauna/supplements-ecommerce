import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { GiftView } from "@/features/gifts/GiftView";

export const metadata: Metadata = { title: "Tenés un regalo", description: "Abrí el regalo que te mandaron desde Volta." };

export default function GiftPage() {
  return (
    <Suspense fallback={<HeroSkeleton label="Cargando regalo" />}>
      <GiftView />
    </Suspense>
  );
}
