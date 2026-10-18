import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SPLASH_ART } from "@/components/illustrations/splash";
import { SPLASH_SCENES, type SplashSceneId } from "@/demo/engine/splash-scenes";

/**
 * Arte de las pantallas de carga por fecha (R3c): cada capa dibujada en `src/components/illustrations/splash/` se
 * publica tal cual en `public/splash/<id>/<n>.svg`. Para regenerarlas después de cambiar un dibujo:
 * `SPLASH_ART_WRITE=1 npx vitest run tests/unit/r3c-splash-art.test.ts`.
 */
const PUBLIC = join(__dirname, "../../public/splash");
const WRITE = process.env.SPLASH_ART_WRITE === "1";
const render = (id: SplashSceneId, n: number) => renderToStaticMarkup(createElement(SPLASH_ART[id]![n]!));

const withArt = (Object.keys(SPLASH_SCENES) as SplashSceneId[]).filter((id) => SPLASH_SCENES[id].status === "ready" && SPLASH_SCENES[id].layers > 0);

describe("arte de las pantallas de carga por fecha", () => {
  it("cada escena terminada tiene tantas capas dibujadas como dice el registro", () => {
    for (const id of withArt) expect(SPLASH_ART[id]?.length, id).toBe(SPLASH_SCENES[id].layers);
    for (const id of Object.keys(SPLASH_ART) as SplashSceneId[]) expect(SPLASH_SCENES[id].status, id).toBe("ready");
  });

  it("los SVG publicados coinciden con su dibujo (sin texto, sin animación, livianos)", () => {
    for (const id of withArt) {
      let total = 0;
      for (let n = 0; n < SPLASH_SCENES[id].layers; n++) {
        const svg = render(id, n);
        const file = join(PUBLIC, id, `${n + 1}.svg`);
        if (WRITE) {
          mkdirSync(join(PUBLIC, id), { recursive: true });
          writeFileSync(file, `${svg}\n`);
        }
        expect(existsSync(file), file).toBe(true);
        expect(readFileSync(file, "utf8"), `${id}/${n + 1}.svg desactualizado`).toBe(`${svg}\n`);
        expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"'), id).toBe(true);
        expect(svg, id).not.toMatch(/<text[\s>]|<animate|<set[\s>]|volta/i);
        expect(svg.length, `${id}/${n + 1}`).toBeLessThan(14_000);
        total += svg.length;
      }
      // Lo que baja una fecha (todas sus capas juntas) es chico: solo se pide el arte de la fecha puesta.
      expect(total, `${id} en total`).toBeLessThan(24_000);
    }
  });
});
