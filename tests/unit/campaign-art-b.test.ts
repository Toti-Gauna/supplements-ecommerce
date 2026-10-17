import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CAMPAIGN_ART_B } from "@/components/illustrations/campaigns/b-index";
import type { SeasonId } from "@/demo/types";

/** Key visuals del lote R3a, parte B: las tres fechas del segundo semestre y los cinco días del deporte. */
const IDS: SeasonId[] = ["dia-del-padre", "dia-del-amigo", "operacion-verano", "crossfit-open", "dia-actividad-fisica", "dia-del-futbolista", "dia-del-running", "dia-del-boxeador"];

describe("key visuals de campaña (parte B)", () => {
  it("cubre exactamente sus ocho fechas", () => {
    expect(Object.keys(CAMPAIGN_ART_B).sort()).toEqual([...IDS].sort());
  });

  it("cada escena es un svg 4:5 decorativo, sin texto, distinto por fecha y liviano", () => {
    const seen = new Set<string>();
    for (const id of IDS) {
      const Art = CAMPAIGN_ART_B[id]!;
      const html = renderToStaticMarkup(createElement(Art, { className: "h-full w-full" }));
      expect(html.startsWith("<svg"), id).toBe(true);
      expect(html, id).toContain('viewBox="0 0 800 1000"');
      expect(html, id).toContain('aria-hidden="true"');
      expect(html, id).toContain('focusable="false"');
      expect(html, id).toContain(`data-campaign="${id}"`);
      expect(html, id).toContain('class="block h-full w-full"');
      // Sin texto adentro: el post se recorta sin tipografía; los números del marcador son formas.
      expect(html, id).not.toMatch(/<text[\s>]/);
      expect(html, id).not.toMatch(/<animate|<set[\s>]/);
      expect(html.length, `${id} supera ~25 KB`).toBeLessThan(25 * 1024);
      seen.add(html);
    }
    expect(seen.size).toBe(IDS.length);
  });

  it("los ids internos salen de useId y no se repiten entre dos escenas en la misma página", () => {
    const page = renderToStaticMarkup(createElement("div", null, createElement(CAMPAIGN_ART_B["dia-del-padre"]!), createElement(CAMPAIGN_ART_B["dia-del-padre"]!)));
    const ids = [...page.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
