import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyOwnerParam, OWNER_OFF, OWNER_SPOTS, OWNER_STORE_HREF, orderPanelHref, ownerParam, ownerSpot, ownerSpotHref,
  parseOwnerSession, spotsForPath, SPOTS_BY_PAGE, toggleOwner, visitedPanel, type OwnerSpotId,
} from "@/demo/admin/owner-mode";
import { movedTarget, resolvePlace } from "@/features/admin/menu";

/** R4c · modo dueño: cada punto de la tienda lleva a una pantalla real del panel, y el interruptor solo existe si se pidió. */
const ROOT = join(__dirname, "../..");
const pageFile = (href: string) => join(ROOT, "app", href.split("?")[0]!, "page.tsx");
const ids = Object.keys(OWNER_SPOTS) as OwnerSpotId[];

describe("mapa punto → pantalla del panel", () => {
  it("cada punto lleva a una pantalla que existe, es del menú y no es una ruta vieja que redirige", () => {
    for (const id of ids) {
      for (const href of [ownerSpotHref(id), ownerSpotHref(id, { slug: "ionic-whey", campaignId: "black-friday" })]) {
        expect(existsSync(pageFile(href)), `${id}: ${href}`).toBe(true);
        expect(resolvePlace(href), `${id}: ${href} en el menú`).not.toBeNull();
        expect(movedTarget(href.split("?")[0]!), `${id}: ${href} no redirige`).toBeNull();
      }
    }
  });

  it("los destinos exactos que muestra el guion", () => {
    expect(ownerSpotHref("carrusel")).toBe("/admin-demo/contenido/carrusel/");
    expect(ownerSpotHref("textos")).toBe("/admin-demo/contenido/textos/");
    expect(ownerSpotHref("preguntas")).toBe("/admin-demo/contenido/preguntas/");
    expect(ownerSpotHref("ficha", { slug: "ionic-whey" })).toBe("/admin-demo/productos/editar/?id=ionic-whey");
    expect(ownerSpotHref("campana", { campaignId: "black-friday" })).toBe("/admin-demo/campanas/editar/?id=black-friday");
    expect(ownerSpotHref("contacto")).toBe("/admin-demo/ajustes/");
  });

  it("sin contexto, la ficha va a la lista de productos y la campaña al calendario, con su rótulo general", () => {
    expect(ownerSpotHref("ficha")).toBe("/admin-demo/productos/");
    expect(ownerSpot("campana")).toMatchObject({ label: "Campañas y temáticas", href: "/admin-demo/campanas/" });
    expect(ownerSpot("campana", { campaignId: "halloween" }).label).toBe("Campaña activa");
    expect(ownerSpot("ficha", { slug: "a b" }).href).toBe("/admin-demo/productos/editar/?id=a%20b");
  });

  it("puntos de cada pantalla: el pie (contacto) en todas, la ficha en cualquier producto", () => {
    expect(spotsForPath("/")).toEqual(["carrusel", "categorias", "campana", "packs", "textos", "club", "contacto"]);
    expect(spotsForPath("/p/ionic-whey/")).toEqual(["ficha", "contacto"]);
    expect(spotsForPath("/preguntas/?q=envio")).toEqual(["preguntas", "contacto"]);
    expect(spotsForPath("/club/juego/")).toEqual(["juego", "contacto"]);
    expect(spotsForPath("/club/")).toEqual(["contacto"]);
    expect(spotsForPath("/carrito")).toEqual(["contacto"]);
    const listed = new Set(SPOTS_BY_PAGE.flatMap((p) => p.spots));
    for (const id of ids.filter((i) => i !== "contacto")) expect(listed.has(id), id).toBe(true);
  });

  it("la ficha del pedido y el acceso desde el panel", () => {
    expect(orderPanelHref("VOL-000125")).toBe("/admin-demo/pedidos/detalle/?codigo=VOL-000125");
    expect(existsSync(pageFile(orderPanelHref("X")))).toBe(true);
    expect(ownerParam(OWNER_STORE_HREF.split("?")[1]!)).toBe("on");
  });
});

describe("cuándo aparece el interruptor", () => {
  it("el comprador normal arranca sin nada; lo guardado roto o sin interruptor no prende nada", () => {
    expect(parseOwnerSession(null)).toEqual(OWNER_OFF);
    expect(parseOwnerSession("{roto")).toEqual(OWNER_OFF);
    expect(parseOwnerSession("null")).toEqual(OWNER_OFF);
    expect(parseOwnerSession(JSON.stringify({ available: false, on: true }))).toEqual(OWNER_OFF);
    expect(parseOwnerSession(JSON.stringify({ available: true, on: true }))).toEqual({ available: true, on: true });
  });

  it("?dueno=1 lo prende, ?dueno=0 lo saca del todo y otros parámetros no cambian nada", () => {
    expect(ownerParam("?dueno=1")).toBe("on");
    expect(ownerParam("q=whey&dueno=si")).toBe("on");
    expect(ownerParam("dueno=0")).toBe("off");
    expect(ownerParam("?dueno=quizas")).toBeNull();
    expect(ownerParam("")).toBeNull();
    const on = applyOwnerParam(OWNER_OFF, "on");
    expect(on).toEqual({ available: true, on: true });
    expect(applyOwnerParam(on, null)).toBe(on);
    expect(applyOwnerParam(on, "off")).toEqual(OWNER_OFF);
  });

  it("pasar por el panel lo deja disponible y apagado; el interruptor prende y apaga solo si está disponible", () => {
    const fromPanel = visitedPanel(OWNER_OFF);
    expect(fromPanel).toEqual({ available: true, on: false });
    expect(visitedPanel({ available: true, on: true })).toEqual({ available: true, on: true });
    expect(toggleOwner(fromPanel)).toEqual({ available: true, on: true });
    expect(toggleOwner(toggleOwner(fromPanel))).toEqual(fromPanel);
    expect(toggleOwner(OWNER_OFF)).toEqual(OWNER_OFF);
  });
});
