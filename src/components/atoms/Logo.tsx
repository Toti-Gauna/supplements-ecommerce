import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { LOGO_VIEWBOX, logoPaths } from "@/config/logo";
import { cn } from "@/lib/cn";

/**
 * Logo de la marca (sale de `brand`, ver src/config/logo.ts): el símbolo (rayo, o "V" con rayo) y el nombre.
 * `LOGO_STROKE_PATH` es null cuando el símbolo es solo el rayo.
 */
export { LOGO_VIEWBOX };
const paths = logoPaths(brand);
export const LOGO_STROKE_PATH = paths.stroke;
export const LOGO_BOLT = paths.bolt;

/** `duo`: el rayo en el color firma y el trazo en el color del texto (como en la marca). */
export function LogoMark({ className, duo = true }: { className?: string; duo?: boolean }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden="true" className={cn("h-8 w-8 text-ink", className)}>
      {LOGO_STROKE_PATH && <path d={LOGO_STROKE_PATH} fill="currentColor" />}
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
