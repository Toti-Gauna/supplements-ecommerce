import { describe, expect, it } from "vitest";
import { myRackSummary, rackProducts, rackStackHref, rackToStack } from "@/demo/engine/my-rack";
import { createRackAlert, rackAlertStatus, rackAlertText } from "@/demo/engine/rack-alerts";
import { rackFacts } from "@/demo/engine/rack";
import { decodeStack } from "@/demo/engine/stack-builder";
import { products } from "@/demo/fixtures/products";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";

const p = (slug: string) => products.find((x) => x.slug === slug)!;
/** Copia del catálogo con un producto cambiado (como lo deja el panel). */
const edit = (slug: string, fn: (x: Product) => Product): Product[] => products.map((x) => (x.slug === slug ? fn(structuredClone(x)) : x));
const soldOut = (x: Product): Product => ({ ...x, variants: x.variants.map((v) => ({ ...v, stock: 0 })) });

describe("Mi rack: total y agregar todo", () => {
  it("suma la presentación de la tarjeta de cada favorito y aplica el descuento stack como el carrito", () => {
    const slugs = ["ionic-whey", "creatina-monohidrato", "overvolt-pre"];
    const r = myRackSummary(slugs, products);
    expect(r.items.map((i) => i.product.slug)).toEqual(slugs);
    expect(r.subtotal).toBe(slugs.reduce((s, x) => s + rackFacts(p(x)).price, 0));
    expect(r.stack.missing).toBe(0);
    expect(r.stack.discount).toBe(Math.round(r.subtotal * 0.1));
    expect(r.total).toBe(r.subtotal - r.stack.discount);
  });

  it("lo que no tiene stock se ve pero no suma ni entra en agregar todo", () => {
    const catalog = edit("omega-3", soldOut);
    const r = myRackSummary(["ionic-whey", "omega-3"], catalog);
    expect(r.items).toHaveLength(2);
    expect(r.items[1]!.available).toBe(false);
    expect(r.buyable.map((i) => i.product.slug)).toEqual(["ionic-whey"]);
    expect(r.total).toBe(rackFacts(p("ionic-whey")).price);
  });

  it("los favoritos borrados o desactivados en el panel desaparecen del rack", () => {
    const catalog = edit("glutamina", (x) => ({ ...x, active: false }));
    expect(rackProducts(["glutamina", "no-existe", "ionic-whey"], catalog).map((x) => x.slug)).toEqual(["ionic-whey"]);
  });

  it("el equipamiento suma al total sin precio por servicio", () => {
    const r = myRackSummary(["guantes-boxeo"], products);
    expect(r.items[0]!.perServing).toBeNull();
    expect(r.total).toBe(rackFacts(p("guantes-boxeo")).price);
  });
});

describe("Mi rack → Armá tu stack", () => {
  it("cada favorito va a su lugar, en el orden del armador, y el link lo abre igual", () => {
    const slugs = ["omega-3", "overvolt-pre", "ionic-whey", "creatina-monohidrato"];
    const { picks, left } = rackToStack(slugs, products);
    expect(picks.map((x) => [x.slot, x.slug])).toEqual([["base", "ionic-whey"], ["creatina", "creatina-monohidrato"], ["energia", "overvolt-pre"], ["extra", "omega-3"]]);
    expect(left).toEqual([]);
    const href = rackStackHref(slugs, products)!;
    expect(href.startsWith("/crear/?stack=")).toBe(true);
    expect(decodeStack(new URLSearchParams(href.split("?")[1]).get("stack"), products)).toEqual(picks);
  });

  it("si dos compiten por el lugar gana el primero guardado; el equipamiento y lo agotado quedan afuera", () => {
    const catalog = edit("pump-flow", soldOut);
    const { picks, left } = rackToStack(["isolate-zero", "ionic-whey", "guantes-boxeo", "pump-flow"], catalog);
    expect(picks.map((x) => x.slug)).toEqual(["isolate-zero"]);
    expect(left.map((x) => x.slug)).toEqual(["ionic-whey", "guantes-boxeo", "pump-flow"]);
  });

  it("sin nada que entre no hay link", () => {
    expect(rackStackHref(["guantes-boxeo", "straps-algodon"], products)).toBeNull();
  });
});

describe("avisos simulados: si baja o si vuelve", () => {
  it("recién pedido, el aviso espera", () => {
    const alert = createRackAlert(p("glutamina"));
    expect(alert.price).toBe(rackFacts(p("glutamina")).price);
    expect(rackAlertStatus(alert, p("glutamina"))).toEqual({ kind: "watching", out: false });
    expect(rackAlertText(rackAlertStatus(alert, p("glutamina")), formatARS)).toBe("Te avisamos si baja de precio.");
  });

  it("salta cuando el dueño baja el precio en el panel, con lo que se ahorra", () => {
    const alert = createRackAlert(p("glutamina"));
    const catalog = edit("glutamina", (x) => ({ ...x, basePrice: x.basePrice - 3000 }));
    const status = rackAlertStatus(alert, catalog.find((x) => x.slug === "glutamina"));
    expect(status).toEqual({ kind: "triggered", back: false, drop: { from: alert.price, to: alert.price - 3000, saved: 3000 } });
    expect(rackAlertText(status, formatARS)).toContain(`Bajó ${formatARS(3000)}`);
  });

  it("subir el precio no avisa", () => {
    const alert = createRackAlert(p("glutamina"));
    const catalog = edit("glutamina", (x) => ({ ...x, basePrice: x.basePrice + 3000 }));
    expect(rackAlertStatus(alert, catalog.find((x) => x.slug === "glutamina"))!.kind).toBe("watching");
  });

  it("salta cuando vuelve el stock de algo que estaba agotado", () => {
    const out = soldOut(structuredClone(p("omega-3")));
    const alert = createRackAlert(out);
    expect(alert.wasOut).toBe(true);
    expect(rackAlertStatus(alert, out)).toEqual({ kind: "watching", out: true });
    const back = rackAlertStatus(alert, p("omega-3"));
    expect(back).toMatchObject({ kind: "triggered", back: true });
    expect(rackAlertText(back, formatARS)).toMatch(/^Volvió el stock/);
  });

  it("si el producto se borró, el aviso queda sin efecto", () => {
    expect(rackAlertStatus(createRackAlert(p("glutamina")), undefined)).toEqual({ kind: "gone" });
  });
});
