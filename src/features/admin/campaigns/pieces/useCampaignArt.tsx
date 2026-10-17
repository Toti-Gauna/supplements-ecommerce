"use client";
import { useEffect, useRef, useState } from "react";
import { CampaignArt } from "@/components/illustrations/campaigns";
import type { SeasonId } from "@/demo/types";
import { svgToImage } from "../../studio/assets";
import type { Img } from "../../studio/render/types";

/**
 * El key visual de la campaña (SVG 4:5) como imagen para el canvas: se dibuja oculto en el DOM, se pasa a imagen y se
 * esperan las fuentes de la marca. `ready` dice que lo cargado corresponde a esta campaña (antes no se descarga).
 */
export function useCampaignArt(id: SeasonId): { stage: React.ReactNode; art: Img | null; ready: boolean } {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<{ id: SeasonId; art: Img | null } | null>(null);
  useEffect(() => {
    let alive = true;
    const svg = ref.current?.querySelector<SVGSVGElement>("svg");
    void (async () => {
      await document.fonts?.ready.catch(() => undefined);
      let art: Img | null = null;
      try { art = svg ? await svgToImage(svg, 800, 1000) : null; } catch { art = null; }
      if (alive) setLoaded({ id, art });
    })();
    return () => { alive = false; };
  }, [id]);
  const stage = (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden">
      <CampaignArt key={id} id={id} className="h-[250px] w-[200px]" />
    </div>
  );
  const ready = loaded?.id === id;
  return { stage, art: ready ? loaded!.art : null, ready };
}
