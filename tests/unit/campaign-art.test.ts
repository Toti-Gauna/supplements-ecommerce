import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CAMPAIGN_ART, CampaignArt } from "@/components/illustrations/campaigns";
import { CAMPAIGN_ART_B } from "@/components/illustrations/campaigns/b-index";
import type { SeasonId } from "@/demo/types";

/** Key visuals de campaña (R3a): escenas 4:5 sin texto, una por fecha. */
const SEASONS: SeasonId[] = [
  "dia-de-la-madre", "halloween", "cyber-monday", "black-friday", "navidad", "ano-nuevo", "san-valentin", "vuelta-al-gym", "hot-sale",
  "dia-del-padre", "dia-del-amigo", "operacion-verano", "crossfit-open", "dia-actividad-fisica", "dia-del-futbolista", "dia-del-running", "dia-del-boxeador",
];
/** Las de la parte A del lote (dibujadas acá); el resto usa la escena provisoria hasta que llegue la parte B. */
const DRAWN: SeasonId[] = ["black-friday", "hot-sale", "vuelta-al-gym", "navidad", "cyber-monday", "ano-nuevo", "san-valentin", "dia-de-la-madre", "halloween"];

const render = (id: SeasonId, className?: string) => renderToStaticMarkup(createElement(CampaignArt, { id, className }));
/** Lo que hay adentro del <svg> (sin el `data-campaign`, que siempre cambia). */
const inner = (html: string) => html.slice(html.indexOf(">") + 1);

describe("key visuals de campaña", () => {
  it("cada fecha resuelve a una escena, sin sobrantes", () => {
    // Parte A dibuja dentro del svg común; parte B trae su propio svg. Entre las dos, cada fecha una vez.
    const all = [...Object.keys(CAMPAIGN_ART), ...Object.keys(CAMPAIGN_ART_B)];
    expect(all.sort()).toEqual([...SEASONS].sort());
    for (const id of SEASONS) expect(typeof (CAMPAIGN_ART[id] ?? CAMPAIGN_ART_B[id])).toBe("function");
  });

  it("dibuja un svg 4:5 decorativo con la fecha y pasa la clase", () => {
    for (const id of SEASONS) {
      const html = render(id, "h-40");
      expect(html.startsWith("<svg"), id).toBe(true);
      expect(html, id).toContain('viewBox="0 0 800 1000"');
      expect(html, id).toContain('aria-hidden="true"');
      expect(html, id).toContain('focusable="false"');
      expect(html, id).not.toContain('role="img"');
      expect(html, id).toContain(`data-campaign="${id}"`);
      expect(html, id).toContain('class="block h-40"');
    }
  });

  it("no lleva texto adentro (un post sin tipografía) ni animación", () => {
    for (const id of SEASONS) {
      const html = render(id);
      expect(html, id).not.toMatch(/<text[\s>]/);
      expect(html, id).not.toMatch(/<animate|<set[\s>]|<animateTransform/);
    }
  });

  it("cada fecha dibujada tiene su escena propia, distinta de la provisoria, y pesa menos de 25 KB", () => {
    const seen = new Map<string, SeasonId>();
    const fallback = inner(render("dia-del-padre"));
    for (const id of DRAWN) {
      const html = render(id);
      const body = inner(html);
      expect(body, id).not.toBe(fallback);
      expect(seen.has(body), `${id} repite a ${seen.get(body)}`).toBe(false);
      seen.set(body, id);
      expect(Buffer.byteLength(html), id).toBeLessThan(25 * 1024);
    }
  });

  it("usa ids únicos por instancia para degradés y máscaras", () => {
    const twice = renderToStaticMarkup(createElement("div", null, createElement(CampaignArt, { id: "navidad" }), createElement(CampaignArt, { id: "navidad" })));
    const ids = [...twice.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
