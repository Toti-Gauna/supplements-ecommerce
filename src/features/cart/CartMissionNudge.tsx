"use client";
import Link from "next/link";
import { LoadBar } from "@/components/molecules/LoadBar";
import { previewMission } from "@/demo/engine/missions";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { brand } from "@/config/brand";

/**
 * Misión del club con este carrito. Con cuenta: cuánto avanza (la barra solo en el carrito completo; en el bolso, una
 * línea, para no sumar otro medidor). Sin cuenta no suma nada, así que no promete premios: lo dice y ofrece entrar.
 */
export function CartMissionNudge({ units, total, compact = false }: { units: number; total: number; compact?: boolean }) {
  const missions = useDemoData((d) => d.missions);
  const isRegistered = useAccount((s) => s.user !== null);
  const mission = missions.find((m) => m.active !== false && m.type === "UNITS_COUNT") ?? missions.find((m) => m.active !== false);
  if (!mission) return null;
  if (!isRegistered) {
    return (
      <p className="rounded-sm border border-dashed border-line p-3 text-[13px] text-muted">
        <span className="eyebrow mr-1.5 text-volt-ink">{brand.club}</span>
        Como invitado este pedido no suma. Con cuenta avanzás en «{mission.title}» (premio: {mission.reward}).{" "}
        <Link href="/cuenta/" className="font-bold text-ink underline underline-offset-2">Entrar</Link>
      </p>
    );
  }
  const p = previewMission(mission, demoAccountProgress[mission.id] ?? 0, { units, total });
  const unit = mission.type === "SPEND_TOTAL" ? `$${p.remaining.toLocaleString("es-AR")}` : `${p.remaining} ${p.remaining === 1 ? "producto" : "productos"}`;
  const headline = p.after >= mission.threshold ? `Con este pedido completás «${mission.title}»: ${mission.reward}` : `Te falta ${unit} para: ${mission.reward}`;
  if (compact) return <p className="text-[13px]"><span className="eyebrow mr-1.5 text-volt-ink">{brand.club}</span>{headline}. Se acredita cuando el pago se confirma.</p>;
  return (
    <div className="flex flex-col gap-3 rounded-sm bg-night p-4 text-on-night">
      <div className="min-w-0 text-sm">
        <p className="eyebrow text-volt">{brand.club}</p>
        <p className="font-bold">{headline}</p>
        <p className="text-xs text-night-muted">Se acredita cuando el pago se confirma.</p>
      </div>
      <LoadBar pct={p.pctAfter} label={`Progreso de ${mission.title}`}>{p.pctAfter}%</LoadBar>
    </div>
  );
}
