"use client";
import { FaqList } from "@/components/molecules/FaqList";
import { useDemoData } from "@/stores/admin";

export function FaqView() {
  const faqs = useDemoData((d) => d.content.faqs);
  return <FaqList faqs={faqs} />;
}
