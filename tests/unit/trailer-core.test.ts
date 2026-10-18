import { describe, expect, it } from "vitest";
import { createClock } from "@/trailer/core/clock";
import { fitStage } from "@/trailer/core/fit";
import { parseParams } from "@/trailer/core/params";
import { bars, beatSec, sceneAt, sequence, validateTrailer } from "@/trailer/core/timeline";
import { STAGE, type TrailerSpec } from "@/trailer/core/types";

const BPM = 120; // medio tiempo = 0,25 s
const spec = (scenes: TrailerSpec["scenes"], duration = 4): TrailerSpec => ({ id: "x", title: "X", bpm: BPM, duration, scenes });

describe("trailer · línea de tiempo", () => {
  it("la grilla musical: un tiempo y cuatro compases", () => {
    expect(beatSec(128)).toBeCloseTo(0.46875);
    expect(bars(4, BPM)).toBe(8);
  });

  it("sequence encadena escenas sin sumar a mano", () => {
    const s = sequence([{ id: "a", recipe: "slam", dur: 1.5 }, { id: "b", recipe: "slam", dur: 2.5 }]);
    expect(s.map((x) => x.start)).toEqual([0, 1.5]);
    expect(validateTrailer(spec(s))).toEqual([]);
  });

  it("detecta huecos, encimadas, ids repetidos, cortes fuera de grilla y un final corto", () => {
    expect(validateTrailer(spec([{ id: "a", recipe: "r", start: 0, dur: 1 }, { id: "b", recipe: "r", start: 1.5, dur: 2.5 }]))).toEqual(["b: empieza en 1.5 y la anterior termina en 1 (hueco)"]);
    expect(validateTrailer(spec([{ id: "a", recipe: "r", start: 0, dur: 2 }, { id: "a", recipe: "r", start: 1.75, dur: 2.25 }]))).toEqual(["escena repetida: a", "a: empieza en 1.75 y la anterior termina en 2 (encimada)"]);
    expect(validateTrailer(spec([{ id: "a", recipe: "r", start: 0, dur: 1.1 }, { id: "b", recipe: "r", start: 1.1, dur: 2.9 }]))[0]).toMatch(/no cae en la grilla/);
    expect(validateTrailer(spec([{ id: "a", recipe: "r", start: 0, dur: 3 }]))).toEqual(["la última escena termina en 3 y el trailer dura 4"]);
    expect(validateTrailer(spec([]))).toEqual(["el trailer no tiene escenas"]);
  });

  it("sceneAt devuelve la escena en pantalla, también en el último cuadro", () => {
    const s = spec(sequence([{ id: "a", recipe: "r", dur: 1 }, { id: "b", recipe: "r", dur: 3 }]));
    expect(sceneAt(s, 0)?.id).toBe("a");
    expect(sceneAt(s, 1)?.id).toBe("b");
    expect(sceneAt(s, 4)?.id).toBe("b");
    expect(sceneAt(s, -1)).toBeUndefined();
  });
});

describe("trailer · parámetros de la URL", () => {
  it("lee t, ratio, export y dev, y recorta t a la duración", () => {
    expect(parseParams("?t=12.5&ratio=9x16&export=1&dev=1", 60)).toEqual({ t: 12.5, ratio: "9x16", exportMode: true, dev: true });
    expect(parseParams("?t=999", 60).t).toBe(60);
    expect(parseParams("?t=-3", 60).t).toBe(0);
  });
  it("valores inválidos caen en el valor por defecto", () => {
    expect(parseParams("?t=abc&ratio=4x3", 60)).toEqual({ t: null, ratio: "16x9", exportMode: false, dev: false });
    expect(parseParams("?t=", 60).t).toBeNull();
  });
});

describe("trailer · escenario", () => {
  it("escala y centra 16:9 en una ventana vertical y 9:16 en una horizontal", () => {
    expect(fitStage(STAGE["16x9"], 960, 1000)).toEqual({ scale: 0.5, x: 0, y: 230 });
    expect(fitStage(STAGE["9x16"], 1920, 960)).toEqual({ scale: 0.5, x: 690, y: 0 });
    expect(fitStage(STAGE["16x9"], 0, 0).scale).toBe(0);
  });
});

describe("trailer · reloj", () => {
  it("corre con la fuente, se pausa, salta y no pasa del final", () => {
    let now = 100;
    const c = createClock(() => now, 10);
    expect(c.time()).toBe(0);
    c.play(); now = 103;
    expect(c.time()).toBe(3);
    c.pause(); now = 200;
    expect(c.time()).toBe(3);
    c.seek(7); c.play(); now = 205;
    expect(c.time()).toBe(10);
    expect(c.playing()).toBe(false);
    c.pause(); c.play(); // al terminar, play vuelve a empezar
    expect(c.time()).toBe(0);
  });
});
