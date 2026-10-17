"use client";
import { useMemo, useRef, useState } from "react";
import { RackRow } from "@/components/molecules/RackRow";
import { Sheet } from "@/components/motion/Sheet";
import { bestSellers, getProduct } from "@/demo/engine/catalog";
import { compareSuggestions } from "@/demo/engine/compare";
import type { Product } from "@/demo/types";
import { plural } from "@/lib/plural";
import { SearchField } from "../catalog/search/SearchField";
import { toRackRow, useCatalogSearch } from "../catalog/search/useCatalogSearch";

const ROWS = 8;

interface Props {
  open: boolean;
  /** Producto que se reemplaza (Cambiar) o el primero de la comparación (Sumar): de ahí salen los parecidos. */
  anchor?: string;
  replacing?: string;
  /** Lo que ya está en la comparación (no se ofrece). */
  taken: string[];
  onPick: (slug: string) => void;
  onClose: () => void;
}

/** Selector del comparador: el buscador del rubro y, sin escribir, los parecidos de la misma categoría y lo más elegido. */
export function ComparePicker({ open, anchor, replacing, taken, onPick, onClose }: Props) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const { outcome } = useCatalogSearch(q);
  const typed = q.trim() !== "";
  const list = useMemo(() => {
    const free = (p: Product) => !taken.includes(p.slug);
    if (typed) return outcome.results.map((r) => r.product).filter(free).slice(0, ROWS);
    const base = anchor ? getProduct(anchor) : undefined;
    const near = base ? compareSuggestions(base, ROWS).filter(free) : [];
    const more = bestSellers(ROWS * 2).filter((p) => free(p) && !near.includes(p));
    return [...near, ...more].slice(0, ROWS);
  }, [typed, outcome.results, anchor, taken]);
  const close = () => { setQ(""); onClose(); };
  const title = replacing ? `Cambiar ${getProduct(replacing)?.name ?? "producto"}` : "Sumar a la comparación";
  return (
    <Sheet open={open} onClose={close} title={title} side="dialog" className="flex h-[88dvh] flex-col sm:h-[80dvh]">
      <div className="plate flex h-14 shrink-0 items-center border-b border-line pl-4 pr-16 sm:pl-6">
        <span className="eyebrow truncate text-volt-ink">{title}</span>
      </div>
      <div className="shrink-0 border-b border-line p-4 sm:px-6">
        <SearchField id="compare-picker" inputRef={input} value={q} onValue={setQ} onSubmit={() => input.current?.blur()} data-autofocus />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4 sm:px-6">
        <p role="status" className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-muted">
          {typed ? (list.length ? plural(list.length, "resultado", "resultados") : `No encontramos “${q.trim()}”`) : "Parecidos y lo más elegido"}
        </p>
        <ul className="flex flex-col gap-2">
          {list.map((p) => (
            <li key={p.slug}>
              <button type="button" onClick={() => { close(); onPick(p.slug); }} aria-label={`Elegir ${p.name}`} className="block w-full text-left focus-visible:outline-offset-0">
                <RackRow item={toRackRow(p)} className="hover:border-ink/50" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
