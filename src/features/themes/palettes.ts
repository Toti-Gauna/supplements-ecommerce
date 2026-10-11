import type { SeasonId } from "@/demo/types";

/**
 * Colores de la tienda durante cada temática (pedido de Ignacio, fuera de la especificación). Pisan TODOS los
 * tokens con `html[data-season]`: header, fondo, tarjetas, el "estudio" detrás de cada producto, bandas y
 * controles cambian sin tocar componentes. Las fechas nocturnas son **inmersivas**: oscuras también en modo claro.
 * El contraste AA de cada par se verifica en tests/unit/palettes.test.ts.
 */
export interface Palette {
  scheme: "light" | "dark";
  primary: string; primaryHover: string; onPrimary: string; accent: string;
  background: string; surface: string; text: string; muted: string; border: string;
  night: string; night2: string; brassInk: string;
  /** Degradado del estudio de fotos de los productos: arriba, medio, piso. */
  studio: [string, string, string];
}

type Pair = { light: Palette; dark: Palette };
const p = (scheme: Palette["scheme"], v: string, studio: string): Palette => {
  const [primary, primaryHover, onPrimary, accent, background, surface, text, muted, border, night, night2, brassInk] = v.split(" ") as [string, string, string, string, string, string, string, string, string, string, string, string];
  return { scheme, primary, primaryHover, onPrimary, accent, background, surface, text, muted, border, night, night2, brassInk, studio: studio.split(" ") as [string, string, string] };
};
const immersive = (v: string, studio: string): Pair => { const d = p("dark", v, studio); return { light: d, dark: d }; };

// primary · hover · texto sobre primary · acento · fondo · superficie · texto · apagado · borde · noche · noche 2 · dorado de texto
export const PALETTES: Record<SeasonId, Pair> = {
  halloween: immersive("#ffa64d #ffb96f #1d1426 #2a1f38 #120b1a #1c1228 #f2e9f7 #b7a8c6 #352646 #08050d #160e21 #ffb877", "#3d2554 #2b1a3d #1d1229"),
  navidad: immersive("#f3c84c #f7d777 #10251b #173a2b #0b1f16 #12291e #f1efe4 #aebfae #22412f #06140d #0e2219 #f3c84c", "#21503b #183d2d #10291f"),
  "ano-nuevo": immersive("#f3dca6 #f8e8c4 #0d1330 #1b2448 #0a0f24 #121a36 #eeecf6 #aab0cc #263162 #05081a #0c1230 #f3dca6", "#28346f #1d2756 #131b3d"),
  "black-friday": immersive("#f3dca6 #f8e8c4 #0b0b0d #1b1b1f #070708 #111113 #f2efe8 #a8a49b #2a2a2f #000000 #0e0e10 #f3dca6", "#2c2c31 #1d1d21 #121214"),
  // Orgullo: noche violeta para que el arcoíris de las decoraciones y del fondo brille.
  orgullo: immersive("#ff9fd0 #ffbadd #2b0d22 #2a2145 #100c1e #19142c #f5f0fb #bcb2d2 #342b52 #07050f #140f26 #ffd27a", "#2f2656 #231c42 #18132f"),
  // 9 de Julio: noche azul de la Casa de Tucumán con fuegos celestes y dorados.
  "dia-de-la-independencia": immersive("#a6d4f5 #c3e2f8 #071a2e #18264a #0a1424 #111d33 #eef3fa #a6b4c9 #22324f #040912 #0b1530 #f3d27a", "#1e3358 #172947 #111e36"),
  "dia-de-la-madre": {
    light: p("light", "#9b3563 #842c54 #fff7fa #f7dce7 #fbeaf1 #fff7fa #2a1520 #6e5060 #efd0dd #4a1830 #5e2440 #8a3d62", "#fbe3ec #f3d0de #e8bccd"),
    dark: p("dark", "#f5a8c6 #f8c0d6 #3a1226 #301a24 #160b10 #211118 #f7e9ef #c7a9b6 #3e2330 #0c0508 #1c0d14 #f3b3cd", "#3a1d2a #2e1621 #221018"),
  },
  "san-valentin": {
    light: p("light", "#b0234a #951d3f #fff7f8 #f8d9e0 #fce9ee #fff7f8 #2a1218 #6d4f58 #f1cfd8 #3b0d1c #561428 #9c2f50", "#fde1e8 #f6cdd8 #ecb7c6"),
    dark: p("dark", "#ff9bb3 #ffb6c8 #3b0d1c #321821 #170a0f #221017 #f7e8ec #c9a7b1 #3f1f2b #0d0508 #1b0a11 #ffa9c0", "#3d1823 #30121b #230c14"),
  },
  pascuas: {
    light: p("light", "#6a4a9e #5a3e88 #fffcff #ece0f7 #f5eefb #fffcff #211a2c #605870 #e2d4ef #3f2a66 #50367f #8a5a12", "#f1e6fa #e6d6f5 #d8c3ee"),
    dark: p("dark", "#cdb3f5 #dccaf8 #241539 #261d35 #110c18 #1a1424 #f0eaf7 #b6a8c8 #322745 #0a0710 #170f22 #ffe28a", "#2a1f3d #211830 #181124"),
  },
  "dia-del-animal": {
    light: p("light", "#3a4527 #283019 #fffdf8 #ecdfc5 #f4ecdc #fffaf1 #1c2016 #5a5d4c #e4d6bc #283019 #343e22 #7a5c26", "#f3e7d2 #e6d6ba #d6c2a0"),
    dark: p("dark", "#c5d19e #d6e0b4 #151910 #262b20 #121510 #1b1f17 #ece6d8 #a9a591 #2f3528 #0a0c08 #16190f #d9b878", "#2a2f20 #22271a #1a1e14"),
  },
  "hot-sale": {
    light: p("light", "#b23a0a #963108 #fff8f3 #fbdcc7 #fdeee3 #fff8f3 #24140d #6b5246 #f3d3bf #3d0f06 #5e1508 #a3360a", "#fde6d6 #f8d2b8 #efbb98"),
    dark: p("dark", "#ff9f6b #ffb78d #2a0c04 #321a10 #160b07 #22110a #f8ebe3 #c9ab9b #422417 #0d0503 #1d0c06 #ffb78d", "#4a2414 #3a1b0f #2a130a"),
  },
  // 25 de Mayo: papel colonial (el Cabildo encalado) con celeste profundo.
  "revolucion-de-mayo": {
    light: p("light", "#1f5c8a #184b72 #f7fbff #e3eef6 #f6f1e6 #fffcf5 #1d1f24 #5c5a52 #e6dccb #18324a #21425f #8a5a12", "#efe6d4 #e4d8c0 #d6c6a6"),
    dark: p("dark", "#9fd2f5 #bde0f8 #06233a #1c2633 #0f1216 #171c22 #ece8df #ada796 #2a323d #07090c #111820 #f3c95a", "#26313d #1e2731 #161d25"),
  },
  // 20 de Junio: cielo celeste y blanco de la bandera.
  "dia-de-la-bandera": {
    light: p("light", "#1b4f7c #153f63 #f8fcff #d8e9f6 #ebf4fb #f8fcff #102030 #4a5d6e #cfe1ef #0d3557 #134670 #8a5a12", "#e1effa #cfe4f5 #b6d5ee"),
    dark: p("dark", "#8ec7f0 #aed7f5 #052038 #132a3f #071421 #0d1d2e #e6f1fa #9db6ca #1c3650 #030a12 #0a1a2a #f6cf5a", "#16334f #10283f #0b1e30"),
  },
  "dia-del-padre": {
    light: p("light", "#2b4560 #22374d #f8fafc #dbe3eb #eef2f6 #fafcfd #161d24 #525c66 #d5dde5 #16222f #22344a #7a5c26", "#e7edf3 #d8e1ea #c6d2de"),
    dark: p("dark", "#a9c6e6 #c1d6ee #0b1118 #1b2633 #0b1118 #121a24 #e8edf2 #a3afbc #263443 #060a0f #0e1620 #e9c27a", "#22344a #1b2a3c #14202e"),
  },
  "dia-del-amigo": {
    light: p("light", "#44622a #3a5424 #fbfdf5 #e4ebcf #f1f4e2 #fbfdf5 #1a2014 #565e4c #dae2c3 #22381f #2f4a2a #7a5c26", "#eef2dc #e1e8c8 #d1dbb2"),
    dark: p("dark", "#b7d68f #cbe3aa #121a0c #1f2a18 #0d120a #151d10 #edf1e4 #a9b39a #2c3a22 #060a04 #111a0c #f3dca6", "#2a3a20 #212e19 #182212"),
  },
  "dia-del-nino": {
    light: p("light", "#17608c #134f74 #f6fbff #d9ecf8 #eaf5fc #f8fcff #122029 #4e5f6a #cfe3f0 #0b4468 #0f5884 #8a5a12", "#e3f2fc #cfe6f6 #b9d8ee"),
    dark: p("dark", "#8fd0f5 #ace0fa #062033 #142a3a #07121a #0d1c27 #e6f2f9 #9fb8c8 #1d3a50 #030a10 #0a1822 #ffd34d", "#14324a #0f273b #0b1d2c"),
  },
};

/** Estados (éxito, aviso, error), sombras y esqueletos para paletas oscuras: los mismos del modo oscuro. */
const DARK_EXTRAS = [
  "color-scheme:dark", "--c-clay:#e08a6c", "--c-success:#93d39f", "--c-success-soft:#1c2b1f", "--c-warning:#ebc77f", "--c-warning-soft:#2d2513",
  "--c-danger:#f3a497", "--c-danger-soft:#37201b", "--amb-snow:#ffffff",
  "--sh-card:0 1px 0 rgb(255 255 255/0.04) inset,0 18px 40px -22px rgb(0 0 0/0.75)", "--sh-lift:0 1px 0 rgb(255 255 255/0.05) inset,0 30px 60px -24px rgb(0 0 0/0.9)",
];

const icon = (svg: string, color: string) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace("COLOR", color))}")`;
const CHEVRON = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='COLOR' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>";
const CALENDAR = "<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='COLOR' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='18' rx='2'/><path d='M16 2v4M8 2v4M3 10h18'/></svg>";

function vars(c: Palette): string {
  return [
    `--brand-primary:${c.primary}!important`, `--brand-primary-hover:${c.primaryHover}!important`, `--brand-on-primary:${c.onPrimary}!important`,
    `--brand-accent:${c.accent}!important`, `--brand-background:${c.background}!important`, `--brand-surface:${c.surface}!important`,
    `--brand-text:${c.text}!important`, `--brand-muted:${c.muted}!important`, `--brand-border:${c.border}!important`,
    `--c-night:${c.night}`, `--c-night-2:${c.night2}`, `--c-brass-ink:${c.brassInk}`,
    `--studio-1:${c.studio[0]}`, `--studio-2:${c.studio[1]}`, `--studio-3:${c.studio[2]}`,
    `--skeleton-a:${c.accent}`, `--skeleton-b:${c.surface}`,
    `--chevron:${icon(CHEVRON, c.primary)}`, `--calendar:${icon(CALENDAR, c.primary)}`,
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
