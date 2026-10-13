"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Marca su bloque con `data-in` ("0" fuera de pantalla, "1" al entrar) para que el CSS dispare una sola vez el flip de
 * marcador y las luces de stock. Sin JS o con "reducir movimiento" no marca nada: todo se ve en su estado final.
 */
export function InView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.in = "0";
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      el.dataset.in = "1";
      io.disconnect();
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
