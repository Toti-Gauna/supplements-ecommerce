import { describe, expect, it } from "vitest";
import { BELT_CENTER_ROW, beltEase, beltPotCenter } from "@/trailer/recipes/clones";
import { tickerEase } from "@/trailer/recipes/ticker";

/** Velocidad relativa de una curva de avance (derivada numérica, en "recorrido total por unidad de avance"). */
const speed = (f: (p: number) => number, p: number, h = 1e-4) => (f(p + h) - f(p - h)) / (2 * h);

describe("T1 · curvas de las escenas del problema", () => {
  it("el ticker avanza de 0 a 1, sin retroceder ni saltar, y llega al final acelerado", () => {
    expect(tickerEase(0)).toBe(0);
    expect(tickerEase(1)).toBeCloseTo(1, 9);
    let prev = 0;
    for (let i = 1; i <= 350; i++) { const v = tickerEase(i / 350); expect(v).toBeGreaterThanOrEqual(prev); expect(v - prev).toBeLessThan(0.01); prev = v; }
    // Tramo constante (2 de 3,5 tiempos) y después acelera hasta ×4 sin cambiar de golpe en el empalme.
    const cruise = speed(tickerEase, 0.3);
    expect(speed(tickerEase, 2 / 3.5 - 0.001)).toBeCloseTo(cruise, 1);
    expect(speed(tickerEase, 0.999) / cruise).toBeCloseTo(4, 0);
  });

  it("la cinta de potes sube a velocidad constante y frena seco para dejar un pote justo en el centro", () => {
    expect(beltEase(0)).toBe(0);
    expect(beltEase(1)).toBeCloseTo(1, 9);
    expect(speed(beltEase, 0.2)).toBeCloseTo(speed(beltEase, 0.8), 3); // 900 px por tiempo, constante
    expect(speed(beltEase, 2.75 / 3 + 0.0005)).toBeCloseTo(speed(beltEase, 2.75 / 3 - 0.0005), 1); // el empalme no salta
    expect(speed(beltEase, 0.9999)).toBeLessThan(0.1 * speed(beltEase, 0.5)); // al final ya casi no se mueve
    expect(beltPotCenter(BELT_CENTER_ROW)).toBe(540);
  });
});
