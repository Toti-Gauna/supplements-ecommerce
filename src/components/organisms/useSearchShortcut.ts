"use client";
import { useEffect, useRef } from "react";

/** "/" abre el buscador desde cualquier lugar de la tienda, salvo mientras se escribe en un campo. */
export function useSearchShortcut(open: () => void): void {
  const ref = useRef(open);
  useEffect(() => { ref.current = open; }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
      e.preventDefault();
      ref.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
