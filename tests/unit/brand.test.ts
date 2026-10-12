import { describe, expect, it } from "vitest";
import { brand, brandCss } from "@/config/brand";
import { BRAND_PRESETS, DEFAULT_BRAND, pickBrand } from "@/config/brands";
import { defineBrand, type BrandPalette } from "@/config/brands/types";
import { logoIconSvg, logoPaths } from "@/config/logo";
import { contrastRatio, shade } from "@/lib/color";

const AA = 4.5;

/** Pares de texto y fondo que la tienda usa de verdad (mismos que las paletas de temáticas). */
function palettePairs(c: BrandPalette): [string, string, string][] {
  return [
    [c.text, c.background, "texto/fondo"], [c.text, c.surface, "texto/superficie"], [c.text, c.accent, "texto/acento"],
    [c.muted, c.surface, "apagado/superficie"], [c.muted, c.background, "apagado/fondo"],
    [c.primary, c.surface, "primario/superficie"], [c.primary, c.background, "primario/fondo"],
    [c.onPrimary, c.primary, "texto sobre primario"], [c.onPrimary, c.primaryHover, "texto sobre primario (hover)"],
    [c.voltInk, c.background, "acento de texto/fondo"], [c.voltInk, c.surface, "acento de texto/superficie"],
  ];
}

describe("paletas de cada marca (AA)", () => {
  for (const [id, b] of Object.entries(BRAND_PRESETS)) {
    for (const [mode, c] of [["oscuro", b.colors], ["claro", b.light]] as const) {
      it(`${id} · modo ${mode}`, () => {
        for (const [fg, bg, label] of palettePairs(c)) expect(contrastRatio(fg, bg), `${label} ${fg} sobre ${bg}`).toBeGreaterThanOrEqual(AA);
      });
      it(`${id} · bandas noche del modo ${mode}`, () => {
        const s = b.signature;
        for (const night of [c.night, c.night2]) {
          expect(contrastRatio(s.onNight, night), `texto ${s.onNight} sobre ${night}`).toBeGreaterThanOrEqual(AA);
          expect(contrastRatio(s.nightMuted, night), `apagado ${s.nightMuted} sobre ${night}`).toBeGreaterThanOrEqual(AA);
          expect(contrastRatio(s.volt, night), `color firma ${s.volt} sobre ${night}`).toBeGreaterThanOrEqual(AA);
          expect(contrastRatio(s.voltSoft, night), `firma clara ${s.voltSoft} sobre ${night}`).toBeGreaterThanOrEqual(AA);
        }
        // Botones "bg-volt text-night" (regalos, club, juego): el texto oscuro sobre el color firma.
        expect(contrastRatio(c.night, s.volt), "noche sobre color firma").toBeGreaterThanOrEqual(AA);
        expect(contrastRatio(c.night, s.voltSoft), "noche sobre firma clara").toBeGreaterThanOrEqual(AA);
      });
    }
    it(`${id} · escenario del regalo sin fecha (texto blanco y botón)`, () => {
      // Mismos colores que src/features/gifts/occasion.ts: fondo → plasma profundo, acento = color firma.
      for (const bg of [b.colors.background, shade(b.signature.plasma, -0.5)]) expect(contrastRatio("#ffffff", bg), `blanco sobre ${bg}`).toBeGreaterThanOrEqual(AA);
      expect(contrastRatio(b.colors.background, b.signature.volt), "texto del botón").toBeGreaterThanOrEqual(AA);
    });
  }
});

describe("marcas disponibles", () => {
  it("sin NEXT_PUBLIC_BRAND se usa VOLTA", () => {
    expect(DEFAULT_BRAND).toBe("volta");
    expect(pickBrand(undefined).name).toBe("Volta");
    expect(pickBrand("  ").id).toBe("volta");
    expect(brand.id).toBe(process.env.NEXT_PUBLIC_BRAND || "volta");
  });

  it("una marca que no existe corta el build con un mensaje claro", () => {
    expect(() => pickBrand("acme")).toThrow(/acme.*volta, nitro/);
  });

  it("cada preset tiene un id válido y distinto, con su prefijo de guardado", () => {
    const ids = Object.entries(BRAND_PRESETS).map(([key, b]) => { expect(b.id).toBe(key); return b.storageKey; });
    expect(new Set(ids).size).toBe(ids.length);
    expect(BRAND_PRESETS.volta!.storageKey).toBe("volta");
  });

  it("completa lo derivado: mayúsculas, club, marca propia, prefijo de pedidos y dominio de muestra", () => {
    const b = defineBrand({ ...BRAND_PRESETS.nitro!, id: "fuerza-mdp", name: "Fuerza", mark: undefined, houseBrand: undefined, orderPrefix: undefined, logo: undefined, storageKey: undefined });
    expect(b).toMatchObject({ mark: "FUERZA", club: "Club Fuerza", houseBrand: "FUERZA Lab", houseMark: "FUERZA LAB", orderPrefix: "FUE", demoDomain: "fuerza-mdp.demo", logo: "bolt", storageKey: "fuerza-mdp" });
  });

  it("rechaza ids con espacios, mayúsculas o acentos", () => {
    for (const id of ["Nitro", "nitro mdp", "fuérza", ""]) expect(() => defineBrand({ ...BRAND_PRESETS.nitro!, id })).toThrow(/minúsculas/);
  });
});

describe("logo, favicon y estilos salen de la marca", () => {
  it("la V con rayo solo para el logo que la pide", () => {
    expect(logoPaths({ logo: "v-bolt" }).stroke).not.toBeNull();
    expect(logoPaths({ logo: "bolt" }).stroke).toBeNull();
  });

  it("el favicon usa el fondo y el color firma de cada marca", () => {
    for (const b of Object.values(BRAND_PRESETS)) {
      const svg = logoIconSvg(b);
      expect(svg).toContain(b.colors.background);
      expect(svg).toContain(b.signature.volt);
      expect(svg.startsWith("<svg")).toBe(true);
    }
  });

  it("la hoja de estilo de la marca lleva sus colores firma y las flechas de los selectores", () => {
    const nitro = brandCss(BRAND_PRESETS.nitro);
    expect(nitro).toContain("--brand-volt:#ff8a3d");
    expect(nitro).toContain("--chevron:url(");
    expect(nitro).not.toMatch(/c8ff2e/i);
  });
});
