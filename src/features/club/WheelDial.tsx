"use client";
import { motion } from "motion/react";
import { LogoMark } from "@/components/atoms/Logo";
import { cn } from "@/lib/cn";
import type { WheelSpinState } from "./useWheelSpin";
import { WheelDisc } from "./WheelDisc";

const BULBS = 24;

/**
 * La ruleta: aro dorado con luces, disco que se gira tocándolo o arrastrándolo, puntero que golpea en cada gajo y,
 * en el centro, el botón "Girar". Sin `state` es una vista quieta (para la portada del club).
 */
export function WheelDial({ state, discRef, segments, className }: {
  state?: Omit<WheelSpinState, "bindDisc">; discRef?: WheelSpinState["bindDisc"]; segments: WheelSpinState["wheel"]["segments"]; className?: string;
}) {
  const spinning = state?.spinning ?? false;
  const justWon = state?.justWon ?? false;
  const canSpin = state?.canSpin ?? false;
  return (
    <div className={cn("relative aspect-square", className)}>
      <div aria-hidden="true" className="absolute -inset-3 rounded-full bg-[conic-gradient(from_0deg,#d2ad69,#8a6a2e,#d2ad69,#f6e7c4,#d2ad69)] p-[3px] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9),0_0_60px_-10px_rgb(210_173_105/0.35)]">
        <div className="h-full w-full rounded-full bg-night" />
      </div>
      <svg aria-hidden="true" viewBox="0 0 100 100" className="pointer-events-none absolute -inset-3 z-[1] h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)]">
        {Array.from({ length: BULBS }, (_, i) => {
          const a = (i / BULBS) * Math.PI * 2;
          return <circle key={i} cx={50 + 48.6 * Math.cos(a)} cy={50 + 48.6 * Math.sin(a)} r="1.15" fill="#fff4d6"
            className={justWon ? "bulb-win" : spinning ? "bulb-chase" : undefined} style={spinning ? { animationDelay: `${(i % 6) * -0.083}s` } : undefined} opacity={spinning || justWon ? 1 : i % 2 ? 0.45 : 0.85} />;
        })}
      </svg>
      {state ? (
        <motion.div ref={discRef} style={{ rotate: state.rotate, touchAction: "none" }} role="button" tabIndex={canSpin ? 0 : -1}
          aria-label={canSpin ? "Ruleta: tocala o arrastrala para girar" : "Ruleta"} aria-disabled={!canSpin} {...state.handlers}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void state.spin(); } }}
          className={cn("absolute inset-0 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#f3dca6]", canSpin && "cursor-grab active:cursor-grabbing")}>
          <WheelDisc segments={segments} />
        </motion.div>
      ) : (
        <div className="absolute inset-0"><WheelDisc segments={segments} /></div>
      )}
      <motion.svg aria-hidden="true" viewBox="0 0 40 52" style={{ rotate: state?.kick ?? 0, transformOrigin: "50% 30%" }} className="pointer-events-none absolute left-1/2 top-[-22px] z-10 w-[9%] min-w-7 -translate-x-1/2 drop-shadow-[0_6px_8px_rgb(0_0_0/0.35)]">
        <defs><linearGradient id="pin-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e2b0" /><stop offset=".5" stopColor="#d2ad69" /><stop offset="1" stopColor="#8a6a2e" /></linearGradient></defs>
        <path d="M20 50 4.5 22A16 16 0 1 1 35.5 22Z" fill="url(#pin-gold)" stroke="#1c2016" strokeWidth="1.5" />
        <circle cx="20" cy="17" r="6" fill="#1c2016" />
      </motion.svg>
      {state && canSpin ? (
        <button type="button" onClick={() => void state.spin()} aria-label="Girar la ruleta"
          className="wheel-hub absolute inset-[36%] z-10 grid place-items-center rounded-full border-4 border-brass bg-[radial-gradient(circle_at_35%_30%,#3a4428,#14170f)] text-brass shadow-[0_8px_24px_-6px_rgb(0_0_0/0.8)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#f3dca6]">
          <span className="flex flex-col items-center leading-none">
            <LogoMark className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="mt-1 text-[11px] font-extrabold tracking-[0.22em] sm:text-xs">GIRAR</span>
          </span>
        </button>
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-[38%] z-10 grid place-items-center rounded-full border-4 border-brass bg-night">
          <LogoMark className="h-1/2 w-1/2 text-brass" />
        </div>
      )}
    </div>
  );
}
