"use client";
import { clubToday } from "@/demo/engine/club-calendar";
import { findClaim } from "@/demo/engine/club-claims";
import { levelProgress } from "@/demo/engine/club-levels";
import { clubPoints } from "@/demo/engine/club-points";
import { clubRing } from "@/demo/engine/club-ring";
import { monthCheckins, trainingProgress, type TrainingContext } from "@/demo/engine/club-training";
import { weekBest, weekScores } from "@/demo/engine/game-ranking";
import { DEMO_CLUB_ACCOUNT, TRAINING_MISSIONS } from "@/demo/fixtures/club";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useClub } from "@/stores/club";
import { useGame } from "@/stores/game";
import { useHydrated } from "@/stores/hydration";

/**
 * Todo lo que muestra el Club, calculado por el engine con lo guardado en este navegador: nivel, misiones de compra y
 * de entrenamiento, puntos del mes y el anillo. Sin cuenta (o antes de rehidratar) todo arranca en cero.
 */
export function useClubState() {
  const hydrated = useHydrated();
  const user = useAccount((s) => s.user);
  const signedIn = hydrated && user !== null;
  const checkins = useClub((s) => s.checkins);
  const sportTried = useClub((s) => s.sportTried);
  const claims = useClub((s) => s.claims);
  const scores = useGame((s) => s.scores);
  const purchaseMissions = useDemoData((d) => d.missions).filter((m) => m.active !== false);
  const today = clubToday(new Date());
  const ownClaims = signedIn ? claims : [];
  const ctx: TrainingContext = {
    today, checkins: signedIn ? checkins : [], seededWeek: signedIn ? DEMO_CLUB_ACCOUNT.checkinsWeek : 0,
    sportTried: signedIn ? sportTried : null, gameWeekPlays: signedIn ? weekScores(scores, today).length : 0,
  };
  const training = TRAINING_MISSIONS.map((mission) => ({ mission, progress: trainingProgress(mission, ctx), claim: findClaim(ownClaims, mission, today) }));
  const purchase = purchaseMissions.map((mission) => ({ mission, progress: signedIn ? (demoAccountProgress[mission.id] ?? 0) : 0 }));
  const level = levelProgress(signedIn ? (demoAccountProgress["m-gasto"] ?? 0) : 0);
  const points = clubPoints({
    today, spendMonth: signedIn ? DEMO_CLUB_ACCOUNT.spendMonth : 0, checkinsMonth: monthCheckins(ctx), claims: ownClaims,
    gameBestWeek: signedIn ? weekBest(scores, today) : 0, double: level.level.id === "bestia",
  });
  const ring = clubRing({ signedIn, today, purchase, training, claims: ownClaims });
  const completed = training.filter((t) => t.claim).length + purchase.filter((p) => p.progress >= p.mission.threshold).length;
  return { hydrated, signedIn, user, today, ctx, training, purchase, level, points, ring, completed };
}

export type ClubState = ReturnType<typeof useClubState>;
