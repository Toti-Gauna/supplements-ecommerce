import { describe, expect, it } from "vitest";
import { pieceNotes } from "@/trailer/audio/piece";
import { HOOK } from "@/trailer/audio/score";
import { validateTrailer } from "@/trailer/core/timeline";
import { t1 } from "@/trailer/pieces/t1";

const BPM = 128, beat = 60 / BPM;
const notes = pieceNotes(t1);
const musical = notes.filter((n) => n.voice !== "gate");
const at = (b: number, voice?: string) => musical.filter((n) => Math.abs(n.t - b * beat) < 1e-3 && (!voice || n.voice === voice));
const within = (from: number, to: number) => musical.filter((n) => n.t >= from * beat - 1e-6 && n.t < to * beat - 1e-6);

describe("T1 · tiempos de la pieza", () => {
  it("son 96 tiempos (45 s), sin huecos y con los cortes en la grilla", () => {
    expect(t1.duration).toBeCloseTo(45, 6);
    expect(validateTrailer(t1)).toEqual([]);
    expect(t1.scenes).toHaveLength(19);
  });

  it("cada efecto cae dentro de la escena del storyboard que lo declara", () => {
    for (const e of t1.effects!) {
      const s = t1.scenes.find((x) => x.id === e.scene);
      expect(s, `escena ${e.scene}`).toBeDefined();
      expect(e.t * beat, `${e.scene} ${e.voice} en ${e.t}`).toBeGreaterThanOrEqual(s!.start - 2e-3); // el inicio de la escena se redondea al milisegundo
      expect(e.t * beat).toBeLessThan(s!.start + s!.dur + 2e-3);
    }
  });
});

describe("T1 · silencio real", () => {
  const silences = t1.music!.silences!;
  it("cinco medios tiempos de silencio, con el máster cerrado", () => {
    expect(silences).toEqual([[11.5, 12], [27.5, 28], [31.5, 32], [55.5, 56], [67.5, 68]]);
    const gates = notes.filter((n) => n.voice === "gate");
    gates.forEach((g, i) => { expect(g.t / beat).toBeCloseTo(silences[i]![0], 2); expect((g.t + g.dur) / beat).toBeCloseTo(silences[i]![1], 2); });
    expect(gates).toHaveLength(silences.length);
  });

  it("nada empieza adentro de un silencio (salvo el cierre del máster)", () => {
    for (const [from, to] of silences) expect(within(from, to), `${from}–${to}`).toEqual([]);
  });

  it("el golpe llega justo al terminar cada silencio", () => {
    expect(at(12, "click").length).toBeGreaterThan(0); // anti-drop: un click, no el golpe
    expect(at(12, "impact")).toEqual([]);
    expect(at(32, "impact")).toHaveLength(1); // DROP 1
    expect(at(56, "boom")).toHaveLength(1); // DROP 2
    expect(at(32, "kick").length).toBeGreaterThan(0);
  });
});

describe("T1 · tramos", () => {
  it("la línea plana es un seno solo en La5, de 26 a 27,5, sin otra voz", () => {
    const tones = notes.filter((n) => n.voice === "tone");
    expect(tones).toHaveLength(1);
    expect(tones[0]).toMatchObject({ midi: 81 });
    expect(tones[0]!.t).toBeCloseTo(26 * beat, 3);
    expect((tones[0]!.t + tones[0]!.dur) / beat).toBeCloseTo(27.5, 2);
    expect(within(26, 28).filter((n) => n.voice !== "tone")).toEqual([]);
  });

  it("el problema no tiene bombo, bajo ni melodía: todas las tiendas suenan igual", () => {
    expect(within(12, 28).filter((n) => ["kick", "bass", "pluck", "bell", "hat", "clap"].includes(n.voice))).toEqual([]);
  });

  it("el latido y la subida de 28 a 32 cortan medio tiempo antes del golpe", () => {
    expect(within(28, 29).filter((n) => n.voice === "sub")).toHaveLength(2); // latido: golpe y eco
    const riser = within(28, 32).find((n) => n.voice === "riser")!;
    expect(riser.t / beat).toBeCloseTo(28.5, 3);
    expect((riser.t + riser.dur) / beat).toBeCloseTo(31.5, 3);
  });

  it("de 37 a 39 los golpes a la bolsa son la batería: el groove pierde bombo y bajo, el resto sigue", () => {
    const groove = within(37, 39.25).filter((n) => n.voice === "kick" || n.voice === "bass"); // solo quedan los de los golpes
    expect(groove.map((n) => Math.round((n.t / beat) * 2) / 2)).toEqual([37, 37, 37.5, 37.5, 38, 38, 38.5, 38.5, 39, 39]);
    expect(groove.filter((n) => n.voice === "kick").map((n) => n.vel)).toEqual(Array(5).fill(0.9)); // solo los de los golpes
    expect(within(37, 39.5).some((n) => n.voice === "pluck")).toBe(true);
    expect(at(39.5, "hat")).toHaveLength(1);
    expect(at(40, "kick")).toHaveLength(1);
  });

  it("de 48 a 56 la compuerta pica el pad en semicorcheas", () => {
    const stabs = within(48, 52).filter((n) => n.voice === "stab" && Math.abs(n.t / beat - 48) < 1e-6 + 0);
    expect(stabs).toHaveLength(3); // el acorde de Am en el primer paso
    expect(within(48, 56).filter((n) => n.voice === "stab")).toHaveLength((2 * 16 - 2) * 3); // los dos últimos pasos caen en el silencio de 55,5
  });

  it("de 56 a 68 es medio tiempo: bombo en 1 y 3, y el estribillo en campana (compases 1, 2 y 4)", () => {
    expect(within(56, 60).filter((n) => n.voice === "kick").map((n) => n.t / beat)).toEqual([56, 58].map((x) => expect.closeTo(x, 3)));
    const bells = (from: number) => within(from, from + 4).filter((n) => n.voice === "bell" && n.vel > 0.4).map((n) => n.midi);
    expect(bells(56)).toEqual(HOOK.slice(0, 8).filter((m) => m !== null));
    expect(bells(60)).toEqual(HOOK.slice(8, 16).filter((m) => m !== null));
    expect(bells(64)).toEqual(HOOK.slice(24, 32).filter((m) => m !== null));
  });
});

describe("T1 · la tienda toca su estribillo", () => {
  const pluck = (b: number) => at(b, "pluck").map((n) => n.midi);
  // Cada evento de la interfaz cae sobre la nota del estribillo que dice el storyboard (sonido.md, regla 2).
  it.each([
    [33, 76, "fecha"], [33.5, 79, "fecha"], [35, 79, "click del tema"],
    [37, 81, "golpe 1"], [38, 79, "golpe 3"], [39, 76, "golpe 5"],
    [41, 76, "atrapada 1"], [41.5, 79, "atrapada 2"], [42, 81, "atrapada 3"], [43, 84, "¡Tiempo!"],
    [47, 81, "la ruleta frena"], [49, 76, "3 cuotas"],
  ])("en %s suena la nota %i (%s)", (b, midi) => {
    expect(pluck(b)).toEqual([midi]);
  });
});

describe("T1 · cue sheet", () => {
  it("las 13 patadas de la ruleta bajan de fuerza y la frenada cae en el La", () => {
    const ticks = t1.effects!.filter((e) => e.scene === "w5-ruleta" && e.voice === "tick");
    expect(ticks).toHaveLength(13);
    expect(ticks[0]!.t).toBe(44.5);
    expect(ticks.at(-1)!.t).toBe(46.5);
    expect(ticks[0]!.vel).toBeGreaterThan(ticks.at(-1)!.vel);
    expect(t1.effects!.find((e) => e.scene === "w5-ruleta" && e.voice === "impact")!.t).toBe(47);
  });

  it("los cinco golpes de la bolsa suben Fa–La–Do–Mi–Fa", () => {
    const bass = t1.effects!.filter((e) => e.scene === "w3-regalo" && e.voice === "bass");
    expect(bass.map((e) => e.midi)).toEqual([41, 45, 48, 52, 53]);
    expect(bass.map((e) => e.t)).toEqual([37, 37.5, 38, 38.5, 39]);
  });

  it("todo cae dentro de la pieza y los efectos no repiten lo que ya suena por estilo", () => {
    for (const n of musical) expect(n.t).toBeLessThan(t1.duration);
    expect(t1.effects!.some((e) => e.voice === "impact" && e.t === 32)).toBe(false);
    expect(t1.effects!.some((e) => e.voice === "boom" && e.t === 56)).toBe(false);
    expect(t1.effects!.some((e) => e.voice === "riser" && e.t === 28.5)).toBe(false);
  });
});
