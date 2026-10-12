"use client";
import { Play } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { SoundToggle } from "@/components/atoms/SoundToggle";
import { gameRules } from "@/demo/fixtures/game";
import { GameScene } from "./art/GameScene";
import { fillLevel } from "./tiers";
import { useGameStats } from "./useGameStats";

/** Pantalla de inicio del juego: título, récord, premio de hoy y "Jugar". */
export function GameHero({ onPlay }: { onPlay: () => void }) {
  const { hydrated, best, today } = useGameStats();
  return (
    <section aria-labelledby="game-title" className="relative grid items-center gap-6 overflow-hidden rounded-[2rem] bg-night p-6 text-on-night sm:rounded-[2.5rem] sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_20%,color-mix(in_srgb,var(--brand-glow)_22%,transparent),transparent_70%),radial-gradient(60%_50%_at_20%_100%,color-mix(in_srgb,var(--brand-volt)_12%,transparent),transparent_70%)]" />
      <SoundToggle className="absolute right-4 top-4 z-10 h-11 w-11 rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20 sm:right-6 sm:top-6" />
      <div className="relative flex flex-col gap-5">
        <div>
          <p className="eyebrow pr-12 text-volt">Juego del Club · {gameRules.durationSec} segundos</p>
          <h1 id="game-title" className="font-display font-wide mt-2 text-[clamp(2.7rem,12vw,5rem)] uppercase leading-[0.92]">Shaker <br />Rush</h1>
          <p className="mt-4 max-w-md text-night-muted sm:text-lg">Atrapá la energía, esquivá la chatarra y cargá el shaker. Tu puntaje desbloquea un cupón para la tienda.</p>
        </div>
        <dl className="grid max-w-md grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <dt className="eyebrow text-[10px] text-night-muted">Tu récord</dt>
            <dd className="font-lab mt-1 text-2xl font-bold tabular-nums text-volt">{hydrated ? best.toLocaleString("es-AR") : "—"}</dd>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <dt className="eyebrow text-[10px] text-night-muted">Cupón de hoy</dt>
            <dd className="mt-1 font-bold leading-tight">{!hydrated ? "—" : today ? <>Ganado: <span className="text-volt">{today.label}</span></> : "Disponible"}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="light" size="lg" onClick={onPlay} disabled={!hydrated} className="min-w-[10rem]"><Play size={18} aria-hidden="true" className="fill-current" />Jugar</Button>
          <a href="#como-se-juega" className="min-h-11 content-center px-2 text-sm font-bold text-on-night underline underline-offset-4">Cómo se juega</a>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-[22rem] lg:max-w-md">
        <GameScene animate level={hydrated ? Math.max(0.2, fillLevel(best)) : 0.45} />
      </div>
    </section>
  );
}
