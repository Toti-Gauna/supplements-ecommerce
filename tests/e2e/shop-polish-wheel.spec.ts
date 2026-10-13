import { expect, test, type Page } from "@playwright/test";

/** Polish 8.2 · Lote 7 (8.2.14): el premio de la ruleta conserva su estado entre pantallas, recargas y el checkout. */

/** Dos colágenos en el carrito ($47.800): alcanza el mínimo de cualquier premio de la ruleta. */
const seedCart = (page: Page) =>
  page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("volta-demo:cart", JSON.stringify({ state: { lines: [{ id: "l1", productSlug: "colageno", variantId: "co-limon-300", quantity: 2 }], couponCode: null }, version: 0 }));
  });

async function win(page: Page) {
  await page.goto("club/");
  await page.getByRole("button", { name: "Girar la ruleta" }).click();
  const stage = page.getByRole("dialog", { name: "Ruleta de cupones" });
  await stage.getByRole("button", { name: "Girar la ruleta" }).click();
  await expect(stage.getByText("¡Ganaste!")).toBeVisible();
  const code = (await stage.getByRole("button", { name: /Copiar código/ }).textContent())!.trim();
  return { stage, code };
}

const toasts = (page: Page, title: string) => page.getByRole("status").filter({ hasText: title });

test("8.2.14 aplicado: sigue aplicado al navegar y recargar, se quita en el checkout y queda desactivado, y se vuelve a aplicar", async ({ page }) => {
  await seedCart(page);
  // Sorteo fijo (5% OFF): así el cupón se ve como descuento en el resumen.
  await page.addInitScript(() => { Math.random = () => 0.1; });
  const { stage, code } = await win(page);
  await stage.getByRole("button", { name: "Aplicar ahora" }).click();
  await expect(stage).toBeHidden();
  await expect(toasts(page, "Cupón aplicado a tu carrito")).toHaveCount(1);
  // En el Club, en el carrito y después de recargar: aplicado.
  await expect(page.getByText("Aplicado a tu carrito").first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("Aplicado a tu carrito").first()).toBeVisible();
  await page.goto("carrito/");
  await expect(page.getByText(new RegExp(`${code}: Ruleta`))).toBeVisible();
  await page.reload();
  await expect(page.getByText(new RegExp(`${code}: Ruleta`))).toBeVisible();
  // Reabrir la ruleta no da otro giro ni otro aviso: dice que ya está aplicado.
  await page.goto("club/");
  await page.getByRole("button", { name: "Ver mi premio" }).click();
  await expect(stage.getByText("Aplicado a tu carrito")).toBeVisible();
  await expect(stage.getByRole("button", { name: "Aplicar ahora" })).toHaveCount(0);
  await stage.getByRole("button", { name: "Listo, ya está aplicado" }).click();
  // Checkout: se ve aplicado, se quita y el total vuelve a subir.
  await page.goto("checkout/");
  // El ticket (con el cupón) va plegado arriba en el celular.
  await page.getByRole("button", { name: /Ver ticket/ }).click();
  const coupon = page.getByRole("region", { name: "Cupón del pedido" });
  const summary = page.getByRole("region", { name: "Resumen de tu compra" });
  await expect(coupon.getByText(new RegExp(`${code}: Ruleta`))).toBeVisible();
  await expect(summary.getByText("Cupón", { exact: true })).toBeVisible();
  await coupon.getByRole("button", { name: `Quitar cupón ${code}` }).click();
  await expect(summary.getByText("Cupón", { exact: true })).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: /Ver ticket/ }).click();
  await expect(coupon.getByRole("button", { name: "Elegir de mis cupones" })).toBeVisible();
  // En Mis cupones queda desactivado (no aplicado) y se puede volver a aplicar desde el checkout.
  await coupon.getByRole("button", { name: /Elegir de mis cupones/ }).click();
  const sheet = page.getByRole("dialog", { name: "Mis cupones" });
  await expect(sheet.getByText(/Quitado del pedido: podés volver a aplicarlo/)).toBeVisible();
  await sheet.getByRole("button", { name: `Aplicar cupón ${code}` }).click();
  await expect(coupon.getByText(new RegExp(`${code}: Ruleta`))).toBeVisible();
  await expect(summary.getByText("Cupón", { exact: true })).toBeVisible();
});

test("8.2.14 guardado y utilizado: un solo premio, un solo cupón y no se puede usar dos veces", async ({ page }) => {
  await seedCart(page);
  const { stage, code } = await win(page);
  await stage.getByRole("button", { name: "Guardar para después" }).click();
  await expect(toasts(page, "Guardado en Mis cupones")).toHaveCount(1);
  await page.goto("cupones/");
  await expect(page.getByText("Guardado en Mis cupones", { exact: false }).first()).toBeVisible();
  // La ruleta reabierta ofrece aplicarlo, pero ya no "guardarlo" otra vez.
  await page.goto("club/");
  await page.getByRole("button", { name: "Ver mi premio" }).click();
  await expect(stage.getByRole("button", { name: "Guardar para después" })).toHaveCount(0);
  await stage.getByRole("button", { name: "Aplicar ahora" }).click();
  // Compra con el premio: después queda como usado en todas partes.
  await page.goto("checkout/");
  await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
  await page.getByLabel("Email").fill("juana@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByText("Retiro en el local").click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Transferencia bancaria").click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
  await page.goto("club/");
  await expect(page.getByText("Ya lo usaste en un pedido").first()).toBeVisible();
  await page.getByRole("button", { name: "Ver mi premio" }).click();
  await expect(stage.getByRole("button", { name: "Aplicar ahora" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  // Escribirlo a mano en el carrito tampoco sirve.
  await page.goto("p/ionic-whey/");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await page.goto("carrito/");
  await page.getByLabel("¿Tenés un código?").fill(code);
  await page.getByLabel("¿Tenés un código?").press("Enter");
  await expect(page.getByRole("alert").filter({ hasText: "límite de usos" })).toBeVisible();
  // Un solo cupón emitido para ese premio, con su uso contado.
  await page.goto("admin-demo/cupones/lista/");
  await expect(page.getByText(code, { exact: true })).toHaveCount(1);
});
