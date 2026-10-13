"use client";
import { Heart, Pause, Zap } from "lucide-react";
import { gameRules } from "@/demo/fixtures/game";
import { cn } from "@/lib/cn";
import { usePrizeTiers } from "./usePrizeTiers";
import type { Hud } from "./useShakerRush";

const CELLS = 9;

/**
 * HUD de la partida en DOM (se lee mejor que dibujado y lo encuentra el lector de pantalla): pausa, puntos, tiempo
 * como batería que se descarga, vidas, combo, ×2 y el premio alcanzado. Nada depende solo del color: todo tiene texto.
 */
export function GameHud({ hud, onPause }: { hud: Hud; onPause: () => void }) {
  const { tiers } = usePrizeTiers();
  const lit = Math.ceil((hud.timeLeft / gameRules.durationSec) * CELLS);
  const low = hud.timeLeft <= 10;
  const reached = hud.tier > 0 ? tiers[hud.tier - 1] : null;
  const next = tiers[hud.tier];
  return (
    <div className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onPause} aria-label="Pausar (Escape)" disabled={hud.phase === "over" || hud.phase === "paused"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-white/10 ring-1 ring-white/15 transition hover:bg-white/20 disabled:opacity-40">
          <Pause size={18} aria-hidden="true" />
        </button>
        <div className="min-w-[4.5rem]">
          <p className="eyebrow text-[10px] text-night-muted">Puntos</p>
          <p className="font-lab text-2xl font-bold leading-none tabular-nums text-volt">{hud.score.toLocaleString("es-AR")}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow flex justify-between text-[10px] text-night-muted"><span>Tiempo</span><span className={cn("tabular-nums", low && "text-[var(--game-alert)]")}>{hud.timeLeft} s</span></p>
          <div role="progressbar" aria-label="Tiempo restante" aria-valuemin={0} aria-valuemax={gameRules.durationSec} aria-valuenow={hud.timeLeft} aria-valuetext={`${hud.timeLeft} segundos`}
            className="mt-1 flex gap-[3px] rounded-md p-[3px] ring-1 ring-white/20">
            {Array.from({ length: CELLS }, (_, i) => (
              <span key={i} className={cn("h-2 flex-1 rounded-[2px]", i < lit ? (low ? "bg-[var(--game-alert)]" : "bg-volt") : "bg-white/10")} />
            ))}
          </div>
        </div>
        <p role="img" aria-label={`Vidas: ${hud.lives} de ${gameRules.lives}`} className="flex shrink-0 gap-0.5">
          {Array.from({ length: gameRules.lives }, (_, i) => (
            <Heart key={i} size={18} aria-hidden="true" className={i < hud.lives ? "fill-volt text-volt" : "text-white/30"} />
          ))}
        </p>
      </div>
      <div className="flex min-h-9 flex-wrap items-center justify-center gap-2 py-1.5 text-xs font-bold">
        {hud.combo >= 2 && (
          <span className="rounded-sm bg-white/10 px-3 py-1 font-lab tabular-nums">Combo {hud.combo}{hud.mult > 1 && <span className="text-volt"> · ×{hud.mult}</span>}</span>
        )}
        {hud.boost > 0 && (
          <span className="inline-flex items-center gap-1 rounded-sm bg-volt px-3 py-1 font-lab text-night"><Zap size={13} aria-hidden="true" className="fill-current" />×2 · {hud.boost} s</span>
        )}
        <span className="rounded-sm px-3 py-1 text-night-muted ring-1 ring-white/15">
          {reached ? <>Premio: <span className="text-volt">{reached.label}</span></> : next ? `Premio desde ${next.minScore} pts` : null}
          {reached && next ? ` · ${next.label} en ${next.minScore}` : ""}
        </span>
      </div>
    </div>
  );
}
