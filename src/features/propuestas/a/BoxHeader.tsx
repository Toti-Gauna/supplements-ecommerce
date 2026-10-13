import { Search, ShoppingBag, User } from "lucide-react";
import { brand } from "@/config/brand";
import { LOGO_VIEWBOX, logoPaths } from "@/config/logo";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";
import s from "./box.module.css";

const NAV = ["Tienda", "Objetivos", "Armá tu stack", "Club"];

/** Símbolo de la marca en una placa de acero atornillada. */
function Mark() {
  const { stroke, bolt } = logoPaths(brand);
  return (
    <span className={cn(s.steel, "grid size-9 place-items-center")}>
      <svg viewBox={LOGO_VIEWBOX} aria-hidden="true" className="size-6">
        {stroke && <path d={stroke} fill="#f2f0ea" />}
        <path d={bolt} fill="#c8ff2e" />
      </svg>
    </span>
  );
}

/**
 * Header de una línea: marca, carriles de navegación, buscador protagonista y bolsa con contador LED.
 * Maqueta: los links no navegan a la tienda real.
 */
export function BoxHeader() {
  return (
    <header className="border-b border-(--bx-steel) bg-(--bx-carbon)/95">
      <div className="mx-auto flex h-14 max-w-[1360px] items-center gap-3 px-4 sm:gap-6 sm:px-8">
        <a href="#a-hero" className={cn("flex shrink-0 items-center gap-2.5", focusRing)} aria-label={`${brand.name}, inicio`}>
          <Mark />
          <span className={cn(s.display, "text-[28px] tracking-[0.04em]")}>{brand.name}</span>
        </a>
        <nav aria-label="Principal" className="hidden h-full lg:block">
          <ul className="flex h-full">
            {NAV.map((n, i) => (
              <li key={n} className="h-full">
                <a href="#a-cards" className={cn("flex h-full items-center border-b-2 px-4 font-mono text-[12px] font-bold uppercase tracking-[0.14em]", i === 0 ? "border-(--bx-volt) text-(--bx-chalk)" : "border-transparent text-(--bx-dim) hover:text-(--bx-chalk)", focusRing)}>
                  {n}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" className={cn("ml-auto flex h-9 min-w-0 items-center gap-2 border border-(--bx-steel) bg-(--bx-rubber) px-3 text-left text-(--bx-dim) sm:w-[min(360px,32vw)] sm:flex-none", focusRing)} aria-label="Buscar productos">
          <Search size={16} aria-hidden="true" className="shrink-0 text-(--bx-chalk)" />
          <span className="hidden truncate font-mono text-[12px] sm:inline">Whey, creatina, sin TACC…</span>
          <kbd className="ml-auto hidden border border-(--bx-steel) px-1.5 font-mono text-[10px] text-(--bx-dim) sm:inline">/</kbd>
        </button>
        <a href="#a-ficha" aria-label="Mi cuenta" className={cn("hidden size-9 place-items-center text-(--bx-chalk) sm:grid", focusRing)}><User size={18} aria-hidden="true" /></a>
        <a href="#a-ficha" aria-label="Bolsa: 0 productos" className={cn("flex h-9 items-center gap-2 bg-(--bx-graphite) px-2.5 text-(--bx-chalk)", focusRing)}>
          <ShoppingBag size={18} aria-hidden="true" />
          <span aria-hidden="true" className="font-mono text-[13px] font-bold tabular-nums text-(--bx-volt)">00</span>
        </a>
      </div>
    </header>
  );
}
