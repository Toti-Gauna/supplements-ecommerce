import type { Metadata } from "next";
import { SettingsHub } from "@/features/admin/settings/SettingsHub";

export const metadata: Metadata = { title: "Ajustes" };

export default function Page() {
  return <SettingsHub />;
}
