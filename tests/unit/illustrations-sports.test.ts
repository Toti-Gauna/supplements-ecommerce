import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AthleteSilhouette, GOAL_ART } from "@/components/illustrations/AthleteSilhouette";
import { SPORT_ART, SportArt } from "@/components/illustrations/SportArt";
import type { Goal, SportId } from "@/demo/types";

/** Ilustraciones de "Entrená por objetivo" y del quiz: una escena por deporte y una pose por objetivo. */
const SPORTS: SportId[] = ["futbol", "tenis", "padel", "running", "ciclismo", "natacion", "boxeo", "crossfit", "basquet", "rugby", "hockey", "voley"];
const GOALS: Goal[] = ["masa-muscular", "fuerza", "energia", "recuperacion", "definicion", "salud", "resistencia"];

const svgOk = (html: string, viewBox: string) => {
  expect(html.startsWith("<svg")).toBe(true);
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('focusable="false"');
  expect(html).toContain(`viewBox="${viewBox}"`);
  expect(html).toContain("currentColor");
  // Sin colores fijos: todo sale de currentColor (el blanco y negro de la máscara de recorte no se ven).
  expect(html.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
  expect(html).not.toMatch(/Gradient/);
};

describe("ilustraciones de deportes", () => {
  it("cada deporte tiene su escena, sin sobrantes", () => {
    expect(Object.keys(SPORT_ART).sort()).toEqual([...SPORTS].sort());
    for (const sport of SPORTS) expect(typeof SPORT_ART[sport]).toBe("function");
  });

  it("cada escena dibuja un svg decorativo en el lienzo común y pasa la clase", () => {
    const seen = new Set<string>();
    for (const sport of SPORTS) {
      const html = renderToStaticMarkup(createElement(SportArt, { sport, className: "h-24 text-ink" }));
      svgOk(html, "0 0 160 200");
      expect(html, sport).toContain('class="block h-24 text-ink"');
      seen.add(html);
    }
    expect(seen.size).toBe(SPORTS.length);
  });
});

describe("siluetas por objetivo", () => {
  it("cada objetivo tiene su pose, sin sobrantes", () => {
    expect(Object.keys(GOAL_ART).sort()).toEqual([...GOALS].sort());
  });

  it("cada pose dibuja un svg decorativo de 120 × 200 (el que espera la escena del carrusel)", () => {
    const seen = new Set<string>();
    for (const goal of GOALS) {
      const html = renderToStaticMarkup(createElement(AthleteSilhouette, { goal, className: "h-36" }));
      svgOk(html, "0 0 120 200");
      seen.add(html);
    }
    expect(seen.size).toBe(GOALS.length);
  });
});
