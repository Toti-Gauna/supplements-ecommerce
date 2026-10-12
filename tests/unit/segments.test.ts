import { beforeEach, describe, expect, it } from "vitest";
import { customerGoal, customerRows, customerViews } from "@/demo/admin/customers";
import { defaultAdminData } from "@/demo/admin/defaults";
import { SEGMENT_HELP as HELP_FROM_HELP } from "@/demo/admin/help";
import { GOAL_OPTIONS, goalName, inSegment, SEGMENT_HELP, segmentCount, SEGMENTS } from "@/demo/admin/segments";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { goals } from "@/demo/fixtures/goals";

beforeEach(() => setDemoData(defaultDemoData()));

const admin = defaultAdminData();
const products = admin.data.products;
const rows = customerRows(admin.users, admin.orders);
const views = customerViews(rows, admin.workshop.profiles, products, DEMO_TODAY);
const names = (id: string) => views.filter((c) => inSegment(c, id)).map((c) => c.name).sort();

describe("segmentos de clientes", () => {
  it("son los de una tienda que vive de la recompra, en este orden", () => {
    expect(SEGMENTS.map((s) => s.label)).toEqual(["Se le termina esta semana", "Recompra atrasada", "Nuevos", "Frecuentes", "VIP", "Sin compras"]);
  });
  it("se le termina esta semana y recompra atrasada salen del cálculo de recompra", () => {
    expect(names("semana")).toEqual(["Florencia Medina", "Juan Ibarra", "Nicolás Romero", "Tomás Herrera"]);
    expect(names("atrasada")).toEqual(["Paula Castro", "Tomás Herrera"]);
  });
  it("nuevos, frecuentes, VIP y sin compras siguen la regla del total pagado (no se pisan entre sí)", () => {
    expect(names("vip")).toEqual(["Juan Ibarra", "Valentina Sosa"]);
    expect(names("frecuentes")).toEqual(["Julián Paz"]);
    expect(names("nuevos")).toContain("Diego Álvarez");
    expect(names("sin-compras")).toEqual(expect.arrayContaining(["Lucía Fernández", "Cuenta de prueba"]));
    for (const c of views) expect(["nuevos", "frecuentes", "vip", "sin-compras"].filter((id) => inSegment(c, id))).toHaveLength(1);
    expect(inSegment(views[0]!, "no-existe")).toBe(false);
  });
  it("las cuentas bloqueadas no se cuentan para escribirles", () => {
    const blocked = views.map((c) => (c.name === "Juan Ibarra" ? { ...c, blocked: true } : c));
    expect(segmentCount(views, "semana")).toBe(4);
    expect(segmentCount(blocked, "semana")).toBe(3);
  });
});

describe("objetivo del cliente", () => {
  const row = (email: string) => rows.find((c) => c.email === email)!;
  it("el de la ficha manda; si no hay, el que más se repite en lo que compró", () => {
    expect(customerGoal(admin.workshop.profiles["juan.i@ejemplo.com"], row("juan.i@ejemplo.com"), products)).toEqual({ goal: "masa-muscular", fromPurchases: false });
    // Diego: pre-entreno (energía, fuerza), tiza (fuerza) y ganador (masa muscular) → fuerza.
    expect(customerGoal(admin.workshop.profiles["diego.a@ejemplo.com"], row("diego.a@ejemplo.com"), products)).toEqual({ goal: "fuerza", fromPurchases: true });
    expect(customerGoal(undefined, row("prueba123@ejemplo.com"), products)).toEqual({ goal: null, fromPurchases: false });
  });
  it("filtra por objetivo con los nombres de la tienda", () => {
    expect(GOAL_OPTIONS.map((o) => o.value)).toEqual(goals.map((g) => g.id));
    expect(views.filter((c) => c.goal === "masa-muscular").map((c) => c.name)).toEqual(expect.arrayContaining(["Juan Ibarra", "Nicolás Romero"]));
    expect([goalName("definicion"), goalName(null)]).toEqual(["Definición", "Sin definir"]);
  });
});

describe("ayuda de segmentos (8.3.10)", () => {
  it("explica cada segmento con su regla, el objetivo y el invitado; la de help.ts es la misma", () => {
    expect(SEGMENT_HELP.items.map((i) => i.term)).toEqual([...SEGMENTS.map((s) => s.label), "Objetivo", "Invitado"]);
    const week = SEGMENT_HELP.items[0]!.text;
    expect(week).toContain("próximos 7 días");
    expect(week).toContain("(pre-entrenos y aminoácidos, 4 por semana; hidratación, 3 por semana)");
    expect(SEGMENT_HELP.items[1]!.text).toContain("30 días");
    expect(HELP_FROM_HELP).toBe(SEGMENT_HELP);
  });
});
