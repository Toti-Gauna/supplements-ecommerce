import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regla de marca (R1): durante una fecha la tienda no se repinta. Ninguna regla de CSS que dependa de
 * `[data-season]` puede tocar el primario, el fondo, las superficies, el texto ni los botones de compra: solo puede
 * usar el acento de temporada (`--season-accent`, `--season-accent-ink`, `--season-glow`) para filos y halos.
 * Las variables de cada fecha se verifican en palettes.test.ts.
 */
const APP = join(process.cwd(), "app");
const sheets = readdirSync(APP).filter((f) => f.endsWith(".css")).map((f) => ({ file: f, css: readFileSync(join(APP, f), "utf8") }));

/** Reglas planas `selector { cuerpo }` (los @media se recorren por dentro: su cuerpo no lleva llaves de regla). */
function seasonRules(css: string): { selector: string; body: string }[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((m) => ({ selector: m[1]!.trim(), body: m[2]!.trim() }))
    .filter((r) => r.selector.includes("data-season"));
}

describe("la fecha solo tiñe acentos en el CSS de la tienda", () => {
  const rules = sheets.flatMap(({ file, css }) => seasonRules(css).map((r) => ({ ...r, file })));

  it("hay reglas de temporada para revisar (filo del header)", () => {
    expect(rules.some((r) => r.selector.includes("[data-shop-header]"))).toBe(true);
  });

  for (const { file, selector, body } of rules) {
    it(`${file} · ${selector}`, () => {
      // Ninguna variable de marca o de estado redefinida.
      expect(body).not.toMatch(/--(brand|c|color)-[\w-]+\s*:/);
      // Ningún fondo, color de texto ni filtro que repinte.
      expect(body).not.toMatch(/(^|;)\s*(background(-color|-image)?|color|filter|backdrop-filter)\s*:/);
      // Los colores que use salen del acento de temporada.
      const vars = [...body.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]);
      for (const v of vars) expect(v, `${selector} usa ${v}`).toMatch(/^--season-/);
      expect(body).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i);
    });
  }
});
