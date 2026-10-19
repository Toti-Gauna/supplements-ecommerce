import { describe, expect, it } from "vitest";
import { TU_TIENDA_BOOK, USD_RATE } from "@/trailer/eclipse/book";
import { fmtArs, fmtUsd } from "@/trailer/eclipse/pricing";
import { GROWTH_OFFER, offerPrices, SALES_BOOK } from "@/trailer/eclipse/offer";

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

  it("el guiño del teaser sale del libro: titular, renglón con su precio y letra chica con el plan bonificado", () => {
    const t = section("base-campaign").teaser!;
    expect([t.title, t.italic]).toEqual(["Arrancá con 3 meses", "bonificados."]);
    expect(t.item).toBe("Adaptación de Tu tienda + asesoría inicial de growth");
    expect(t.price).toEqual({ usd: 500, ars: 750_000 });
    expect(t.fine).toBe("Incluye 3 meses del plan Esencial ($ 45.000/mes) · sujeto a disponibilidad · dólar a $ 1.500");
    expect(section("launch-pack-draft").teaser).toBeUndefined(); // el pack es un borrador: no se muestra en el teaser
  });
});

describe("trailer · oferta de venta de T1 (19/10/2026)", () => {
  const p = offerPrices(GROWTH_OFFER);
  it("el paquete sale USD 500 = $ 750.000 y al contado lleva el 50 % de descuento", () => {
    expect(p.list).toEqual({ usd: 500, ars: 750_000 });
    expect(p.cash).toEqual({ usd: 250, ars: 375_000 });
  });
  it("en hasta 4 cuotas, cada una con 20 % de recargo: 4 × $ 225.000 = $ 900.000", () => {
    expect(p.installments).toBe(4);
    expect(p.installment).toEqual({ usd: 150, ars: 225_000 });
    expect(p.financed).toEqual({ usd: 600, ars: 900_000 });
  });
  it("incluye 2 meses de mantenimiento, 100 mensajes de WhatsApp y la asesoría", () => {
    expect(GROWTH_OFFER.maintenance.months).toBe(2);
    expect(GROWTH_OFFER.includes.map((i) => i.name)).toEqual(["Tienda digital moderna", "100 mensajes automáticos de WhatsApp", "Asesoría en marketing digital y trends"]);
  });
  it("el mantenimiento muestra el plan Esencial del tarifario después de los meses bonificados, y las piezas usan sus precios", () => {
    const m = SALES_BOOK.sections.find((s) => s.id === "mantenimiento")!;
    expect(m.rows.at(-1)!.price).toEqual({ usd: 30, ars: 45_000 });
    const piezas = SALES_BOOK.sections.find((s) => s.id === "piezas")!;
    expect(piezas.rows[0]!.name).toBe("Más mensajes automáticos de WhatsApp");
    expect(piezas.rows.slice(1).map((r) => r.price?.usd)).toEqual([250, 250, 150, 200]);
  });
});
