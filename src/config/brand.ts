/**
 * Configuración de marca del cliente. En producción sale de la tabla `Setting`
 * y se aplica como variables CSS sin deploy. Acá vive la versión de demo.
 *
 * Paleta PROVISIONAL: derivada del logo ("M" sobre "V" en verde oliva sobre blanco)
 * y de las fotos de Instagram (madera clara). No es identidad final confirmada.
 */
/** Tipografía display (títulos editoriales). */
export const DISPLAY_FONT = "'Fraunces Variable', 'Iowan Old Style', Georgia, serif";

export interface BrandConfig {
  name: string;
  tagline: string;
  city: string;
  instagram: string | null;
  /** Número en formato internacional sin "+". null = no confirmado: el CTA abre WhatsApp sin destinatario. */
  whatsappNumber: string | null;
  email: string | null;
  legalName: string | null;
  cuit: string | null;
  paletteStatus: "provisional" | "confirmada";
  colors: {
    primary: string;
    primaryHover: string;
    onPrimary: string;
    accent: string;
    wood: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
  };
  fontFamily: string;
}

export const brand: BrandConfig = {
  name: "Volta",
  tagline: "Objetos hechos a pedido para tu casa y tu mascota",
  city: "Mar del Plata",
  instagram: "volta.mdp",
  whatsappNumber: null,
  email: null,
  legalName: null,
  cuit: null,
  paletteStatus: "provisional",
  colors: {
    primary: "#3a4527",
    primaryHover: "#283019",
    onPrimary: "#fffdf8",
    accent: "#ece2cf",
    wood: "#b98b5c",
    background: "#f6f1e8",
    surface: "#fffdf8",
    text: "#1c2016",
    muted: "#5d6050",
    border: "#e2d8c4",
  },
  fontFamily: "'Manrope Variable', ui-sans-serif, system-ui, sans-serif",
};

/** Variables CSS que consumen los tokens de Tailwind (ver app/globals.css). */
export function brandCssVariables(config: BrandConfig = brand): Record<string, string> {
  const c = config.colors;
  return {
    "--brand-primary": c.primary,
    "--brand-primary-hover": c.primaryHover,
    "--brand-on-primary": c.onPrimary,
    "--brand-accent": c.accent,
    "--brand-wood": c.wood,
    "--brand-background": c.background,
    "--brand-surface": c.surface,
    "--brand-text": c.text,
    "--brand-muted": c.muted,
    "--brand-border": c.border,
    "--brand-font": config.fontFamily,
    "--brand-display": DISPLAY_FONT,
  };
}
