"use client";
import { Trophy } from "lucide-react";
import { Breadcrumbs } from "@/components/templates/PageHeader";
import { brand } from "@/config/brand";
import { daysLeftInMonth } from "@/demo/engine/club-calendar";
import { overtakeGap } from "@/demo/engine/gym-league";
import { LEAGUE_PRIZE } from "@/demo/fixtures/gyms";
import { formatDay } from "@/lib/date";
import { ClubHeading } from "../ClubHeading";
import { NightStats } from "../NightStats";
import { NIGHT_BAND } from "../styles";
import { useClubState } from "../useClubState";
import { GymPicker } from "./GymPicker";
import { LeagueContribution } from "./LeagueContribution";
import { LeagueTable } from "./LeagueTable";

/**
 * Liga de gimnasios de la ciudad (R2c): elegís tu box, ves el ranking del mes (muestra + tu aporte, resaltado) y cómo
 * se suma. Todo lo calcula el engine con lo guardado en este navegador; en producción, el servidor.
 */
export function LeagueView() {
  const state = useClubState();
  const { league, gym, points, signedIn, today, hydrated } = state;
  const mine = league.find((r) => r.mine);
  const gap = overtakeGap(league);
  // Lo que depende del reloj se muestra después de rehidratar (el HTML estático no sabe qué día es).
  const month = hydrated ? formatDay(today, "month") : "este mes";
  const left = hydrated ? daysLeftInMonth(today) : null;
  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <div className="flex flex-col gap-4">
        <Breadcrumbs crumbs={[{ href: "/club/", label: "Club" }]} />
        <section aria-labelledby="liga-title" className={NIGHT_BAND}>
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--brand-glow)_35%,transparent),transparent)]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
            <div className="min-w-0">
              <p className="eyebrow text-volt">Liga de gimnasios · {brand.city}</p>
              <h1 id="liga-title" className="font-display mt-3 text-[clamp(2.6rem,7vw,5rem)] uppercase leading-[0.95]">La liga <span className="italic text-volt">de los boxes</span></h1>
              <p className="mt-4 max-w-lg text-night-muted">Elegí tu gimnasio y cada compra, entreno, misión y partida de Shaker Rush suma para su ranking de {month}. {LEAGUE_PRIZE}</p>
            </div>
            <NightStats label="Tu liga" stats={[
              { label: "Puesto de tu box", value: mine ? String(mine.position) : "-", reading: mine ? `Tu box va ${mine.position}.º` : "Sin gimnasio elegido" },
              { label: "Tu aporte", value: String(signedIn ? points.total : 0), reading: `${signedIn ? points.total : 0} puntos aportados` },
              { label: "Días al cierre", value: left === null ? "-" : String(left), reading: left === null ? "Cierre a fin de mes" : `${left} días para el cierre del mes` },
            ]} />
          </div>
        </section>
      </div>
      <section aria-labelledby="elegi" className="flex flex-col gap-6">
        <ClubHeading id="elegi" eyebrow="Tu box" title="Elegí tu gimnasio">{gym ? `Sumás para ${gym.name}. Lo podés cambiar cuando quieras.` : "Boxes y gimnasios de muestra. Elegí uno y tu aporte del mes va a su ranking."}</ClubHeading>
        <GymPicker selected={gym?.id ?? null} />
      </section>
      <section aria-labelledby="ranking" className={NIGHT_BAND}>
        <div className="relative flex flex-col gap-6">
          <ClubHeading id="ranking" eyebrow={`Ranking de ${month}`} title="Tabla de posiciones" night>
            {gap ? `A ${gym?.name} le faltan ${gap.points.toLocaleString("es-AR")} puntos para pasar a ${gap.gym.name}.` : mine ? `${gym?.name} va primero. ¡A sostenerlo!` : "Elegí tu gimnasio para ver tu aporte en la tabla."}
          </ClubHeading>
          <LeagueTable rows={league} label="Ranking mensual de gimnasios" />
          <p className="flex items-start gap-2 text-xs text-night-muted"><Trophy size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-volt" />Puntos de muestra de los otros socios. En la tienda real salen de pedidos pagados y partidas validadas en el servidor.</p>
        </div>
      </section>
      <LeagueContribution state={state} />
    </div>
  );
}
