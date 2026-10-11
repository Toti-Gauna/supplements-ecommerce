import type { Metadata } from "next";
import { HomeTextsEditor } from "@/features/admin/content/HomeTextsEditor";

export const metadata: Metadata = { title: "Textos de inicio" };

export default function Page() {
  return <HomeTextsEditor />;
}
