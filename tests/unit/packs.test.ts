import { describe, expect, it } from "vitest";
import type { CartLine } from "@/demo/engine/cart-types";
import { NO_PACK_DISCOUNT, packCartLines, packId, packMissingItems, quotePack, validatePack } from "@/demo/engine/packs";
import { quoteCart } from "@/demo/engine/pricing";
import { demoData } from "@/demo/engine/source";
import {
  cancelSubscription, changeDay, createSubscription, deliveriesWithin, nextDelivery, pauseSubscription, resumeSubscription,
  subscriptionsFromLines, toggleSkipNext,
} from "@/demo/engine/subscriptions";
import { packs } from "@/demo/fixtures/packs";
import { workshopSettings } from "@/demo/fixtures/workshop";

const cal = { closedWeekdays: workshopSettings.closedWeekdays, closures: workshopSettings.closures };
const pack = (id: string) => packs.find((p) => p.id === id)!;
const withIds = (lines: ReturnType<typeof packCartLines>): CartLine[] => lines.map((l, i) => ({ ...l, id: `l${i}` }));

describe("packs (L3)", () => {
  it("todos los packs de muestra se pueden comprar y combinan suplementos con equipamiento donde corresponde", () => {
    for (const p of packs) {
      const q = quotePack(p);
      expect(q.available, `${p.name}: ${q.missing.join(", ")}`).toBe(true);
      expect(q.lines.some((l) => l.recurring)).toBe(true);
    }
    const hip = quotePack(pack("hipertrofia"));
    expect(hip.lines.filter((l) => !l.recurring).map((l) => l.product.slug)).toEqual(["straps-algodon"]);
  });

  it("precio del pack, del mes y ahorro, en pesos enteros", () => {
    const q = quotePack(pack("hipertrofia"));
    expect(q.discount).toBe(Math.round((q.subtotal * 10) / 100));
    expect(q.price).toBe(q.subtotal - q.discount);
    // Cada mes solo se repiten los suplementos y se suma el extra por suscribirse (10 % + 5 %).
    expect(q.monthlySubtotal).toBe(q.lines.filter((l) => l.recurring).reduce((s, l) => s + l.lineTotal, 0));
    expect(q.monthlyPrice).toBe(q.monthlySubtotal - Math.round((q.monthlySubtotal * 15) / 100));
    expect(q.monthlySaving).toBe(q.monthlySubtotal - q.monthlyPrice);
    for (const n of [q.subtotal, q.discount, q.price, q.monthlyPrice]) expect(Number.isInteger(n)).toBe(true);
    expect(q.lastsDays).toBeGreaterThan(0);
  });

  it("un producto sin stock deja el pack no disponible y dice cuál", () => {
    const stocked = demoData().products.map((p) => (p.slug === "isolate-zero" ? { ...p, variants: p.variants.map((v) => ({ ...v, stock: 0 })) } : p));
    const before = demoData().products;
    demoData().products = stocked;
    try {
      const q = quotePack(pack("fuerza"));
      expect(q.available).toBe(false);
      expect(q.missing).toEqual(["Isolate Zero"]);
    } finally { demoData().products = before; }
  });

  it("el carrito descuenta solo el pack completo; si falta un producto no hay descuento", () => {
    const q = quotePack(pack("principiante"));
    const full = withIds(packCartLines(q));
    const quote = quoteCart(full);
    expect(quote.pack.discount).toBe(q.discount);
    expect(quote.pack.entries).toMatchObject([{ packId: "principiante", pct: 10, monthly: false }]);
    expect(quote.total).toBe(q.price);
    const partial = full.slice(1);
    expect(quoteCart(partial).pack).toEqual(NO_PACK_DISCOUNT);
    expect(packMissingItems(partial, pack("principiante"))).toEqual(["Ionic Whey 100%"]);
  });

  it("suscripción: suma el extra mensual y las líneas del pack no suman al descuento stack", () => {
    const q = quotePack(pack("hipertrofia"));
    const lines = withIds(packCartLines(q, 12));
    const quote = quoteCart(lines);
    expect(quote.pack.entries[0]).toMatchObject({ pct: 15, monthly: true });
    expect(quote.stack.discount).toBe(0);
    // Suelto, el mismo carrito sí junta categorías para el stack.
    const loose = quoteCart(lines.map((l) => ({ id: l.id, productSlug: l.productSlug, variantId: l.variantId, quantity: l.quantity })));
    expect(loose.pack.discount).toBe(0);
    expect(loose.stack.discount).toBeGreaterThan(0);
  });

  it("validaciones del panel", () => {
    const ok = pack("fuerza");
    expect(validatePack(ok, packs)).toEqual([]);
    expect(validatePack({ ...ok, name: " " }, packs)).toContain("El pack necesita un nombre.");
    expect(validatePack({ ...ok, name: "pack hipertrofia" }, packs)).toContain("Ya hay un pack con ese nombre.");
    expect(validatePack({ ...ok, items: ok.items.slice(0, 1) }, packs)).toContain("Un pack lleva al menos dos productos.");
    expect(validatePack({ ...ok, items: [ok.items[0]!, ok.items[0]!] }, packs)).toContain("Un producto no puede estar dos veces en el mismo pack.");
    expect(validatePack({ ...ok, items: [{ productSlug: "straps-algodon", qty: 1 }, { productSlug: "botella-1l", qty: 1 }] }, packs)[0]).toMatch(/al menos un suplemento/);
    expect(validatePack({ ...ok, discountPct: 41 }, packs)).toContain("El descuento del pack va de 0 a 40 %.");
    expect(validatePack({ ...ok, monthlyPct: -1 }, packs)).toContain("El extra mensual va de 0 a 20 %.");
    expect(packId("Pack Ñandú 2", [])).toBe("pack-nandu-2");
    expect(packId("Pack Fuerza", packs)).toBe("pack-fuerza");
    expect(packId("Fuerza", packs)).toBe("fuerza-2");
  });
});

describe("suscripciones a un pack (simuladas)", () => {
  const p = pack("hipertrofia");
  const sub = createSubscription({ pack: p, choices: { "ionic-whey": "x" }, day: 12, today: "2026-10-05", orderCode: "VOL-1", id: "s1" });

  it("la próxima entrega es el día elegido, después de hoy, en un día hábil", () => {
    expect(sub).toMatchObject({ status: "active", skipNext: false, startedOn: "2026-10-05" });
    // 12 de octubre de 2026 es feriado (y lunes): corre al próximo día hábil.
    const next = nextDelivery(sub, "2026-10-05", cal)!;
    expect(next > "2026-10-11" && next < "2026-10-16").toBe(true);
    // Después del día elegido, es el del mes siguiente.
    expect(nextDelivery({ ...sub, day: 3 }, "2026-10-05", cal)!.startsWith("2026-11-")).toBe(true);
    expect(nextDelivery({ ...sub, day: 28 }, "2026-12-30", cal)!.startsWith("2027-01-")).toBe(true);
  });

  it("saltear, pausar, reanudar y cancelar", () => {
    const skipped = toggleSkipNext(sub);
    expect(nextDelivery(skipped, "2026-10-05", cal)!.startsWith("2026-11-")).toBe(true);
    expect(toggleSkipNext(skipped).skipNext).toBe(false);
    const paused = pauseSubscription(skipped);
    expect([paused.status, paused.skipNext, nextDelivery(paused, "2026-10-05", cal)]).toEqual(["paused", false, null]);
    expect(toggleSkipNext(paused)).toBe(paused);
    expect(resumeSubscription(paused).status).toBe("active");
    const cancelled = cancelSubscription(paused);
    expect(cancelled.status).toBe("cancelled");
    expect(resumeSubscription(cancelled)).toBe(cancelled);
    expect(changeDay(cancelled, 20)).toBe(cancelled);
    expect(changeDay(sub, 29)).toBe(sub);
    expect(changeDay(sub, 20).day).toBe(20);
    expect(() => createSubscription({ pack: p, choices: {}, day: 0, today: "2026-10-05", orderCode: "x", id: "x" })).toThrow();
  });

  it("el pedido arma una suscripción por pack mensual completo", () => {
    const lines = withIds(packCartLines(quotePack(p), 20));
    const made = subscriptionsFromLines(lines, packs, { today: "2026-10-05", orderCode: "VOL-9", newId: () => "n1" });
    expect(made).toHaveLength(1);
    expect(made[0]).toMatchObject({ packId: "hipertrofia", day: 20, orderCode: "VOL-9" });
    expect(Object.keys(made[0]!.choices)).toEqual(p.items.map((i) => i.productSlug));
    expect(subscriptionsFromLines(lines.slice(1), packs, { today: "2026-10-05", orderCode: "x", newId: () => "n" })).toEqual([]);
    expect(subscriptionsFromLines(withIds(packCartLines(quotePack(p))), packs, { today: "2026-10-05", orderCode: "x", newId: () => "n" })).toEqual([]);
  });

  it("las entregas de los próximos días, ordenadas", () => {
    const a = createSubscription({ pack: p, choices: {}, day: 20, today: "2026-10-05", orderCode: "a", id: "a" });
    const b = createSubscription({ pack: p, choices: {}, day: 8, today: "2026-10-05", orderCode: "b", id: "b" });
    const list = deliveriesWithin([a, b, pauseSubscription(sub)], "2026-10-05", 30, cal);
    expect(list.map((x) => x.sub.id)).toEqual(["b", "a"]);
    expect(deliveriesWithin([a, b], "2026-10-05", 2, cal)).toEqual([]);
  });
});
