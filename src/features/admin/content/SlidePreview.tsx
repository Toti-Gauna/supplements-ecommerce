"use client";
import { useEffect, useRef, useState } from "react";
import type { CarouselSlide } from "@/demo/types";
import { HeroSlideBody, heroSlideClass } from "@/features/home/HeroSlide";

/** Ancho que tiene la diapositiva en la tienda con esta pantalla (en celular ocupa todo el ancho; desde 640 px, el contenido). */
const shopWidth = (vw: number) => (vw < 640 ? vw : Math.min(vw, 1280) - 48);

/**
 * Vista previa de la diapositiva elegida (8.3.28): es la misma diapositiva del inicio, dibujada al ancho que tiene en
 * la tienda y achicada para entrar entera (nada se corta, ni en un celular). Muestra el borrador, no lo publica.
 */
export function SlidePreview({ slide, index, caption }: { slide: CarouselSlide; index: number; caption: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ width: 0, scale: 1, height: 0 });
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
  return (
    <figure className="flex flex-col gap-2">
      <div ref={outer} data-slide-preview className="relative overflow-hidden rounded-[1.5rem] bg-night shadow-[var(--shadow-card)]" style={{ height: m.height || undefined }}>
        <div ref={inner} className="origin-top-left sm:[--hero-safe:4.5rem] lg:[--hero-safe:5.5rem]" style={{ width: m.width || "100%", transform: `scale(${m.scale})` }}>
          <div className={heroSlideClass(index)}><HeroSlideBody slide={slide} index={index} /></div>
        </div>
      </div>
      <figcaption className="text-xs font-semibold text-muted">{caption}</figcaption>
    </figure>
  );
}
