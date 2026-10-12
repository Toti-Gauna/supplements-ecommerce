"use client";
import { useEffect, useRef, useState } from "react";

export interface ScrollEdges {
  /** Hay contenido escondido arriba. */
  above: boolean;
  /** Hay contenido escondido abajo. */
  below: boolean;
}

/** Si un contenedor con scroll vertical tiene más contenido arriba o abajo, para mostrar una sombra que lo avise. */
export function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState<ScrollEdges>({ above: false, below: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const above = el.scrollTop > 2;
      const below = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
      setEdges((e) => (e.above === above && e.below === below ? e : { above, below }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    // También los hijos: los contadores llegan después de rehidratar y pueden cambiar el alto sin cambiar el contenedor.
    for (const node of [el, ...el.children]) ro.observe(node);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, []);
  return [ref, edges] as const;
}
