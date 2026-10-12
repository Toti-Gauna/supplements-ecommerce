"use client";
import { useCallback, useState } from "react";
import type { GameSummary } from "@/demo/engine/game";
import { useGame } from "@/stores/game";
import { LegendAside, PrizeAside } from "./GameAsides";
import { GameHud } from "./GameHud";
import { Countdown, PauseMenu } from "./GameOverlays";
import { GameResult } from "./GameResult";
import { StageShell } from "./StageShell";
import { resultText, useGameFinish, type FinishedGame } from "./useGameFinish";
import { useShakerRush } from "./useShakerRush";

/**
 * La partida a pantalla completa: HUD arriba, campo con el canvas y las capas (cuenta, pausa, resultado). El campo
 * no deja que el navegador use el gesto (touch-action: none): arrastrar mueve el shaker, nunca la página.
 */
export function GameStage({ onClose }: { onClose: () => void }) {
  const finish = useGameFinish();
  const best = useGame((s) => s.best);
  const [result, setResult] = useState<FinishedGame | null>(null);
  const [round, setRound] = useState(0);
  const onEnd = useCallback((summary: GameSummary) => setResult(finish(summary)), [finish]);
  const { bindArena, bindCanvas, pointer, hud, announce, start, pause, resume } = useShakerRush(onEnd, onClose);
  const replay = () => { setResult(null); setRound((r) => r + 1); start(); };
  return (
    <StageShell label="Shaker Rush">
      <LegendAside />
      <div className="flex h-full w-full max-w-[30rem] flex-col">
        <GameHud hud={hud} onPause={pause} />
        <div ref={bindArena} {...pointer} className="relative min-h-0 flex-1 touch-none select-none overscroll-none [-webkit-touch-callout:none]">
          <canvas ref={bindCanvas} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
          {hud.phase === "countdown" && <Countdown count={hud.count} first={round === 0 && hud.score === 0} />}
          {hud.phase === "paused" && <PauseMenu onResume={resume} onRestart={replay} onExit={onClose} />}
          {hud.phase === "over" && result && <GameResult result={result} best={best} onReplay={replay} onExit={onClose} />}
        </div>
      </div>
      <PrizeAside score={hud.score} />
      {/* Un solo canal en vivo para toda la partida: vidas, rayo, pausa y, al final, el resultado. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">{result ? resultText(result) : announce}</p>
    </StageShell>
  );
}
