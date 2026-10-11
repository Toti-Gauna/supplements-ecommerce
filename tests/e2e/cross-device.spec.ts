import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/**
 * QA cruzado (Fase 7): recorre todas las rutas de la tienda y del panel en los tamaños de pantalla que va a usar el
 * dueño y sus clientes. Chromium emula el tamaño y el toque; **no reemplaza** la prueba en un
 * iPhone y un Android reales (ver docs/qa-dispositivos.md).
 */
const DEVICES = [
  { name: "iPhone SE (375×667)", viewport: { width: 375, height: 667 }, mobile: true },
  { name: "iPhone 15 (393×852)", viewport: { width: 393, height: 852 }, mobile: true },
  { name: "Android (412×915)", viewport: { width: 412, height: 915 }, mobile: true },
  { name: "Escritorio (1440×900)", viewport: { width: 1440, height: 900 }, mobile: false },
] as const;

const SHOP = [
  ["", "Destacados de Volta"], ["buscar/?q=creatna", "Buscar"], ["categorias/", "Todas las categorías"], ["c/proteinas/", "Proteínas"],
  ["p/ionic-whey/", "Ionic Whey 100%"], ["p/creatina-monohidrato/", "Creatina monohidrato"], ["crear/", "Entrená por objetivo"],
  ["cupones/", "Mis cupones"], ["favoritos/", "Favoritos"], ["carrito/", "Tu carrito"], ["checkout/", "Checkout de demostración"],
  ["checkout/confirmacion/", "Confirmación (demo)"], ["pedido/demo-volta/", "Seguimiento de tu pedido"], ["cuenta/", "Mi cuenta"],
  ["club/", "Comprás, sumás, ganás."], ["regalo/", "¿Te hicieron un regalo?"], ["preguntas/", "Preguntas frecuentes"], ["terminos/", "Términos y condiciones"],
  ["privacidad/", "Política de privacidad"], ["arrepentimiento/", "Botón de arrepentimiento"],
] as const;

const ADMIN = [
  ["admin-demo/", "Buen día, Volta"], ["admin-demo/pedidos/", "Pedidos"], ["admin-demo/pedidos/detalle/?codigo=VOL-000123", "VOL-000123"],
  ["admin-demo/pagos/", "Pagos manuales"], ["admin-demo/productos/", "Productos y stock"], ["admin-demo/categorias/", "Categorías"],
  ["admin-demo/stock/", "Productos y stock"], ["admin-demo/planilla/", "Productos y stock · formato Excel"], ["admin-demo/importar/", "Importar desde Excel"],
  ["admin-demo/misiones/", "Misiones y premios"], ["admin-demo/cupones/", "Cupones"], ["admin-demo/emails/", "Emails automáticos"],
  ["admin-demo/calendario/", "Calendario de entregas"], ["admin-demo/produccion/", "Cola de producción"], ["admin-demo/costos/", "Costos y margen"],
  ["admin-demo/insumos/", "Insumos"], ["admin-demo/usuarios/", "Clientes"], ["admin-demo/reclamos/", "Reclamos"],
  ["admin-demo/contenido/", "Contenido"], ["admin-demo/tematicas/", "Temáticas"], ["admin-demo/estudio/", "Estudio de contenido"], ["admin-demo/ajustes/", "Ajustes"],
  // Subpáginas de Polish 8.3 (tarjetas de Marketing, Contenido y Ajustes).
  ["admin-demo/marketing/", "Marketing"], ["admin-demo/cupones/lista/", "Cupones"], ["admin-demo/cupones/ruleta/", "Configuración de ruleta"],
  ["admin-demo/cupones/premios/", "Premios disponibles"], ["admin-demo/misiones/simular/", "Simular progreso y premio"], ["admin-demo/emails/enviados/", "Bandeja de salida"],
  ["admin-demo/contenido/carrusel/", "Carrusel"], ["admin-demo/contenido/textos/", "Textos de inicio"], ["admin-demo/contenido/preguntas/", "Preguntas frecuentes"],
  ["admin-demo/ajustes/contacto/", "Contacto y WhatsApp"], ["admin-demo/ajustes/pagos/", "Medios de pago"], ["admin-demo/ajustes/cobro/", "Datos de cobro"],
  ["admin-demo/ajustes/envios/", "Envíos y retiro"],
] as const;

/** Errores que no son de la demo: el navegador de pruebas no tiene GPU ni códecs propietarios. */
const IGNORED = [/GPU stall/i, /Failed to load resource: the server responded with a status of 404/i];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`error de página: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORED.some((re) => re.test(m.text()))) errors.push(`consola: ${m.text()}`);
  });
  return errors;
}

async function sweep(page: Page, routes: readonly (readonly [string, string])[], admin: boolean) {
  const errors = watchErrors(page);
  const problems: string[] = [];
  for (const [path, heading] of routes) {
    const before = errors.length;
    const res = await page.goto(path);
    if (res?.status() !== 200) problems.push(`/${path}: HTTP ${res?.status()}`);
    const target = path === "" ? page.getByRole("region", { name: heading }) : page.getByRole("heading", { level: 1, name: heading });
    if (!(await target.first().waitFor({ state: "visible", timeout: 8000 }).then(() => true, () => false))) problems.push(`/${path}: no se ve «${heading}»`);
    const overflow = await horizontalOverflow(page);
    if (overflow > 0) problems.push(`/${path}: desborda ${overflow}px a lo ancho`);
    if (admin && !(await page.getByText("Panel de demostración · datos ficticios").first().waitFor({ state: "visible", timeout: 4000 }).then(() => true, () => false))) problems.push(`/${path}: falta la señal de demo`);
    if (await page.getByText(/acreditad/i).count()) problems.push(`/${path}: dice «acreditado»`);
    for (const e of errors.slice(before)) problems.push(`/${path}: ${e}`);
  }
  expect(problems, problems.join("\n")).toEqual([]);
}

for (const d of DEVICES) {
  test.describe(d.name, () => {
    test.use({ viewport: d.viewport, isMobile: d.mobile, hasTouch: d.mobile });
    test.describe.configure({ timeout: 120_000 });

    test("tienda: todas las rutas abren sin errores ni desborde", async ({ page }) => {
      await sweep(page, SHOP, false);
    });

    test("panel: todas las rutas abren sin errores ni desborde", async ({ page }) => {
      await sweep(page, ADMIN, true);
    });
  });
}
