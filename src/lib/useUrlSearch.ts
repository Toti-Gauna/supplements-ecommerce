"use client";
import { useCallback, useSyncExternalStore } from "react";

/**
 * La consulta de la URL (`?marca=…`) leída en el navegador, para estado que se comparte por link en un export
 * estático: el HTML sale sin filtros y, al hidratar, se aplica lo de la URL (sin `useSearchParams`, que obligaría a
 * dejar la página en blanco hasta hidratar). `replace` cambia la URL sin navegar ni mover el scroll.
 */
const EVENT = "demo:urlsearch";

function subscribe(cb: () => void): () => void {
  window.addEventListener("popstate", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(EVENT, cb);
  };
}

const read = () => window.location.search;
const none = () => "";

export function useUrlSearch(): [string, (query: string) => void] {
  const search = useSyncExternalStore(subscribe, read, none);
  const replace = useCallback((query: string) => {
    const q = query && !query.startsWith("?") ? `?${query}` : query;
    if (q === window.location.search) return;
    window.history.replaceState(null, "", `${window.location.pathname}${q}${window.location.hash}`);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [search, replace];
}
