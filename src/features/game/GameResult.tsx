"use client";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/atoms/Button";
import { Counter } from "@/components/motion/Counter";
import { formatDate } from "@/lib/date";
import styles from "./game.module.css";
import { GamePrizeTicket } from "./GamePrizeTicket";
import type { FinishedGame } from "./useGameFinish";

function Prize({ outcome }: { outcome: FinishedGame["outcome"] }) {
  switch (outcome.kind) {
    case "won":
      return (
        <div className="flex flex-col gap-3">
          <p className="font-display text-2xl leading-tight">Ganaste <span className="text-volt">{outcome.tier.label}</span></p>
          <div className="text-ink"><GamePrizeTicket code={outcome.coupon.code} badge="Ganado hoy" /></div>
          <p className="text-xs text-night-muted">Ya está en Mis cupones. Un uso, vence el {formatDate(outcome.coupon.endsAt!)}.</p>
        </div>
      );
    case "already": {
      const better = outcome.tier && outcome.tier.id !== outcome.claimed.tierId ? ` Con este puntaje llegabas a ${outcome.tier.label}.` : "";
      return (
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <p className="font-bold">Hoy ya ganaste tu cupón</p>
          <p className="mt-1 text-sm text-night-muted">
            {outcome.claimed.label} · <span className="font-lab">{outcome.claimed.code}</span>. El cupón es uno por día: mañana podés ganar otro.{better}
          </p>
          <Link href="/cupones/" className="mt-2 inline-block text-sm font-bold text-volt underline underline-offset-4">Ver mis cupones</Link>
        </div>
      );
    }
    case "below":
      return (
        <p className="rounded-2xl bg-white/5 p-4 text-sm ring-1 ring-white/10">
          {outcome.next ? <>Te faltaron <strong className="text-volt">{outcome.next.missing.toLocaleString("es-AR")} puntos</strong> para {outcome.next.tier.label}. ¡Otra!</> : "Sin premio esta vez."}
        </p>
      );
    case "inactive":
      return <p className="text-sm text-night-muted">Los premios del juego están pausados: jugá por el récord.</p>;
    case "invalid":
      return <p className="text-sm text-night-muted">No pudimos validar este puntaje, así que no hay premio.</p>;
  }
}

/** Fin de la partida: puntaje, récord, premio alcanzado y qué hacer después. El foco entra al título. */
export function GameResult({ result, best, onReplay, onExit }: { result: FinishedGame; best: number; onReplay: () => void; onExit: () => void }) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, []);
  const { summary, newBest } = result;
  return (
    <div className="absolute inset-0 overflow-y-auto bg-night/75 px-4 py-5 backdrop-blur-sm">
      <section aria-labelledby="game-result-title" className={`${styles.panel} mx-auto flex min-h-full w-full max-w-sm flex-col justify-center gap-5`}>
        <div>
          <p className="eyebrow text-volt">{summary.reason === "lives" ? "Sin vidas" : "¡Tiempo!"}</p>
          <h2 ref={title} id="game-result-title" tabIndex={-1} className="font-display mt-1 text-[clamp(2.6rem,12vw,3.6rem)] leading-none outline-none">
            <Counter value={summary.score} /> <span className="text-xl text-night-muted">puntos</span>
          </h2>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-night-muted">
            {newBest ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-volt px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-night"><Trophy size={13} aria-hidden="true" />Nuevo récord</span>
            ) : <span>Récord: {best.toLocaleString("es-AR")}</span>}
            <span>Atrapaste {summary.caught} · Combo máximo {summary.bestCombo}</span>
          </p>
        </div>
        <Prize outcome={result.outcome} />
        <div className="flex flex-col gap-2">
          <Button variant={result.outcome.kind === "won" ? "dark" : "light"} size="lg" onClick={onReplay}><RotateCcw size={18} aria-hidden="true" />Jugar de nuevo</Button>
          <Button variant="dark" onClick={onExit}><ArrowLeft size={18} aria-hidden="true" />Volver</Button>
        </div>
      </section>
    </div>
  );
}
