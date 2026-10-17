import { describe, expect, it } from "vitest";
import { seasonalThemes, themeCoupons } from "@/demo/fixtures/themes";
import { demoNow } from "@/demo/clock";
import { dropDiscount, missingForDrop, ticketBars, ticketSerial } from "@/demo/engine/campaign-drop";
import {
  ENDED_DAYS, calendarOrder, campaignAgenda, campaignWindow, countdownParts, daysLeftText, daysUntil, previewDay,
} from "@/demo/engine/campaign-window";

const ar = (iso: string) => Date.parse(`${iso}-03:00`);
const bf = seasonalThemes.find((t) => t.id === "black-friday")!;
const madre = seasonalThemes.find((t) => t.id === "dia-de-la-madre")!;
const anoNuevo = seasonalThemes.find((t) => t.id === "ano-nuevo")!;

describe("ventana de campaña (R3a)", () => {
  it("Black Friday: por venir, sala de espera 7 días antes, en vivo y terminada", () => {
    expect(campaignWindow(bf, ar("2026-11-05T12:00:00")).state).toBe("upcoming");
    const waiting = campaignWindow(bf, ar("2026-11-16T00:00:00"));
    expect(waiting.state).toBe("waiting");
    expect(waiting.target).toBe(ar("2026-11-23T00:00:00"));
    expect(campaignWindow(bf, ar("2026-11-15T23:59:59")).state).toBe("upcoming");
    const live = campaignWindow(bf, ar("2026-11-23T00:00:00"));
    expect(live.state).toBe("live");
    // Cierra a las 00:00 del día siguiente al último.
    expect(live.target).toBe(ar("2026-12-01T00:00:00"));
    expect(campaignWindow(bf, ar("2026-11-30T23:59:59")).state).toBe("live");
    const ended = campaignWindow(bf, ar("2026-12-01T00:00:00"));
    expect(ended.state).toBe("ended");
    expect(ended.target).toBeNull();
    expect(ended.nextStartsAt).toBe(ar("2027-11-23T00:00:00"));
  });

  it("sin sala de espera, la semana previa sigue 'por venir'; pasado el aviso de cierre, anuncia la próxima edición", () => {
    expect(campaignWindow(madre, ar("2026-09-28T12:00:00")).state).toBe("upcoming");
    expect(campaignWindow(madre, ar("2026-10-19T00:00:00")).state).toBe("ended");
    expect(ENDED_DAYS).toBe(14);
    const later = campaignWindow(madre, ar("2026-11-02T00:00:00"));
    expect(later.state).toBe("upcoming");
    expect(later.target).toBe(ar("2027-10-01T00:00:00"));
  });

  it("se repite cada año y contempla rangos que cruzan el año", () => {
    expect(campaignWindow(bf, ar("2030-11-25T10:00:00")).state).toBe("live");
    const w = campaignWindow(anoNuevo, ar("2027-01-03T12:00:00"));
    expect(w.state).toBe("live");
    expect(w.startsAt).toBe(ar("2026-12-26T00:00:00"));
    expect(w.target).toBe(ar("2027-01-07T00:00:00"));
  });

  it("cuenta regresiva en partes y días de calendario", () => {
    expect(countdownParts(ar("2026-11-23T00:00:00"), ar("2026-11-20T21:58:30"))).toEqual({ days: 2, hours: 2, minutes: 1, seconds: 30 });
    expect(countdownParts(0, 10_000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(daysUntil(ar("2026-11-23T00:00:00"), ar("2026-11-11T12:00:00"))).toBe(12);
    expect(daysUntil(ar("2026-11-23T00:00:00"), ar("2026-11-22T23:00:00"))).toBe(1);
    expect(daysLeftText(12)).toBe("faltan 12 días");
    expect(daysLeftText(1)).toBe("es mañana");
    expect(daysLeftText(0)).toBe("es hoy");
  });

  it("la vista previa simula el primer día, o tres días antes para la sala de espera", () => {
    expect(previewDay(bf, "live")).toBe("2026-11-23");
    expect(previewDay(bf, "waiting")).toBe("2026-11-20");
    expect(previewDay({ startsOn: "2027-03-01", endsOn: "2027-03-20" }, "waiting")).toBe("2027-02-26");
    expect(campaignWindow(bf, ar(`${previewDay(bf, "waiting")}T12:00:00`)).state).toBe("waiting");
  });

  it("el reloj de la demo pone la hora real de Buenos Aires en el día de la campaña", () => {
    expect(demoNow(new Date("2026-10-17T18:42:10Z"), "2026-11-23")).toBe("2026-11-23T18:42:10.000Z");
    expect(campaignWindow(bf, Date.parse(demoNow(new Date("2026-10-17T18:42:10Z"), previewDay(bf, "live")))).state).toBe("live");
  });

  it("agenda: la que está en vivo y la que viene; entre fechas, la próxima", () => {
    const gap = campaignAgenda(seasonalThemes, ar("2026-11-11T12:00:00"));
    expect(gap.live).toBeNull();
    expect(gap.next?.theme.id).toBe("black-friday");
    expect(gap.next?.window.state).toBe("upcoming");
    expect(campaignAgenda(seasonalThemes, ar("2026-11-18T12:00:00")).next?.window.state).toBe("waiting");
    const today = campaignAgenda(seasonalThemes, ar("2026-10-05T12:00:00"));
    expect(today.live?.id).toBe("dia-de-la-madre");
    expect(today.next?.theme.id).toBe("halloween");
    // Una campaña pausada no cuenta.
    expect(campaignAgenda(seasonalThemes.map((t) => (t.id === "black-friday" ? { ...t, active: false } : t)), ar("2026-11-11T12:00:00")).next?.theme.id).toBe("navidad");
  });

  it("orden de calendario: las 17 fechas de octubre a septiembre", () => {
    const order = calendarOrder(seasonalThemes).map((t) => t.id);
    expect(order).toHaveLength(17);
    expect(order[0]).toBe("dia-de-la-madre");
    expect(order.at(-1)).toBe("operacion-verano");
    expect(order.indexOf("crossfit-open")).toBeGreaterThan(order.indexOf("vuelta-al-gym"));
  });
});

describe("drop de campaña", () => {
  const coupon = (code: string) => themeCoupons.find((c) => c.code === code)!;

  it("el descuento del marcador sale del cupón: porcentaje, monto fijo o envío", () => {
    expect(dropDiscount(coupon("BLACK30"))).toEqual({ kind: "percent", led: "30", sign: "%", label: "30 %", condition: "Desde $ 40.000 de compra" });
    expect(dropDiscount(coupon("COMPA5000"))).toMatchObject({ kind: "fixed", led: "5.000", sign: "$", label: "$ 5.000" });
    expect(dropDiscount(coupon("MAMA15")).condition).toBeNull();
    expect(dropDiscount({ type: "FREE_SHIPPING", value: 0 })).toMatchObject({ kind: "shipping", led: null, label: "Envío gratis" });
  });

  it("lo que falta para el mínimo, en pesos enteros", () => {
    expect(missingForDrop(35_700, coupon("BLACK30"))).toBe(4300);
    expect(missingForDrop(50_000, coupon("BLACK30"))).toBe(0);
    expect(missingForDrop(1000, coupon("MAMA15"))).toBe(0);
  });

  it("serie y barras del ticket: decorativas y estables", () => {
    expect(ticketSerial(bf)).toMatch(/^BF·2311·\d{4}$/);
    expect(ticketSerial(bf)).toBe(ticketSerial(bf));
    const bars = ticketBars("BLACK30");
    expect(bars).toHaveLength(28);
    expect(bars.every((b) => b >= 1 && b <= 3)).toBe(true);
    expect(ticketBars("BLACK30")).toEqual(bars);
    expect(ticketBars("HOTSALE30")).not.toEqual(bars);
  });
});
