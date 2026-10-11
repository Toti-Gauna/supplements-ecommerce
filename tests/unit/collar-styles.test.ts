import { describe, expect, it } from "vitest";
import { withCurrentCollarSpec } from "@/demo/admin/templates";
import { collarPieces, demoChoices, describeCollar, optionsFor, resolveCollar } from "@/demo/engine/collar";
import { defaultDemoData } from "@/demo/engine/source";
import { collarPresets, collarSpec, defaultCollarConfig, type CollarSpec } from "@/demo/fixtures/collar";

/** Polish 8.2.4: estilos de letras, adornos, patrones del cordón y opciones marcadas como ejemplo de la demo. */
describe("collar: estilos, patrones y adornos", () => {
  it("una configuración vieja (sin patrón ni adorno) queda lisa, sin adorno y con un segundo color que contrasta", () => {
    const old = { format: "letters" as const, material: "paracord" as const, cordColor: "#5a6b3a", cordColorName: "Verde oliva", charm: "paw" as const };
    const c = resolveCollar(collarSpec, old);
    expect(c.pattern).toBe("solid");
    expect(c.design).toBe("none");
    expect(c.accentColor).not.toBe(c.cordColor);
    expect(collarSpec.cordColors.some((x) => x.hex === c.accentColor && x.name === c.accentColorName)).toBe(true);
  });
  it("los adornos van solo con letras sueltas o en línea; con chapita o de corrido se descartan", () => {
    expect(optionsFor(collarSpec.designs, "letters").map((o) => o.id)).toEqual(["none", "paws", "hearts", "stars", "bones"]);
    expect(optionsFor(collarSpec.designs, "tag").map((o) => o.id)).toEqual(["none"]);
    expect(resolveCollar(collarSpec, { ...defaultCollarConfig, format: "joined", design: "hearts" }).design).toBe("none");
    expect(resolveCollar(collarSpec, { ...defaultCollarConfig, format: "inline", design: "hearts" }).design).toBe("hearts");
  });
  it("letras en línea: una pieza por letra, como las sueltas", () => {
    expect(collarPieces("Mora", { ...defaultCollarConfig, format: "inline" })).toEqual(["M", "O", "R", "A"]);
    expect(collarPieces("Mora", { ...defaultCollarConfig, format: "tag" })).toEqual(["Mora"]);
  });
  it("lo único confirmado por Volta (letras sueltas, paracord liso, patita) no lleva marca de demo; lo demás sí", () => {
    expect(demoChoices(collarSpec, defaultCollarConfig)).toEqual([]);
    expect(describeCollar(collarSpec, defaultCollarConfig)).not.toContain("demo");
    const custom = { ...defaultCollarConfig, format: "inline" as const, pattern: "twist" as const, design: "paws" as const };
    expect(demoChoices(collarSpec, custom)).toEqual(["Letras en línea", "Patitas", "Espiral"]);
    for (const list of [collarSpec.formats, collarSpec.designs, collarSpec.materials, collarSpec.patterns, collarSpec.charms]) {
      expect(list.filter((o) => !o.demo).length).toBeGreaterThan(0);
    }
  });
  it("la descripción para el taller nombra adorno, patrón con su segundo color y el aviso de demo", () => {
    const text = describeCollar(collarSpec, { ...defaultCollarConfig, cordColor: "#7fb2dc", cordColorName: "Celeste", format: "inline", design: "stars", pattern: "stripes", accentColor: "#efe2c6", accentColorName: "Crema" });
    expect(text).toBe("Letras en línea · adorno estrellas · Paracord trenzado celeste, rayas crema · dije patita · ejemplo de la demo");
  });
  it("las combinaciones listas usan patrones, adornos y segundos colores que existen", () => {
    for (const p of collarPresets) {
      const c = resolveCollar(collarSpec, p.config);
      expect(collarSpec.patterns.some((o) => o.id === c.pattern)).toBe(true);
      expect(optionsFor(collarSpec.designs, c.format).some((o) => o.id === c.design)).toBe(true);
      if (p.config.design) expect(c.design).toBe(p.config.design);
      if (p.config.accentColor) expect(c.accentColor).toBe(p.config.accentColor);
    }
  });
  it("los datos guardados en el navegador con la configuración vieja del collar toman la vigente", () => {
    const data = defaultDemoData();
    const stale = { ...collarSpec, patterns: undefined, designs: undefined } as unknown as CollarSpec;
    const saved = { ...data, products: data.products.map((p) => (p.personalization?.collar ? { ...p, personalization: { ...p.personalization, collar: stale, maxChars: 7 } } : p)) };
    const fresh = withCurrentCollarSpec(saved);
    const collar = fresh.products.find((p) => p.personalization?.collar)!;
    expect(collar.personalization!.collar).toBe(collarSpec);
    expect(collar.personalization!.maxChars).toBe(7);
    expect(fresh.products.filter((p) => !p.personalization?.collar)).toEqual(saved.products.filter((p) => !p.personalization?.collar));
  });
});
