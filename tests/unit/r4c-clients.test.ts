import { describe, expect, it } from "vitest";
import { BIRTHDAY_GIFT_AMOUNT, birthdayGift, birthdayMessage, birthdayState, daysToBirthday, giftParam, giftPathFor, nextBirthday } from "@/demo/admin/birthday";
import { customerRows, customerViews } from "@/demo/admin/customers";
import { createCustomerActions } from "@/demo/admin/customers-slice";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { writeMessage, writeToday, repurchaseLines } from "@/demo/admin/repurchase-today";
import { CART_LINK_MAX_QTY, cartLinkPath, decodeCartLink, encodeCartLink } from "@/demo/engine/cart-link";
import { decodeGift } from "@/demo/engine/gift-link";
import { giftCardStatus } from "@/demo/engine/gift-cards";
import { todayBoard } from "@/demo/engine/today-board";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";

const admin = defaultAdminData();
const products = admin.data.products;
const views = customerViews(customerRows(admin.users, admin.orders), admin.workshop.profiles, products, DEMO_TODAY);

describe("link de recompra con el bolso cargado", () => {
  it("codifica slug.variante.cantidad y lo vuelve a leer igual", () => {
    const lines = [{ slug: "ionic-whey", variantId: "iw-chocolate-2lb", qty: 2 }, { slug: "creatina-brava", variantId: "cb-sin-sabor-250", qty: 1 }];
    expect(encodeCartLink(lines)).toBe("bolso=ionic-whey.iw-chocolate-2lb.2,creatina-brava.cb-sin-sabor-250.1");
    expect(cartLinkPath(lines)).toBe("/recompra/?bolso=ionic-whey.iw-chocolate-2lb.2,creatina-brava.cb-sin-sabor-250.1");
    const raw = new URLSearchParams(encodeCartLink(lines)).get("bolso");
    expect(decodeCartLink(raw, products)).toEqual({ lines, dropped: 0 });
  });
  it("sin líneas no hay parámetro", () => {
    expect(encodeCartLink([])).toBe("");
    expect(cartLinkPath([])).toBe("/recompra/");
  });
  it("descarta lo que no existe, está pausado o sin stock, y no repite una variante", () => {
    const paused = products.map((p) => (p.slug === "isolate-zero" ? { ...p, active: false } : p));
    const raw = "ionic-whey.iw-chocolate-2lb.1,nada.x.1,isolate-zero.iz-chocolate-2lb.1,ionic-whey.iw-frutilla-5lb.1,ionic-whey.iw-chocolate-2lb.3,ionic-whey.no-existe.1";
    const out = decodeCartLink(raw, paused);
    expect(out.lines).toEqual([{ slug: "ionic-whey", variantId: "iw-chocolate-2lb", qty: 1 }]);
    expect(out.dropped).toBe(5);
  });
  it("la cantidad es entera, al menos 1 y no pasa del stock ni del tope", () => {
    const stockOf = (id: string) => products.flatMap((p) => p.variants).find((v) => v.id === id)!.stock;
    expect(stockOf("iw-chocolate-5lb")).toBe(6);
    expect(decodeCartLink("ionic-whey.iw-chocolate-5lb.9", products).lines[0]!.qty).toBe(6);
    expect(decodeCartLink("ionic-whey.iw-chocolate-2lb.99", products).lines[0]!.qty).toBe(CART_LINK_MAX_QTY);
    expect(decodeCartLink("ionic-whey.iw-chocolate-2lb.0", products).lines[0]!.qty).toBe(1);
    expect(decodeCartLink("ionic-whey.iw-chocolate-2lb.1,5", products).lines[0]!.qty).toBe(1);
  });
  it("un parámetro vacío, roto o enorme no abre nada", () => {
    expect(decodeCartLink(null, products)).toEqual({ lines: [], dropped: 0 });
    expect(decodeCartLink("x".repeat(3000), products)).toEqual({ lines: [], dropped: 0 });
    expect(decodeCartLink("???", products).lines).toEqual([]);
  });
});

describe("a quién escribirle hoy", () => {
  const list = writeToday(views, admin.workshop.profiles, products);
  it("una tarjeta por persona con lo que se le terminó o se le termina esta semana, sin los ya avisados", () => {
    expect(list.length).toBeGreaterThan(0);
    expect(new Set(list.map((w) => w.email)).size).toBe(list.length);
    for (const w of list) expect(w.items.every((i) => i.state !== "later")).toBe(true);
    const first = list[0]!;
    const noticed = { ...admin.workshop.profiles, [first.email.toLowerCase()]: { notes: [], notices: first.items.map((i) => ({ key: i.key, channel: "whatsapp" as const, at: "2026-10-05T10:00:00Z" })) } };
    expect(writeToday(views, noticed, products).map((w) => w.email)).not.toContain(first.email);
  });
  it("coincide con las recompras que muestra Hoy", () => {
    const row = todayBoard({ orders: admin.orders, users: admin.users, data: admin.data, workshop: admin.workshop }, DEMO_TODAY).actions.find((a) => a.id === "repurchase:due")!;
    expect(row.cta.type === "repurchase" ? row.cta.keys.length : 0).toBe(list.reduce((n, w) => n + w.items.length, 0));
    expect(row.metric.value).toBe(list.length);
  });
  it("el bolso lleva la misma variante y cantidad de la compra, y solo lo que hoy tiene stock", () => {
    const w = list.find((x) => x.lines.length)!;
    const customer = views.find((c) => c.email === w.email)!;
    for (const l of w.lines) {
      const bought = customer.orders.flatMap((o) => o.lines).find((x) => x.productSlug === l.slug && x.variantId === l.variantId)!;
      expect(l.qty).toBe(bought.quantity);
    }
    expect(w.path.startsWith("/recompra/?bolso=")).toBe(true);
    const empty = products.map((p) => ({ ...p, variants: p.variants.map((v) => ({ ...v, stock: 0 })) }));
    expect(repurchaseLines(customer.orders, w.items, empty)).toEqual([]);
  });
  it("el mensaje dice cuándo se termina y suma el link solo si hay bolso", () => {
    const w = list.find((x) => x.lines.length)!;
    const text = writeMessage(w, "Mi tienda", "https://x.test/recompra/?bolso=a.b.1");
    expect(text).toContain("¡Hola ");
    expect(text).toContain("Mi tienda");
    expect(text).toMatch(/se (te )?termin/);
    expect(text).toContain("https://x.test/recompra/?bolso=a.b.1");
    expect(writeMessage({ ...w, lines: [] }, "Mi tienda", "https://x.test")).not.toContain("https://x.test");
    expect(writeMessage({ ...w, lines: w.lines }, "Mi tienda")).not.toContain("bolso armado");
  });
  it("junta varios potes de la misma persona en un solo mensaje", () => {
    const two = list.find((x) => x.items.length > 1) ?? { ...list[0]!, items: [list[0]!.items[0]!, { ...list[0]!.items[0]!, product: "BCAA 2:1:1", inDays: 3, runsOutOn: "2026-10-08" }] };
    const text = writeMessage(two, "Mi tienda");
    expect(text.match(/se (te )?termin/g)!.length).toBeGreaterThanOrEqual(2);
  });
});

describe("cumpleaños", () => {
  it("próximo cumpleaños y días que faltan, también al cruzar el año", () => {
    expect(nextBirthday("10-05", "2026-10-05")).toBe("2026-10-05");
    expect(nextBirthday("10-04", "2026-10-05")).toBe("2027-10-04");
    expect(daysToBirthday("10-05", DEMO_TODAY)).toBe(0);
    expect(daysToBirthday("10-08", DEMO_TODAY)).toBe(3);
    expect(daysToBirthday("01-15", "2026-12-30")).toBe(16);
  });
  it("el 29/2 cuenta como 28/2 y un dato roto no da días", () => {
    expect(nextBirthday("02-29", "2027-02-01")).toBe("2027-02-28");
    expect(daysToBirthday("13-40", DEMO_TODAY)).toBeNull();
    expect(daysToBirthday(undefined, DEMO_TODAY)).toBeNull();
    expect(daysToBirthday("", DEMO_TODAY)).toBeNull();
  });
  it("el estado dice si ya se armó el regalo de este año", () => {
    expect(birthdayState({ birthday: "10-08" }, DEMO_TODAY)).toEqual({ inDays: 3, date: "2026-10-08", done: false });
    const gift = { year: 2026, code: "REGALO-X", at: "x", param: "p" };
    expect(birthdayState({ birthday: "10-08", birthdayGift: gift }, DEMO_TODAY)!.done).toBe(true);
    expect(birthdayState({ birthday: "10-08", birthdayGift: { ...gift, year: 2025 } }, DEMO_TODAY)!.done).toBe(false);
    expect(birthdayState({}, DEMO_TODAY)).toBeNull();
  });
  it("el regalo es una gift card de la casa con monto fijo y un link que se abre", () => {
    const made = birthdayGift({ name: "Tomás Herrera", email: "Tomas.H@ejemplo.com", store: "Mi tienda", today: DEMO_TODAY, now: "2026-10-05T12:00:00.000Z", random: () => 0.42 })!;
    expect(made.card).toMatchObject({ amount: BIRTHDAY_GIFT_AMOUNT, balance: BIRTHDAY_GIFT_AMOUNT, to: "Tomás", from: "Mi tienda", expires: "2027-10-05" });
    expect(giftCardStatus(made.card, DEMO_TODAY)).toBe("activa");
    expect(made.gift).toMatchObject({ kind: "gift-card", toEmail: "tomas.h@ejemplo.com", to: "Tomás" });
    expect(made.gift.message).toContain("¡Feliz cumple, Tomás!");
    const param = giftParam(made.gift);
    expect(giftPathFor(param)).toBe(`/regalo/?g=${param}`);
    expect(decodeGift(param)).toMatchObject({ code: made.gift.code, kind: "gift-card", giftCard: { amount: BIRTHDAY_GIFT_AMOUNT } });
    expect(birthdayMessage("Tomás Herrera", "https://x.test/regalo/?g=1", "Mi tienda")).toContain("https://x.test/regalo/?g=1");
  });
});

describe("armar el regalo de cumpleaños en el panel", () => {
  const setup = () => {
    let state = structuredClone(admin) as AdminData;
    const get = () => state;
    const actions = createCustomerActions((fn) => { state = { ...state, ...fn(state) }; }, get);
    return { get, actions };
  };
  it("emite la gift card y el regalo, anota la ficha y no repite el mismo año", () => {
    const { get, actions } = setup();
    const out = actions.sendBirthdayGift("tomas.h@ejemplo.com", "Tomás Herrera")!;
    expect(out.code).toMatch(/^REGALO-/);
    const s = get();
    expect(s.data.giftCards!.some((c) => c.giftCode === out.code && c.balance === BIRTHDAY_GIFT_AMOUNT)).toBe(true);
    expect(s.data.giftRecords!.find((r) => r.code === out.code)).toMatchObject({ kind: "gift-card", status: "enviado", to: "Tomás" });
    expect(s.workshop.profiles["tomas.h@ejemplo.com"]!.birthdayGift).toMatchObject({ year: 2026, code: out.code, param: out.param });
    expect(s.audit[0]!.action).toContain("Regalo de cumpleaños");
    expect(actions.sendBirthdayGift("tomas.h@ejemplo.com", "Tomás Herrera")).toBeNull();
    expect(get().data.giftCards).toHaveLength(s.data.giftCards!.length);
  });
  it("no arma nada si no tiene cumpleaños cargado", () => {
    const { actions } = setup();
    expect(actions.sendBirthdayGift("martin.g@ejemplo.com", "Martín Gómez")).toBeNull();
  });
  it("Hoy lo muestra en su día y lo saca al armarlo", () => {
    const { get, actions } = setup();
    const ids = () => todayBoard({ orders: get().orders, users: get().users, data: get().data, workshop: get().workshop }, DEMO_TODAY).actions.filter((a) => a.kind === "birthday");
    expect(ids().map((a) => [a.id, a.tier, a.cta.type === "link" ? a.cta.label : ""])).toEqual([
      ["birthday:tomas.h@ejemplo.com", "hoy", "Mandarle el regalo"], ["birthday:flor.m@ejemplo.com", "semana", "Mandarle el regalo"],
    ]);
    actions.sendBirthdayGift("tomas.h@ejemplo.com", "Tomás Herrera");
    expect(ids().map((a) => a.id)).toEqual(["birthday:flor.m@ejemplo.com"]);
  });
  it("quien cumple más tarde de 3 días no aparece en Hoy", () => {
    const rows = todayBoard({ orders: admin.orders, users: admin.users, data: admin.data, workshop: admin.workshop }, DEMO_TODAY).actions.filter((a) => a.kind === "birthday");
    expect(rows.some((a) => a.id.includes("lucia.f"))).toBe(false);
  });
});
