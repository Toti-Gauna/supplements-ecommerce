"use client";
import { CalendarClock, Check, ShieldCheck } from "lucide-react";
import { gamePrizes } from "@/demo/fixtures/game";
import { cn } from "@/lib/cn";
import { GamePrizeTicket } from "./GamePrizeTicket";
import { useGameStats } from "./useGameStats";

const tiers = [...gamePrizes.tiers].sort((a, b) => a.minScore - b.minScore);

/** Tabla de premios por puntaje (de los fixtures), las reglas del cupón diario y el cupón de hoy si ya se ganó. */
export function GamePrizeTable() {
  const { hydrated, best, today } = useGameStats();
  return (
    <section aria-labelledby="premios-juego" className="flex flex-col gap-6">
      <div>
        <p className="eyebrow text-volt-ink">Premios por puntaje</p>
        <h2 id="premios-juego" className="font-display mt-2 text-4xl leading-tight sm:text-5xl">Cargá el shaker, ganá un cupón</h2>
        <p className="mt-2 max-w-xl text-muted">Las marcas del vaso son los niveles: el batido sube con tus puntos.</p>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {tiers.map((t, i) => {
          const reached = hydrated && best >= t.minScore;
          return (
            <li key={t.id} className="flex items-center gap-4 rounded-[1.5rem] bg-night p-5 text-on-night">
              <span aria-hidden="true" className="flex h-12 w-7 shrink-0 flex-col-reverse gap-[3px] rounded-md p-[3px] ring-1 ring-white/25">
                {tiers.map((_, j) => <span key={j} className={cn("flex-1 rounded-[2px]", j <= i ? "bg-volt shadow-[0_0_8px_rgb(200_255_46/0.6)]" : "bg-white/10")} />)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-lab block text-xs text-night-muted">Nivel {i + 1} · desde {t.minScore.toLocaleString("es-AR")} pts</span>
                <span className="font-display block text-2xl">{t.label}</span>
                {reached && <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-volt"><Check size={14} aria-hidden="true" />Tu récord ya llega</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <ul className="grid gap-3 text-sm sm:grid-cols-2">
        <li className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
          <CalendarClock size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
          <span>Jugá todas las veces que quieras: <strong>el cupón se gana una vez por día</strong>, con la primera partida que llegue a un nivel. Es de un uso y vence a los {gamePrizes.validDays} días.</span>
        </li>
        <li className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
          <ShieldCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
          <span>Demo: el límite diario es por navegador y se reinicia con “Reiniciar demo”. En la tienda real es por cuenta y el servidor valida el puntaje.</span>
        </li>
      </ul>
      {today && (
        <div className="max-w-md">
          <p className="eyebrow mb-2 text-volt-ink">Tu cupón de hoy</p>
          <GamePrizeTicket code={today.code} />
        </div>
      )}
    </section>
  );
}
