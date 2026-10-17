"use client";
import { useEffect, useMemo } from "react";
import { compareHref, parseCompareParam } from "@/demo/engine/compare";
import { useUrlSearch } from "@/lib/useUrlSearch";
import { useDemoVersion } from "@/stores/admin";
import { useCompare } from "@/stores/compare";
import { useHydrated } from "@/stores/hydration";

/** Bandeja del comparador ya rehidratada, solo con productos que siguen existiendo, y el link a /comparar/. */
export function useCompareTray(): { slugs: string[]; href: string; ready: boolean } {
  const hydrated = useHydrated();
  const stored = useCompare((s) => s.slugs);
  const data = useDemoVersion();
  const slugs = useMemo(() => (hydrated ? stored.filter((s) => data.products.some((p) => p.slug === s)) : []), [hydrated, stored, data.products]);
  return { slugs, href: compareHref(slugs), ready: hydrated };
}

/**
 * Lo que se compara en /comparar/: `?p=` manda (un link compartido abre esa comparación y pasa a ser la bandeja); sin
 * `?p=`, la bandeja, y se escribe en la URL para poder compartirla. `update` cambia las dos cosas juntas.
 */
export function useComparedSlugs(): { slugs: string[]; ready: boolean; update: (slugs: string[]) => void } {
  const [search, replace] = useUrlSearch();
  const data = useDemoVersion();
  const setTray = useCompare((s) => s.set);
  const tray = useCompareTray();
  const fromUrl = useMemo(
    () => parseCompareParam(new URLSearchParams(search).get("p"), (slug) => data.products.some((p) => p.slug === slug)),
    [search, data.products],
  );
  const slugs = fromUrl.length ? fromUrl : tray.slugs;
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
  return { slugs, ready: tray.ready, update };
}
