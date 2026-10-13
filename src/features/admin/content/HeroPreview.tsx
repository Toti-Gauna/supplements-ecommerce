"use client";
import { useEffect, useRef, useState } from "react";
import { getProduct } from "@/demo/engine/catalog";
import { rackFacts } from "@/demo/engine/rack";
import type { HeroFeature } from "@/demo/types";
import { HeroStage } from "@/features/home/HeroStage";
import { useHeroCadete } from "@/features/home/useHeroCadete";

/** Ancho que tiene el hero en la tienda con esta pantalla (en celular, todo el ancho; desde 640 px, el contenido). */
const shopWidth = (vw: number) => (vw < 640 ? vw : Math.min(vw, 1280));

/**
 * Vista previa del destacado elegido: es el mismo hero del inicio (rack, titular y marcador), dibujado al ancho que
 * tiene en la tienda y achicado para entrar entero. Muestra el borrador, no lo publica; no se puede tocar.
 */
export function HeroPreview({ feature, caption }: { feature: HeroFeature; caption: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ width: 0, scale: 1, height: 0 });
  const cadete = useHeroCadete();
  useEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const update = () => {
      const width = shopWidth(window.innerWidth);
      const scale = Math.min(1, o.clientWidth / width);
      setM((prev) => (prev.width === width && prev.scale === scale && prev.height === i.offsetHeight * scale ? prev : { width, scale, height: i.offsetHeight * scale }));
    };
    const ro = new ResizeObserver(update);
    ro.observe(o); ro.observe(i);
    update();
    return () => ro.disconnect();
  }, []);
  const product = getProduct(feature.productSlug);
  return (
    <figure className="flex flex-col gap-2">
      <div ref={outer} data-hero-preview className="relative overflow-hidden rounded-sm border border-line" style={{ height: m.height || undefined }}>
        <div ref={inner} inert className="origin-top-left" style={{ width: m.width || "100%", transform: `scale(${m.scale})` }}>
          {product
            ? <HeroStage pick={{ key: feature.id, kind: "featured", product, headline: feature.headline || "Sin titular", pitch: feature.pitch }} facts={rackFacts(product)}
                cadete={cadete} motion="none" headingLevel="p" />
            : <p className="p-8 text-muted">Elegí un producto para ver el hero.</p>}
        </div>
      </div>
      <figcaption className="text-xs font-semibold text-muted">{caption}</figcaption>
    </figure>
  );
}
