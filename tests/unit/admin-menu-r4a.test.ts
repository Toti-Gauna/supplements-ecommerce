import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MOBILE_ORDER, MOVED, SECTIONS, movedTarget, normalizePath, resolvePlace, type MenuTab } from "@/features/admin/menu";

/** R4a: el menú de 8 entradas y a qué pestaña lleva cada ruta (las nuevas y las viejas). */

const flat = (tabs: MenuTab[]): MenuTab[] => tabs.flatMap((t) => [t, ...flat(t.children ?? [])]);

/** Todas las rutas con pantalla bajo /admin-demo, leídas de app/. */
function panelRoutes(dir = join(process.cwd(), "app/admin-demo"), base = "/admin-demo"): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return panelRoutes(full, `${base}/${name}`);
    return name === "page.tsx" ? [base] : [];
  });
}

describe("menú del panel (R4a)", () => {
  it("tiene las 8 entradas en el orden acordado", () => {
    expect(SECTIONS.map((s) => s.label)).toEqual(["Hoy", "Pedidos", "Stock", "Compras", "Clientes", "Promos", "Campañas", "Ajustes"]);
    expect(SECTIONS[0]!.href).toBe("/admin-demo/");
  });

  it("el celular tiene Hoy, Pedidos, Stock y Promos más “Más”; el centro queda libre para Mostrador (R4b)", () => {
    expect(MOBILE_ORDER).toEqual(["hoy", "pedidos", "stock", "promos"]);
    expect(MOBILE_ORDER.every((id) => SECTIONS.some((s) => s.id === id))).toBe(true);
  });

  it("Promos reúne las seis herramientas en pestañas", () => {
    expect(SECTIONS.find((s) => s.id === "promos")!.tabs.map((t) => t.label)).toEqual(["Cupones", "Descuento stack", "Ruleta", "Premios del juego", "Misiones", "Regalos y gift cards"]);
  });

  it("no repite ids ni destinos de pestañas", () => {
    const tabs = SECTIONS.flatMap((s) => flat(s.tabs));
    const key = (t: MenuTab) => t.href;
    expect(new Set(tabs.map((t) => t.id)).size).toBe(tabs.length);
    expect(new Set(tabs.filter((t) => !t.children).map(key)).size).toBe(tabs.filter((t) => !t.children).length);
  });

  it("cada pestaña lleva a una ruta que le pertenece, y la entrada de la sección es una de sus pestañas", () => {
    for (const s of SECTIONS) {
      for (const t of flat(s.tabs)) {
        const place = resolvePlace(t.href)!;
        expect(place.section.id, t.href).toBe(s.id);
        expect([place.tab?.id, place.sub?.id], t.href).toContain(t.id);
      }
      if (s.tabs.length) expect(resolvePlace(s.href)!.tab?.id, s.href).toBe(s.tabs[0]!.id);
    }
  });

  it("toda ruta con pantalla pertenece a una sección", () => {
    const routes = panelRoutes();
    expect(routes.length).toBeGreaterThan(40);
    for (const r of routes) expect(resolvePlace(r), r).not.toBeNull();
  });

  it("las rutas con detalle quedan en la pestaña de su lista", () => {
    const at = (p: string) => resolvePlace(p)!.tab!.id;
    expect(at("/admin-demo/pedidos/detalle/")).toBe("pedidos");
    expect(at("/admin-demo/pagos/detalle/")).toBe("pagos");
    expect(at("/admin-demo/reclamos/detalle/")).toBe("reclamos");
    expect(at("/admin-demo/productos/editar/")).toBe("productos");
    expect(at("/admin-demo/packs/editar/")).toBe("packs");
    expect(at("/admin-demo/usuarios/ficha/")).toBe("clientes");
    expect(at("/admin-demo/campanas/piezas/")).toBe("campanas");
    expect(at("/admin-demo/misiones/simular/")).toBe("misiones");
    expect(at("/admin-demo/cupones/premios/")).toBe("ruleta");
    expect(resolvePlace("/admin-demo/emails/editar/")!.sub!.id).toBe("plantillas");
    expect(resolvePlace("/admin-demo/emails/enviados/")!.sub!.id).toBe("bandeja");
  });

  it("las rutas viejas redirigen a una pestaña que existe (tabla completa)", () => {
    const keys = Object.keys(MOVED);
    expect(keys.sort()).toEqual(["/admin-demo/ajustes/contacto", "/admin-demo/contenido", "/admin-demo/cupones", "/admin-demo/cupones/lista", "/admin-demo/marketing", "/admin-demo/planilla", "/admin-demo/produccion", "/admin-demo/stock", "/admin-demo/tematicas"]);
    for (const from of keys) {
      const target = movedTarget(from)!;
      expect(resolvePlace(target), `${from} → ${target}`).not.toBeNull();
      expect(target.split("?")[0]).not.toBe(`${from}/`);
    }
  });

  it("al mudar una ruta se conservan los parámetros que traía", () => {
    expect(movedTarget("/admin-demo/stock/", "vista=reponer&q=whey")).toBe("/admin-demo/productos/?ver=variantes&stock=reponer&q=whey");
    expect(movedTarget("/admin-demo/planilla/", "q=creatina")).toBe("/admin-demo/productos/?formato=excel&q=creatina");
    expect(movedTarget("/admin-demo/marketing/")).toBe("/admin-demo/campanas/");
    expect(movedTarget("/admin-demo/pedidos/")).toBeNull();
  });

  it("normaliza barras finales y parámetros", () => {
    expect(normalizePath("/admin-demo/pedidos/")).toBe("/admin-demo/pedidos");
    expect(normalizePath("/admin-demo/pedidos?x=1")).toBe("/admin-demo/pedidos");
    expect(normalizePath("/")).toBe("/");
    expect(resolvePlace("/otra-cosa/")).toBeNull();
  });
});
