import { expect, test, type Locator } from "@playwright/test";

/** Polish 8.2.4: el collar con letras sueltas, en línea, de corrido o chapita; patrón, colores y ejemplos de la demo. */

/** Textos del collar dibujado (letras, nombre o teléfono de la chapita). */
const texts = (preview: Locator) => preview.locator("text").allTextContents();

/** Cuántos textos se salen del dibujo (nombres largos o cortos no lo rompen). */
const outside = (svgImage: Locator) => svgImage.evaluate((svg) => {
  const box = svg.getBoundingClientRect();
  return [...svg.querySelectorAll("text")].filter((t) => {
    const r = t.getBoundingClientRect();
    return r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1;
  }).length;
});

test("inicio: el estilo de las letras, el patrón y los colores cambian la vista previa al instante, con nombres cortos y largos", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#probalo").locator("xpath=ancestor::section[1]");
  await section.scrollIntoViewIfNeeded();
  const preview = section.getByRole("img", { name: /Vista previa del collar/ });
  const pick = (name: string) => section.locator("label", { hasText: name }).first().click();
  await page.getByLabel("Nombre de tu mascota").fill("Bo");
  await expect.poll(() => texts(preview)).toEqual(["B", "O"]);
  await expect(section.getByText("Ejemplo de la demo:")).toBeHidden();
  await pick("Letras en línea");
  await expect.poll(() => texts(preview)).toEqual(["B", "O"]);
  await expect(section.getByText(/Ejemplo de la demo:.*Letras en línea/)).toBeVisible();
  await pick("Nombre de corrido");
  await expect.poll(() => texts(preview)).toEqual(["Bo"]);
  await pick("Chapita con nombre");
  await expect.poll(() => texts(preview)).toEqual(["Bo", "Tel. 223 ··· ····"]);
  for (const name of ["A", "Bartolom"]) {
    await page.getByLabel("Nombre de tu mascota").fill(name);
    for (const style of ["Letras sueltas", "Letras en línea", "Nombre de corrido", "Chapita con nombre"]) {
      await pick(style);
      expect(await outside(preview), `${name} con ${style}`).toBe(0);
    }
  }
  // Patrón de dos colores: aparece el segundo color y el cordón lo usa.
  await pick("Rayas");
  const second = section.locator("fieldset", { has: page.locator("legend", { hasText: "Segundo color" }) });
  await expect(second).toBeVisible();
  await second.getByTitle("Negro").click();
  await expect(preview.locator("path[stroke='#26282a'][stroke-dasharray='2.4 7.6']")).toHaveCount(1);
  await section.locator("fieldset", { has: page.locator("legend", { hasText: "Color del cordón" }) }).getByTitle("Rosa").click();
  await expect(preview.locator("path[stroke='#e38aa3']").first()).toBeAttached();
  // Volver a lo que Volta ya hace: sin aviso de demo.
  await pick("Letras sueltas");
  await pick("Liso");
  await expect(second).toBeHidden();
  await expect(section.getByText("Ejemplo de la demo:")).toBeHidden();
});

test("ficha: adorno, patrón y estilo llegan al carrito marcados como ejemplo de la demo; otros productos no cambian", async ({ page }) => {
  await page.goto("p/collar-con-nombre/");
  const card = page.locator("#personalizar");
  await page.getByLabel("Nombre", { exact: true }).fill("Mora");
  await expect(card.locator("label", { hasText: "Letras sueltas" })).not.toContainText("Demo");
  await expect(card.locator("label", { hasText: "Letras en línea" })).toContainText("Demo");
  await card.locator("label", { hasText: "Letras en línea" }).click();
  await card.locator("fieldset", { has: page.locator("legend", { hasText: "Adorno" }) }).locator("label", { hasText: "Corazones" }).click();
  await card.locator("label", { hasText: "Lunares" }).click();
  const preview = page.getByRole("img", { name: "Vista previa del collar Mora" }).first();
  await expect(preview.locator("text")).toHaveText(["M", "O", "R", "A"]);
  await expect(page.getByText("Con ejemplos de la demo").first()).toBeVisible();
  await expect(page.getByText(/lo marcado como demo te lo confirma antes por WhatsApp/)).toBeVisible();
  // Con chapita el adorno no corresponde: se oculta y no se describe.
  await card.locator("label", { hasText: "Chapita con nombre" }).click();
  await expect(card.locator("legend", { hasText: "Adorno" })).toBeHidden();
  await card.locator("label", { hasText: "Letras en línea" }).click();
  await card.locator("fieldset", { has: page.locator("legend", { hasText: "Adorno" }) }).locator("label", { hasText: "Corazones" }).click();
  await page.getByRole("button", { name: /Agregar al carrito/ }).last().click();
  await page.goto("carrito/");
  await expect(page.getByText("Letras en línea · adorno corazones · Paracord trenzado verde oliva, lunares crema · dije patita · ejemplo de la demo")).toBeVisible();
  await page.goto("p/comedero-perro-globo/");
  await expect(page.getByLabel("Texto", { exact: true })).toBeVisible();
  await expect(page.getByText("Estilo de las letras")).toHaveCount(0);
  await expect(page.getByText("Patrón del cordón")).toHaveCount(0);
});
