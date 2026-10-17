import type { Metadata } from "next";
import { LeagueAdmin } from "@/features/admin/missions/LeagueAdmin";

export const metadata: Metadata = { title: "Liga de gimnasios" };

export default function AdminLeaguePage() {
  return <LeagueAdmin />;
}
