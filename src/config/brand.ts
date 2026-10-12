import { CALENDAR_SVG, CHEVRON_SVG, cssIcon } from "@/lib/color";
import { pickBrand } from "./brands";
import type { BrandConfig, BrandPalette } from "./brands/types";

/**
 * Configuración de marca del cliente (marca blanca). En producción sale de la tabla `Setting` y se aplica como
 * variables CSS sin deploy. Acá vive la versión de demo: cada marca es un archivo en `src/config/brands/` y se elige
 * en el build con `NEXT_PUBLIC_BRAND` (por defecto VOLTA, inventada). Guía paso a paso: docs/marca-blanca.md.
 * Contraste AA de cada paleta en tests/unit/brand.test.ts.
 */
export type { BrandConfig, BrandInput, BrandPalette, BrandSignature } from "./brands/types";

/** Tipografía display (titulares): Archivo expandida. El ancho se pide con `font-stretch` en `font-display`. */
export const DISPLAY_FONT = "'Archivo Variable', 'Arial Black', ui-sans-serif, system-ui, sans-serif";
/** Datos de laboratorio: tabla nutricional, lote, vencimiento, precio por servicio. */
export const MONO_FONT = "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";

/** La marca de este build. `process.env.NEXT_PUBLIC_BRAND` se reemplaza por su valor al compilar. */
export const brand: BrandConfig = pickBrand(process.env.NEXT_PUBLIC_BRAND);

function paletteVariables(c: BrandPalette): Record<string, string> {
  return {
    "--brand-primary": c.primary,
    "--brand-primary-hover": c.primaryHover,
    "--brand-on-primary": c.onPrimary,
    "--brand-accent": c.accent,
    "--brand-ion": c.ion,
    "--brand-plasma": c.plasma,
    "--brand-background": c.background,
    "--brand-surface": c.surface,
    "--brand-text": c.text,
    "--brand-muted": c.muted,
    "--brand-border": c.border,
    "--c-night": c.night,
    "--c-night-2": c.night2,
    "--c-volt-ink": c.voltInk,
    "--chevron": cssIcon(CHEVRON_SVG, c.primary),
    "--calendar": cssIcon(CALENDAR_SVG, c.primary),
  };
}

const BOLT_SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><path d='M20 4 11 19h7l-3 13 10-17h-7z' fill='COLOR' fill-opacity='.05'/></svg>";

/** Variables CSS que consumen los tokens de Tailwind (ver app/globals.css). Oscuro por defecto. */
export function brandCssVariables(config: BrandConfig = brand): Record<string, string> {
  const s = config.signature;
  return {
    ...paletteVariables(config.colors),
    "--brand-volt": s.volt, "--brand-volt-soft": s.voltSoft, "--brand-glow": s.plasma, "--brand-spark": s.ion,
    "--brand-on-night": s.onNight, "--brand-night-muted": s.nightMuted, "--bolt-pattern": cssIcon(BOLT_SVG, s.volt),
    "--brand-font": config.fontFamily, "--brand-display": DISPLAY_FONT, "--brand-mono": MONO_FONT,
  };
}

const declarations = (vars: Record<string, string>) => Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";");

/**
 * Hoja de estilo de la marca para el <head>: oscuro en `:root` y claro con `data-theme="light"`.
 * Sin !important: las paletas de temporada (`html[data-season]`) la pisan con más especificidad.
 */
export function brandCss(config: BrandConfig = brand): string {
  return `:root{${declarations(brandCssVariables(config))}}html[data-theme="light"]{${declarations(paletteVariables(config.light))}}`;
}
