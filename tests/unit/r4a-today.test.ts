import { describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import type { AdminOrder } from "@/demo/admin/types";
import { groupByTier, summaryLine, type TodaySnapshot } from "@/demo/engine/today";
import { todayBoard } from "@/demo/engine/today-board";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";

/** R4a · "Hoy en tu tienda": la lista del día por urgencia con los datos de muestra (lunes 5/10/2026). */
const snap = (): TodaySnapshot => defaultAdminData();
const ids = (s: TodaySnapshot) => todayBoard(s, DEMO_TODAY).actions.map((a) => a.id);
const order = (s: TodaySnapshot, code: string) => s.orders.find((o) => o.code === code)!;

describe("lista del día por urgencia", () => {
  it("ordena atrasado → para hoy → esta semana → más adelante, y por tipo dentro de cada nivel", () => {
    expect(ids(snap())).toEqual([
      "late:VOL-000115",
      "receipt:VOL-000124", "receipt:VOL-000123",
      "dispatch:VOL-000120",
      "purchase:suggested",
      "repurchase:due",
      "birthday:tomas.h@ejemplo.com",
      "pack:rest",
      "gift:REGALO-T4M4-N0X2",
      "birthday:flor.m@ejemplo.com",
      "lot:barra-proteica::bp-mani-x12::VL-2604-B",
      "campaign:halloween",
      "lots:rest",
    ]);
    const tiers = groupByTier(todayBoard(snap(), DEMO_TODAY).actions).map((g) => [g.tier, g.actions.length]);
    expect(tiers).toEqual([["atrasado", 1], ["hoy", 6], ["semana", 4], ["despues", 2]]);
  });

  it("aprobar un comprobante lo saca de la lista y suma el pedido a lo que hay que armar", () => {
    const s = snap();
    Object.assign(order(s, "VOL-000123"), { status: "PAID", proof: { ...order(s, "VOL-000123").proof!, status: "APPROVED" } });
    const board = todayBoard(s, DEMO_TODAY);
    expect(board.actions.map((a) => a.id)).not.toContain("receipt:VOL-000123");
    expect(board.score.toPack.count).toBe(9);
    expect(board.actions.find((a) => a.id === "pack:rest")!.metric.value).toBe(8);
  });

  it("un comprobante recibido es siempre 'Aprobar' con su monto (el botón pide confirmación en la pantalla)", () => {
    const receipt = todayBoard(snap(), DEMO_TODAY).actions.find((a) => a.id === "receipt:VOL-000123")!;
    expect(receipt.cta).toEqual({ type: "approve", label: "Aprobar", code: "VOL-000123", amount: 56_510 });
    expect(receipt.detail).toContain("Mirá tu cuenta antes de aprobar");
    expect(JSON.stringify(todayBoard(snap(), DEMO_TODAY))).not.toMatch(/acreditad/i);
  });

  it("lo que sale hoy: armar si no está listo; listo para retirar se marca entregado", () => {
    const s = snap();
    order(s, "VOL-000113").promisedDate = DEMO_TODAY;
    Object.assign(order(s, "VOL-000109"), { status: "READY", promisedDate: DEMO_TODAY });
    const list = todayBoard(s, DEMO_TODAY).actions;
    expect(list.find((a) => a.id === "pack:VOL-000113")).toMatchObject({ tier: "hoy", title: "Armá VOL-000113: sale hoy" });
    expect(list.find((a) => a.id === "dispatch:VOL-000109")!.cta).toMatchObject({ type: "dispatch", to: "DELIVERED", label: "Marcar retirado" });
    expect(list.find((a) => a.id === "dispatch:VOL-000120")!.cta).toMatchObject({ to: "SHIPPED", label: "Marcar enviado" });
  });

  it("lotes: vencido es atrasado, liquidado sale de la lista y el descuento propuesto crece al acercarse", () => {
    const s = snap();
    const bar = s.data.products.find((p) => p.slug === "barra-proteica")!.variants.find((v) => v.id === "bp-mani-x12")!;
    const lot = bar.lots!.find((l) => l.code === "VL-2604-B")!;
    expect(todayBoard(s, DEMO_TODAY).actions.find((a) => a.kind === "lot")!.cta).toMatchObject({ type: "clearance", pct: 30 });
    expect(todayBoard(s, "2026-10-20").actions.find((a) => a.kind === "lot")!.cta).toMatchObject({ pct: 40 });
    lot.expires = "2026-09";
    // Atrasado, justo después del pedido atrasado (los pedidos van primero dentro del nivel).
    expect(todayBoard(s, DEMO_TODAY).actions.slice(0, 2).map((a) => [a.kind, a.tier])).toEqual([["late", "atrasado"], ["lot", "atrasado"]]);
    expect(todayBoard(s, DEMO_TODAY).actions[1]!.title).toBe("Sacá de la venta el lote VL-2604-B");
    lot.clearancePct = 30;
    expect(todayBoard(s, DEMO_TODAY).actions.some((a) => a.id.includes("VL-2604-B"))).toBe(false);
  });

  it("recompras: avisadas no cuentan; sin nadie con el pote terminado, pasan a la semana", () => {
    const s = snap();
    const row = todayBoard(s, DEMO_TODAY).actions.find((a) => a.kind === "repurchase")!;
    expect(row).toMatchObject({ tier: "hoy", metric: { value: 5 } });
    expect(row.title).toBe("Avisales a 5 clientes que se les termina el pote");
    const keys = row.cta.type === "repurchase" ? row.cta.keys : [];
    for (const k of keys) {
      const [email, key] = k.split("|") as [string, string];
      const id = email.toLowerCase();
      s.workshop.profiles[id] = { ...(s.workshop.profiles[id] ?? {}), notices: [...(s.workshop.profiles[id]?.notices ?? []), { key, channel: "whatsapp", at: "2026-10-05T10:00:00-03:00" }] } as never;
    }
    expect(todayBoard(s, DEMO_TODAY).actions.some((a) => a.kind === "repurchase")).toBe(false);
  });

  it("compras: sin variantes agotadas van a la semana; la mercadería que llega hoy es para hoy", () => {
    const s = snap();
    for (const p of s.data.products) for (const v of p.variants) if (v.stock === 0) v.stock = 1;
    expect(todayBoard(s, DEMO_TODAY).actions.find((a) => a.id === "purchase:suggested")!.tier).toBe("semana");
    s.workshop.purchases.push({ id: "oc-1", supplierId: "sur", createdAt: "2026-10-01T10:00:00-03:00", expectedOn: DEMO_TODAY, lines: [], total: 0, status: "ordered" });
    expect(todayBoard(s, DEMO_TODAY).actions.find((a) => a.id === "receive:oc-1")).toMatchObject({ tier: "hoy", title: "Recibí la mercadería de Sur Suplementos (muestra)" });
  });

  it("campaña: a 7 días o menos sube a la semana y el checklist marca lo que falta", () => {
    const s = snap();
    s.data.coupons = s.data.coupons.filter((c) => c.code !== "MONSTER20");
    const row = todayBoard(s, "2026-10-14").actions.find((a) => a.kind === "campaign")!;
    expect(row).toMatchObject({ tier: "semana", metric: { value: 5 }, title: "Prepará Halloween: empieza en 5 días" });
    expect(row.checklist!.map((c) => c.done)).toEqual([false, true, false, false]);
    expect(row.checklist![0]!.label).toBe("Falta el cupón de la campaña");
  });

  it("día vacío: sin nada pendiente, la lista queda vacía y el marcador en cero", () => {
    const s = snap();
    s.orders = [];
    s.data.giftRecords = [];
    s.data.themes = s.data.themes.map((t) => ({ ...t, active: false }));
    for (const p of s.data.products) for (const v of p.variants) Object.assign(v, { stock: 100, lots: undefined });
    const board = todayBoard(s, DEMO_TODAY);
    expect(board.actions).toEqual([]);
    expect(board.score).toMatchObject({ sold: { amount: 0 }, toCollect: { amount: 0 }, toPack: { count: 0 }, stockRisk: { count: 0 } });
    expect(summaryLine(board.actions)).toBe("Todo al día: no hay nada pendiente.");
  });

  it("los pedidos cancelados, entregados o en reclamo nunca entran en la lista", () => {
    const s = snap();
    s.orders = s.orders.filter((o) => ["CANCELLED", "DELIVERED", "IN_CLAIM", "SHIPPED"].includes(o.status)) as AdminOrder[];
    expect(todayBoard(s, DEMO_TODAY).actions.filter((a) => ["late", "receipt", "dispatch", "pack"].includes(a.kind))).toEqual([]);
  });
});

