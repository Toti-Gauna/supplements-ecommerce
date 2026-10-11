"use client";
import { motion } from "motion/react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import type { WheelSpinState } from "./useWheelSpin";
import { WheelCollar } from "./WheelCollar";
import { WheelDisc } from "./WheelDisc";
import { WheelHub } from "./WheelHub";
import { WheelRim, type RimLights } from "./WheelRim";

type DialState = Omit<WheelSpinState, "bindDisc">;

/** El disco ocupa el centro del dial; el aro de goma con las luces, el resto (ver `PLATE_R` en `WheelRim`). */
const DISC = "absolute inset-[4.4%] rounded-full";

const lightsFor = (s?: DialState): RimLights => (s?.landed != null || s?.justWon ? "win" : s?.spinning ? "chase" : "idle");

/**
 * La ruleta "Disco olímpico": disco de pesas que se gira tocándolo, arrastrándolo o con Enter; aro de goma con luces
 * LED, traba de barra como puntero (cabecea en cada gajo) y la maza de acero con "Girar" en el agujero de la barra.
 * Sin `state` es una vista quieta (portada del club y vista previa del panel).
 */
export function WheelDial({ state, discRef, segments, describedBy, className }: {
  state?: DialState; discRef?: WheelSpinState["bindDisc"]; segments: WheelSpinState["wheel"]["segments"]; describedBy?: string; className?: string;
}) {
  const canSpin = state?.canSpin ?? false;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    void state?.spin();
  };
  return (
    <div className={cn("relative aspect-square select-none", className)}>
      <div aria-hidden="true" className="absolute inset-[1%] rounded-full shadow-[0_34px_70px_-26px_rgb(0_0_0/0.95),0_0_0_1px_rgb(255_255_255/0.04)]" />
      {state ? (
        <motion.div ref={discRef} style={{ rotate: state.rotate, touchAction: "none", willChange: "transform" }} role="button" tabIndex={canSpin ? 0 : -1}
          aria-label={canSpin ? "Ruleta: tocala o arrastrala para girar" : "Ruleta"} aria-describedby={describedBy} aria-disabled={!canSpin}
          {...state.handlers} onKeyDown={onKeyDown}
          className={cn(DISC, "focus-visible:outline-4 focus-visible:outline-offset-[6px] focus-visible:outline-volt-soft", canSpin && "cursor-grab active:cursor-grabbing")}>
          <WheelDisc segments={segments} landed={state.landed} />
        </motion.div>
      ) : (
        <div className={DISC}><WheelDisc segments={segments} /></div>
      )}
      <WheelRim lights={lightsFor(state)} dir={state?.dir} />
      <WheelCollar kick={state?.kick} />
      <WheelHub onSpin={state && canSpin ? () => void state.spin() : undefined} />
    </div>
  );
}
