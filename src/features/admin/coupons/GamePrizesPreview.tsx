"use client";
import { Check, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { scorePreview, tierSentence } from "@/demo/admin/game-prizes";
import { sortedTiers } from "@/demo/engine/game-prize";
import type { GamePrizeConfig } from "@/demo/fixtures/game";
import { ShakerArt } from "@/features/game/art/GameGlyph";
import { cn } from "@/lib/cn";

/**
 * Vista previa de los premios en edición: el shaker con el batido al puntaje de prueba, la escalera de niveles como
 * en el juego y la frase de lo que se gana ("Con 800 puntos ganás 10 % OFF").
 */
export function GamePrizesPreview({ config, valid }: { config: GamePrizeConfig; valid: boolean }) {
  const tiers = sortedTiers(config.tiers);
  const top = Math.max(1, tiers.at(-1)?.minScore ?? 1);
  const max = Math.ceil((top * 1.25) / 50) * 50;
  const [score, setScore] = useState(tiers[1]?.minScore ?? tiers[0]?.minScore ?? 0);
  const shown = Math.min(score, max);
  return (
    <section aria-labelledby="gp-preview" className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-night p-5 text-on-night sm:p-6">
      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgb(139_114_255/0.35),transparent)]" />
      <p id="gp-preview" className="eyebrow relative flex items-center gap-2 text-volt"><Gamepad2 size={14} aria-hidden="true" />Vista previa · Shaker Rush</p>
      {!valid ? <p className="relative text-sm text-night-muted">Corregí los valores marcados para ver la vista previa.</p> : (
        <>
          <div className="relative grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-4">
            <svg viewBox="-48 -14 96 132" aria-hidden="true" className="h-auto w-full"><ShakerArt level={config.active ? Math.min(1, shown / top) : 0} /></svg>
            <ol aria-label="Niveles de premio" className="flex flex-col-reverse gap-2">
              {tiers.map((t) => {
                const reached = config.active && shown >= t.minScore;
                return (
                  <li key={t.id} className={cn("rounded-2xl px-3 py-2 ring-1", reached ? "bg-volt/10 ring-volt/60" : "ring-white/10")}>
                    <span className="font-lab block text-xs text-night-muted">{t.minScore.toLocaleString("es-AR")} pts · vence a los {t.validDays} días</span>
                    <span className="font-display flex items-center gap-1.5 text-lg">{reached && <Check size={15} aria-label="alcanzado" className="text-volt" />}{t.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="relative flex flex-col gap-1.5">
            <label htmlFor="gp-score" className="text-sm font-bold">Probá un puntaje: <span className="font-lab text-volt">{shown.toLocaleString("es-AR")}</span></label>
            <input id="gp-score" type="range" min={0} max={max} step={50} value={shown} onChange={(e) => setScore(Number(e.target.value))} className="w-full accent-[var(--color-volt)]" />
            <p aria-live="polite" className="font-display text-xl leading-snug" data-game-preview>{scorePreview(shown, config)}</p>
          </div>
          <ul aria-label="Premios en palabras" className="relative flex flex-col gap-1 text-sm text-night-muted">
            {tiers.map((t) => <li key={t.id}>{tierSentence(t)}</li>)}
          </ul>
        </>
      )}
      <p className="relative text-xs text-night-muted">El cupón se gana una vez por día por navegador, con la primera partida que llega a un nivel. En producción lo emite el servidor.</p>
    </section>
  );
}
