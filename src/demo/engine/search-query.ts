import type { Goal, ProductBadge } from "../types";
import { BADGE_LABELS, BADGE_PHRASES, FLAVOR_ALIASES, GOAL_PHRASES, STOPWORDS, SYNONYMS } from "./search-lexicon";
import { normalize, sameWord, stem, stems } from "./search-text";

/** Filtro entendido del texto: la UI lo muestra como chip y lo puede sacar con `removeChip`. */
export interface SearchChip {
  /** Único por consulta: "goal:definicion", "badge:sin-tacc", "flavor:chocolate". */
  key: string;
  kind: "goal" | "badge" | "flavor";
  /** Id del objetivo o del sello; para sabores, el sabor normalizado ("dulce de leche"). */
  id: string;
  label: string;
  /** Lo que escribió la persona ("sin TACC", "vegana"). */
  source: string;
  /** Posiciones de las palabras que lo formaron (ver `tokenize`). */
  at: number[];
}

/** Palabra libre: se busca en nombre, categoría y descripción, con sus sinónimos. */
export interface QueryTerm {
  text: string;
  alts: string[];
  source: string;
  at: number[];
  /** true si es una palabra del rubro escrita bien: no se busca con tolerancia a errores ni se corrige. */
  known: boolean;
}

export interface ParsedQuery {
  chips: SearchChip[];
  terms: QueryTerm[];
  /** "sin X" que no es un sello: no se puede filtrar y no se busca (sería lo contrario). */
  ignored: string[];
}

export interface QueryContext {
  /** Sabores del catálogo: normalizado → como se muestra ("dulce de leche" → "Dulce de leche"). */
  flavors: Map<string, string>;
  goalName: (id: Goal) => string;
}

interface Token { raw: string; stem: string }

const STOP = new Set([...STOPWORDS].map(stem));

/** Palabras de la consulta tal como se escribieron, con su forma comparable. */
export function tokenize(query: string): Token[] {
  return query.split(/[^\p{L}\p{N}]+/u).map((raw) => ({ raw, stem: stem(normalize(raw).replace(/ /g, "")) })).filter((t) => t.stem);
}

type Make = (hit: Token[], at: number[], words: string[]) => { chip?: SearchChip; term?: QueryTerm };
interface Phrase { words: string[]; make: Make }

function phrases(ctx: QueryContext): Phrase[] {
  const list: Phrase[] = [];
  const add = (text: string, make: Make) => list.push({ words: stems(text), make });
  const chip = (kind: SearchChip["kind"], id: string, label: string): Make => (hit, at) => ({ chip: { key: `${kind}:${id}`, kind, id, label, source: raw(hit), at } });
  for (const [id, texts] of Object.entries(BADGE_PHRASES)) for (const t of texts) add(t, chip("badge", id, BADGE_LABELS[id as ProductBadge]));
  for (const [id, texts] of Object.entries(GOAL_PHRASES)) for (const t of texts) add(t, chip("goal", id, ctx.goalName(id as Goal)));
  for (const [id, label] of ctx.flavors) for (const t of [id, ...(FLAVOR_ALIASES[id] ?? [])]) add(t, chip("flavor", id, label));
  for (const s of SYNONYMS) {
    const all = [s.term, ...s.alts].map(stem);
    for (const t of s.phrases) {
      add(t, (hit, at, words) => {
        // Una palabra escrita se busca tal cual (y el término del rubro como alternativa); una frase, por su término.
        const text = hit.length === 1 ? hit[0]!.stem : stem(s.term);
        const known = hit.every((h, k) => h.stem === words[k]);
        return { term: { text, alts: all.filter((a) => a !== text), source: raw(hit), at, known } };
      });
    }
  }
  // Las frases más largas primero ("whey isolate" antes que "whey"; "chocolate blanco" antes que "chocolate").
  return list.sort((a, b) => b.words.length - a.words.length);
}

const raw = (hit: Token[]) => hit.map((t) => t.raw).join(" ");

function matchAt(tokens: Token[], i: number, words: string[]): boolean {
  return words.every((w, k) => tokens[i + k] !== undefined && sameWord(tokens[i + k]!.stem, w));
}

/** Entiende la consulta: sellos, objetivos y sabores como filtros; el resto, palabras libres con sus sinónimos. */
export function parseQuery(query: string, ctx: QueryContext): ParsedQuery {
  const tokens = tokenize(query);
  const list = phrases(ctx);
  const out: ParsedQuery = { chips: [], terms: [], ignored: [] };
  let i = 0;
  while (i < tokens.length) {
    const hit = list.find((p) => matchAt(tokens, i, p.words));
    if (hit) {
      const at = hit.words.map((_, k) => i + k);
      const { chip, term } = hit.make(at.map((k) => tokens[k]!), at, hit.words);
      if (chip && !out.chips.some((c) => c.key === chip.key)) out.chips.push(chip);
      else if (chip) out.chips.find((c) => c.key === chip.key)!.at.push(...at);
      if (term) out.terms.push(term);
      i += hit.words.length;
      continue;
    }
    const token = tokens[i]!;
    const next = tokens[i + 1];
    if (token.stem === "sin" && next && !STOP.has(next.stem)) {
      out.ignored.push(`${token.raw} ${next.raw}`);
      i += 2;
      continue;
    }
    if (!STOP.has(token.stem)) out.terms.push({ text: token.stem, alts: [], source: token.raw, at: [i], known: false });
    i += 1;
  }
  return out;
}

/** Saca de la consulta las palabras de un chip o de un término (para "quitar filtro" y para las sugerencias). */
export function removeWords(query: string, at: readonly number[]): string {
  return tokenize(query).filter((_, i) => !at.includes(i)).map((t) => t.raw).join(" ");
}

/** La consulta sin ese chip: es lo que la UI pone en el buscador al tocar la cruz del chip. */
export function removeChip(query: string, chip: Pick<SearchChip, "at">): string {
  return removeWords(query, chip.at);
}
