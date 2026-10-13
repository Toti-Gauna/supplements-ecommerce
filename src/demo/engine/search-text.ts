/**
 * Texto de la búsqueda: normalización, plurales simples y distancia de edición. Puro y sin datos del catálogo.
 * En producción: Postgres `unaccent` + `pg_trgm` (y un diccionario de sinónimos del rubro).
 */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9ñ\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length]!;
}

/** Errores de tipeo tolerados según el largo de la palabra (las cortas tienen que coincidir). */
function tolerance(token: string): number {
  if (token.length <= 3) return 0;
  if (token.length <= 5) return 1;
  return 2;
}

/** 0 = no coincide; mayor = mejor (4 igual, 3 empieza así, 2 la contiene, 1 con un error leve). */
export function tokenScore(token: string, word: string): number {
  if (word === token) return 4;
  if (word.startsWith(token)) return 3;
  if (token.length >= 3 && word.includes(token)) return 2;
  const tol = tolerance(token);
  if (tol === 0) return 0;
  let best = Infinity;
  for (let len = Math.max(1, token.length - 1); len <= Math.min(word.length, token.length + 2); len++) {
    best = Math.min(best, levenshtein(token, word.slice(0, len)));
  }
  return best <= tol ? 1 : 0;
}

/** Plural simple del castellano: "quemadores" → "quemador", "gomitas" → "gomita", "bcaas" → "bcaa". */
export function stem(word: string): string {
  if (word.length >= 6 && /[rlnd]es$/.test(word)) return word.slice(0, -2);
  if (word.length >= 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

/** Palabras normalizadas y sin plural, listas para comparar. */
export function stems(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean).map(stem);
}

/** Palabra de la consulta contra palabra de un diccionario: igual, o un error leve en palabras largas. */
export function sameWord(token: string, word: string): boolean {
  return token === word || (token.length >= 6 && word.length >= 6 && levenshtein(token, word) <= 1);
}
