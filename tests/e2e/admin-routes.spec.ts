import { expect, test } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

const ADMIN_ROUTES = [
  ["admin-demo/", "Hoy en tu tienda"], ["admin-demo/pedidos/", "Todos los pedidos"], ["admin-demo/pedidos/detalle/?codigo=VOL-000123", "VOL-000123"],
  ["admin-demo/pagos/", "Por cobrar"], ["admin-demo/pagos/detalle/?codigo=VOL-000123", "VOL-000123"], ["admin-demo/reclamos/detalle/?id=c1", "ARR-0007"], ["admin-demo/productos/", "Productos y stock"], ["admin-demo/productos/editar/?id=overvolt-pre", "Editar: Overvolt pre-entreno"],
  ["admin-demo/categorias/", "Categorías"], ["admin-demo/categorias/detalle/?slug=creatinas", "Creatinas"], ["admin-demo/stock/", "Productos y stock"], ["admin-demo/planilla/", "Productos y stock · formato Excel"], ["admin-demo/importar/", "Importar desde Excel"], ["admin-demo/misiones/", "Misiones y premios"], ["admin-demo/cupones/", "Cupones"], ["admin-demo/descuento-stack/", "Descuento stack"], ["admin-demo/emails/", "Emails automáticos"], ["admin-demo/emails/editar/?id=tpl-order-created", "Recibimos tu pedido"], ["admin-demo/cupones/juego/", "Premios del juego"],
  ["admin-demo/calendario/", "Calendario de despachos"], ["admin-demo/preparacion/", "Para armar"], ["admin-demo/produccion/", "Para armar"],
  ["admin-demo/despachos/", "Despachos"], ["admin-demo/postventa/", "Postventa"], ["admin-demo/costos/", "Costos y margen"],
  ["admin-demo/insumos/", "Insumos de embalaje"], ["admin-demo/proveedores/", "Proveedores y compras"],
  ["admin-demo/usuarios/ficha/?email=diego.a@ejemplo.com", "Diego Álvarez"],
  ["admin-demo/usuarios/", "Clientes"], ["admin-demo/reclamos/", "Reclamos"], ["admin-demo/contenido/", "Carrusel del inicio"], ["admin-demo/promos/", "Cupones"], ["admin-demo/estudio/", "Estudio de contenido"], ["admin-demo/ajustes/", "Contacto y WhatsApp"],
  ["admin-demo/packs/", "Packs y suscripciones"], ["admin-demo/packs/?ver=suscripciones", "Packs y suscripciones"], ["admin-demo/packs/editar/?id=hipertrofia", "Editar: Pack Hipertrofia"], ["admin-demo/packs/editar/?nuevo=1", "Nuevo pack"],
  ["admin-demo/campanas/", "Campañas"], ["admin-demo/campanas/editar/?id=black-friday", "Black Friday"], ["admin-demo/campanas/piezas/?id=dia-del-boxeador", "Sacar las piezas"],
] as const;

test("la ruta vieja de Temáticas lleva a Campañas (R3)", async ({ page }) => {
  await page.goto("admin-demo/tematicas/");
  await expect(page).toHaveURL(/admin-demo\/campanas\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Campañas" })).toBeVisible();
});

test.describe("panel demo: rutas directas y refresh", () => {
  for (const [path, heading] of ADMIN_ROUTES) {
    test(`/${path}`, async ({ page }) => {
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.getByText("Panel de demostración · datos ficticios")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1, name: new RegExp(heading) })).toBeVisible();
      await page.reload();
      await expect(page.getByRole("heading", { level: 1, name: new RegExp(heading) })).toBeVisible();
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
      await expect(page.getByText(/acreditad/i)).toHaveCount(0);
    });
  }
});
