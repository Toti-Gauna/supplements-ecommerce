import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guardia de marca blanca: el nombre de la tienda solo se escribe en `src/config/brands/`. Si alguien vuelve a escribir
 * "Volta" en un componente, un texto o un dato de muestra, este test lo marca con archivo y línea (y la demo de otro
 * cliente no muestra el nombre equivocado). Los comentarios no cuentan.
 *
 * Se permiten las claves internas en minúscula que no ve nadie y no conviene cambiar (romperían lo guardado):
 * `volta-demo:*`, `volta-ui:*`, preferencias (`volta-theme`, `volta-ambient`, `volta-sound`), ids del DOM, ganchos de
 * los tests (`__volta*`) y la ocasión "volta" (regalo sin fecha especial).
 */
const ROOT = join(__dirname, "../..");
const DIRS = ["src", "app"];
const PRESETS = "src/config/brands/";
const INTERNAL = /volta-(?:demo|ui|splash|theme|ambient|sound|glyph)\b|x-volta-inline|__volta\w*|"volta"|\bvolta(?=:\s)/g;

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? files(p) : /\.(tsx?|css)$/.test(e.name) ? [p] : [];
  });
}

/** Saca comentarios de bloque y de línea, conservando los saltos para informar la línea correcta. */
const stripComments = (code: string) =>
  code.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " ")).replace(/(^|[\s;{}(,])\/\/.*$/gm, "$1");

describe("marca blanca: el nombre sale de src/config/brands", () => {
  it("ningún archivo de la tienda o del panel escribe Volta a mano", () => {
    const found: string[] = [];
    for (const file of DIRS.flatMap((d) => files(join(ROOT, d)))) {
      const rel = relative(ROOT, file).replace(/\\/g, "/");
      if (rel.startsWith(PRESETS)) continue;
      stripComments(readFileSync(file, "utf8")).split("\n").forEach((line, i) => {
        if (/volta/i.test(line.replace(INTERNAL, ""))) found.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
    }
    expect(found).toEqual([]);
  });
});
