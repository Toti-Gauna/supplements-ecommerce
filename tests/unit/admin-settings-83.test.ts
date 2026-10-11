import { describe, expect, it } from "vitest";
import { checkPayments, checkShipping, checkWhatsapp, zoneDraft, zoneFromDraft } from "@/demo/admin/settings-form";
import { defaultDemoData } from "@/demo/engine/source";

/** Polish 8.3 · Lote 8: validación de cada sección de Ajustes. */
const { zones, settings } = defaultDemoData();

describe("Ajustes por sección (8.3.29)", () => {
  it("WhatsApp: vacío o de 10 a 15 dígitos", () => {
    expect(checkWhatsapp("")).toBeNull();
    expect(checkWhatsapp("54 9 223 555 0000")).toBeNull();
    expect(checkWhatsapp("123")).toMatch(/código de país y área/);
    expect(checkWhatsapp("5".repeat(16))).toMatch(/código de país y área/);
  });

  it("medios de pago: mismas reglas que la página única", () => {
    const ok = { methods: settings.enabledMethods, pct: settings.transferDiscountPct, hours: settings.pendingTransferHours };
    expect(checkPayments(ok)).toBeNull();
    expect(checkPayments({ ...ok, methods: [] })).toBe("Dejá al menos un medio de pago activo.");
    expect(checkPayments({ ...ok, pct: 51 })).toMatch(/50%/);
    expect(checkPayments({ ...ok, hours: 0 })).toMatch(/1 a 168/);
    expect(checkPayments({ ...ok, hours: 169 })).toMatch(/1 a 168/);
  });

  it("envíos: los datos de muestra pasan; código postal mal escrito y plazo vacío se avisan", () => {
    const draft = { free: settings.freeShippingFrom, zones: zones.map(zoneDraft) };
    expect(checkShipping(draft)).toEqual({ free: undefined, zones: {} });
    const bad = { ...draft, zones: draft.zones.map((z) => (z.id === "local" ? { ...z, cps: "7600, 76OO" } : z.id === "pickup" ? { ...z, etaText: " " } : z)) };
    expect(checkShipping(bad).zones).toEqual({ pickup: ["Escribí el plazo que ve el comprador."], local: ["Estos códigos postales no tienen 4 dígitos: 76OO."] });
    expect(checkShipping({ ...draft, free: -1 }).free).toMatch(/negativo/);
  });

  it("la zona vuelve igual desde el borrador (sin perder códigos ni campos)", () => {
    for (const z of zones) expect(zoneFromDraft(zoneDraft(z))).toEqual(z);
    const local = zones.find((z) => z.type === "LOCAL_DELIVERY")!;
    expect(zoneFromDraft({ ...zoneDraft(local), cps: "7600  7601,7602" }).postalCodes).toEqual(["7600", "7601", "7602"]);
  });
});
