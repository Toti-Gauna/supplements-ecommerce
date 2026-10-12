"use client";
import { useEffect, useRef, useState } from "react";
import { Decor, type DecorKind } from "@/components/illustrations/seasonal/Decor";
import { CONTAINERS, FRAME_SCALE, defaultPack } from "@/components/illustrations/supplements";
import { PackDefs } from "@/components/illustrations/supplements/defs";
import type { StudioProduct } from "@/demo/admin/studio/content";
import type { Img } from "./render/types";

/** Ilustraciones que necesita la pieza: se dibujan en el DOM (oculto) y se pasan a imagen para el canvas. */
export interface AssetRequest {
  products: StudioProduct[];
  particles: DecorKind[];
}

/** `photos`: productos con foto cargada en el panel (van como tarjeta, no como envase). */
export interface StudioAssets { products: Record<string, Img>; photos: Set<string>; particles: Record<string, Img> }

const EMPTY: StudioAssets = { products: {}, photos: new Set(), particles: {} };

/**
 * El envase solo, sin escenario: la misma ilustración de la tienda (librería de suplementos) sobre fondo transparente,
 * en un cuadro de 400 × 400 con el piso en y = 330. El pedestal y la luz los dibuja el canvas.
 */
export function PackShot({ product }: { product: Pick<StudioProduct, "art" | "pack" | "tint"> }) {
  const Container = CONTAINERS[product.art] ?? CONTAINERS.tub;
  const s = FRAME_SCALE[product.art] ?? 1;
  return (
    <svg viewBox="0 0 400 400" width="400" height="400" aria-hidden="true">
      <PackDefs />
      <g transform={`translate(200 330) scale(${s}) translate(-200 -330)`}><Container pack={product.pack ?? defaultPack(product.art)} tint={product.tint ?? "#8b72ff"} /></g>
    </svg>
  );
}

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
  const key = JSON.stringify([req.products.map((p) => [p.slug, p.art, p.tint, Boolean(p.photoDataUrl)]), req.particles]);
  useEffect(() => {
    let alive = true;
    const root = ref.current;
    if (!root) return;
    const pick = (sel: string) => root.querySelector<SVGSVGElement>(`[data-asset="${sel}"] svg`);
    void (async () => {
      const out: StudioAssets = { products: {}, photos: new Set(), particles: {} };
      for (const p of req.products) {
        // La foto cargada en el panel manda; si no abre, vuelve al envase ilustrado.
        const photo = p.photoDataUrl ? await safe(() => loadImage(p.photoDataUrl!)) : null;
        const svg = pick(`p:${p.slug}`);
        const img = photo ?? (svg ? await safe(() => svgToImage(svg, 900, 900)) : null);
        if (img) out.products[p.slug] = img;
        if (photo) out.photos.add(p.slug);
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
      {req.products.map((p) => <div key={p.slug} data-asset={`p:${p.slug}`} className="h-40 w-40"><PackShot product={p} /></div>)}
      {req.particles.map((k) => <div key={k} data-asset={`d:${k}`} className="h-12 w-12"><Decor kind={k} /></div>)}
    </div>
  );
  return { stage, assets, ready: loadedKey === key };
}
