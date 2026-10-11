import type { Metadata } from "next";
import { LegalPage } from "@/components/templates/LegalPage";
import { privacy } from "@/demo/fixtures/content";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return <LegalPage title="Política de privacidad" sections={privacy} />;
}
