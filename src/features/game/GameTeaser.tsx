"use client";
import { Play } from "lucide-react";
import { useId } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { gameRules } from "@/demo/fixtures/game";
import { cn } from "@/lib/cn";
import { GameScene } from "./art/GameScene";
import { fillLevel } from "./tiers";
import { useGameStats } from "./useGameStats";
import { usePrizeTiers } from "./usePrizeTiers";

/** "5 % OFF, 10 % OFF o envío gratis" (o el aviso de premios pausados). */
function prizesText(labels: string[], active: boolean): string {
  if (!active || !labels.length) return "Los premios están pausados: jugá por el récord.";
  return `Según tu puntaje ganás ${new Intl.ListFormat("es", { type: "disjunction" }).format(labels.map((l) => l.replace(/^Envío/, "envío")))} (un cupón por día).`;
}

/**
 * Tarjeta de Shaker Rush para el Club y el inicio: mini escena (un scoop que cae al shaker, tres veces y queda),
 * récord de este navegador, estado del cupón de hoy y "Jugar". `heading` elige el nivel del título según dónde va.
 */
export function GameTeaser({ className, heading = "h2" }: { className?: string; heading?: "h2" | "h3" }) {
  const id = useId();
  const { hydrated, best, today } = useGameStats();
  const { config, tiers } = usePrizeTiers();
  const Title = heading;
  return (
    <article aria-labelledby={id} className={cn("relative grid items-center gap-5 overflow-hidden rounded-[2rem] bg-night p-6 text-on-night sm:grid-cols-[1fr_minmax(0,14rem)] sm:p-8", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_85%_30%,color-mix(in_srgb,var(--brand-glow)_24%,transparent),transparent_70%)]" />
      <div className="relative order-2 flex flex-col gap-4 sm:order-1">
        <div>
          <p className="eyebrow text-volt">Juego del Club</p>
          <Title id={id} className="font-display font-wide mt-1 text-4xl uppercase leading-none">Shaker Rush</Title>
          <p className="mt-3 max-w-md text-sm text-night-muted">{gameRules.durationSec} segundos para atrapar energía y esquivar la chatarra. {prizesText(tiers.map((t) => t.label), config.active)}</p>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div><dt className="eyebrow text-[10px] text-night-muted">Tu récord</dt><dd className="font-lab text-xl font-bold tabular-nums text-volt">{hydrated ? best.toLocaleString("es-AR") : "—"}</dd></div>
          <div><dt className="eyebrow text-[10px] text-night-muted">Cupón de hoy</dt><dd className="font-bold">{!hydrated ? "—" : today ? `Ganado: ${today.label}` : "Disponible"}</dd></div>
        </dl>
        <ButtonLink href="/club/juego/" variant="light" aria-label="Jugar Shaker Rush" className="w-full sm:w-fit"><Play size={17} aria-hidden="true" className="fill-current" />Jugar</ButtonLink>
      </div>
      <div className="relative order-1 mx-auto w-full max-w-[13rem] sm:order-2">
        <GameScene animate level={hydrated ? Math.max(0.2, fillLevel(best)) : 0.45} />
      </div>
    </article>
  );
}
