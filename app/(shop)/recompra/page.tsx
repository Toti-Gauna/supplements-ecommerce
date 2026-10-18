import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { RepurchaseLanding } from "@/features/cart/RepurchaseLanding";

export const metadata: Metadata = { title: "Tu bolso de recompra", robots: { index: false, follow: false } };

export default function RepurchasePage() {
  return (
    <Suspense fallback={<HeroSkeleton label="Armando tu bolso" />}>
      <RepurchaseLanding />
    </Suspense>
  );
}
