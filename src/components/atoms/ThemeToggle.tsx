"use client";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

export const THEME_KEY = "volta-theme";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

/** Cambia entre modo claro y oscuro (la primera vez, el de la marca). Se recuerda en este navegador. */
export function ThemeToggle({ className, withLabel }: { className?: string; withLabel?: boolean }) {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme === "dark", () => brand.defaultMode === "dark");
  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { window.localStorage.setItem(THEME_KEY, next); } catch { /* modo privado: dura la sesión */ }
  };
  const label = dark ? "Activar modo claro" : "Activar modo oscuro";
  return (
    <button type="button" onClick={toggle} aria-label={label} aria-pressed={dark} title={label}
      className={cn("transition-colors", withLabel ? "inline-flex items-center gap-2" : "grid place-items-center", className)}>
      {dark ? <Sun size={withLabel ? 18 : 20} aria-hidden="true" /> : <Moon size={withLabel ? 18 : 20} aria-hidden="true" />}
      {withLabel && <span>{dark ? "Modo claro" : "Modo oscuro"}</span>}
    </button>
  );
}

/** Se ejecuta en <head> antes de pintar: evita el destello del tema equivocado. */
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t="${brand.defaultMode}"}document.documentElement.dataset.theme=t}catch(e){}`;
