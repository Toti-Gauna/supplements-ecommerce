import { describe, expect, it } from "vitest";
import { TU_TIENDA_BOOK, USD_RATE } from "@/trailer/eclipse/book";
import { fmtArs, fmtUsd } from "@/trailer/eclipse/pricing";

describe("trailer · libro de precios de Eclipse", () => {
  const book = TU_TIENDA_BOOK;
  const section = (id: string) => book.sections.find((s) => s.id === id)!;

  it("usa el tarifario aprobado y pasa a pesos a $1.500 por dólar", () => {
    expect(book.version).toBe("2026-10-16.aprobado");
    expect(USD_RATE).toBe(1500);
    expect(section("base-campaign").rows[0]!.price).toEqual({ usd: 500, ars: 750_000 });
    expect(section("launch-pack-draft").rows[0]!.price).toEqual({ usd: 700, ars: 1_050_000 });
  });

  it("muestra primero la campaña base, después el pack, los planes y los extras", () => {
    expect(book.sections.map((s) => s.id)).toEqual(["base-campaign", "launch-pack-draft", "planes", "extras"]);
  });

  it("la campaña base incluye la asesoría de growth y bonifica 3 meses del plan Esencial", () => {
    const rows = section("base-campaign").rows;
    expect(rows.find((r) => r.name.startsWith("Asesoría growth"))?.tag).toBe("Incluida · vale USD 150");
    expect(rows.find((r) => r.credit)?.price).toEqual({ usd: -90, ars: -135_000 });
  });

  it("el pack trae la landing incluida y avisa que está sujeto a disponibilidad", () => {
    const s = section("launch-pack-draft");
    expect(s.rows.some((r) => r.tag === "Incluida · vale USD 200")).toBe(true);
    expect(s.note).toMatch(/sujeto a disponibilidad/);
  });

  it("los tres planes son mensuales y los extras muestran las dos asesorías", () => {
    expect(section("planes").rows.map((r) => [r.name, r.price?.ars, r.unit])).toEqual([["Esencial", 45_000, "por mes"], ["Conectado", 112_500, "por mes"], ["Automatización/IA", 225_000, "por mes"]]);
    expect(section("extras").rows.map((r) => r.price?.usd)).toEqual([150, 150, 250, 100, 250, 250]);
  });

  it("formatea pesos y dólares como en el kit", () => {
    expect(fmtArs(750_000)).toBe("$ 750.000");
    expect(fmtArs(-135_000)).toBe("−$ 135.000");
    expect(fmtUsd(1500)).toBe("USD 1.500");
  });
});
