import { expect, test } from "@playwright/test";
import { guardNetwork, makePng } from "./helpers";

test("la foto se encuadra en la ficha y nunca sale del dispositivo", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("crear/velador-con-foto/");
  const add = page.getByRole("button", { name: "Agregar al carrito" }).filter({ visible: true });
  await add.click();
  await expect(page.getByRole("alert").filter({ hasText: "Subí una foto" })).toBeVisible();

  // Archivo inválido y archivo demasiado grande
  await page.getByLabel("Elegir foto").setInputFiles({ name: "falso.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF") });
  await expect(page.getByRole("alert").filter({ hasText: "JPG, PNG o WEBP" })).toBeVisible();
  await page.getByLabel("Elegir foto").setInputFiles({ name: "enorme.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(11 * 1024 * 1024) });
  await expect(page.getByRole("alert").filter({ hasText: "10 MB" })).toBeVisible();

  // Foto válida: se dibuja en vivo en la galería, con zoom y encuadre
  await page.getByLabel("Elegir foto").setInputFiles({ name: "perro.png", mimeType: "image/png", buffer: await makePng(page) });
  await expect(page.locator("canvas").first()).toBeVisible();
  await page.getByLabel(/Zoom/).fill("1.6");
  await page.getByRole("button", { name: "Mover a la derecha" }).click();
  await add.click();
  await page.getByRole("dialog", { name: "Carrito" }).getByRole("link", { name: "Ver carrito completo" }).click();
  await expect(page).toHaveURL(/carrito\/$/);
  const thumb = page.getByRole("list", { name: "Productos en el carrito" }).getByRole("img", { name: "Vista previa aprobada de Velador con foto" });
  await expect(thumb).toBeVisible();
  expect(await thumb.getAttribute("src")).toMatch(/^data:image\/jpeg/);
  assertNoExternal();
});

test("foto de referencia con notas", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("crear/velador-pintado-a-mano/");
  await page.getByLabel("Elegir foto").setInputFiles({ name: "ref.png", mimeType: "image/png", buffer: await makePng(page, "#e88aa0") });
  await expect(page.getByRole("img", { name: "Tu foto de referencia" })).toBeVisible();
  await page.getByLabel("Notas para el taller").fill("Sentado, con collar rojo y fondo verde.");
  await page.getByRole("button", { name: "Agregar al carrito" }).filter({ visible: true }).click();
  await page.getByRole("dialog", { name: "Carrito" }).getByRole("link", { name: "Ver carrito completo" }).click();
  await expect(page.getByText(/Notas: Sentado/)).toBeVisible();
  assertNoExternal();
});
