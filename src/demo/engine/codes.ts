/**
 * Códigos para escribir a mano (regalos y gift cards): PREFIJO-XXXX-XXXX en base 32 de Crockford, con el último
 * carácter como dígito verificador. Aceptan minúsculas, sin guiones, O por 0 e I o L por 1. Funciones puras: el azar
 * se pasa (`random` devuelve [0, 1)).
 */
export const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function checkChar(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) sum += (i + 1) * CODE_ALPHABET.indexOf(body[i]!);
  return CODE_ALPHABET[sum % 32]!;
}

/** Código nuevo con su prefijo ("REGALO", "GIFT"). */
export function makeCode(prefix: string, random: () => number): string {
  const body = Array.from({ length: 7 }, () => CODE_ALPHABET[Math.floor(random() * 32) % 32]).join("");
  const raw = body + checkChar(body);
  return `${prefix}-${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/** Lo que escribió la persona, normalizado; null si no es un código válido de ese prefijo. */
export function normalizeCode(prefix: string, input: string): string | null {
  const raw = input.toUpperCase().replace(/[^0-9A-Z]/g, "").replace(new RegExp(`^${prefix}`), "").replace(/O/g, "0").replace(/[IL]/g, "1");
  if (raw.length !== 8 || [...raw].some((c) => !CODE_ALPHABET.includes(c))) return null;
  if (checkChar(raw.slice(0, 7)) !== raw[7]) return null;
  return `${prefix}-${raw.slice(0, 4)}-${raw.slice(4)}`;
}
