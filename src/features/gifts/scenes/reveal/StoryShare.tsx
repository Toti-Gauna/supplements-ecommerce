"use client";
import { Smartphone } from "lucide-react";
import { useRef, useState } from "react";
import { CONTAINERS, FRAME_SCALE, defaultPack, type PackStyle } from "@/components/illustrations/supplements";
import { PackDefs } from "@/components/illustrations/supplements/defs";
import type { ArtKey } from "@/demo/types";
import { sharePng } from "@/lib/share-png";
import { useToasts } from "@/stores/toast";
import { renderGiftStory, type StoryData } from "./story-card";

interface Props extends Omit<StoryData, "art"> {
  code: string;
  art: ArtKey;
  pack?: PackStyle;
  tint?: string;
}

/** SVG del DOM → imagen (data URL del mismo origen: el canvas se puede exportar). */
async function toImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  await img.decode();
  return img;
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/**
 * "Compartí en tu historia": arma la pieza 9:16 en el navegador (estudio neutro, el producto, el mensaje y quién lo
 * manda) y abre la hoja de compartir del celular; si no acepta archivos, descarga el PNG. Nada sale a un servicio.
 * El envase se dibuja aparte (oculto, con sus degradés y solo mientras se arma) para pasarlo a imagen.
 */
export function StoryShare({ code, art, pack, tint = "#8b72ff", ...data }: Props) {
  const [busy, setBusy] = useState(false);
  const toast = useToasts((s) => s.push);
  const svg = useRef<SVGSVGElement>(null);
  const kind = art in CONTAINERS ? (art as keyof typeof CONTAINERS) : "tub";
  const Container = CONTAINERS[kind];
  const share = async () => {
    setBusy(true);
    try {
      await frame();
      await frame();
      const image = svg.current ? await toImage(svg.current).catch(() => null) : null;
      const blob = await renderGiftStory({ ...data, art: image });
      const result = await sharePng(blob, `regalo-${code.toLowerCase()}.png`, `Mi regalo de ${data.from}`);
      if (result === "downloaded") toast({ tone: "success", title: "Historia descargada", description: "Subila a tus historias." });
    } catch {
      toast({ tone: "error", title: "No pudimos armar la historia", description: "Probá de nuevo." });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button type="button" onClick={share} disabled={busy} aria-busy={busy}
        className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-on-night px-6 font-bold text-night hover:bg-white disabled:opacity-70">
        <Smartphone size={18} aria-hidden="true" /> {busy ? "Armando la historia…" : "Compartí en tu historia"}
      </button>
      {busy && (
        <svg ref={svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="760" height="760" aria-hidden="true" focusable="false" className="pointer-events-none fixed left-0 top-0 h-0 w-0 opacity-0">
          <PackDefs />
          <g transform={`translate(200 330) scale(${FRAME_SCALE[kind] ?? 1}) translate(-200 -330)`}><Container pack={pack ?? defaultPack(kind)} tint={tint} /></g>
        </svg>
      )}
    </>
  );
}
