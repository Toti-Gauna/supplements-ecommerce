"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarClock, Layers, Receipt, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { ClubHero } from "./ClubHero";
import { MissionCard } from "./MissionCard";
import { MissionPath } from "./MissionPath";
import { RewardsWallet } from "./RewardsWallet";
import { WheelTeaser } from "./WheelTeaser";

const RULES = [
  { icon: Receipt, text: "Solo suman pedidos pagados." },
  { icon: CalendarClock, text: "Cada premio es de un uso y vence." },
  { icon: Layers, text: "Lo que sobra pasa a la misión siguiente." },
  { icon: ShieldCheck, text: "Ilustrativo: en la tienda real se calcula en el servidor." },
];

/** Encabezado de sección del Club: rótulo, título y bajada con el mismo ritmo en toda la página. */
function Heading({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <Reveal>
      <p className="eyebrow text-brass-ink">{eyebrow}</p>
      <h2 id={id} className="font-display mt-2 scroll-mt-28 text-4xl leading-tight sm:text-5xl">{title}</h2>
      {children && <p className="mt-2 max-w-xl text-muted">{children}</p>}
    </Reveal>
  );
}

export function ClubView() {
  const all = useDemoData((d) => d.missions);
  const missions = all.filter((m) => m.active !== false);
  const user = useAccount((s) => s.user);
  const done = all.reduce((s, m) => s + (m.completedCount ?? 0), 0);
  return (
    <div className="flex flex-col gap-14 sm:gap-20">
      <ClubHero missions={missions} done={done} />
      <section aria-labelledby="mis">
        <Heading id="mis" eyebrow="Misiones" title="Tus misiones">{user ? "Así vas con la cuenta demo." : "Sin cuenta el progreso arranca en cero."}</Heading>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {missions.map((m, i) => <Reveal as="li" key={m.id} delay={i * 0.08}><MissionCard mission={m} progress={user ? (demoAccountProgress[m.id] ?? 0) : 0} /></Reveal>)}
        </ul>
      </section>
      <section aria-labelledby="ruleta" className="grid items-center gap-10 rounded-[2rem] bg-surface p-6 shadow-[var(--shadow-card)] sm:rounded-[2.5rem] sm:p-10 lg:grid-cols-2 lg:p-14">
        <Heading id="ruleta" eyebrow="Ruleta de cupones" title="Girá y llevate un premio">Envío gratis, grabado gratis, un llavero de regalo o un descuento para tu próxima compra. Todos los premios ganan.</Heading>
        <WheelTeaser />
      </section>
      <section aria-labelledby="path" className="rounded-[2rem] bg-night p-6 text-[#f6f1e8] sm:rounded-[2.5rem] sm:p-10 lg:p-14">
        <p className="eyebrow text-brass">Cadenas</p>
        <h2 id="path" className="font-display mb-8 mt-2 text-4xl leading-tight sm:text-5xl">Camino de premios</h2>
        <MissionPath missions={missions} />
      </section>
      <section aria-labelledby="wallet" className="flex flex-col gap-8">
        <Heading id="wallet" eyebrow="Billetera" title="Tus premios">Los cupones de la ruleta y los premios de tus misiones.</Heading>
        <RewardsWallet />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-sm">
              <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />{text}
            </li>
          ))}
        </ul>
        <Link href="/cuenta/#premios" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-primary underline">Ver mis premios en la cuenta <ArrowRight size={15} aria-hidden="true" /></Link>
      </section>
    </div>
  );
}
