"use client";
import { useState } from "react";

/**
 * Volver a una lista con sus filtros y página (8.3.5, 8.3.12). Cada tabla anota su URL actual por sección en
 * `sessionStorage` (pestaña actual); la ficha arma su "Volver" con eso. Si no hay nada anotado, vuelve a la lista limpia.
 */
const key = (listPath: string) => `volta-ui:list:${listPath.replace(/\/$/, "")}`;

export function rememberList(listPath: string, search: string) {
  try { sessionStorage.setItem(key(listPath), search); } catch { /* sin almacenamiento: "Volver" lleva a la lista limpia */ }
}

export function useBackHref(listPath: string): string {
  const [href] = useState(() => {
    try { const s = sessionStorage.getItem(key(listPath)); return s ? `${listPath}?${s}` : listPath; } catch { return listPath; }
  });
  return href;
}
