import type { Metadata } from "next";
import { PerformanceLab } from "@/features/propuestas/b/PerformanceLab";

export const metadata: Metadata = {
  title: "Propuesta B · Performance Lab",
  robots: { index: false },
};

export default function PropuestaBPage() {
  return <PerformanceLab />;
}
