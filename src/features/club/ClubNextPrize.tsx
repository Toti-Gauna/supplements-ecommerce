"use client";
import { ArrowDown, Gift } from "lucide-react";
import { Led } from "@/components/atoms/Led";
import { PlateRing } from "@/components/molecules/PlateRing";
import type { RingState } from "@/demo/engine/club-ring";
import { DemoAccountButton } from "./DemoAccountButton";
import { NIGHT_PLATE } from "./styles";

/**
 * "Tu próximo premio" con el anillo de placas. Al invitado nunca le dice que desbloquea algo: no suma sin cuenta, así
 * que lo invita a crear la cuenta demo. Con cuenta muestra lo que ya puede reclamar o la misión más avanzada.
 */
export function ClubNextPrize({ ring }: { ring: RingState }) {
  const pct = ring.kind === "progress" ? ring.pct : ring.kind === "ready" || ring.kind === "done" ? 100 : 0;
  const label = ring.kind === "guest" ? "Tu carga: sin cuenta no suma" : ring.kind === "done" ? "Misiones completas" : `Progreso hacia ${ring.reward}`;
  return (
    <div className={`${NIGHT_PLATE} relative flex flex-col items-center gap-5 rounded-sm p-6 text-center sm:flex-row sm:text-left lg:flex-col lg:text-center`}>
      <span aria-hidden="true" className="bevel absolute -right-2 -top-3 grid h-11 w-11 place-items-center rounded-xs bg-(--season-accent) text-(--season-accent-ink)"><Gift size={20} /></span>
      <PlateRing pct={pct} label={label} className="w-40 shrink-0 sm:w-36 lg:w-44">
        <span className="flex flex-col items-center gap-0.5">
          <Led value={String(pct)} label={`${pct} %`} motion="none" className="h-8!" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-night-muted">% carga</span>
        </span>
      </PlateRing>
      <div className="min-w-0">
        <p className="eyebrow text-(--season-accent)">Tu próximo premio</p>
        {ring.kind === "guest" && (
          <>
            <p className="font-display mt-2 text-2xl leading-tight">Como invitado, todavía no sumás.</p>
            <p className="mt-1 text-sm text-night-muted">Creá la cuenta demo y cada compra, entreno y partida carga tu barra.</p>
            <DemoAccountButton size="sm" className="mt-4" />
          </>
        )}
        {ring.kind === "ready" && (
          <>
            <p className="font-display mt-2 text-2xl leading-tight">Listo para reclamar: {ring.reward}</p>
            <a href="#mis" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-volt underline underline-offset-4">Reclamalo en «{ring.title}» <ArrowDown size={15} aria-hidden="true" /></a>
          </>
        )}
        {ring.kind === "progress" && (
          <>
            <p className="font-display mt-2 text-2xl leading-tight">{ring.reward}</p>
            <p className="mt-1 text-sm text-night-muted">{ring.title} · {ring.detail}</p>
          </>
        )}
        {ring.kind === "done" && <p className="font-display mt-2 text-2xl leading-tight">Completaste todas las misiones. La semana que viene, más.</p>}
      </div>
    </div>
  );
}
