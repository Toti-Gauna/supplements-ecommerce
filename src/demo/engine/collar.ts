import type { CollarConfig, CollarFormat, CollarOption, CollarSpec } from "../fixtures/collar";
import type { Product } from "../types";

/** Reglas del configurador de collar: recargos, talle por contorno de cuello y descripción para el taller. */

/** Opciones que van con un estilo de letras (los adornos, por ejemplo, solo con letras sueltas o en línea). */
export function optionsFor<T extends CollarOption<string>>(list: T[], format: CollarFormat): T[] {
  return list.filter((o) => !o.formats || o.formats.includes(format));
}

const luma = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
};

/**
 * Configuración completa y coherente: patrón liso y sin adorno si no vienen (carritos guardados antes), segundo color
 * que contrasta con el cordón si el patrón lo usa, y el adorno se descarta si no va con el estilo de letras elegido.
 */
export function resolveCollar(spec: CollarSpec, config: CollarConfig): Required<Omit<CollarConfig, "neckCm">> & Pick<CollarConfig, "neckCm"> {
  const pattern = spec.patterns.find((o) => o.id === config.pattern) ?? spec.patterns[0]!;
  const others = spec.cordColors.filter((c) => c.hex !== config.cordColor);
  const contrast = [...others].sort((a, b) => Math.abs(luma(b.hex) - luma(config.cordColor)) - Math.abs(luma(a.hex) - luma(config.cordColor)))[0];
  const accent = others.find((c) => c.hex === config.accentColor) ?? contrast ?? { name: config.cordColorName, hex: config.cordColor };
  const design = optionsFor(spec.designs, config.format).find((o) => o.id === config.design)?.id ?? "none";
  return { ...config, pattern: pattern.id, accentColor: accent.hex, accentColorName: accent.name, design };
}

/** Las opciones elegidas que son ejemplos de la demo (Volta todavía no las confirmó). */
export function demoChoices(spec: CollarSpec | undefined, config: CollarConfig | undefined): string[] {
  if (!spec || !config) return [];
  const c = resolveCollar(spec, config);
  const picked: (CollarOption<string> | undefined)[] = [
    spec.formats.find((o) => o.id === c.format), spec.designs.find((o) => o.id === c.design), spec.materials.find((o) => o.id === c.material),
    spec.patterns.find((o) => o.id === c.pattern), spec.charms.find((o) => o.id === c.charm),
  ];
  return picked.flatMap((o) => (o?.demo ? [o.name] : []));
}

export function collarSurcharge(spec: CollarSpec | undefined, config: CollarConfig | undefined): number {
  if (!spec || !config) return 0;
  const c = resolveCollar(spec, config);
  const pick = <T extends { id: string; delta: number }>(list: T[], id: string) => list.find((o) => o.id === id)?.delta ?? 0;
  return pick(spec.formats, c.format) + pick(spec.designs, c.design) + pick(spec.materials, c.material) + pick(spec.patterns, c.pattern) + pick(spec.charms, c.charm);
}

/** Talle (variante) para un contorno de cuello; null si está fuera de los talles (se hace a medida por WhatsApp). */
export function sizeForNeck(spec: CollarSpec, product: Product, cm: number): string | null {
  const id = sizeInSpec(spec, cm);
  return id && product.variants.some((v) => v.id === id) ? id : null;
}

/** Talle por contorno con rangos sin huecos: cada talle va desde su mínimo hasta el mínimo del siguiente (27,5 cm cae en un talle). */
export function sizeInSpec(spec: CollarSpec, cm: number): string | null {
  if (!Number.isFinite(cm)) return null;
  const sizes = [...spec.sizes].sort((a, b) => a.min - b.min);
  const i = sizes.findIndex((s, k) => cm >= s.min && cm < (sizes[k + 1]?.min ?? s.max + 1));
  return i >= 0 ? sizes[i]!.variantId : null;
}

export function neckRange(spec: CollarSpec, variantId: string): { min: number; max: number } | null {
  const s = spec.sizes.find((x) => x.variantId === variantId);
  return s ? { min: s.min, max: s.max } : null;
}

/**
 * Texto corto para el carrito, el pedido y los emails: "Letras sueltas · Paracord trenzado verde oliva · dije patita".
 * El patrón y el adorno se nombran solo si no son los de siempre; si hay ejemplos de la demo, se avisa al final.
 */
export function describeCollar(spec: CollarSpec | undefined, config: CollarConfig | undefined): string {
  if (!spec || !config) return "";
  const c = resolveCollar(spec, config);
  const format = spec.formats.find((o) => o.id === c.format)?.name;
  const design = spec.designs.find((o) => o.id === c.design);
  const material = spec.materials.find((o) => o.id === c.material)?.name;
  const pattern = spec.patterns.find((o) => o.id === c.pattern);
  const charm = spec.charms.find((o) => o.id === c.charm);
  const cord = `${material ?? ""} ${c.cordColorName.toLowerCase()}`.trim();
  return [
    format,
    design && design.id !== "none" ? `adorno ${design.name.toLowerCase()}` : "",
    pattern && pattern.twoTone ? `${cord}, ${pattern.name.toLowerCase()} ${c.accentColorName.toLowerCase()}` : cord,
    charm && charm.id !== "none" ? `dije ${charm.name.toLowerCase()}` : "sin dije",
    c.neckCm ? `cuello ${c.neckCm} cm` : "",
    demoChoices(spec, c).length ? "ejemplo de la demo" : "",
  ].filter(Boolean).join(" · ");
}

/** Letras que se imprimen (las sueltas y las de en línea se cuentan una por una; los espacios no llevan pieza). */
export function collarPieces(text: string, config: CollarConfig): string[] {
  const clean = text.trim();
  if (config.format !== "letters" && config.format !== "inline") return clean ? [clean] : [];
  return [...clean.toUpperCase()].filter((ch) => ch.trim());
}
