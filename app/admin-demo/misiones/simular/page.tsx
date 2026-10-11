import type { Metadata } from "next";
import { MissionSimulatorPage } from "@/features/admin/missions/MissionSimulator";

export const metadata: Metadata = { title: "Simular progreso y premio" };

export default function AdminMissionSimulatorPage() {
  return <MissionSimulatorPage />;
}
