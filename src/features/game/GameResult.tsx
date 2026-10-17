"use client";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/atoms/Button";
import { Led } from "@/components/atoms/Led";
import styles from "./game.module.css";
import { GameResultPrize } from "./GameResultPrize";
import { ShareScore } from "./ShareScore";
import type { FinishedGame } from "./useGameFinish";
import { ownAlias, useWeeklyRanking } from "./useWeeklyRanking";
import { useAccount } from "@/stores/account";

/**
 * Fin de la partida estilo arcade: el puntaje en el marcador LED, récord y puesto de la semana, el premio con "Usar
 * cupón ahora", "Compartir puntaje" (tarjeta 9:16) y qué hacer después. El foco entra al título.
 */
export function GameResult({ result, best, onReplay, onExit }: { result: FinishedGame; best: number; onReplay: () => void; onExit: () => void }) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, []);
  const { summary, newBest, outcome } = result;
  const { mine } = useWeeklyRanking();
  const name = useAccount((s) => s.user?.name);
  const prize = outcome.kind === "won" ? outcome.tier.label : outcome.kind === "already" ? outcome.claimed.label : null;
  const score = summary.score.toLocaleString("es-AR");
  return (
    <div className="led-dark absolute inset-0 overflow-y-auto bg-night/85 px-4 py-5 backdrop-blur-sm">
      <section aria-labelledby="game-result-title" className={`${styles.panel} mx-auto flex min-h-full w-full max-w-sm flex-col justify-center gap-5`}>
        <div className="text-center">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-volt">{summary.reason === "lives" ? "Game over · sin vidas" : "¡Tiempo!"}</p>
          <h2 ref={title} id="game-result-title" tabIndex={-1} aria-label={`${score} puntos`} className="mt-3 flex flex-col items-center gap-1 outline-none">
            <Led value={score} label={`${score} puntos`} motion="flip" className="h-16! max-w-full sm:h-20!" />
            <span aria-hidden="true" className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-night-muted">puntos</span>
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-night-muted">
            {newBest ? (
              <span className="inline-flex items-center gap-1 rounded-sm bg-volt px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-night"><Trophy size={13} aria-hidden="true" />Nuevo récord</span>
            ) : <span>Récord: {best.toLocaleString("es-AR")}</span>}
            {mine && <span className="rounded-sm px-2 py-1 ring-1 ring-white/20">Puesto {mine.position}.º de la semana</span>}
          </div>
          <p className="mt-2 text-xs text-night-muted">Atrapaste {summary.caught} · Combo máximo {summary.bestCombo}</p>
        </div>
        <GameResultPrize outcome={outcome} />
        <div className="flex flex-col gap-2">
          <ShareScore data={{ score: summary.score, best: Math.max(best, summary.score), newBest, position: mine?.position ?? null, prize, alias: ownAlias(name) }} />
          <Button variant="dark" size="lg" onClick={onReplay}><RotateCcw size={18} aria-hidden="true" />Jugar de nuevo</Button>
          <Button variant="dark" onClick={onExit}><ArrowLeft size={18} aria-hidden="true" />Volver</Button>
        </div>
      </section>
    </div>
  );
}
