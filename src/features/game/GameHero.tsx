"use client";
import { Play } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Led } from "@/components/atoms/Led";
import { SoundToggle } from "@/components/atoms/SoundToggle";
import { gameRules } from "@/demo/fixtures/game";
import { NIGHT_PLATE } from "../club/styles";
import { GameScene } from "./art/GameScene";
import { fillLevel } from "./tiers";
import { useGameStats } from "./useGameStats";
import { useWeeklyRanking } from "./useWeeklyRanking";

const SCANLINES = "pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.025)_0_1px,transparent_1px_3px)]";

/**
 * Pantalla de inicio estilo arcade: marquesina, marcador LED con tu récord y tu puesto de la semana, el rival a
 * vencer, el cupón de hoy y "Jugar". Todo quieto salvo la escena del shaker (que respeta "reducir movimiento").
 */
export function GameHero({ onPlay }: { onPlay: () => void }) {
  const { hydrated, best, today } = useGameStats();
  const { mine, rival } = useWeeklyRanking();
  return (
    <section aria-labelledby="game-title" className="floor led-dark relative grid items-center gap-6 overflow-hidden rounded-sm p-6 text-on-night sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_20%,color-mix(in_srgb,var(--brand-glow)_22%,transparent),transparent_70%),radial-gradient(60%_50%_at_20%_100%,color-mix(in_srgb,var(--brand-volt)_12%,transparent),transparent_70%)]" />
      <div aria-hidden="true" className={SCANLINES} />
      <SoundToggle className="absolute right-4 top-4 z-10 h-11 w-11 rounded-sm bg-white/10 ring-1 ring-white/15 hover:bg-white/20 sm:right-6 sm:top-6" />
      <div className="relative flex flex-col gap-5">
        <div>
          <p className="eyebrow pr-12 text-volt">Arcade del Club · {gameRules.durationSec} segundos · {gameRules.lives} vidas</p>
          <h1 id="game-title" className="font-display font-wide mt-2 text-[clamp(2.7rem,12vw,5rem)] uppercase leading-[0.92] [text-shadow:0_0_28px_color-mix(in_srgb,var(--brand-volt)_35%,transparent)]">Shaker <br />Rush</h1>
          <p className="mt-4 max-w-md text-night-muted sm:text-lg">Atrapá la energía, esquivá la chatarra y cargá el shaker. Tu puntaje desbloquea un cupón para la tienda.</p>
        </div>
        <dl className="grid max-w-md grid-cols-2 gap-2 text-sm">
          <div className={`${NIGHT_PLATE} rounded-sm p-3`}>
            <dt className="eyebrow text-[10px] text-night-muted">Tu récord</dt>
            <dd className="mt-1.5">{hydrated ? <Led value={String(best).padStart(4, "0")} label={`${best.toLocaleString("es-AR")} puntos`} className="h-8!" /> : "—"}</dd>
          </div>
          <div className={`${NIGHT_PLATE} rounded-sm p-3`}>
            <dt className="eyebrow text-[10px] text-night-muted">Tu puesto de la semana</dt>
            <dd className="mt-1.5">{hydrated && mine ? <Led value={String(mine.position).padStart(2, "0")} label={`Puesto ${mine.position}`} className="h-8!" /> : <span className="font-mono text-sm font-bold">Sin partidas</span>}</dd>
          </div>
          <div className={`${NIGHT_PLATE} rounded-sm p-3`}>
            <dt className="eyebrow text-[10px] text-night-muted">Rival de la semana</dt>
            <dd className="mt-1 font-mono font-bold leading-tight">{rival ? <>{rival.row.alias} <span className="block text-xs font-normal text-night-muted">{rival.row.score.toLocaleString("es-AR")} pts · te faltan {rival.gap.toLocaleString("es-AR")}</span></> : "¡Vas primero!"}</dd>
          </div>
          <div className={`${NIGHT_PLATE} rounded-sm p-3`}>
            <dt className="eyebrow text-[10px] text-night-muted">Cupón de hoy</dt>
            <dd className="mt-1 font-bold leading-tight">{!hydrated ? "—" : today ? <>Ganado: <span className="text-volt">{today.label}</span></> : "Disponible"}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="light" size="lg" onClick={onPlay} disabled={!hydrated} className="min-w-[11rem]"><Play size={18} aria-hidden="true" className="fill-current" />Jugar</Button>
          <a href="#como-se-juega" className="min-h-11 content-center px-2 text-sm font-bold text-on-night underline underline-offset-4">Cómo se juega</a>
          <a href="#ranking" className="min-h-11 content-center px-2 text-sm font-bold text-on-night underline underline-offset-4">Ranking</a>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-[22rem] lg:max-w-md">
        <GameScene animate level={hydrated ? Math.max(0.2, fillLevel(best)) : 0.45} />
      </div>
    </section>
  );
}
