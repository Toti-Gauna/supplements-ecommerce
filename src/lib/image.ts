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
