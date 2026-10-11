import type { Metadata } from "next";
import { LegalPage } from "@/components/templates/LegalPage";
import { terms } from "@/demo/fixtures/content";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return <LegalPage title="Términos y condiciones" sections={terms} />;
}
