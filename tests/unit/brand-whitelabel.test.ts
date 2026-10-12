import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * Marca blanca: con `NEXT_PUBLIC_BRAND=nitro` no queda "Volta" en nada que vea un cliente (datos de muestra, textos de
 * la tienda y del panel, emails, archivos exportados, logo, pantalla de carga). Los ids internos que se guardan en el
 * navegador (ocasión "volta" de un regalo) no se ven y se permiten.
 */
const VISIBLE = /volta/i;
const fixtures = import.meta.glob("/src/demo/fixtures/**/*.ts");

/** Todos los textos de un valor (objetos, listas, mapas), sin entrar a funciones. */
function strings(value: unknown, seen = new Set<unknown>()): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object" || seen.has(value)) return [];
  seen.add(value);
  const items = value instanceof Map ? [...value.entries()] : Array.isArray(value) ? value : Object.entries(value);
  return items.flatMap((v) => strings(v, seen));
}

/** Lo que muestra "Volta" (fuera del id interno de la ocasión de un regalo). */
const leaks = (texts: string[]) => texts.filter((t) => VISIBLE.test(t) && t !== "volta");

vi.mock("next/navigation", () => ({ useRouter: () => ({ push() {}, refresh() {} }), usePathname: () => "/" }));

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_BRAND", "nitro");
  vi.resetModules();
});
afterAll(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("segunda marca (Nitro)", () => {
  it("la configuración cambia entera: nombre, club, marca propia, pedidos, colores", async () => {
    const { brand, brandCss } = await import("@/config/brand");
    const { site } = await import("@/config/site");
    expect(brand).toMatchObject({ id: "nitro", name: "Nitro", club: "Club Nitro", houseBrand: "NITRO Labs", orderPrefix: "NIT" });
    expect(leaks(strings(site))).toEqual([]);
    expect(brandCss()).not.toMatch(/c8ff2e/i);
    const { STORAGE_PREFIX } = await import("@/stores/storage");
    expect(STORAGE_PREFIX).toBe("nitro-demo:");
  });

  it("ningún dato de muestra dice Volta (catálogo, pedidos, clientes, emails, textos legales, temáticas)", async () => {
    const found: string[] = [];
    expect(Object.keys(fixtures).length).toBeGreaterThan(15);
    for (const [path, load] of Object.entries(fixtures)) {
      for (const t of leaks(strings(await load()))) found.push(`${path}: ${t}`);
    }
    expect(found).toEqual([]);
    const { defaultAdminData } = await import("@/demo/admin/defaults");
    expect(leaks(strings(defaultAdminData()))).toEqual([]);
  }, 30_000);

  it("el catálogo trae la marca propia y el shaker de la tienda nueva", async () => {
    const { products } = await import("@/demo/fixtures/products");
    const shaker = products.find((p) => p.slug === "shaker-nitro");
    expect(shaker?.name).toBe("Shaker NITRO 700 ml");
    expect(products.filter((p) => p.brand === "NITRO Labs").length).toBeGreaterThan(3);
    const { DEMO_TRACKING_TOKEN, DEMO_ORDER_CODE } = await import("@/demo/fixtures/commerce");
    expect([DEMO_TRACKING_TOKEN, DEMO_ORDER_CODE]).toEqual(["demo-nitro", "NIT-DEMO-0001"]);
  });

  it("textos armados en código: WhatsApp, seguimiento, archivos y calendario", async () => {
    const { whatsappMessage } = await import("@/lib/whatsapp");
    const { exportFileName } = await import("@/demo/admin/table");
    const { toIcs } = await import("@/demo/admin/workshop/ics");
    const { TEST_INBOX } = await import("@/demo/admin/emails-slice");
    const { timelineFor } = await import("@/features/order/tracking-states");
    const texts = [
      whatsappMessage({}), whatsappMessage({ page: "checkout" }), exportFileName("pedidos"), TEST_INBOX,
      toIcs([{ uid: "a", day: "2026-10-12", title: "Entrega", description: "x" }] as never, new Date("2026-10-12T10:00:00Z")),
      ...strings(timelineFor(1)),
    ];
    expect(leaks(texts)).toEqual([]);
    expect(exportFileName("pedidos")).toMatch(/^nitro-pedidos-/);
  });

  it("logo, header, pie, pantalla de carga, menú del panel y disco de la ruleta se dibujan con Nitro", async () => {
    const { Logo } = await import("@/components/atoms/Logo");
    const { Header } = await import("@/components/organisms/Header");
    const { Footer } = await import("@/components/organisms/Footer");
    const { Splash } = await import("@/components/organisms/Splash");
    const { SidebarContent } = await import("@/features/admin/AdminSidebar");
    const { WheelHub } = await import("@/features/club/WheelHub");
    for (const C of [Logo, Header, Footer, Splash, SidebarContent, WheelHub] as ComponentType[]) {
      const html = renderToStaticMarkup(createElement(C));
      expect(html).toMatch(/Nitro|NITRO/);
      expect(html.replace(/volta-splash/g, "")).not.toMatch(VISIBLE);
    }
  }, 30_000);
});
