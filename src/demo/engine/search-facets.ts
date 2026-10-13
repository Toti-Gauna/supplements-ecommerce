import type { GoalInfo } from "../fixtures/goals";
import type { Product, ProductBadge } from "../types";
import { flavorsOf } from "./search-index";
import { BADGE_LABELS, BADGE_PHRASES, GOAL_PHRASES } from "./search-lexicon";
import type { SearchChip } from "./search-query";
import { normalize } from "./search-text";

/**
 * Filtros para tocar en el buscador (objetivo, sello y sabor). Cada opción trae la frase que el motor entiende: tocarla
 * la suma a la consulta y el chip aparece solo; tocarla de nuevo la saca con `removeChip`.
 */
export interface ChipOption {
  /** Mismo formato que `SearchChip.key` ("badge:sin-tacc"): sirve para saber si ya está aplicada. */
  key: string;
  kind: SearchChip["kind"];
  /** Id del objetivo o del sello; para sabores, el sabor normalizado. */
  id: string;
  label: string;
  /** Lo que se escribe en la consulta ("sin tacc", "masa muscular", "chocolate"). */
  phrase: string;
}

export interface ChipGroups {
  goal: ChipOption[];
  badge: ChipOption[];
  flavor: ChipOption[];
}

/** Objetivos vigentes, los sellos que tiene algún producto y los sabores más repetidos del catálogo. */
export function chipOptions(products: Product[], goals: GoalInfo[], maxFlavors = 6): ChipGroups {
  const goal = goals.map((g) => ({ key: `goal:${g.id}`, kind: "goal" as const, id: g.id, label: g.name, phrase: GOAL_PHRASES[g.id][0]! }));
  const present = new Set(products.flatMap((p) => p.badges ?? []));
  const badge = (Object.keys(BADGE_LABELS) as ProductBadge[])
    .filter((id) => present.has(id))
    .map((id) => ({ key: `badge:${id}`, kind: "badge" as const, id, label: BADGE_LABELS[id], phrase: BADGE_PHRASES[id][0]! }));
  const flavors = new Map<string, { label: string; count: number }>();
  for (const p of products) {
    for (const id of flavorsOf(p)) {
      const label = p.variants.find((v) => normalize(v.color ?? "") === id)?.color ?? id;
      flavors.set(id, { label: flavors.get(id)?.label ?? label, count: (flavors.get(id)?.count ?? 0) + 1 });
    }
  }
  const flavor = [...flavors]
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .slice(0, maxFlavors)
    .map(([id, f]) => ({ key: `flavor:${id}`, kind: "flavor" as const, id, label: f.label, phrase: id }));
  return { goal, badge, flavor };
}

/** La consulta con la opción sumada al final (si ya estaba, la devuelve igual). */
export function addChipPhrase(query: string, option: Pick<ChipOption, "phrase">): string {
  return `${query.trim()} ${option.phrase}`.trim();
}
