"use client";
import Link from "next/link";
import { Gift } from "lucide-react";
import { previewMission } from "@/demo/engine/missions";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { useDemoData } from "@/stores/admin";

/** Cuánto suma este producto a la misión de unidades (ilustrativo). */
export function MissionChip({ units }: { units: number }) {
  const missions = useDemoData((d) => d.missions);
  const m = missions.find((x) => x.active !== false && x.type === "UNITS_COUNT");
  if (!m) return null;
  const p = previewMission(m, demoAccountProgress[m.id] ?? 0, { units, total: 0 });
  return (
    <Link href="/club/" className="flex items-center gap-3 rounded-2xl bg-night px-4 py-3 text-sm text-[#f6f1e8] hover:bg-night-2">
      <Gift size={18} aria-hidden="true" className="shrink-0 text-brass" />
      <span className="flex-1">{p.after >= m.threshold ? <>Con esta compra completás <strong>“{m.title}”</strong> y ganás: {m.reward}.</> : <>Suma {units} a <strong>“{m.title}”</strong> del Club Volta.</>}</span>
      <span className="text-xs text-brass">Ver Club</span>
    </Link>
  );
}
