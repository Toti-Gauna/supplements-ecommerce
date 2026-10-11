/** Fotos que se aceptan para subir en el panel demo (producto, comprobante, banners): tipo y tamaño máximos. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePhoto(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) return "Ese archivo no es una foto compatible. Subí JPG, PNG o WEBP.";
  if (file.size > MAX_PHOTO_BYTES) return `La foto pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es 10 MB.`;
  return null;
}

/** Procesamiento de imágenes 100% en el navegador. Nada se sube a ningún servidor. */
export async function readImage(file: Blob, maxSize: number, quality: number, background?: string): Promise<{ src: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) { bitmap.close(); throw new Error("Canvas no disponible"); }
  // JPEG no tiene transparencia: un PNG con fondo transparente quedaría negro.
  if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { src: canvas.toDataURL("image/jpeg", quality), width, height };
}

export async function fileToThumbnail(file: Blob, maxSize = 480, quality = 0.82): Promise<string> {
  return (await readImage(file, maxSize, quality)).src;
}
