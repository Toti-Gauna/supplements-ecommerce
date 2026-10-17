"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useHydrated } from "@/stores/hydration";

/**
 * Lee `?objetivo=` (uno o varios), `?deporte=` y `?stack=` una sola vez, con los datos de la demo ya recuperados (el
 * panel puede haber cambiado el catálogo). Va dentro de su propio `<Suspense>`: el resto del armador se exporta completo en el HTML estático.
 */
export function StackUrlLoader({ onLoad }: { onLoad: (params: URLSearchParams) => void }) {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const done = useRef(false);
  useEffect(() => {
    if (!hydrated || done.current) return;
    done.current = true;
    onLoad(new URLSearchParams(params.toString()));
  }, [hydrated, params, onLoad]);
  return null;
}
