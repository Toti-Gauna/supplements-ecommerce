"use client";
import { Search } from "lucide-react";
import { useUi } from "@/stores/ui";

/**
 * Campo de búsqueda a la vista que abre el buscador del rubro (el mismo superpuesto del header y del dock, R1): una
 * sola búsqueda en toda la tienda, con sus chips, filas de rack y teclado.
 */
export function SearchTrigger() {
  const setSearch = useUi((s) => s.setSearch);
  return (
    <button type="button" onClick={() => setSearch(true)} aria-label="Buscar productos" aria-haspopup="dialog" aria-keyshortcuts="/"
      className="plate flex h-14 w-full items-center gap-3 border border-line px-4 text-left shadow-[inset_0_2px_0_rgb(0_0_0/0.12)] transition-colors hover:border-ink/40">
      <Search size={20} aria-hidden="true" className="shrink-0 text-volt-ink" />
      <span className="min-w-0 flex-1 truncate text-[15px] text-muted">Buscá: whey, creatina, sin TACC, chocolate…</span>
      <kbd aria-hidden="true" className="hidden border border-line px-1.5 font-mono text-[11px] text-muted sm:inline">/</kbd>
    </button>
  );
}
