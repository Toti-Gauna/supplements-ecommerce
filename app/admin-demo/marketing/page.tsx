import type { Metadata } from "next";
import { MarketingHub } from "@/features/admin/marketing/MarketingHub";

export const metadata: Metadata = { title: "Marketing" };

export default function AdminMarketingPage() {
  return <MarketingHub />;
}
