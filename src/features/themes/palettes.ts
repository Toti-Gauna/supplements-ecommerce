import type { SeasonId } from "@/demo/types";
import { CALENDAR_SVG, CHEVRON_SVG, cssIcon } from "@/lib/color";

/**
 * Colores de la tienda durante cada temática (Fase 5). Pisan TODOS los
 * tokens con `html[data-season]`: header, fondo, tarjetas, el "estudio" detrás de cada producto, bandas y
 * controles cambian sin tocar componentes. Las fechas nocturnas son **inmersivas**: oscuras también en modo claro.
 * El contraste AA de cada par se verifica en tests/unit/palettes.test.ts.
 */
export interface Palette {
  scheme: "light" | "dark";
  primary: string; primaryHover: string; onPrimary: string; accent: string;
  background: string; surface: string; text: string; muted: string; border: string;
  night: string; night2: string; voltInk: string;
  /** Degradado del estudio de fotos de los productos: arriba, medio, piso. */
  studio: [string, string, string];
}

type Pair = { light: Palette; dark: Palette };
const p = (scheme: Palette["scheme"], v: string, studio: string): Palette => {
  const [primary, primaryHover, onPrimary, accent, background, surface, text, muted, border, night, night2, voltInk] = v.split(" ") as [string, string, string, string, string, string, string, string, string, string, string, string];
  return { scheme, primary, primaryHover, onPrimary, accent, background, surface, text, muted, border, night, night2, voltInk, studio: studio.split(" ") as [string, string, string] };
};
const immersive = (v: string, studio: string): Pair => { const d = p("dark", v, studio); return { light: d, dark: d }; };

// primary · hover · texto sobre primary · acento · fondo · superficie · texto · apagado · borde · noche · noche 2 · acento de texto (volt-ink)
export const PALETTES: Record<SeasonId, Pair> = {
  "dia-de-la-madre": {
    light: p("light", "#9b3563 #842c54 #fff7fa #f7dce7 #fbeaf1 #fff7fa #2a1520 #6e5060 #efd0dd #4a1830 #5e2440 #8a3d62", "#fbe3ec #f3d0de #e8bccd"),
    dark: p("dark", "#f5a8c6 #f8c0d6 #3a1226 #301a24 #160b10 #211118 #f7e9ef #c7a9b6 #3e2330 #0c0508 #1c0d14 #f3b3cd", "#3a1d2a #2e1621 #221018"),
  },
  // Monster pump: noche violeta con naranja de calabaza.
  halloween: immersive("#ffa64d #ffb96f #1d1426 #2a1f38 #120b1a #1c1228 #f2e9f7 #b7a8c6 #352646 #08050d #160e21 #ffb877", "#3d2554 #2b1a3d #1d1229"),
  // CyberMonday: placa de circuito, ion sobre azul profundo.
  "cyber-monday": immersive("#3ff0e0 #7af5ea #04141a #112a3a #050d14 #0b1822 #e6f6fa #94b0bd #173244 #02070b #08141d #3ff0e0", "#0f3346 #0b2433 #071722"),
  // Black Friday: negro total y voltio.
  "black-friday": immersive("#c8ff2e #dcff6e #0a0b0d #1d1e22 #060607 #111113 #f2f2ee #a6a69e #2a2a2f #000000 #0e0e10 #c8ff2e", "#2c2c31 #1d1d21 #121214"),
  navidad: immersive("#f3c84c #f7d777 #10251b #173a2b #0b1f16 #12291e #f1efe4 #aebfae #22412f #06140d #0e2219 #f3c84c", "#21503b #183d2d #10291f"),
  // Versión 2027: azul noche con plasma y voltio.
  "ano-nuevo": immersive("#c8ff2e #dcff6e #0d1330 #1d2550 #0a0f24 #121a36 #eeecf6 #aab0cc #263162 #05081a #0c1230 #c8ff2e", "#28346f #1d2756 #131b3d"),
  "san-valentin": {
    light: p("light", "#b0234a #951d3f #fff7f8 #f8d9e0 #fce9ee #fff7f8 #2a1218 #6d4f58 #f1cfd8 #3b0d1c #561428 #9c2f50", "#fde1e8 #f6cdd8 #ecb7c6"),
    dark: p("dark", "#ff9bb3 #ffb6c8 #3b0d1c #321821 #170a0f #221017 #f7e8ec #c9a7b1 #3f1f2b #0d0508 #1b0a11 #ffa9c0", "#3d1823 #30121b #230c14"),
  },
  // Vuelta al gym: el plasma de VOLTA con voltio.
  "vuelta-al-gym": {
    light: p("light", "#5a3fe6 #4a30cc #fbfaff #e6e1fb #f3f1fb #fdfcff #15122a #5b5770 #dfd9f5 #1b1240 #2a1d5e #5236d6", "#ebe6fd #ddd5fa #cbc0f4"),
    dark: p("dark", "#b3a4ff #c7bcff #170f3a #221c3d #0c0a18 #151226 #efecfb #aaa3c8 #2d2650 #06050d #110d22 #c8ff2e", "#2a2156 #201a44 #171232"),
  },
  "hot-sale": {
    light: p("light", "#b23a0a #963108 #fff8f3 #fbdcc7 #fdeee3 #fff8f3 #24140d #6b5246 #f3d3bf #3d0f06 #5e1508 #a3360a", "#fde6d6 #f8d2b8 #efbb98"),
    dark: p("dark", "#ff9f6b #ffb78d #2a0c04 #321a10 #160b07 #22110a #f8ebe3 #c9ab9b #422417 #0d0503 #1d0c06 #ffb78d", "#4a2414 #3a1b0f #2a130a"),
  },
  // Día del Padre: acero azul con oro de medalla.
  "dia-del-padre": {
    light: p("light", "#24476b #1b3654 #f8fafc #dbe3eb #eef2f6 #fafcfd #131b24 #505b67 #d5dde5 #13202e #1f3349 #8a5300", "#e7edf3 #d8e1ea #c6d2de"),
    dark: p("dark", "#9cc3ea #b9d5f1 #0b1118 #1b2633 #0b1118 #121a24 #e8edf2 #a3afbc #263443 #060a0f #0e1620 #ffcf5c", "#22344a #1b2a3c #14202e"),
  },
  // Día del Amigo: ion profundo (el color de "compañero") con voltio.
  "dia-del-amigo": {
    light: p("light", "#0b6e65 #095a53 #f4fffd #d6efeb #ecf7f5 #fbfffe #0f1e1c #4c5f5c #cfe6e2 #06302c #0a4540 #0a6a61", "#e0f2ef #cde8e3 #b6dcd5"),
    dark: p("dark", "#5ee8da #8af0e5 #04201d #142a28 #071211 #0d1c1a #e6f7f5 #9cbab6 #1d3a37 #030908 #0a1816 #c8ff2e", "#173d39 #12302d #0c2321"),
  },
  // Operación verano: mar de la costa y sol.
  "operacion-verano": {
    light: p("light", "#075f80 #054c67 #f3fbff #d5ecf5 #eaf6fb #f9fdff #0c1d26 #4b606b #cde5ef #053246 #08445e #0a5d7e", "#dff1f8 #c9e6f2 #b0d9ea"),
    dark: p("dark", "#7fd6f0 #a3e3f6 #052433 #13293a #061219 #0c1c26 #e5f4fa #9db8c6 #1b3647 #030a0f #0a1822 #ffd34d", "#143a4f #102e40 #0b2231"),
  },
};

/** Estados (éxito, aviso, error), sombras y esqueletos para paletas oscuras: los mismos del modo oscuro. */
const DARK_EXTRAS = [
  "color-scheme:dark", "--c-ember:#e08a6c", "--c-success:#93d39f", "--c-success-soft:#1c2b1f", "--c-warning:#ebc77f", "--c-warning-soft:#2d2513",
  "--c-danger:#f3a497", "--c-danger-soft:#37201b", "--amb-snow:#ffffff",
  "--sh-card:0 1px 0 rgb(255 255 255/0.04) inset,0 18px 40px -22px rgb(0 0 0/0.75)", "--sh-lift:0 1px 0 rgb(255 255 255/0.05) inset,0 30px 60px -24px rgb(0 0 0/0.9)",
];


function vars(c: Palette): string {
  return [
    `--brand-primary:${c.primary}!important`, `--brand-primary-hover:${c.primaryHover}!important`, `--brand-on-primary:${c.onPrimary}!important`,
    `--brand-accent:${c.accent}!important`, `--brand-background:${c.background}!important`, `--brand-surface:${c.surface}!important`,
    `--brand-text:${c.text}!important`, `--brand-muted:${c.muted}!important`, `--brand-border:${c.border}!important`,
    `--c-night:${c.night}`, `--c-night-2:${c.night2}`, `--c-volt-ink:${c.voltInk}`,
    `--studio-1:${c.studio[0]}`, `--studio-2:${c.studio[1]}`, `--studio-3:${c.studio[2]}`,
    `--skeleton-a:${c.accent}`, `--skeleton-b:${c.surface}`,
    `--chevron:${cssIcon(CHEVRON_SVG, c.primary)}`, `--calendar:${cssIcon(CALENDAR_SVG, c.primary)}`,
    ...(c.scheme === "dark" ? DARK_EXTRAS : ["color-scheme:light"]),
  ].join(";");
}

/** CSS de las paletas (va en <head>): claro con :not([data-theme=dark]) para no pisar el oscuro. */
export function seasonPaletteCss(): string {
  return Object.entries(PALETTES).map(([id, { light, dark }]) =>
    `html[data-season="${id}"]:not([data-theme="dark"]){${vars(light)}}html[data-season="${id}"][data-theme="dark"]{${vars(dark)}}`).join("");
}

/** Temáticas inmersivas (oscuras en ambos modos). */
export function isImmersive(id: SeasonId): boolean {
  return PALETTES[id].light.scheme === "dark";
}
