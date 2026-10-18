/**
 * Identidad de Eclipse (dirección «Efemérides»): tokens copiados de `eclipse-email-kit/data/brand.json`, que a su vez
 * salen de `eclipse-web/app/globals.css`. Es la marca de quien firma el trailer, no la de la tienda: por eso no sale de
 * la ficha de marca de la app.
 */
export const EC = {
  void: "#05050a", night: "#0c0c14", ash: "#1a1a24", corona: "#f5b942", flare: "#ffe8b0", dawn: "#f4efe6", day: "#fbf9f6",
  ink: "#111114", mist: "#9a97a6", muted: "#5b5866", deep: "#8a5a00", dim: "#c9c4bc", soft: "#f3efe8", paper: "#ffffff",
  hairdark: "#1f1f28", ruledark: "#34333b", hairlight: "#ddd7cd", rulelight: "#c4beb4",
} as const;

/** Familias (variables que define `app/trailer/[pieza]/fonts.ts`): Geist, Instrument Serif y Geist Mono. */
export const FONT = {
  sans: "var(--font-ec-sans), ui-sans-serif, system-ui, sans-serif",
  serif: "var(--font-ec-serif), Georgia, 'Times New Roman', serif",
  mono: "var(--font-ec-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

/** Contacto que muestra el cierre (lo dio Ignacio; reemplaza al "contacto pendiente" del kit de emails). */
export const CONTACT = { phone: "223-446 7881", whatsapp: "5492234467881", demoUrl: "toti-gauna.github.io/supplements-ecommerce" } as const;
