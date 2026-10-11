"use client";
import { Gift } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { useUi } from "@/stores/ui";
import { WheelDial } from "./WheelDial";
import { WheelPrizeTicket } from "./WheelPrizeTicket";

/**
 * El disco olímpico en la página del club: vista quieta sobre un halo plasma y el botón que lo abre a pantalla
 * completa (o el premio ya ganado). El disco mismo también abre la ruleta con un toque (el botón es el acceso real).
 */
export function WheelTeaser() {
  const hydrated = useHydrated();
  const wheel = useDemoData((d) => d.wheel);
  const prize = useAccount((s) => s.wheelPrize);
  const setWheel = useUi((s) => s.setWheel);
  return (
    <div className="flex flex-col items-center gap-6">
      <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setWheel(true)} className="group relative w-full max-w-[320px] pt-3">
        <span className="absolute inset-[-6%] rounded-full bg-[radial-gradient(closest-side,rgb(139_114_255/0.32),rgb(139_114_255/0.08)_70%,transparent)]" />
        <WheelDial segments={wheel.segments} className="w-full transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" />
      </button>
      {hydrated && prize ? (
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-2 text-center text-volt-ink">Tu premio</p>
          <WheelPrizeTicket />
          <Button variant="secondary" className="mt-3 w-full" onClick={() => setWheel(true)}>Ver mi premio</Button>
        </div>
      ) : (
        <Button size="lg" className="w-full max-w-sm" disabled={!wheel.active} onClick={() => setWheel(true)}>
          <Gift size={18} aria-hidden="true" /> {wheel.active ? "Girar la ruleta" : "Ruleta pausada"}
        </Button>
      )}
      <p className="max-w-sm text-center text-xs text-muted">Demo: un giro por navegador (se reinicia con “Reiniciar demo”). En producción, un giro por cuenta y sorteo en el servidor.</p>
    </div>
  );
}
