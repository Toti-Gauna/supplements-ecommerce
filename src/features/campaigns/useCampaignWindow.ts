"use client";
import { useCallback, useMemo, useState } from "react";
import { demoNow, shopNow } from "@/demo/clock";
import { campaignWindow, previewDay, type CampaignRange } from "@/demo/engine/campaign-window";

/** Fase que simula la vista previa: el primer día de la campaña ("live") o su sala de espera ("waiting"). */
export type CampaignPhase = "live" | "waiting";

/**
 * Desfase del reloj de una campaña (ms). Sin fase es 0: la hora real (la misma con la que el modo automático elige la
 * fecha). Con fase, la hora real de Buenos Aires puesta en el día que se simula (`demoNow`): así la vista previa de
 * Black Friday cuenta los días que faltan para que cierre, aunque se muestre en octubre.
 */
export function campaignOffset(range: CampaignRange, phase: CampaignPhase | null): number {
  if (!phase) return 0;
  const real = shopNow();
  return Date.parse(demoNow(new Date(real), previewDay(range, phase))) - real;
}

/** Ventana de la campaña con su reloj; `refresh` la recalcula cuando una cuenta regresiva llega a cero. */
export function useCampaignWindow(range: CampaignRange, phase: CampaignPhase | null) {
  const { startsOn, endsOn, waitingRoom } = range;
  const [tick, setTick] = useState(0);
  const { offset, win } = useMemo(() => {
    const r = { startsOn, endsOn, waitingRoom };
    const off = campaignOffset(r, phase);
    return { offset: off, win: campaignWindow(r, shopNow() + off) };
    // `tick` vuelve a leer el reloj.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startsOn, endsOn, waitingRoom, phase, tick]);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  return { win, offset, simulated: phase !== null, refresh };
}
