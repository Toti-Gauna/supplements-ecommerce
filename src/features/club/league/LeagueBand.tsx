"use client";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/atoms/Button";
import { brand } from "@/config/brand";
import { GYMS } from "@/demo/fixtures/gyms";
import { ClubHeading } from "../ClubHeading";
import { NIGHT_BAND } from "../styles";
import type { ClubState } from "../useClubState";
import { LeagueTable } from "./LeagueTable";

/** La liga en el Club: el podio del mes, tu box si está fuera del podio y el acceso a la tabla completa. */
export function LeagueBand({ state }: { state: ClubState }) {
  const { league, gym } = state;
  const mine = league.find((r) => r.mine);
  const rows = mine && mine.position > 3 ? [...league.slice(0, 3), mine] : league.slice(0, 3);
  return (
    <section aria-labelledby="liga" className={NIGHT_BAND}>
      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div className="flex flex-col gap-5">
          <ClubHeading id="liga" eyebrow={`Liga de gimnasios · ${brand.city}`} title="Tu box contra la ciudad" night>
            {gym ? `Sumás para ${gym.name}: va ${mine?.position}.º de ${GYMS.length}.` : `${GYMS.length} boxes y gimnasios compiten en el mes. Elegí el tuyo y sumá con cada compra, entreno y partida.`}
          </ClubHeading>
          <ButtonLink href="/club/liga/" variant="light" className="w-full sm:w-fit">{gym ? "Ver la tabla completa" : "Elegir mi gimnasio"}<ArrowRight size={16} aria-hidden="true" /></ButtonLink>
        </div>
        <LeagueTable rows={rows} label="Podio del mes" compact />
      </div>
    </section>
  );
}
