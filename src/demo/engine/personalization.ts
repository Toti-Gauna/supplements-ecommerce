/** Validaciones del personalizador (spec 5.5). Se repiten en el servidor en producción. */
const EMOJI = /\p{Extended_Pictographic}/u;
const ALLOWED = /^[\p{L}\p{N} .'\-&♥]*$/u;

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateText(text: string, maxChars: number): string | null {
  if (EMOJI.test(text)) return "Los emoji no se pueden imprimir. Usá letras, números, acentos o ñ.";
  if (!ALLOWED.test(text)) return "Usá solo letras (con acento o ñ), números, espacios, punto o guion.";
  if (text.trim().length === 0) return "Escribí el texto que querés en tu pieza.";
  if ([...text].length > maxChars) return `Máximo ${maxChars} caracteres. Tenés ${[...text].length}.`;
  return null;
}

export function validatePhoto(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) return "Ese archivo no es una foto compatible. Subí JPG, PNG o WEBP.";
  if (file.size > MAX_PHOTO_BYTES) return `La foto pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es 10 MB.`;
  return null;
}
