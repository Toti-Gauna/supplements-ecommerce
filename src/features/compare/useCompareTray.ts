"use client";
import { useEffect, useMemo } from "react";
import { compareHref, parseCompareParam, sameTypeOnly } from "@/demo/engine/compare-tray";
import { useUrlSearch } from "@/lib/useUrlSearch";
import { useDemoVersion } from "@/stores/admin";
import { categoryOfProduct, useCompare } from "@/stores/compare";
import { useHydrated } from "@/stores/hydration";

/** Bandeja del comparador ya rehidratada, solo con productos que siguen existiendo y del mismo tipo, y el link a /comparar/. */
export function useCompareTray(): { slugs: string[]; href: string; ready: boolean } {
  const hydrated = useHydrated();
  const stored = useCompare((s) => s.slugs);
  const data = useDemoVersion();
  // `data` cambia cuando el panel edita el catálogo (un producto que se borra o cambia de categoría).
  const slugs = useMemo(() => (hydrated && data ? sameTypeOnly(stored, categoryOfProduct) : []), [hydrated, stored, data]);
  return { slugs, href: compareHref(slugs), ready: hydrated };
}

/**
 * Lo que se compara en /comparar/: `?p=` manda (un link compartido abre esa comparación y pasa a ser la bandeja); sin
 * `?p=`, la bandeja, y se escribe en la URL para poder compartirla. `update` cambia las dos cosas juntas. `mixed`: el
 * link mezclaba tipos y quedaron solo los del tipo del primero.
 */
export function useComparedSlugs(): { slugs: string[]; mixed: boolean; ready: boolean; update: (slugs: string[]) => void } {
  const [search, replace] = useUrlSearch();
  const data = useDemoVersion();
  const setTray = useCompare((s) => s.set);
  const tray = useCompareTray();
  const fromUrl = useMemo(() => (data ? parseCompareParam(new URLSearchParams(search).get("p"), categoryOfProduct) : null), [search, data]);
  const slugs = fromUrl?.slugs.length ? fromUrl.slugs : tray.slugs;
  const key = slugs.join(",");
  useEffect(() => {
    if (!tray.ready) return;
    // Se lee la URL de nuevo: al llegar con un link de la tienda, el primer render todavía ve la URL anterior.
    const fresh = new URLSearchParams(window.location.search).get("p");
    if (fresh) {
      if (key !== tray.slugs.join(",")) setTray(key ? key.split(",") : []);
    } else if (tray.slugs.length) replace(`?p=${tray.slugs.join(",")}`);
  }, [tray.ready, key, tray.slugs, setTray, replace]);
  const update = (next: string[]) => {
    setTray(next);
    replace(next.length ? `?p=${next.join(",")}` : "");
  };
  return { slugs, mixed: !!fromUrl?.mixed, ready: tray.ready, update };
}
