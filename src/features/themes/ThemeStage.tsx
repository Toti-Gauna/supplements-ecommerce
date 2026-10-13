"use client";
import { useEffect } from "react";
import { useCurrentTheme } from "./useCurrentTheme";

/**
 * Marca la temática vigente en <html> (`data-season`): con eso cambian solo los acentos de temporada (filos, halos y
 * la cinta del ticker, ver palettes.ts). La tienda no se repinta ni lleva fondos decorativos: el arte de cada fecha
 * vive en su campaña. Al salir de la tienda (al panel) se quita.
 */
export function ThemeStage() {
  const { theme, ready } = useCurrentTheme();
  const id = theme?.id ?? null;
  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    if (id) html.setAttribute("data-season", id);
    else html.removeAttribute("data-season");
  }, [id, ready]);
  useEffect(() => () => document.documentElement.removeAttribute("data-season"), []);
  return null;
}
