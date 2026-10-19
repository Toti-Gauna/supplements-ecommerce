import { expect, test, type Page } from "@playwright/test";
import { t1 } from "@/trailer/pieces/t1";

test.use({ contextOptions: { reducedMotion: "no-preference" } });

/**
 * Los textos que entran letra por letra (`splitChars`) cortan el renglón entre palabras, nunca adentro de una: en el celular
 * "PROCESOS MÁS SIMPLES." salía como "SIMPLE / S.". Se recorre cada escena con letras partidas en los dos formatos.
 */
const B = 60 / 128;
const START = Object.fromEntries(t1.scenes.map((x) => [x.id, x.start / B]));
const rel = (id: string, beats: number) => Math.round((START[id]! + beats) * B * 1000) / 1000;
const ready = (page: Page) => page.waitForFunction(() => window.__trailer?.ready === true);
const SWEEP = [["latido", [0.5, 1, 1.5]], ["sistema", Array.from({ length: 24 }, (_, i) => i / 2 + 0.25)], ["en-vivo", [3, 5, 7, 9, 11]]] as const;

for (const ratio of ["9x16", "16x9"] as const) {
  test(`${ratio}: ninguna palabra animada queda partida en dos renglones`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(ratio === "16x9" ? { width: 960, height: 540 } : { width: 405, height: 720 });
    await page.goto(`trailer/t1/?export=1&ratio=${ratio}&t=1`);
    await ready(page);
    let measured = 0;
    for (const [id, beats] of SWEEP) {
      for (const b of beats) {
        await page.evaluate((s) => window.__trailer!.seek(s), rel(id, b));
        const out = await page.evaluate((sceneId) => {
          const bad: string[] = [];
          const holders = new Set<HTMLElement>();
          for (const c of document.querySelectorAll<HTMLElement>(`[data-escena='${sceneId}'] .trl-char`)) holders.add(c.closest<HTMLElement>("[data-t]")!);
          for (const el of holders) {
            // Texto del renglón con la posición de cada letra: si dos letras seguidas cambian de renglón, entre ellas tiene que haber un espacio.
            let text = "";
            const marks: { from: number; to: number; top: number }[] = [];
            const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            for (let n = walk.nextNode(); n; n = walk.nextNode()) {
              const ch = n.parentElement?.closest<HTMLElement>(".trl-char");
              if (ch) marks.push({ from: text.length, to: text.length + n.textContent!.length, top: Math.round(ch.parentElement!.getBoundingClientRect().top) });
              text += n.textContent;
            }
            for (let i = 1; i < marks.length; i++) {
              const [a, b] = [marks[i - 1]!, marks[i]!];
              if (b.top > a.top + 4 && !/\s/.test(text.slice(a.to, b.from))) bad.push(`«${text.trim()}» cortada en «${text.slice(a.from, a.to)}|${text.slice(b.from, b.to)}»`);
            }
          }
          return { bad, seen: holders.size };
        }, id);
        measured += out.seen;
        expect(out.bad, `${id} a ${b}`).toEqual([]);
      }
    }
    expect(measured, "hay textos partidos en letras que medir").toBeGreaterThan(10);
  });
}
