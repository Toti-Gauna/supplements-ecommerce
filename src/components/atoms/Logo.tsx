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

/**
 * Logo de la tienda: el símbolo en una placa de acero atornillada y el nombre en la display. Sin adornos de temporada
 * (regla de marca: la fecha no toca el logo). `tone="light"` para bandas noche.
 */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const ink = tone === "light" ? "text-on-night" : "text-ink";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xs", tone === "light" ? "bevel bg-night-2" : "plate")}>
        <LogoMark className={cn("h-6 w-6", ink)} />
      </span>
      <span className={cn("font-display font-wide text-[1.7rem] leading-none", ink)}>{brand.name}</span>
    </span>
  );
}
