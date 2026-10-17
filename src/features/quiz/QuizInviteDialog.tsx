"use client";
import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Led } from "@/components/atoms/Led";
import { AthleteSilhouette } from "@/components/illustrations/AthleteSilhouette";
import { SportArt } from "@/components/illustrations/SportArt";
import { Sheet } from "@/components/motion/Sheet";
import { sportInfo } from "@/demo/engine/sports";
import type { SportId } from "@/demo/types";
import { cn } from "@/lib/cn";
import { useGoal } from "../catalog/useGoals";

/** Tres deportes alrededor de un atleta de gimnasio: el quiz arma para los dos mundos. */
const CAST: [SportId, SportId, SportId] = ["futbol", "boxeo", "running"];
const ART = "h-[6.5rem] w-[5.2rem] sm:h-28 sm:w-[5.6rem]";

/** Una figura del elenco, en el color de su deporte (u objetivo) y con su halo. */
function Figure({ hue, className, children }: { hue?: string; className?: string; children: ReactNode }) {
  return (
    <span aria-hidden="true" style={{ "--hue": hue ?? "var(--color-volt)" } as CSSProperties}
      className={cn("text-[color:var(--hue)] drop-shadow-[0_0_16px_color-mix(in_srgb,var(--hue)_45%,transparent)]", className)}>
      {children}
    </span>
  );
}

interface Props {
  open: boolean;
  /** "Hacer el quiz": la invitación se cierra y el link lleva al quiz. */
  onAccept: () => void;
  /** "Ahora no", Escape, la X o tocar afuera. */
  onDecline: () => void;
}

/**
 * Invitación al quiz (la primera vez que se entra a la tienda): banda noche con deportistas y el marcador de cuánto
 * lleva, el título, una línea de qué gana y las dos salidas. El foco arranca en "Hacer el quiz"; Escape es "Ahora no".
 */
export function QuizInviteDialog({ open, onAccept, onDecline }: Props) {
  const gym = useGoal("fuerza");
  return (
    <Sheet open={open} onClose={onDecline} title="Invitación al quiz" labelledBy="quiz-invite-title" side="center" className="w-[min(94vw,30rem)] overflow-x-hidden">
      <div data-quiz-invite className="relative isolate flex h-48 items-end justify-center gap-1 overflow-hidden bg-night px-6 text-on-night sm:h-52">
        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_110%,color-mix(in_srgb,var(--brand-volt)_22%,transparent),transparent_70%),radial-gradient(40%_60%_at_0%_0%,color-mix(in_srgb,var(--brand-glow)_25%,transparent),transparent_70%)]" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-volt/40" />
        <Figure hue={sportInfo(CAST[0])?.hue}><SportArt sport={CAST[0]} className={ART} /></Figure>
        <Figure hue={gym?.hue}><AthleteSilhouette goal="fuerza" className="h-32 w-[4.8rem] sm:h-36 sm:w-[5.4rem]" /></Figure>
        <Figure hue={sportInfo(CAST[1])?.hue}><SportArt sport={CAST[1]} className={ART} /></Figure>
        <Figure hue={sportInfo(CAST[2])?.hue} className="max-[359px]:hidden"><SportArt sport={CAST[2]} className={ART} /></Figure>
        <span aria-hidden="true" className="absolute left-4 top-4 flex items-center gap-2 sm:left-5 sm:top-5">
          <Led value="05" label="5 preguntas" motion="none" className="h-6 w-auto" />
          <span className="eyebrow text-[10px] text-night-muted">preguntas · 1 min</span>
        </span>
      </div>
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div>
          <p className="eyebrow text-volt-ink">Quiz · objetivos y deportes</p>
          <h2 id="quiz-invite-title" className="font-display mt-1.5 text-[clamp(1.9rem,8vw,2.5rem)] leading-[1.02]">¿Armamos tu rutina en 1 minuto?</h2>
          <p className="mt-2.5 text-muted">Contestá 5 preguntas y te recomendamos qué suplementos y qué equipamiento te sirven para tu objetivo o tu deporte. Sin registrarte.</p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <ButtonLink href="/crear/quiz/" data-autofocus onClick={onAccept} size="lg" className="w-full sm:flex-1">
            Hacer el quiz<ArrowRight size={18} aria-hidden="true" />
          </ButtonLink>
          <Button variant="secondary" size="lg" onClick={onDecline} className="w-full sm:w-auto">Ahora no</Button>
        </div>
      </div>
    </Sheet>
  );
}
