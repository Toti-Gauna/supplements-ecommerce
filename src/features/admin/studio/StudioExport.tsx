"use client";
import { Download, Film, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { exportName } from "@/demo/admin/studio/video";
import { STUDIO_BRAND } from "@/demo/fixtures/studio";
import { carouselSlides } from "./render/carousel";
import type { StudioScene } from "./render/types";
import { canvasFor, canShareFiles, recordVideo, releaseCanvas, saveBlob, shareFiles, toPng, videoSupport } from "./export";
import type { StudioMusic } from "./music";
import { drawFrame } from "./StudioPreview";

const FORMAT_SLUG = { post: "post", story: "historia", carousel: "carrusel" } as const;

/** Exportar: imagen del cuadro final, todas las diapositivas del carrusel o el video con música. */
export function StudioExport({ scene, slide, themeId, music, onRecording, ready }: { scene: StudioScene; slide: number; themeId: string | null; music: StudioMusic; onRecording: (on: boolean) => void; ready: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [last, setLast] = useState<File[]>([]);
  // "Compartir" ofrece lo último exportado de esta misma pieza: si cambia la pieza, se olvida.
  const [seen, setSeen] = useState(scene);
  if (seen !== scene) { setSeen(scene); setLast([]); }
  const blocked = busy !== null || !ready;
  const format = FORMAT_SLUG[scene.format];
  const video = scene.format !== "carousel" ? videoSupport() : null;

  const still = async (index: number) => {
    const canvas = canvasFor(scene.W, scene.H);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("El navegador no tiene memoria para la imagen: cerrá otras pestañas y probá de nuevo.");
    drawFrame(ctx, scene, scene.duration, index);
    const blob = await toPng(canvas).finally(() => releaseCanvas(canvas));
    return new File([blob], exportName(themeId, format, "png", scene.format === "carousel" ? index : undefined), { type: "image/png" });
  };
  const deliver = async (files: File[], label: string) => {
    setLast(files);
    for (const [i, f] of files.entries()) { saveBlob(f, f.name); if (i < files.length - 1) await new Promise((r) => setTimeout(r, 450)); }
    setStatus(`${label}: ${files.map((f) => f.name).join(", ")}`);
  };
  const run = (key: string, job: () => Promise<void>) => async () => {
    setBusy(key);
    setStatus("");
    // Mientras graba, la vista previa se pausa: el video se dibuja a tiempo real y compite por el mismo procesador.
    if (key === "video") onRecording(true);
    try { await job(); } catch (e) { setStatus(e instanceof Error ? e.message : "No se pudo exportar."); } finally { setBusy(null); onRecording(false); }
  };

  const png = run("png", async () => deliver([await still(slide)], "Imagen lista"));
  const all = run("all", async () => {
    const n = carouselSlides(scene).length;
    const files: File[] = [];
    for (let i = 0; i < n; i++) files.push(await still(i));
    await deliver(files, "Imágenes listas");
  });
  const rec = run("video", async () => {
    const canvas = canvasFor(scene.W, scene.H);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("El navegador no tiene memoria para el video: cerrá otras pestañas y probá de nuevo.");
    try {
      const { blob, ext } = await recordVideo(canvas, (t) => drawFrame(ctx, scene, t), scene.duration, music, (s) => setStatus(`Grabando… ${Math.floor(s)} de ${scene.duration} s`));
      await deliver([new File([blob], exportName(themeId, format, ext), { type: blob.type })], "Video listo");
    } finally { releaseCanvas(canvas); }
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={png} disabled={blocked}><Download size={18} aria-hidden="true" />{scene.format === "carousel" ? "Descargar esta diapositiva" : "Descargar imagen (PNG)"}</Button>
        {scene.format === "carousel" && <Button variant="secondary" onClick={all} disabled={blocked}><Download size={18} aria-hidden="true" />Descargar las {carouselSlides(scene).length}</Button>}
        {scene.format !== "carousel" && (
          <Button variant="dark" onClick={rec} disabled={blocked || !video}><Film size={18} aria-hidden="true" />{busy === "video" ? "Grabando…" : `Grabar video (${scene.duration} s${video ? `, ${video.ext.toUpperCase()}` : ""})`}</Button>
        )}
        {last.length > 0 && canShareFiles(last) && <Button variant="secondary" onClick={() => void shareFiles(last, STUDIO_BRAND.name)}><Share2 size={18} aria-hidden="true" />Compartir</Button>}
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-sm font-semibold text-muted">{!ready && !busy ? "Preparando las imágenes…" : status}</p>
      {scene.format !== "carousel" && !video && <p className="text-xs text-warning">Este navegador no graba video: usá Chrome o Safari actualizados.</p>}
      {busy === "video" && <p className="text-xs text-muted">No cambies de pestaña mientras graba: el navegador pausa la animación y la grabación se cancela.</p>}
    </div>
  );
}
