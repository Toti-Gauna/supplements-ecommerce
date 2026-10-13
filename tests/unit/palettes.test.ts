import { describe, expect, it } from "vitest";
import { BRAND_PRESETS } from "@/config/brands";
import { SEASON_VARIABLES, seasonAccentCss } from "@/features/themes/palettes";
import { SKINS } from "@/features/themes/skins";
import { contrastRatio } from "@/lib/color";

describe("regla de marca: la fecha solo tiñe acentos", () => {
  const css = seasonAccentCss();
  it("cada temática define su acento, su texto y su halo", () => {
    for (const id of Object.keys(SKINS)) expect(css, id).toContain(`html[data-season="${id}"]{--season-accent:`);
  });
  it("ninguna temática pisa el primario, el fondo, las superficies, el texto ni los estados", () => {
    const props = [...css.matchAll(/([\w-]+)\s*:/g)].map((m) => m[1]).filter((p) => p!.startsWith("--") || p === "color-scheme" || p === "background");
    expect(new Set(props)).toEqual(new Set(SEASON_VARIABLES));
    expect(css).not.toMatch(/--brand-|--c-|color-scheme|!important/);
  });
  it("el acento se lee como texto (código del cupón) sobre la cinta del ticker de cada marca", () => {
    for (const b of Object.values(BRAND_PRESETS)) {
      for (const [id, skin] of Object.entries(SKINS)) {
        expect(contrastRatio(skin.accent, b.colors.night), `${b.id} · ${id}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
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

