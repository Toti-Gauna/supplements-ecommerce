/**
 * Titulares con acento: lo que va después de la primera coma se pinta en voltio
 * ("Tu estante, según tu objetivo" → ["Tu estante, ", "según tu objetivo"]). Sin coma, todo el título va parejo.
 */
export function splitAccent(title: string): [string, string] {
  const m = /^(.*?,\s*)(\S.*)$/.exec(title);
  return m ? [m[1]!, m[2]!] : [title, ""];
}
