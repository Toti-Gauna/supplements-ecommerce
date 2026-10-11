import { describe, expect, it } from "vitest";
import { PALETTES } from "@/features/themes/palettes";
import { SKINS } from "@/features/themes/skins";
import { contrastRatio } from "@/lib/color";

describe("paletas de temáticas", () => {
  for (const [id, pair] of Object.entries(PALETTES)) {
    for (const mode of ["light", "dark"] as const) {
      it(`${id} (${mode}) cumple AA`, () => {
        const c = pair[mode];
        for (const [fg, bg, label] of [
          [c.text, c.background, "texto/fondo"], [c.text, c.surface, "texto/superficie"], [c.muted, c.surface, "apagado/superficie"],
          [c.muted, c.background, "apagado/fondo"], [c.primary, c.surface, "primario/superficie"], [c.primary, c.background, "primario/fondo"],
          [c.onPrimary, c.primary, "texto sobre primario"], [c.brassInk, c.background, "dorado/fondo"], [c.text, c.accent, "texto/acento"],
        ] as const) expect(contrastRatio(fg, bg), `${label} ${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

/** Promedio de dos colores hex (centro del degradado de la cinta, donde va el código del cupón). */
const mid = (a: string, b: string) => {
  const ch = (h: string, s: number) => (parseInt(h.slice(1), 16) >> s) & 255;
  return `#${[16, 8, 0].map((s) => Math.round((ch(a, s) + ch(b, s)) / 2).toString(16).padStart(2, "0")).join("")}`;
};

describe("pieles de temáticas (cinta y banner)", () => {
  for (const [id, skin] of Object.entries(SKINS)) {
    it(`${id}: texto blanco, código del cupón y botón cumplen AA`, () => {
      expect(contrastRatio("#ffffff", skin.from), "blanco sobre el inicio").toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio("#ffffff", skin.to), "blanco sobre el final").toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(skin.accent, mid(skin.from, skin.to)), "código sobre el centro de la cinta").toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(skin.accentInk, skin.accent), "texto del botón").toBeGreaterThanOrEqual(4.5);
    });
  }
});

