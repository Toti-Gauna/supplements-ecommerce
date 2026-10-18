import { describe, expect, it } from "vitest";
import { checkPayments } from "@/demo/admin/settings-form";
import { closeDay, daySummary, differenceText } from "@/demo/engine/counter-close";
import { cashChange, cashSuggestions, chargeFor, chargeLabel, counterPlans, installmentCharge, payOptions } from "@/demo/engine/counter-pay";
import type { CounterSale } from "@/demo/engine/counter-sale";
import { DEFAULT_COUNTER_PLANS } from "@/demo/fixtures/counter";

/** R4b · cobro del mostrador (vuelto y cuotas con recargo en pesos enteros) y el cierre del día con la caja esperada. */
const plans = DEFAULT_COUNTER_PLANS; // 3 cuotas +12 %, 6 cuotas +24 %

describe("cobro", () => {
  it("efectivo: vuelto exacto; si no alcanza, avisa cuánto falta", () => {
    expect(cashChange(109530, 120000)).toEqual({ change: 10470, missing: 0 });
    expect(cashChange(109530, 100000)).toEqual({ change: 0, missing: 9530 });
    expect(chargeFor(109530, { method: "CASH", received: 120000 }, plans)).toMatchObject({ total: 109530, received: 120000, change: 10470, surcharge: 0 });
    expect(chargeFor(109530, { method: "CASH" }, plans)).toMatchObject({ received: 109530, change: 0 });
    expect(chargeFor(109530, { method: "CASH", received: 100000 }, plans)).toEqual({ error: "Con $ 100.000 no alcanza: faltan $ 9.530." });
  });

  it("billetes sugeridos: justo y redondeos hacia arriba, sin repetir", () => {
    expect(cashSuggestions(109530)).toEqual([109530, 110000, 120000, 150000]);
    expect(cashSuggestions(110000)).toEqual([110000, 120000, 150000, 200000]);
    expect(cashSuggestions(2900)).toEqual([2900, 3000, 10000, 20000]);
    expect(cashSuggestions(0)).toEqual([]);
  });

  it("transferencia, débito y crédito en 1 pago cobran el total sin recargo", () => {
    for (const choice of [{ method: "TRANSFER" as const }, { method: "DEBIT" as const }, { method: "CREDIT" as const, installments: 1 }]) {
      expect(chargeFor(109530, choice, plans)).toMatchObject({ total: 109530, surcharge: 0, installments: 1, installment: 109530 });
    }
  });

  it("cuotas con recargo: cuotas iguales en pesos enteros, redondeadas hacia arriba al peso", () => {
    // 109.530 × 1,12 = 122.673,6 → 3 cuotas de 40.891,2 → 40.892 (total 122.676).
    expect(installmentCharge(109530, { count: 3, pct: 12 })).toEqual({ installment: 40892, total: 122676, surcharge: 13146 });
    // 109.530 × 1,24 = 135.817,2 → 6 de 22.636,2 → 22.637 (total 135.822).
    expect(installmentCharge(109530, { count: 6, pct: 24 })).toEqual({ installment: 22637, total: 135822, surcharge: 26292 });
    // Exacto cuando divide justo.
    expect(installmentCharge(100000, { count: 3, pct: 20 })).toEqual({ installment: 40000, total: 120000, surcharge: 20000 });
    // % con decimales, siempre en enteros.
    expect(installmentCharge(10000, { count: 3, pct: 12.5 })).toEqual({ installment: 3750, total: 11250, surcharge: 1250 });
    for (const base of [1, 999, 54901, 123457]) {
      for (const p of plans) {
        const c = installmentCharge(base, p);
        expect(Number.isInteger(c.installment) && Number.isInteger(c.total)).toBe(true);
        expect(c.total).toBe(c.installment * p.count);
        expect(c.total).toBeGreaterThanOrEqual(base * (100 + p.pct) / 100);
        expect(c.total - base * (100 + p.pct) / 100).toBeLessThan(p.count);
      }
    }
  });

  it("chargeFor con cuotas usa el plan y rechaza uno que no existe", () => {
    expect(chargeFor(109530, { method: "CREDIT", installments: 3 }, plans)).toMatchObject({ installments: 3, pct: 12, installment: 40892, total: 122676, surcharge: 13146 });
    expect(chargeFor(109530, { method: "CREDIT", installments: 12 }, plans)).toEqual({ error: "El mostrador no tiene un plan de 12 cuotas." });
    expect(chargeFor(0, { method: "DEBIT" }, plans)).toEqual({ error: "El ticket está vacío." });
  });

  it("planes de los ajustes: se usan los válidos, ordenados; si no queda ninguno, los de muestra", () => {
    expect(counterPlans([{ count: 6, pct: 30 }, { count: 3, pct: 10 }])).toEqual([{ count: 3, pct: 10 }, { count: 6, pct: 30 }]);
    expect(counterPlans([{ count: 1, pct: 5 }, { count: 3, pct: 150 }])).toEqual(DEFAULT_COUNTER_PLANS);
    expect(counterPlans(undefined)).toEqual(DEFAULT_COUNTER_PLANS);
  });

  it("Ajustes → Medios de pago valida el recargo de las cuotas", () => {
    const ok = { methods: ["BANK_TRANSFER" as const], pct: 10, hours: 48, plans };
    expect(checkPayments(ok)).toBeNull();
    expect(checkPayments({ ...ok, plans: [{ count: 3, pct: 101 }] })).toBe("El recargo de las cuotas va de 0 a 100 %.");
  });

  it("botones de cobro y rótulos", () => {
    expect(payOptions(plans).map((o) => o.label)).toEqual(["Efectivo", "Transferencia", "Débito", "Crédito 1 pago", "3 cuotas", "6 cuotas"]);
    expect(payOptions(plans).at(-1)!.hint).toBe("Recargo 24 %");
    expect(chargeLabel({ method: "CREDIT", installments: 6 })).toBe("Crédito 6 cuotas");
    expect(chargeLabel({ method: "CREDIT", installments: 1 })).toBe("Crédito 1 pago");
    expect(chargeLabel({ method: "CASH", installments: 1 })).toBe("Efectivo");
  });
});

const DAY = "2026-10-05";
const make = (id: string, over: Partial<CounterSale>): CounterSale => ({
  id, number: id, day: DAY, at: `${DAY}T10:0${id}:00-03:00`, lines: [{ productSlug: "x", variantId: "y", productName: "X", variantLabel: "Y", qty: 1, unitPrice: 1000, total: 1000, lots: [] }],
  subtotal: 1000, stackDiscount: 0, method: "CASH", installments: 1, pct: 0, base: 1000, surcharge: 0, total: 1000, installment: 1000, ...over,
});

describe("cierre del día", () => {
  const sales = [
    make("1", { method: "CASH", base: 109530, total: 109530, received: 120000, change: 10470 }),
    make("2", { method: "DEBIT", base: 54900, total: 54900 }),
    make("3", { method: "CREDIT", installments: 3, pct: 12, base: 109530, surcharge: 13146, total: 122676, installment: 40892 }),
    make("4", { method: "TRANSFER", base: 29900, total: 29900 }),
    make("5", { method: "CASH", base: 2900, total: 2900, received: 3000, change: 100 }),
    make("6", { day: "2026-10-04", method: "CASH", total: 99999 }),
  ];

  it("caja esperada = fondo + efectivo cobrado; totales por medio, recargos y tickets", () => {
    const s = daySummary(sales, DAY, 20000);
    expect(s.tickets).toBe(5);
    expect(s.byMethod).toEqual({ CASH: 112430, TRANSFER: 29900, DEBIT: 54900, CREDIT: 122676 });
    expect(s.total).toBe(112430 + 29900 + 54900 + 122676);
    expect(s.surcharges).toBe(13146);
    expect(s.installmentSales).toBe(1);
    expect(s.cashExpected).toBe(132430);
    expect(s.sales.map((x) => x.id)).toEqual(["5", "4", "3", "2", "1"]);
  });

  it("cerrar marca las ventas y calcula la diferencia con lo contado; las ventas nuevas van al próximo cierre", () => {
    const at = `${DAY}T20:00:00-03:00`;
    const r = closeDay(sales, DAY, 20000, 132000, at);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.closure).toMatchObject({ tickets: 5, cashExpected: 132430, counted: 132000, difference: -430 });
    expect(r.sales.filter((s) => s.closedAt === at)).toHaveLength(5);
    expect(r.sales.find((s) => s.id === "6")!.closedAt).toBeUndefined();
    expect(daySummary(r.sales, DAY, 20000)).toMatchObject({ tickets: 0, cashExpected: 20000 });
    expect(closeDay(r.sales, DAY, 20000, null, at)).toEqual({ ok: false, error: "No hay ventas abiertas para cerrar." });
    expect(closeDay(sales, DAY, 20000, null, at)).toMatchObject({ ok: true, closure: { counted: null, difference: null } });
  });

  it("diferencia en palabras", () => {
    expect(differenceText(0)).toBe("La caja da justo");
    expect(differenceText(500)).toBe("Sobran $ 500");
    expect(differenceText(-1200)).toBe("Faltan $ 1.200");
  });
});
