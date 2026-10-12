import type { Metadata } from "next";
import { StackRuleEditor } from "@/features/admin/marketing/StackRuleEditor";

export const metadata: Metadata = { title: "Descuento stack" };

export default function AdminStackRulePage() {
  return <StackRuleEditor />;
}
