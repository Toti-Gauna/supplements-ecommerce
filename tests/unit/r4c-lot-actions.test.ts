import { describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import { comboId, comboPlan, pickComplement } from "@/demo/admin/lot-combo";
import { couponLink, couponMessage, lotBuyers, lotCoupon, lotCouponCode } from "@/demo/admin/lot-coupon";
import { dropPlan, lotDone, withDropProduct } from "@/demo/admin/lot-drop";
import { expiringLots } from "@/demo/admin/lots";
import { upsertPack } from "@/demo/admin/packs";
import type { CostBook } from "@/demo/admin/supplier-list/costs";
import { quotePack } from "@/demo/engine/packs";
import { setDemoData } from "@/demo/engine/source";
import { todayBoard } from "@/demo/engine/today-board";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";

const admin = defaultAdminData();
const book: CostBook = { recipes: admin.workshop.recipes, materials: admin.workshop.materials, settings: admin.workshop.settings };
const products = admin.data.products;
const lot = expiringLots(products, DEMO_TODAY).find((r) => r.lot.code === "VL-2604-B")!;

describe("combo del lote que vence", () => {
  it("elige el complemento de la primera categoría lógica con stock sano", () => {
    const pick = pickComplement(lot, products, DEMO_TODAY)!;
    expect(pick.product.categorySlug).toBe("shakers");
    expect(pick.product.slug).not.toBe(lot.productSlug);
    expect(pick.variant.stock).toBeGreaterThan(0);
  });
  it("no ofrece un complemento que también vence pronto ni sin stock", () => {
    const risky = products.map((p) => (p.categorySlug === "shakers" ? { ...p, variants: p.variants.map((v) => ({ ...v, stock: 0 })) } : p));
    expect(pickComplement(lot, risky, DEMO_TODAY)!.product.categorySlug).not.toBe("shakers");
    expect(pickComplement({ productSlug: "no-existe" }, [], DEMO_TODAY)).toBeNull();
  });
  it("el precio del combo es la suma de los dos menos el descuento, en pesos enteros", () => {
    const plan = comboPlan(lot, products, book, DEMO_TODAY)!;
    expect(plan.listTotal).toBe(lot.listPrice + plan.complement.price);
    expect(plan.pct).toBe(15);
    expect(plan.saving).toBe(Math.round((plan.listTotal * 15) / 100));
    expect(plan.price).toBe(plan.listTotal - plan.saving);
    expect(Number.isInteger(plan.price)).toBe(true);
    expect(plan.margin).not.toBeNull();
  });
  it("el pack creado cotiza igual que el plan y se guarda con id estable", () => {
    const plan = comboPlan(lot, products, book, DEMO_TODAY, 20)!;
    expect(plan.pack.id).toBe(comboId("VL-2604-B"));
    expect(plan.pack.items.map((i) => i.variantId)).toEqual([lot.variantId, plan.complement.variantId]);
    const saved = upsertPack(admin.data.packs, plan.pack);
    setDemoData({ ...admin.data, packs: saved.packs });
    const quote = quotePack(saved.pack);
    expect(quote.available).toBe(true);
    expect(quote.price).toBe(plan.price);
    // Crearlo dos veces no lo duplica.
    expect(upsertPack(saved.packs, plan.pack).packs).toHaveLength(saved.packs.length);
    setDemoData(admin.data);
  });
  it("sin complemento posible no hay combo", () => {
    expect(comboPlan(lot, products, book, DEMO_TODAY, 15, null)).toBeNull();
  });
});

describe("cupón para quienes lo compraron", () => {
  const coupon = lotCoupon(lot, DEMO_TODAY);
  it("es un cupón real con código, vigencia corta y usos acotados", () => {
    expect(lotCouponCode("VL-2604-B")).toBe("LOTEVL2604B");
    expect(coupon).toMatchObject({ code: "LOTEVL2604B", type: "PERCENT", value: 15, minSubtotal: lot.listPrice, maxUses: 3, active: true });
    // Vence antes el cupón (14 días) que el lote (31/10).
    expect(coupon.endsAt).toBe("2026-10-19");
  });
  it("nunca dura más que el lote", () => {
    const soon = { ...lot, lot: { ...lot.lot, expires: "2026-10" } };
    expect(lotCoupon({ ...soon, lot: { ...soon.lot, expires: "2026-10" } }, "2026-10-25").endsAt).toBe("2026-10-31");
  });
  it("llega a los que compraron ese producto y pagaron, no a los bloqueados ni a los impagos", () => {
    const buyers = lotBuyers(admin.users, admin.orders, "barra-proteica");
    expect(buyers.length).toBeGreaterThan(0);
    expect(buyers.every((b) => b.units > 0)).toBe(true);
    expect(buyers.map((b) => b.name)).not.toContain("Lucía Fernández");
    const blocked = admin.users.map((u) => ({ ...u, blocked: true }));
    expect(lotBuyers(blocked, admin.orders, "barra-proteica").filter((b) => admin.users.some((u) => u.email === b.email))).toHaveLength(0);
  });
  it("el mensaje dice por qué hay descuento, el código y hasta cuándo, y arma el link de WhatsApp", () => {
    const text = couponMessage({ name: "Ana López" }, coupon, lot.productName, "Mi tienda");
    expect(text).toContain("¡Hola Ana!");
    expect(text).toContain("vencen pronto");
    expect(text).toContain("LOTEVL2604B");
    expect(text).toContain("15 %");
    expect(text).toMatch(/hasta el lunes 19 de octubre/);
    const link = couponLink({ email: "a@b.c", name: "Ana López", phone: "223 555-0113", units: 2 }, coupon, lot.productName, "Mi tienda")!;
    expect(link.startsWith("https://wa.me/5492235550113?text=")).toBe(true);
    expect(couponLink({ email: "a@b.c", name: "Ana", units: 1 }, coupon, lot.productName, "Mi tienda")).toBeNull();
  });
});

describe("drop de la semana", () => {
  const plan = dropPlan(admin.data.themes, admin.data.coupons, lot.productSlug, DEMO_TODAY)!;
  it("es la próxima campaña con su cupón", () => {
    expect(plan.theme.id).toBe("halloween");
    expect(plan.daysLeft).toBeGreaterThan(0);
    expect(plan.already).toBe(false);
    expect(plan.coupon?.code).toBe(plan.theme.couponCode);
  });
  it("suma el producto una sola vez", () => {
    const once = withDropProduct(plan.theme, lot.productSlug);
    expect(once.productSlugs).toEqual([...plan.theme.productSlugs, lot.productSlug]);
    expect(withDropProduct(once, lot.productSlug)).toBe(once);
  });
  it("sin campañas activas no hay drop", () => {
    expect(dropPlan(admin.data.themes.map((t) => ({ ...t, active: false })), admin.data.coupons, "x", DEMO_TODAY)).toBeNull();
  });
});

describe("lo ya armado se ve en Hoy", () => {
  it("sin nada armado, la fila de Hoy ofrece las otras salidas; con algo, dice qué se armó", () => {
    const row = (data: typeof admin.data) => todayBoard({ orders: admin.orders, users: admin.users, data, workshop: admin.workshop }, DEMO_TODAY).actions.find((a) => a.id === `lot:${lot.key}`)!;
    expect(row(admin.data).detail).toContain("combo, mandar un cupón o meter en el drop");
    const withCoupon = { ...admin.data, coupons: [...admin.data.coupons, lotCoupon(lot, DEMO_TODAY)] };
    expect(row(withCoupon).detail).toContain("Ya armaste: cupón.");
    expect(lotDone(lot, withCoupon, DEMO_TODAY)).toEqual({ combo: false, coupon: true, drop: false });
  });
});
