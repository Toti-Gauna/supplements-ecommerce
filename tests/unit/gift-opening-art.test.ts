import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OPENINGS, OPENING_SCENES, type OpeningScene } from "@/demo/engine/gift-opening";
import { OPENING_ARTS } from "@/features/gifts/scenes/dates";
import type { OpeningArtProps } from "@/features/gifts/scenes/stage/types";

/** R3b · punto 11: cada fecha con su apertura propia, en un archivo chico, que cambia con cada gesto. */
const DIR = join(__dirname, "../../src/features/gifts/scenes/dates");
const c = { from: "#13202e", to: "#2e4c6e", accent: "#ffcf5c" };

async function load(scene: Exclude<OpeningScene, "original">): Promise<ComponentType<OpeningArtProps>> {
  return ((await import(`../../src/features/gifts/scenes/dates/${scene}.tsx`)) as { default: ComponentType<OpeningArtProps> }).default;
}

const draw = (Art: ComponentType<OpeningArtProps>, step: number, steps: number, opened = false) =>
  renderToStaticMarkup(createElement("svg", null, createElement(Art, { u: "t", t: step, step, steps, opened, slowmo: false, reduce: true, c })));

describe("escenas de apertura por fecha", () => {
  it("el registro de la interfaz tiene una escena por cada apertura del motor", () => {
    expect(Object.keys(OPENING_ARTS).sort()).toEqual([...OPENING_SCENES].sort());
  });

  it("cada fecha es un archivo propio de 150 líneas o menos", () => {
    const files = readdirSync(DIR).filter((f) => f.endsWith(".tsx"));
    for (const scene of OPENING_SCENES) expect(files, scene).toContain(`${scene}.tsx`);
    for (const f of files) expect(readFileSync(join(DIR, f), "utf8").split("\n").length, f).toBeLessThanOrEqual(150);
  });

  it("cada escena cambia con los gestos, termina distinta y no se parece a ninguna otra", async () => {
    const finals = new Set<string>();
    for (const scene of OPENING_SCENES) {
      if (scene === "original") continue;
      const Art = await load(scene);
      const { steps } = OPENINGS[scene];
      const start = draw(Art, 0, steps), mid = draw(Art, Math.ceil(steps / 2), steps), end = draw(Art, steps, steps, true);
      expect(mid, `${scene}: el gesto no se ve`).not.toBe(start);
      expect(end, `${scene}: no termina distinta`).not.toBe(mid);
      expect(end.length, `${scene} supera ~40 KB`).toBeLessThan(40 * 1024);
      // Sin animaciones SMIL (no se pueden pausar) ni bucles infinitos.
      expect(start, scene).not.toMatch(/<animate|<set[\s>]|infinite/);
      finals.add(end.replace(/t-\w+|:R\w+:|«\w+»/g, ""));
    }
    expect(finals.size).toBe(OPENING_SCENES.length - 1);
  });
});
