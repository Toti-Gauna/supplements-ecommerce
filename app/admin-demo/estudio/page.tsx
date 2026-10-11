import type { Metadata } from "next";
import { StudioAdmin } from "@/features/admin/studio/StudioAdmin";

export const metadata: Metadata = { title: "Estudio de contenido" };

export default function AdminStudioPage() {
  return <StudioAdmin />;
}
