"use client";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

interface SearchFormProps {
  initial?: string;
  /** Modo controlado (búsqueda en vivo). */
  value?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onSearch?: (q: string) => void;
}

export function SearchForm({ initial = "", value, compact, autoFocus, onSearch }: SearchFormProps) {
  const router = useRouter();
  const id = useId();
  const [internal, setInternal] = useState(initial);
  const q = value ?? internal;
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSearch) onSearch(q);
        else router.push(`/buscar/?q=${encodeURIComponent(q.trim())}`);
      }}
      className="relative"
    >
      <label htmlFor={id} className="sr-only">Buscar productos</label>
      <input
        id={id}
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => {
          setInternal(e.target.value);
          onSearch?.(e.target.value);
        }}
        placeholder="Buscar: comedero, lámpara, nfc…"
        className={cn("w-full rounded-full border border-line bg-bg pl-11 pr-4 text-base focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", compact ? "h-10" : "h-12")}
      />
      <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
    </form>
  );
}
