import type { Metadata } from "next";
import { MissionsAdmin } from "@/features/admin/missions/MissionsAdmin";

export const metadata: Metadata = { title: "Misiones y premios" };

export default function AdminMissionsPage() {
  return <MissionsAdmin />;
}
