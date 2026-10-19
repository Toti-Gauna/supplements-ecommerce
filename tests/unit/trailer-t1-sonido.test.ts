import { describe, expect, it } from "vitest";
import { pieceNotes } from "@/trailer/audio/piece";
import { validateTrailer } from "@/trailer/core/timeline";
import { t1 } from "@/trailer/pieces/t1";

const beat = 60 / 128;
const notes = pieceNotes(t1);
const total = t1.scenes.reduce((t, s) => t + s.dur, 0);

/**
 * Montaje de ventas (19/10): la partitura de 96 tiempos sigue a las escenas hasta que se escriba la música publicitaria nueva
 * (sobre el montaje final). Acá solo se cuida lo estructural: que la pieza cierre, que cada efecto caiga en su escena y que
 * cada silencio real tenga su compuerta cerrada.
 */
describe("T1 · tiempos y sonido del montaje de ventas", () => {
  it("la duración es la suma de las escenas, sin huecos y con los cortes en la grilla", () => {
    expect(t1.duration).toBeCloseTo(total, 6);
    expect(validateTrailer(t1)).toEqual([]);
    expect(t1.scenes).toHaveLength(22);
  });

  it("la apertura dura 3 s y cada escena de producto 8 tiempos (3,75 s)", () => {
    expect(t1.scenes.find((s) => s.id === "apertura")!.dur).toBeCloseTo(6 * beat, 6);
    for (const id of ["w1-carga", "w2-tema", "w3-regalo", "w4-shaker", "w5-ruleta", "w6-mostrador", "w7-proveedor"]) {
      expect(t1.scenes.find((s) => s.id === id)!.dur, id).toBeCloseTo(8 * beat, 6);
    }
  });

  it("cada efecto cae dentro de la escena que lo declara", () => {
    for (const e of t1.effects!) {
      const s = t1.scenes.find((x) => x.id === e.scene);
      expect(s, `escena ${e.scene}`).toBeDefined();
      expect(e.t * beat, `${e.scene} ${e.voice} en ${e.t}`).toBeGreaterThanOrEqual(s!.start - 2e-3);
      expect(e.t * beat).toBeLessThan(s!.start + s!.dur + 2e-3);
    }
  });

  it("los silencios reales tienen su compuerta y nada suena adentro", () => {
    const silences = t1.music!.silences!;
    const gates = notes.filter((n) => n.voice === "gate");
    expect(gates).toHaveLength(silences.length);
    gates.forEach((g, i) => { expect(g.t / beat).toBeCloseTo(silences[i]![0], 2); expect((g.t + g.dur) / beat).toBeCloseTo(silences[i]![1], 2); });
    for (const [from, to] of silences) {
      expect(notes.filter((n) => n.voice !== "gate" && n.t >= from * beat + 1e-6 && n.t < to * beat - 3e-3), `${from}–${to}`).toEqual([]);
    }
  });

  it("los tramos de música cubren toda la pieza, en orden", () => {
    const parts = t1.music!.parts;
    expect(parts[0]!.from).toBe(0);
    expect(parts.at(-1)!.to).toBeCloseTo(total / beat, 2);
    parts.slice(1).forEach((p, i) => expect(p.from).toBeCloseTo(parts[i]!.to, 2));
    for (const n of notes.filter((x) => x.voice !== "gate")) expect(n.t).toBeLessThan(t1.duration);
  });
});
