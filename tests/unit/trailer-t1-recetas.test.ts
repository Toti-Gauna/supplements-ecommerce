import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { forRatio } from "@/trailer/recipes/plate-kit";
import { BELT_CENTER_ROW, beltEase, beltPotCenter } from "@/trailer/recipes/clones";
import { tickerEase } from "@/trailer/recipes/ticker";
import { t1 } from "@/trailer/pieces/t1";

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

describe("T1 · resumen para lectores de pantalla", () => {
  it("cuenta los supers, los rótulos, el contacto y el guiño con los datos de las escenas y del libro", () => {
    const s = t1.summary!;
    for (const text of ["Mismo template.", "La tuya, no.", "pantallas de carga por fecha", "mostrador en cuotas y lista del proveedor", "No es solo software.",
      "Para que la tuya venda más.", "223-446 7881", "Arrancá con 3 meses bonificados.", "$ 750.000 (USD 500)", "sujeto a disponibilidad"]) expect(s).toContain(text);
    expect(s).not.toMatch(/volta/i);
  });
});

describe("T1 · placas por formato", () => {
  const PLATE_KEYS = ["light", "dark", "before", "after"] as const;
  const ids = (props: Record<string, unknown>) => PLATE_KEYS.map((k) => props[k]).filter((v): v is string => typeof v === "string");

  it("forRatio deja la base en 16:9 y suma lo vertical en 9:16", () => {
    const props = { a: 1, b: 2, tall: { b: 3 } };
    expect(forRatio(props, "16x9")).toBe(props);
    expect(forRatio(props, "9x16")).toMatchObject({ a: 1, b: 3 });
    const sin = { a: 1 };
    expect(forRatio(sin, "9x16")).toBe(sin);
  });

  it("cada escena de placas trae su versión vertical y todos los archivos existen", () => {
    const withPlates = t1.scenes.filter((s) => (s.props as { mode?: string } | undefined)?.mode);
    expect(withPlates.map((s) => s.id)).toEqual(["w2-tema", "w6-mostrador", "w7-proveedor"]);
    for (const s of withPlates) {
      const props = s.props as Record<string, unknown> & { tall?: Record<string, unknown> };
      expect(props.tall, `${s.id}: falta la versión vertical`).toBeDefined();
      for (const id of [...ids(props), ...ids(props.tall!)]) expect(existsSync(join(process.cwd(), "public/trailer/shots/t1", `${id}.jpg`)), `${s.id}: ${id}.jpg`).toBe(true);
      for (const id of ids(props.tall!)) expect(id.endsWith("-t"), `${s.id}: ${id} es una placa de celular`).toBe(true);
    }
  });
});
