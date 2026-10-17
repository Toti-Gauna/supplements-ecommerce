import type { TrainingMission } from "../fixtures/club";
import type { Mission } from "../types";
import { findClaim, type ClubClaim } from "./club-claims";
import { formatMissionValue } from "./missions";
import { trainingPct } from "./club-training";

/**
 * Qué muestra el anillo "Tu próximo premio" del Club. A un invitado nunca le promete nada (no suma sin cuenta): lo
 * invita a crear la cuenta demo. Con cuenta, primero lo que ya se puede reclamar y, si no hay, la misión más avanzada.
 */
export type RingState =
  | { kind: "guest" }
  | { kind: "ready"; missionId: string; title: string; reward: string }
  | { kind: "progress"; missionId: string; title: string; reward: string; pct: number; detail: string }
  | { kind: "done" };

export interface RingInput {
  signedIn: boolean;
  today: string;
  purchase: { mission: Mission; progress: number }[];
  training: { mission: TrainingMission; progress: number }[];
  claims: ClubClaim[];
}

export function clubRing(input: RingInput): RingState {
  if (!input.signedIn) return { kind: "guest" };
  const training = input.training.filter(({ mission }) => !findClaim(input.claims, mission, input.today));
  const ready = training.find(({ mission, progress }) => progress >= mission.threshold);
  if (ready) return { kind: "ready", missionId: ready.mission.id, title: ready.mission.title, reward: ready.mission.reward };
  const candidates = [
    ...training.map(({ mission, progress }) => ({
      missionId: mission.id, title: mission.title, reward: mission.reward, pct: trainingPct(mission, progress),
      detail: `${Math.min(progress, mission.threshold)} de ${mission.threshold}`,
    })),
    ...input.purchase.filter(({ mission, progress }) => progress < mission.threshold).map(({ mission, progress }) => ({
      missionId: mission.id, title: mission.title, reward: mission.reward,
      pct: Math.min(100, Math.round((progress / mission.threshold) * 100)),
      detail: `${formatMissionValue(mission, progress)} de ${formatMissionValue(mission, mission.threshold)}`,
    })),
  ];
  const best = candidates.sort((a, b) => b.pct - a.pct)[0];
  return best ? { kind: "progress", ...best } : { kind: "done" };
}
