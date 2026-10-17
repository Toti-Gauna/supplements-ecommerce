import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow, makePng } from "./helpers";

/**
 * R2a · ficha "hoja técnica". Pedido de Ignacio (L1): primero el precio total en el marcador y abajo, en chico, cuánto
 * rinde por servicio. Placas de sabor y tamaño, "Verificá tu lote", equipamiento sin lote ni servicios y barra fija.
 */
const priceBox = (page: Page) => page.getByRole("region", { name: "Precio", exact: true });
const total = (page: Page, amount: string) => priceBox(page).locator("[data-sheet-total]").getByRole("img", { name: new RegExp(`^\\$\\s?${amount.replace(".", "\\.")}$`) });

test("el precio total va primero y grande; el precio por servicio, chico y abajo", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto("p/ionic-whey/");
  const big = total(page, "54.900");
  await expect(big).toBeVisible();
  const perServing = priceBox(page).getByRole("img", { name: /1\.830 por servicio/ });
  await expect(perServing).toBeVisible();
  const [b, s] = [(await big.boundingBox())!, (await perServing.boundingBox())!];
  expect(s.y).toBeGreaterThan(b.y + b.height - 1);
  expect(b.height).toBeGreaterThan(s.height * 2);
  await expect(priceBox(page).getByRole("img", { name: "24 g de proteína por servicio" })).toBeVisible();
  await expect(priceBox(page).getByRole("img", { name: "30 servicios" })).toBeVisible();
  await expect(priceBox(page).getByRole("img", { name: /Te dura 30 días con 1 servicio por día/ })).toBeVisible();
  // Los dos precios explicados, abajo.
  const pay = priceBox(page).getByRole("list", { name: "Cómo pagar" });
  await expect(pay).toContainText(/Transferencia o QR.*49\.410/);
  await expect(pay).toContainText(/3 cuotas de \$\s?18\.300/);
  // "Te dura" sigue a la calculadora.
  await page.getByRole("button", { name: "2 por día" }).click();
  await expect(priceBox(page).getByRole("img", { name: /Te dura 15 días con 2 servicios por día/ })).toBeVisible();
});

test("las placas de sabor y tamaño cambian el total, el precio por servicio y la presentación", async ({ page }) => {
  await page.goto("p/ionic-whey/");
  await expect(total(page, "54.900")).toBeVisible();
  const sizes = page.getByRole("group", { name: /^Tamaño/ });
  await sizes.getByTitle("5 lb (2,27 kg)").click();
  await expect(total(page, "116.900")).toBeVisible();
  await expect(priceBox(page).getByRole("img", { name: /1\.559 por servicio/ })).toBeVisible();
  await expect(priceBox(page)).toContainText("Chocolate · 5 lb (2,27 kg)");
  await expect(sizes.getByRole("radio", { name: /5 lb.*mejor precio por servicio/ })).toBeChecked();
  // Frutilla 5 lb está sin stock: al cambiar de sabor pasa a 2 lb y la placa de 5 lb queda marcada.
  await page.getByRole("group", { name: /^Sabor/ }).getByTitle("Frutilla").click();
  await expect(priceBox(page)).toContainText("Frutilla · 2 lb (907 g)");
  await expect(sizes.getByRole("radio", { name: /5 lb.*sin stock/ })).toBeAttached();
  // La barra fija del celular dice lo mismo: el total primero.
  const bar = page.locator("[data-buy-bar]");
  await expect(bar.locator("[data-bar-total]")).toHaveText(/^\$\s?54\.900\$\s?1\.830 por servicio$/);
});

test("Verificá tu lote: un lote real de la tienda y uno que no existe", async ({ page }) => {
  await page.goto("p/ionic-whey/");
  const section = page.getByRole("region", { name: "Verificá tu lote" });
  await page.getByRole("link", { name: "Verificá tu lote" }).click();
  await expect(section).toBeInViewport();
  const code = section.getByLabel(/Lote de tu pote/);
  await code.fill("vl 2609 w");
  await section.getByRole("button", { name: "Verificar" }).click();
  const result = section.getByRole("status");
  await expect(result).toContainText("Lote VL-2609-W");
  await expect(result).toContainText("Ionic Whey 100%");
  await expect(result).toContainText("11/2027");
  await expect(result).toContainText("Vigente");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await code.fill("XX-0000-Z");
  await section.getByRole("button", { name: "Verificar" }).click();
  await expect(result).toContainText("No encontramos el lote XX-0000-Z");
});

test("equipamiento: total en el marcador, sin servicios, lote ni RNPA, con garantía y cambio de talle", async ({ page }) => {
  await page.goto("p/guantes-boxeo/");
  await expect(total(page, "59.900")).toBeVisible();
  await expect(page.locator("dl[aria-label='Cuánto rinde']")).toHaveCount(0);
  await expect(page.locator("dl[aria-label='Datos de ficha']")).toContainText(/Peso\s*10–16 oz/);
  await expect(page.locator("main").getByText(/por servicio|RNPA|Verificá tu lote/)).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Elegí color, peso y cantidad" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Garantía y cambios" })).toContainText("Original, con garantía de la marca");
  await expect(page.getByText("Cambio de talle sin costo")).toBeVisible();
  await page.getByRole("group", { name: /^Peso/ }).getByTitle("16 oz").click();
  await expect(total(page, "64.900")).toBeVisible();
  await expect(page.getByRole("button", { name: "Medidas y disponibilidad" }).or(page.getByText("Medidas y disponibilidad"))).toBeVisible();
  await expect(page.getByRole("heading", { name: /Armá tu stack|Sumá .* categorías/ })).toHaveCount(0);
});

test("barra fija del celular: total que sigue a la cantidad, Agregar y Regalar", async ({ page }) => {
  await page.goto("p/overvolt-pre/");
  const bar = page.locator("[data-buy-bar]");
  await expect(bar).toBeVisible();
  const first = (await bar.locator("[data-bar-total]").textContent())!;
  const amount = Number(first.match(/\$\s?([\d.]+)/)![1]!.replace(/\./g, ""));
  // La ficha es HTML estático: hasta que React toma la página, elegir la cantidad no cambia nada (se reintenta).
  await expect(async () => {
    await page.getByLabel("Cantidad:").selectOption("2");
    await expect(bar.locator("[data-bar-total]")).toContainText((amount * 2).toLocaleString("es-AR"), { timeout: 1000 });
  }).toPass();
  await bar.getByRole("button", { name: "Regalar" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await bar.getByRole("button", { name: /Agregar al carrito/ }).click();
  await expect(page.getByRole("dialog", { name: "Carrito" })).toBeVisible();
});

for (const slug of ["ionic-whey", "guantes-boxeo", "overvolt-pre"]) {
  test(`a 375 px la ficha de ${slug} no tiene scroll horizontal`, async ({ page }) => {
    await page.goto(`p/${slug}/`);
    await expect(priceBox(page)).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}

test("la foto cargada en el panel se ve en la galería, junto al rótulo; la vista previa no compra", async ({ page }) => {
  await page.goto("admin-demo/productos/editar/?id=ionic-whey");
  const photo = page.getByText("Foto del producto (opcional)").locator("..").locator("input[type=file]");
  await photo.setInputFiles({ name: "pote.png", mimeType: "image/png", buffer: await makePng(page) });
  await page.getByLabel("Texto alternativo (alt)").fill("Pote de prueba sobre la mesada");
  await page.getByRole("button", { name: "Ver en tienda" }).click();
  await expect(page).toHaveURL(/vista-previa\//);
  const views = page.getByRole("group", { name: "Vistas del producto" });
  await expect(views.getByRole("button", { name: /Foto/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-vt-hero] img[alt='Pote de prueba sobre la mesada']")).toBeVisible();
  await views.getByRole("button", { name: /Rótulo/ }).click();
  await expect(page.locator("[data-vt-hero]").getByText("Información nutricional")).toBeVisible();
  await expect(page.getByRole("button", { name: "Comprar ahora" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Mi rack/ })).toHaveCount(0);
  await expect(page.locator("[data-buy-bar]")).toBeHidden();
});
