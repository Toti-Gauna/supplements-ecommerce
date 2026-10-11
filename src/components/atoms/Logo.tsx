import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

/**
 * Logo de VOLTA (marca de demo): una "V" cuyo trazo derecho es un rayo que baja más que el izquierdo.
 * Dos piezas rellenas en una grilla de 64: el trazo (`LOGO_STROKE_PATH`) y el rayo (`LOGO_BOLT`).
 */
export const LOGO_VIEWBOX = "0 0 64 64";
export const LOGO_STROKE_PATH = "M4 8h14l13 34-5 14z";
export const LOGO_BOLT = "M44 8h17L48 30h7L27 60l8.5-23H29z";

/** `duo`: el rayo en voltio y el trazo en el color del texto (como en la marca). */
export function LogoMark({ className, duo = true }: { className?: string; duo?: boolean }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden="true" className={cn("h-8 w-8 text-ink", className)}>
      <path d={LOGO_STROKE_PATH} fill="currentColor" />
      <path d={LOGO_BOLT} fill={duo ? "var(--logo-bolt, var(--color-volt))" : "currentColor"} />
    </svg>
  );
}

/** `topper`: adorno que se apoya sobre la marca (el sombrero de la temática vigente). */
export function Logo({ className, tone = "dark", topper }: { className?: string; tone?: "dark" | "light"; topper?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative">
        <LogoMark className={cn("h-8 w-8", tone === "light" ? "text-on-night" : "text-ink")} />
        {topper && <span className="animate-pop pointer-events-none absolute -right-2.5 -top-4 h-6 w-6 rotate-[14deg] drop-shadow-[0_2px_2px_rgb(0_0_0/0.25)]">{topper}</span>}
      </span>
      <span className={cn("font-display font-wide text-[1.32rem] uppercase leading-none tracking-[0.06em]", tone === "light" ? "text-on-night" : "text-ink")}>{brand.name}</span>
    </span>
  );
}
