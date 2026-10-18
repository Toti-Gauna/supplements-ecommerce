"use client";
import { Search, X } from "lucide-react";
import { inputClass } from "@/components/atoms/Field";
import { cn } from "@/lib/cn";

interface SearchFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** La etiqueta solo para lectores de pantalla (cuando el título de la pantalla ya lo dice). */
  hideLabel?: boolean;
  className?: string;
}

/**
 * Buscador grande del mostrador (pensado para el dedo): lupa, texto grande y un botón para borrar. Enter no envía el
 * formulario que lo contenga (en el pedido por chat, buscar no es cargar el pedido).
 */
export function SearchField({ id, label, value, onChange, placeholder, hideLabel = false, className }: SearchFieldProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "eyebrow text-muted"}>{label}</label>
      <div className="relative">
        <Search size={22} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" enterKeyHint="search" placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
          className={cn(inputClass, "h-14 pl-12 pr-12 text-lg font-semibold [&::-webkit-search-cancel-button]:hidden")} />
        {value && (
          <button type="button" onClick={() => onChange("")} aria-label="Borrar la búsqueda" className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-sm text-muted hover:bg-accent hover:text-ink">
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
