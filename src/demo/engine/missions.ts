import type { Mission } from "../types";

/** Progreso ILUSTRATIVO. En producción solo cuentan pedidos PAID, evaluados en el servidor (spec 5.6). */
export interface MissionPreview {
  mission: Mission;
  before: number;
  after: number;
  pctBefore: number;
  pctAfter: number;
  completesNow: boolean;
  alreadyComplete: boolean;
  remaining: number;
}

export function missionDelta(mission: Mission, order: { units: number; total: number }): number {
  if (mission.type === "UNITS_COUNT") return order.units;
  if (mission.type === "ORDERS_COUNT") return order.units > 0 ? 1 : 0;
  return order.total;
}

export function previewMission(mission: Mission, current: number, order: { units: number; total: number }): MissionPreview {
  const after = current + missionDelta(mission, order);
  const pct = (v: number) => Math.min(100, Math.round((v / mission.threshold) * 100));
  return {
    mission,
    before: current,
    after,
    pctBefore: pct(current),
    pctAfter: pct(after),
    alreadyComplete: current >= mission.threshold,
    completesNow: current < mission.threshold && after >= mission.threshold,
    remaining: Math.max(0, mission.threshold - after),
  };
}

export function formatMissionValue(mission: Mission, value: number): string {
  if (mission.type === "SPEND_TOTAL") return `$${Math.min(value, mission.threshold).toLocaleString("es-AR")}`;
  return `${Math.min(value, mission.threshold)}`;
}
