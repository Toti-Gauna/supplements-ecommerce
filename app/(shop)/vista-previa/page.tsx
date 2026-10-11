import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/atoms/Skeleton";
import { ProductPreview } from "@/features/product/ProductPreview";

export const metadata: Metadata = { title: "Vista previa del producto", robots: { index: false, follow: false } };

export default function ProductPreviewPage() {
  return (
    <div className="pb-24">
      <Suspense fallback={<DetailSkeleton />}><ProductPreview /></Suspense>
    </div>
  );
}
