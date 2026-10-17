import { beforeEach, describe, expect, it } from "vitest";
import { prepareList, subscriptionRows, subscriptionStats } from "@/demo/admin/subscription-view";
import { quotePack } from "@/demo/engine/packs";
import { cancelSubscription, createSubscription, deliveriesWithin, pauseSubscription, type Subscription } from "@/demo/engine/subscriptions";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { packs as samplePacks } from "@/demo/fixtures/packs";
import { seedSubscriptions } from "@/demo/fixtures/subscriptions";
import { workshopSettings } from "@/demo/fixtures/workshop";
import { useAdmin } from "@/stores/admin";

/** L3 · derivados de la pantalla de Suscripciones del panel: filas, números y "Qué preparar". */
const cal = { closedWeekdays: workshopSettings.closedWeekdays, closures: workshopSettings.closures };
const hip = () => samplePacks.find((p) => p.id === "hipertrofia")!;

beforeEach(() => useAdmin.getState().resetAdmin());

const sub = (over: Partial<Subscription> = {}): Subscription =>
  ({ ...createSubscription({ pack: hip(), choices: {}, day: 10, today: "2026-09-01", orderCode: "VOL-000200", id: "s-x", customer: "Persona Inventada" }), ...over });

describe("suscripciones del panel: números, filas y qué preparar", () => {
  it("las filas traen cliente, pack, próxima entrega e importe mensual; las de muestra no vienen de la tienda", () => {
    const rows = subscriptionRows([...seedSubscriptions, sub()], samplePacks, DEMO_TODAY, cal);
    const seed = rows.find((r) => r.sub.id === "sub-seed-1")!;
    expect(seed).toMatchObject({ customer: "Julián Paz", packName: "Pack Hipertrofia", fromShop: false });
    expect(seed.next).toMatch(/^2026-10-\d\d$/);
    expect(seed.amount).toBe(quotePack(hip()).monthlyPrice);
    expect(rows.at(-1)!.fromShop).toBe(true);
    expect(rows.find((r) => r.sub.id === "sub-seed-3")!.next).toBeNull();
  });

  it("un pack quitado queda marcado y sin importe", () => {
    const [row] = subscriptionRows([sub({ packId: "ya-no-existe" })], samplePacks, DEMO_TODAY, cal);
    expect(row).toMatchObject({ packName: "Pack quitado", packFound: false, amount: null });
  });

  it("estadísticas: activas, pausadas, ingreso mensual estimado en pesos enteros y entregas de 30 días", () => {
    const stats = subscriptionStats(seedSubscriptions, samplePacks, DEMO_TODAY, cal);
    expect(stats).toMatchObject({ active: 3, paused: 1, cancelled: 0 });
    const expected = seedSubscriptions.filter((s) => s.status === "active").reduce((n, s) => n + quotePack(samplePacks.find((p) => p.id === s.packId)!).monthlyPrice, 0);
    expect(stats.monthlyIncome).toBe(expected);
    expect(Number.isInteger(stats.monthlyIncome)).toBe(true);
    expect(stats.deliveries).toBe(deliveriesWithin(seedSubscriptions, DEMO_TODAY, 30, cal).length);
    expect(stats.deliveries).toBe(2);
  });

  it("pausar y cancelar sacan a la suscripción del ingreso y de las entregas", () => {
    const base = [sub({ startedOn: "2026-09-10" })];
    expect(subscriptionStats(base, samplePacks, DEMO_TODAY, cal)).toMatchObject({ active: 1, deliveries: 1 });
    const paused = subscriptionStats([pauseSubscription(base[0]!)], samplePacks, DEMO_TODAY, cal);
    expect(paused).toMatchObject({ active: 0, paused: 1, monthlyIncome: 0, deliveries: 0 });
    expect(subscriptionStats([cancelSubscription(base[0]!)], samplePacks, DEMO_TODAY, cal)).toMatchObject({ cancelled: 1, monthlyIncome: 0 });
  });

  it("qué preparar agrupa por fecha, lleva solo lo que se repite y suma las unidades por producto", () => {
    const subs = [sub({ id: "a", startedOn: "2026-09-10", choices: {} }), sub({ id: "b", startedOn: "2026-09-10", customer: "Otra Persona" })];
    const list = prepareList(subs, samplePacks, DEMO_TODAY, cal);
    expect(list.deliveries).toBe(2);
    expect(list.days).toHaveLength(1);
    expect(list.days[0]!.deliveries.map((d) => d.customer)).toEqual(["Persona Inventada", "Otra Persona"]);
    const slugs = list.days[0]!.deliveries[0]!.lines.map((l) => l.productSlug);
    expect(slugs).toEqual(["ionic-whey", "creatina-monohidrato", "mass-gainer"]);
    expect(slugs).not.toContain("straps-algodon");
    expect(list.totals.map((t) => t.productSlug).sort()).toEqual([...slugs].sort());
    expect(list.totals.every((t) => t.qty === 2)).toBe(true);
    expect(list.units).toBe(6);
    expect(list.days[0]!.units).toBe(6);
  });

  it("sin entregas en 30 días no hay nada para preparar", () => {
    const list = prepareList([pauseSubscription(sub())], samplePacks, DEMO_TODAY, cal);
    expect(list).toEqual({ days: [], totals: [], units: 0, deliveries: 0 });
  });

  it("las entregas de días distintos quedan en orden de fecha; una de un pack quitado aparece sin productos", () => {
    const early = sub({ id: "early", day: 8, startedOn: "2026-09-08" });
    const late = sub({ id: "late", day: 28, startedOn: "2026-09-28", packId: "ya-no-existe" });
    const list = prepareList([late, early], samplePacks, DEMO_TODAY, cal);
    expect(list.days.map((d) => d.date)).toEqual([...list.days.map((d) => d.date)].sort());
    expect(list.days.at(-1)!.deliveries[0]).toMatchObject({ packName: "Pack quitado", lines: [] });
  });
});
