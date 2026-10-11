import type { Metadata } from "next";
import { FaqPage } from "@/features/admin/content/FaqPage";

export const metadata: Metadata = { title: "Preguntas frecuentes" };

export default function Page() {
  return <FaqPage />;
}
