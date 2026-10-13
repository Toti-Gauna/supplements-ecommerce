import { describe, expect, it } from "vitest";
import { BADGE_EDGE, coverRatio, offerParts, overlaps, postLayout, potRect, storyBadge } from "@/demo/admin/studio/offer";
import { defaultDemoData } from "@/demo/engine/source";
import { splitAccent } from "@/lib/accent";

/** Polish 8.3 · Lote 7: cartel de oferta del Estudio y textos de inicio. */
const { content } = defaultDemoData();

describe("cartel de oferta del Estudio (8.3.27)", () => {
  it("separa el valor de OFF y deja frases como 'Envío gratis' enteras", () => {
    expect(offerParts("30% OFF")).toEqual({ value: "30%", unit: "OFF" });
    expect(offerParts("$3.000 OFF")).toEqual({ value: "$3.000", unit: "OFF" });
    expect(offerParts("Envío gratis")).toEqual({ value: "Envío gratis", unit: "" });
  });

  it("post 1:1: el cartel entra en la pieza, no pisa la columna de texto y apenas roza el pote", () => {
    for (const badge of [{ w: 280, h: 230 }, { w: 320, h: 300 }, { w: 378, h: 360 }]) {
      const L = postLayout(1080, badge);
      expect(L.badge!.x + L.badge!.w).toBeLessThanOrEqual(1080 - BADGE_EDGE);
      expect(L.badge!.y).toBeGreaterThanOrEqual(BADGE_EDGE);
      // Titular, texto y precio van de x = 80 a 530.
      expect(overlaps(L.badge!, { x: 80, y: 100, w: 450, h: 760 })).toBe(false);
      // Solo puede rozar la tapa del pote (el producto se ve entero).
      const pot = potRect(L.pot);
      expect(coverRatio(pot, L.badge!)).toBeLessThan(0.05);
      expect(pot.x).toBeGreaterThan(530);
      expect(L.pot.size).toBeGreaterThanOrEqual(380);
    }
    expect(postLayout(1080, null)).toMatchObject({ badge: null, pot: { cx: 790, floorY: 830, size: 560 } });
  });

  it("historia 9:16: el cartel queda dentro y solo se apoya en el costado del pote", () => {
    const pot = potRect({ cx: 540, floorY: 1340, size: 640 });
    const b = storyBadge(1080, pot, { w: 312, h: 334 });
    expect(b.x + b.w).toBeLessThanOrEqual(1080 - BADGE_EDGE);
    expect(b.x).toBeGreaterThan(pot.x + pot.w * 0.8);
    expect(coverRatio(pot, b)).toBeLessThan(0.1);
  });
});

// El carrusel del inicio (8.3.28) se reemplazó por el hero del rack (R1): sus reglas se prueban en r1-vidriera.test.ts.

describe("textos de inicio", () => {
  it("el bloque “Armá tu stack” arranca con textos de suplementos y pinta en voltio lo que sigue a la coma", () => {
    expect(content.homeCta).toEqual({ title: "Tu estante, según tu objetivo", text: "Tocá un objetivo y mirá el stack que te sugerimos." });
    expect(splitAccent(content.homeCta.title)).toEqual(["Tu estante, ", "según tu objetivo"]);
    expect(splitAccent("Stack del mes")).toEqual(["Stack del mes", ""]);
    expect(splitAccent("Más fuerza,")).toEqual(["Más fuerza,", ""]);
    for (const f of content.faqs) expect(`${f.q} ${f.a}`).not.toMatch(/mascota|vela|collar|taller|a mano/i);
  });
});
