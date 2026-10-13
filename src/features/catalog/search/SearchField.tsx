"use client";
import { Search, X } from "lucide-react";
import type { ComponentProps, RefObject } from "react";
import { cn } from "@/lib/cn";

interface SearchFieldProps extends Omit<ComponentProps<"input">, "value" | "onChange" | "size" | "ref"> {
  value: string;
  onValue: (q: string) => void;
  onSubmit: () => void;
  /** Para devolverle el foco al campo (al vaciarlo, al tocar un filtro). */
  inputRef: RefObject<HTMLInputElement | null>;
  /** "hero": el campo grande del buscador superpuesto; "page": el de /buscar. */
  size?: "hero" | "page";
  className?: string;
}

/**
 * Campo de búsqueda del box: placa grande, lupa, el texto en display y la cruz para vaciarlo. El `<form role=search>`
 * hace que Enter en el celular ("Buscar" del teclado) funcione igual que en el escritorio.
 */
export function SearchField({ value, onValue, onSubmit, inputRef, size = "page", className, id = "buscar", ...input }: SearchFieldProps) {
  const hero = size === "hero";
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">Buscar productos</label>
      <Search size={hero ? 24 : 20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-volt-ink" />
      <input ref={inputRef} id={id} type="search" value={value} onChange={(e) => onValue(e.target.value)} autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="search"
        placeholder="Proteína, creatina, sin TACC…" {...input}
        className={cn(
          "bevel w-full rounded-sm border-2 border-line bg-surface pr-14 font-display tracking-wide text-ink outline-none transition-colors placeholder:text-muted focus:border-primary [&::-webkit-search-cancel-button]:hidden",
          hero ? "h-16 pl-14 text-[26px] sm:h-[72px] sm:text-[32px]" : "h-14 pl-12 text-2xl",
        )} />
      {value && (
        <button type="button" onClick={() => { onValue(""); inputRef.current?.focus(); }} aria-label="Borrar búsqueda"
          className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xs text-muted hover:bg-accent hover:text-ink">
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
