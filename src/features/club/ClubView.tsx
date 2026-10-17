"use client";
import Link from "next/link";
import { ArrowRight, CalendarClock, Layers, Receipt, ShieldCheck } from "lucide-react";
import { GameLeaderboard } from "../game/GameLeaderboard";
import { GameTeaser } from "../game/GameTeaser";
import { SeasonTicket } from "../campaigns/SeasonTicket";
import { ClubHeading } from "./ClubHeading";
import { ClubHero } from "./ClubHero";
import { ClubLevels } from "./ClubLevels";
import { ClubMissions } from "./ClubMissions";
import { RewardsWallet } from "./RewardsWallet";
import { NIGHT_BAND } from "./styles";
import { useClubState } from "./useClubState";
import { WheelTeaser } from "./WheelTeaser";

const RULES = [
  { icon: Receipt, text: "Las compras suman cuando el pago se confirma." },
  { icon: CalendarClock, text: "Cada premio es de un uso y vence. Se reclama una vez: no se duplica." },
  { icon: Layers, text: "Lo que sobra de una misión de compra pasa a la siguiente." },
  { icon: ShieldCheck, text: "Ilustrativo: en la tienda real se calcula en el servidor." },
];

/** El Club en una página, sin repetir: portada, niveles con medallas, misiones, disco, juego y billetera. */
export function ClubView() {
  const state = useClubState();
  return (
    <div className="flex flex-col gap-14 sm:gap-20">
      <ClubHero state={state} />
      <SeasonTicket where="club" className="-mt-6 sm:-mt-12" />
      <section aria-labelledby="niveles" className={NIGHT_BAND}>
        <div className="relative flex flex-col gap-8">
          <ClubHeading id="niveles" eyebrow="Niveles" title="Tabla de niveles" night>Cuatro medallas: bronce, plata, oro y platino. Se suben con lo comprado en los últimos 12 meses.</ClubHeading>
          <ClubLevels progress={state.level} signedIn={state.signedIn} />
        </div>
      </section>
      <ClubMissions state={state} />
      <section aria-labelledby="ruleta" className="lab-grid grid items-center gap-10 rounded-sm border border-line bg-surface p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
        <ClubHeading id="ruleta" eyebrow="Disco olímpico" title="Cargá la barra y girá">
          Un giro con premio seguro: envío gratis, el shaker, una muestra o un descuento para tu próxima compra. No corta tu compra: lo girás acá o desde el carrito.
        </ClubHeading>
        <WheelTeaser />
      </section>
      <section aria-label="Juego Shaker Rush" id="juego" className="grid scroll-mt-28 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <GameTeaser />
        <GameLeaderboard compact />
      </section>
      <section aria-labelledby="wallet" className="flex flex-col gap-8">
        <ClubHeading id="wallet" eyebrow="Billetera" title="Tus premios">Los cupones del disco, de Shaker Rush y de tus misiones.</ClubHeading>
        <RewardsWallet />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 rounded-sm border border-line bg-surface p-4 text-sm">
              <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />{text}
            </li>
          ))}
        </ul>
        <Link href="/cuenta/#premios" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-primary underline">Ver mis premios en la cuenta <ArrowRight size={15} aria-hidden="true" /></Link>
      </section>
    </div>
  );
}
