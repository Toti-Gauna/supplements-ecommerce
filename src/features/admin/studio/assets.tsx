"use client";
import { useEffect, useRef, useState } from "react";
import { VoltaPup, type CastId, type PupOutfit } from "@/components/illustrations/characters";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { Decor, type DecorKind } from "@/components/illustrations/seasonal/Decor";
import type { StudioProduct } from "@/demo/admin/studio/content";
import type { Img } from "./render/types";

/** Ilustraciones que necesita la pieza: se dibujan en el DOM (oculto) y se pasan a imagen para el canvas. */
export interface AssetRequest {
  products: StudioProduct[];
  hero: DecorKind | null;
  cast: { who: CastId; outfit?: PupOutfit; flip?: boolean; pup?: boolean }[];
  particles: DecorKind[];
}

export interface StudioAssets { products: Record<string, Img>; hero: Img | null; cast: Img[]; particles: Record<string, Img> }

const EMPTY: StudioAssets = { products: {}, hero: null, cast: [], particles: {} };

/** SVG del DOM → imagen (data URL, mismo origen: el canvas no queda bloqueado para exportar). */
export async function svgToImage(svg: SVGSVGElement, w: number, h: number): Promise<Img> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));
  clone.removeAttribute("class");
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  await img.decode();
  return img;
}

export async function loadImage(src: string): Promise<Img> {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

/** Cada imagen por separado: si una falla queda vacía (o vuelve a la ilustración) y el resto sigue. */
async function safe<T>(job: () => Promise<T>): Promise<T | null> {
  try { return await job(); } catch { return null; }
}

/**
 * Arma las imágenes cada vez que cambia lo pedido. Devuelve el escenario oculto (montarlo), las imágenes y `ready`
 * (las imágenes corresponden a lo pedido: hasta entonces no se exporta).
 */
export function useStudioAssets(req: AssetRequest): { stage: React.ReactNode; assets: StudioAssets; ready: boolean } {
  const ref = useRef<HTMLDivElement>(null);
  const [assets, setAssets] = useState<StudioAssets>(EMPTY);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const key = JSON.stringify([req.products.map((p) => [p.slug, p.tint, Boolean(p.photoDataUrl)]), req.hero, req.cast, req.particles]);
  useEffect(() => {
    let alive = true;
    const root = ref.current;
    if (!root) return;
    const pick = (sel: string) => root.querySelector<SVGSVGElement>(`[data-asset="${sel}"] svg`);
    void (async () => {
      const out: StudioAssets = { products: {}, hero: null, cast: [], particles: {} };
      for (const p of req.products) {
        const svg = pick(`p:${p.slug}`);
        // La foto cargada en el panel manda; si no abre, vuelve a la ilustración.
        const img = (p.photoDataUrl ? await safe(() => loadImage(p.photoDataUrl!)) : null) ?? (svg ? await safe(() => svgToImage(svg, 900, 900)) : null);
        if (img) out.products[p.slug] = img;
      }
      const hero = req.hero ? pick("hero") : null;
      if (hero) out.hero = await safe(() => svgToImage(hero, 480, 480));
      for (let i = 0; i < req.cast.length; i++) {
        const svg = pick(`cast:${i}`);
        const img = svg ? await safe(() => svgToImage(svg, 520, 400)) : null;
        if (img) out.cast.push(img);
      }
      for (const kind of req.particles) {
        const svg = pick(`d:${kind}`);
        const img = svg ? await safe(() => svgToImage(svg, 96, 96)) : null;
        if (img) out.particles[kind] = img;
      }
      if (alive) { setAssets(out); setLoadedKey(key); }
    })();
    return () => { alive = false; };
    // `key` resume `req`: se rearma solo cuando cambia lo que se dibuja.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const stage = (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden">
      {req.products.map((p) => <div key={p.slug} data-asset={`p:${p.slug}`} className="h-40 w-40"><ProductArt art={p.art} pack={p.pack} tint={p.tint} label={p.name} showBadge={false} /></div>)}
      {req.hero && <div data-asset="hero" className="h-24 w-24"><Decor kind={req.hero} /></div>}
      {req.cast.map((c, i) => <div key={i} data-asset={`cast:${i}`} className="w-32"><VoltaPup who={c.who} pose="stand" outfit={c.outfit} flip={c.flip} pup={c.pup} /></div>)}
      {req.particles.map((k) => <div key={k} data-asset={`d:${k}`} className="h-12 w-12"><Decor kind={k} /></div>)}
    </div>
  );
  return { stage, assets, ready: loadedKey === key };
}
