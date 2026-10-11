import { pickVideoFormat } from "@/demo/admin/studio/video";
import { playJingle, type StudioMusic } from "./music";

/** Exportación: imagen PNG del cuadro final y video grabado del canvas (MediaRecorder) con la música opcional. */
export function canvasFor(W: number, H: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
}

export function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))), "image/png"));
}

/** Descarga un archivo (en el iPhone abre la vista para guardarlo). */
export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** ¿Se pueden compartir archivos (hoja de compartir del celular: "Guardar imagen", Instagram, WhatsApp)? */
export function canShareFiles(files: File[]): boolean {
  return typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files });
}

export async function shareFiles(files: File[], title: string): Promise<boolean> {
  if (!canShareFiles(files)) return false;
  try { await navigator.share({ files, title }); return true; } catch { return false; }
}

export function videoSupport(): ReturnType<typeof pickVideoFormat> {
  if (typeof MediaRecorder === "undefined" || typeof HTMLCanvasElement.prototype.captureStream !== "function") return null;
  return pickVideoFormat((m) => MediaRecorder.isTypeSupported(m));
}

/** Libera la memoria del canvas de exportación (Safari de iPhone limita el total de canvas abiertos). */
export function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Graba `duration` segundos: dibuja cada cuadro con `draw(t)` y captura el canvas a 30 cuadros por segundo.
 * Antes de grabar dibuja la pieza entera una vez (arma los mapas de bits y evita saltos). Si se cambia de pestaña, el
 * navegador pausa la animación: la grabación se cancela con un aviso. Siempre libera grabador, pistas y audio.
 */
export async function recordVideo(canvas: HTMLCanvasElement, draw: (t: number) => void, duration: number, music: StudioMusic, onProgress: (s: number) => void): Promise<{ blob: Blob; ext: string }> {
  const format = videoSupport();
  if (!format) throw new Error("Este navegador no puede grabar video");
  for (let t = 0; t <= duration; t += 0.5) draw(t);
  const stream = canvas.captureStream(30);
  let audio: AudioContext | null = null, stopMusic = () => {}, rec: MediaRecorder | null = null, hidden = false;
  const onHide = () => { if (document.hidden) hidden = true; };
  document.addEventListener("visibilitychange", onHide);
  try {
    if (music !== "none") {
      audio = new AudioContext();
      const dest = audio.createMediaStreamDestination();
      stopMusic = playJingle(audio, dest, music, duration);
      dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    }
    rec = new MediaRecorder(stream, { mimeType: format.mimeType, videoBitsPerSecond: 6_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise<void>((resolve) => { rec!.onstop = () => resolve(); });
    draw(0);
    rec.start(250);
    const start = performance.now();
    await new Promise<void>((resolve, reject) => {
      const tick = () => {
        try {
          if (hidden) throw new Error("Se canceló la grabación: la pestaña quedó en segundo plano. Volvé a grabar sin cambiar de pestaña.");
          const t = (performance.now() - start) / 1000;
          draw(Math.min(t, duration));
          onProgress(Math.min(t, duration));
          if (t >= duration) resolve(); else requestAnimationFrame(tick);
        } catch (e) { reject(e); }
      };
      requestAnimationFrame(tick);
    });
    rec.stop();
    await stopped;
    const blob = new Blob(chunks, { type: format.mimeType.split(";")[0] });
    if (!blob.size) throw new Error("El video salió vacío. Probá de nuevo o con otro navegador.");
    return { blob, ext: format.ext };
  } finally {
    document.removeEventListener("visibilitychange", onHide);
    if (rec && rec.state !== "inactive") rec.stop();
    stopMusic();
    stream.getTracks().forEach((track) => track.stop());
    await audio?.close().catch(() => {});
  }
}
