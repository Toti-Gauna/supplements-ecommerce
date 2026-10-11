"use client";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Reveal } from "@/components/motion/Reveal";
import { useDemoData } from "@/stores/admin";
import { useUi } from "@/stores/ui";
import { MissionCard } from "../club/MissionCard";
import { demoAccountProgress } from "@/demo/fixtures/commerce";

/** Banda del Club en el inicio: misiones vigentes + acceso a la ruleta. Va dentro del margen de la página (pedido de Ignacio, 8.2). */
export function ClubBand() {
  const all = useDemoData((d) => d.missions);
  const wheelActive = useDemoData((d) => d.wheel.active);
  const setWheel = useUi((s) => s.setWheel);
  const missions = all.filter((m) => m.active !== false).slice(0, 3);
  return (
    <section aria-labelledby="club" className="relative overflow-hidden rounded-[2rem] bg-night px-5 py-12 text-on-night sm:rounded-[2.5rem] sm:px-10 sm:py-16 lg:px-14 lg:py-20">
      <div aria-hidden="true" className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgb(139_114_255/0.35),transparent)]" />
      <Reveal className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-volt">Club Volta</p>
          <h2 id="club" className="font-display mt-3 max-w-xl text-4xl leading-tight sm:text-5xl">Cada compra suma. <span className="italic text-volt">Cada misión, un regalo.</span></h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {wheelActive && <Button variant="light" size="lg" onClick={() => setWheel(true)}><Gift size={18} aria-hidden="true" /> Girar la ruleta</Button>}
          <Link href="/club/" className="inline-flex min-h-14 items-center gap-2 rounded-full border border-white/25 px-6 font-bold hover:bg-white/10">Conocé el Club <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </Reveal>
      <ul className="relative mt-10 grid gap-4 md:grid-cols-3">
        {missions.map((m, i) => <Reveal as="li" key={m.id} delay={i * 0.1}><MissionCard mission={m} progress={demoAccountProgress[m.id] ?? 0} dark /></Reveal>)}
      </ul>
      <p className="relative mt-4 text-xs text-night-muted">Progreso de ejemplo de la cuenta demo.</p>
    </section>
  );
}
