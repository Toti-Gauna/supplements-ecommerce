/**
 * Configuración de marca del cliente (marca blanca). En producción sale de la tabla `Setting`
 * y se aplica como variables CSS sin deploy. Acá vive la versión de demo.
 *
 * VOLTA es una marca INVENTADA para la demo: para mostrársela a otra tienda se cambian nombre, contacto
 * y colores en este archivo. Identidad "Laboratorio eléctrico": grafito profundo, verde voltio y violeta plasma
 * (ver docs/tono-visual.md). Contraste AA de cada par en tests/unit/brand.test.ts.
 */
/** Tipografía display (titulares): Archivo expandida. El ancho se pide con `font-stretch` en `font-display`. */
export const DISPLAY_FONT = "'Archivo Variable', 'Arial Black', ui-sans-serif, system-ui, sans-serif";
/** Datos de laboratorio: tabla nutricional, lote, vencimiento, precio por servicio. */
export const MONO_FONT = "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";

export interface BrandPalette {
  primary: string;
  primaryHover: string;
  onPrimary: string;
  /** Superficie suave: chips, hover, fondos de campos. */
  accent: string;
  /** Acento decorativo frío (datos, brillos). No es texto sobre fondo claro. */
  ion: string;
  /** Acento de energía (brillos, degradés). */
  plasma: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  /** Bandas oscuras (club, pie, menú del panel): oscuras en los dos modos. */
  night: string;
  night2: string;
  /** Texto de acento sobre el fondo (links destacados, cifras). */
  voltInk: string;
}

export interface BrandConfig {
  name: string;
  /** Bajada corta debajo del nombre (header del panel, pie). */
  descriptor: string;
  tagline: string;
  city: string;
  instagram: string | null;
  /** Número en formato internacional sin "+". null = no confirmado: el CTA abre WhatsApp sin destinatario. */
  whatsappNumber: string | null;
  email: string | null;
  legalName: string | null;
  cuit: string | null;
  paletteStatus: "provisional" | "confirmada";
  /** Modo con el que abre la tienda si la persona no eligió otro. */
  defaultMode: "dark" | "light";
  /** Paleta del modo oscuro (el de la marca). */
  colors: BrandPalette;
  /** Paleta del modo claro "Tiza". */
  light: BrandPalette;
  fontFamily: string;
}

export const brand: BrandConfig = {
  name: "Volta",
  descriptor: "Suplementos",
  tagline: "Suplementos deportivos con energía de verdad",
  city: "Mar del Plata",
  instagram: "volta.mdp",
  whatsappNumber: null,
  email: null,
  legalName: null,
  cuit: null,
  paletteStatus: "provisional",
  defaultMode: "dark",
  colors: {
    primary: "#c8ff2e",
    primaryHover: "#d9ff6e",
    onPrimary: "#0a0c10",
    accent: "#1a1f28",
    ion: "#2ee6d6",
    plasma: "#8b72ff",
    background: "#0a0c10",
    surface: "#12161d",
    text: "#eef1f5",
    muted: "#9aa4b2",
    border: "#252b36",
    night: "#050608",
    night2: "#0e1117",
    voltInk: "#c8ff2e",
  },
  light: {
    primary: "#0b0d10",
    primaryHover: "#1c2129",
    onPrimary: "#c8ff2e",
    accent: "#e6eae0",
    ion: "#0fa89b",
    plasma: "#5a3fe6",
    background: "#f2f3ee",
    surface: "#ffffff",
    text: "#0b0d10",
    muted: "#545c68",
    border: "#daded4",
    night: "#0b0d10",
    night2: "#161a22",
    voltInk: "#4e6e00",
  },
  fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif",
};

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
  };
}

/** Variables CSS que consumen los tokens de Tailwind (ver app/globals.css). Oscuro por defecto. */
export function brandCssVariables(config: BrandConfig = brand): Record<string, string> {
  return { ...paletteVariables(config.colors), "--brand-font": config.fontFamily, "--brand-display": DISPLAY_FONT, "--brand-mono": MONO_FONT };
}

const declarations = (vars: Record<string, string>) => Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";");

/**
 * Hoja de estilo de la marca para el <head>: oscuro en `:root` y claro con `data-theme="light"`.
 * Sin !important: las paletas de temporada (`html[data-season]`) la pisan con más especificidad.
 */
export function brandCss(config: BrandConfig = brand): string {
  return `:root{${declarations(brandCssVariables(config))}}html[data-theme="light"]{${declarations(paletteVariables(config.light))}}`;
}
