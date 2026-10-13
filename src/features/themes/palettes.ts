import { alpha } from "@/lib/color";
import { SKINS } from "./skins";

/**
 * Regla de marca (R1): la fecha NUNCA pinta el primario, los botones de compra, el fondo ni las superficies. Lo único
 * que cambia con `html[data-season]` es el acento de temporada, para filos, halos y la cinta del ticker:
 * - `--season-accent`: el color de la fecha (filos y luces);
 * - `--season-accent-ink`: el texto que va encima de ese color (AA, ver tests/unit/palettes.test.ts);
 * - `--season-glow`: el halo, el mismo color con transparencia.
 * Sin temática valen el color firma de la marca (app/box.css).
 */
export const SEASON_VARIABLES = ["--season-accent", "--season-accent-ink", "--season-glow"] as const;

export function seasonAccentVariables(id: keyof typeof SKINS): Record<(typeof SEASON_VARIABLES)[number], string> {
  const s = SKINS[id];
  return { "--season-accent": s.accent, "--season-accent-ink": s.accentInk, "--season-glow": alpha(s.accent, 0.45) };
}

/** CSS de los acentos de temporada (va en <head>, antes de pintar). */
export function seasonAccentCss(): string {
  return (Object.keys(SKINS) as (keyof typeof SKINS)[])
    .map((id) => `html[data-season="${id}"]{${Object.entries(seasonAccentVariables(id)).map(([k, v]) => `${k}:${v}`).join(";")}}`)
    .join("");
}
