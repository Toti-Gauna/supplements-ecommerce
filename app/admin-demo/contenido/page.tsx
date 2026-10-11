import type { Metadata } from "next";
import { ContentHub } from "@/features/admin/content/ContentHub";

export const metadata: Metadata = { title: "Contenido" };

export default function Page() {
  return <ContentHub />;
}
