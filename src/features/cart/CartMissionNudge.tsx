"use client";
import { LoadBar } from "@/components/molecules/LoadBar";
import { previewMission } from "@/demo/engine/missions";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { brand } from "@/config/brand";

/** Empujón de misión: cuánto falta para el premio con este carrito (ilustrativo). */
export function CartMissionNudge({ units, total }: { units: number; total: number }) {
  const missions = useDemoData((d) => d.missions);
  const isRegistered = useAccount((s) => s.user !== null);
  const mission = missions.find((m) => m.active !== false && m.type === "UNITS_COUNT") ?? missions.find((m) => m.active !== false);
  if (!mission) return null;
  const p = previewMission(mission, isRegistered ? (demoAccountProgress[mission.id] ?? 0) : 0, { units, total });
  const unit = mission.type === "SPEND_TOTAL" ? `$${p.remaining.toLocaleString("es-AR")}` : `${p.remaining} ${p.remaining === 1 ? "producto" : "productos"}`;
  return (
    <div className="flex flex-col gap-3 rounded-sm bg-night p-4 text-on-night">
      <div className="min-w-0 text-sm">
        <p className="eyebrow text-volt">{brand.club}</p>
        <p className="font-bold">{p.after >= mission.threshold ? `¡Desbloqueás: ${mission.reward}!` : `Te falta ${unit} para: ${mission.reward}`}</p>
        <p className="text-xs text-night-muted">{isRegistered ? "Se acredita cuando el pago se confirma." : "Con cuenta, este pedido suma. (Ilustrativo)"}</p>
      </div>
      <LoadBar pct={p.pctAfter} label={`Progreso de ${mission.title}`}>{p.pctAfter}%</LoadBar>
    </div>
  );
}
