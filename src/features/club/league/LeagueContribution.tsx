"use client";
import { Dumbbell, Gamepad2, ShoppingBag, Target } from "lucide-react";
import { CLUB_POINTS } from "@/demo/engine/club-points";
import type { PointsPart } from "@/demo/engine/club-points";
import { ClubHeading } from "../ClubHeading";
import { DemoAccountButton } from "../DemoAccountButton";
import type { ClubState } from "../useClubState";

const ICON: Record<PointsPart["id"], typeof Dumbbell> = { compras: ShoppingBag, entrenos: Dumbbell, misiones: Target, juego: Gamepad2 };
const RULE: Record<PointsPart["id"], string> = {
  compras: `${CLUB_POINTS.perThousand} punto por cada $1.000 de pedidos pagados`,
  entrenos: `${CLUB_POINTS.perCheckin} puntos por entreno marcado (uno por día)`,
  misiones: "Los puntos de cada misión de entrenamiento, al reclamarla",
  juego: `Tu récord de la semana ÷ ${CLUB_POINTS.gameDivisor}, hasta ${CLUB_POINTS.gameCap} puntos`,
};

/** Cómo se arma tu aporte: cada fuente con su regla y, con cuenta, cuánto llevás este mes. */
export function LeagueContribution({ state }: { state: ClubState }) {
  const { signedIn, points } = state;
  return (
    <section aria-labelledby="aporte" className="flex flex-col gap-6">
      <ClubHeading id="aporte" eyebrow="Tu aporte" title="Cómo sumás para tu box">
        {signedIn ? `Este mes llevás ${points.total.toLocaleString("es-AR")} puntos.` : "Sin cuenta no sumás: tu aporte queda en cero."}
      </ClubHeading>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {points.parts.map((p) => {
          const Icon = ICON[p.id];
          return (
            <li key={p.id} className="plate flex flex-col gap-2 rounded-sm border border-line p-4">
              <Icon size={20} aria-hidden="true" className="text-volt-ink" />
              <p className="font-bold">{p.label}</p>
              <p className="text-sm text-muted">{RULE[p.id]}</p>
              <p className="mt-auto font-lab text-2xl font-bold tabular-nums">{signedIn ? `+${p.points.toLocaleString("es-AR")}` : "—"}<span className="ml-1 text-xs font-normal text-muted">pts</span></p>
            </li>
          );
        })}
      </ul>
      {!signedIn && <DemoAccountButton variant="primary" className="w-fit" />}
    </section>
  );
}
