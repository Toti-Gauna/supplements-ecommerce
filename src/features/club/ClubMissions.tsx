"use client";
import { Reveal } from "@/components/motion/Reveal";
import { ClubHeading } from "./ClubHeading";
import { MissionCard } from "./MissionCard";
import { TrainingCard } from "./TrainingCard";
import type { ClubState } from "./useClubState";
import { useTrainingActions } from "./useTrainingActions";

/**
 * Tus misiones, una sola vez: las de entrenamiento (marcás vos, se reclaman una vez por período) y las de compra (las
 * del panel, que se acreditan cuando el pago se confirma). Las cadenas se dicen en cada tarjeta.
 */
export function ClubMissions({ state }: { state: ClubState }) {
  const { checkIn, trySport, claim } = useTrainingActions();
  const { signedIn, training, purchase, ctx } = state;
  const titleOf = (id?: string | null) => purchase.find((p) => p.mission.id === id)?.mission.title;
  return (
    <section aria-labelledby="mis" className="flex flex-col gap-8">
      <ClubHeading id="mis" eyebrow="Misiones" title="Tus misiones">
        {signedIn ? "Así vas con la cuenta demo. Los premios se reclaman una vez: no se duplican." : "Entrenamiento y compras. Con la cuenta demo marcás, sumás y reclamás."}
      </ClubHeading>
      <div className="flex flex-col gap-4">
        <p id="mis-entreno" className="eyebrow text-volt-ink">Entrenamiento</p>
        <ul aria-labelledby="mis-entreno" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {training.map((t, i) => (
            <Reveal as="li" key={t.mission.id} delay={i * 0.08}>
              <TrainingCard mission={t.mission} progress={t.progress} claim={t.claim} ctx={ctx} signedIn={signedIn}
                onCheckIn={checkIn} onSport={trySport} onClaim={() => claim(t.mission, t.progress)} />
            </Reveal>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <p id="mis-compras" className="eyebrow text-volt-ink">Compras · se acreditan cuando el pago se confirma</p>
        <ul aria-labelledby="mis-compras" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {purchase.map((p, i) => (
            <Reveal as="li" key={p.mission.id} delay={i * 0.08}>
              <MissionCard mission={p.mission} progress={p.progress} next={titleOf(p.mission.nextMissionId)} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
