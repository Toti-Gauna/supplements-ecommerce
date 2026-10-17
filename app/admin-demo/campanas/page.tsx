import type { Metadata } from "next";
import { CampaignsAdmin } from "@/features/admin/campaigns/CampaignsAdmin";

export const metadata: Metadata = { title: "Campañas" };

export default function AdminCampaignsPage() {
  return <CampaignsAdmin />;
}
