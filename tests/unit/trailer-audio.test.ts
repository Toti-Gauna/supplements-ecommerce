import { describe, expect, it } from "vitest";
import { buildScore, HOOK, MAJOR, MINOR, type MusicPlan } from "@/trailer/audio/score";
import { encodeWav } from "@/trailer/audio/wav";
import { firma } from "@/trailer/pieces/firma";

const BPM = 128, beat = 60 / BPM, eighth = beat / 2;
const plan: MusicPlan = firma.music!;
const notes = buildScore(plan);
const within = (from: number, to: number) => notes.filter((n) => n.t >= from * beat - 1e-6 && n.t < to * beat - 1e-6);

describe("trailer · firma sonora", () => {
  it("el estribillo: 4 compases, pentatónica (entra en La menor y en Do mayor) y termina en La", () => {
    expect(HOOK).toHaveLength(32);
    const pcs = new Set(HOOK.filter((m): m is number => m !== null).map((m) => m % 12));
    expect([...pcs].every((pc) => [0, 2, 4, 7, 9, 11].includes(pc))).toBe(true);
    expect(HOOK.filter((m) => m !== null).at(-1)! % 12).toBe(9);
    expect(HOOK.slice(0, 5)).toEqual(HOOK.slice(16, 21)); // los compases 1 y 3 arrancan igual
    expect([MINOR.length, MAJOR.length]).toEqual([4, 4]);
  });

  it("todo cae en la grilla de corcheas y dentro del trailer", () => {
    for (const n of notes) {
      expect(Math.abs(n.t / eighth - Math.round(n.t / eighth))).toBeLessThan(1e-3);
      expect(n.t).toBeLessThan(firma.duration);
    }
  });

  it("la apertura sube y corta: silencio real antes del golpe del drop", () => {
    const riser = notes.find((n) => n.voice === "riser")!;
    expect(riser.t + riser.dur).toBeCloseTo(11.5 * beat, 3);
    expect(within(11.5, 12)).toEqual([]);
    expect(within(12, 12.01).map((n) => n.voice)).toEqual(expect.arrayContaining(["impact", "kick"]));
  });

  it("el drop lleva bombo en cada tiempo, palmas en 2 y 4 y el estribillo", () => {
    const drop = within(12, 40);
    expect(drop.filter((n) => n.voice === "kick")).toHaveLength(28);
    expect(drop.filter((n) => n.voice === "clap")).toHaveLength(14);
    expect(drop.filter((n) => n.voice === "pluck").map((n) => n.midi).slice(0, 5)).toEqual([76, 76, 79, 81, 79]);
  });

  it("la parte tranquila (precios) no tiene bombo ni palmas y canta el estribillo lento en campanas", () => {
    const calm = within(40, 96);
    expect(calm.some((n) => n.voice === "kick" || n.voice === "clap" || n.voice === "hat")).toBe(false);
    const bells = calm.filter((n) => n.voice === "bell");
    expect(bells.slice(0, 3).map((n) => n.midi)).toEqual([76, 76, 79]);
    expect(bells[1]!.t - bells[0]!.t).toBeCloseTo(2 * beat, 3); // negras: el doble de lento
  });

  it("el cierre: golpe grave y el acorde que se apaga", () => {
    expect(within(96, 106).map((n) => n.voice)).toEqual(expect.arrayContaining(["boom", "pad", "bell"]));
  });
});

describe("trailer · WAV", () => {
  it("arma un PCM de 16 bits estéreo con encabezado válido", () => {
    const wav = encodeWav([new Float32Array([0, 1, -1]), new Float32Array([0.5, 0, 2])], 48000);
    const v = new DataView(wav.buffer);
    expect(String.fromCharCode(...wav.slice(0, 4))).toBe("RIFF");
    expect(v.getUint16(22, true)).toBe(2);
    expect(v.getUint32(24, true)).toBe(48000);
    expect(v.getUint32(40, true)).toBe(12);
    expect(v.getInt16(46, true)).toBe(16383); // 0,5 a la derecha
    expect(v.getInt16(48, true)).toBe(32767);
    expect(v.getInt16(54, true)).toBe(32767); // recorta el 2
  });
});
