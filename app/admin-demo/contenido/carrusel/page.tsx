import type { Metadata } from "next";
import { CarouselEditor } from "@/features/admin/content/CarouselEditor";

export const metadata: Metadata = { title: "Carrusel del inicio" };

export default function Page() {
  return <CarouselEditor />;
}
