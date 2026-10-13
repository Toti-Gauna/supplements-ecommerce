"use client";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import s from "./arena.module.css";

interface ArenaHeaderProps {
  brandName: string;
  /** Avisos del ticker, en orden de importancia: en el celular se ve el primero. */
  ticker: string[];
}

const NAV = ["Tienda", "Objetivos", "Armá tu stack", "Club"];

/** Ticker ocultable (sin desplazamiento automático) y header de una línea, con la búsqueda a la vista. */
export function ArenaHeader({ brandName, ticker }: ArenaHeaderProps) {
  const [showTicker, setShowTicker] = useState(true);
  const hideTicker = () => setShowTicker(false);
  return (
    <header className="relative z-20">
      {showTicker && (
        <div className="flex h-8 items-center gap-3 border-b border-[var(--a-line)] bg-black px-4 sm:px-8">
          <p className={cn(s.mono, "flex min-w-0 flex-1 items-center gap-3 overflow-hidden whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--a-muted)]")}>
            {ticker.map((t, i) => (
              <span key={t} className={cn("flex items-center gap-3", i === 1 && "hidden sm:flex", i > 1 && "hidden xl:flex")}>
                {i > 0 && <span aria-hidden="true" className="text-[var(--a-plasma-ink)]">/</span>}
                <span className={i === 0 ? "text-[var(--a-volt)]" : undefined}>{t}</span>
              </span>
            ))}
          </p>
          <button type="button" onClick={hideTicker} aria-label="Ocultar avisos" className="grid size-7 place-items-center text-[var(--a-muted)] hover:text-[var(--a-ink)] focus-visible:outline-2 focus-visible:outline-[var(--a-volt)]">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="flex h-16 items-center gap-4 px-4 sm:px-8">
        <a href="#arena-hero" className={cn(s.display, s.wide, "text-[1.7rem] leading-none tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--a-volt)]")}>
          {brandName}<span className="text-[var(--a-volt)]">.</span>
        </a>
        <nav aria-label="Tienda (maqueta)" className="ml-6 hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <a key={n} href="#arena-rack" className="text-[13px] font-extrabold uppercase italic tracking-[0.06em] text-[var(--a-ink)]/85 hover:text-[var(--a-volt)]">{n}</a>
          ))}
        </nav>
        <button type="button" className={cn(s.cut, s.cutSm, s.focusCut, "ml-auto hidden h-10 w-[min(26rem,34vw)] items-center gap-3 bg-[#14141a] px-4 text-left text-sm text-[var(--a-muted)] md:flex")}>
          <Search size={16} aria-hidden="true" className="text-[var(--a-volt)]" />
          <span className="flex-1">Buscá whey, creatina, sin TACC…</span>
          <kbd className={cn(s.mono, "border border-[var(--a-line)] px-1.5 text-[11px]")}>/</kbd>
        </button>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <IconButton label="Buscar" className="md:hidden"><Search size={20} aria-hidden="true" /></IconButton>
          <IconButton label="Mi cuenta" className="hidden sm:grid"><User size={20} aria-hidden="true" /></IconButton>
          <IconButton label="Bolsa, vacía">
            <ShoppingBag size={20} aria-hidden="true" />
            <span aria-hidden="true" className={cn(s.mono, "absolute right-0.5 top-0.5 grid size-4 place-items-center bg-[var(--a-volt)] text-[10px] font-bold text-black")}>0</span>
          </IconButton>
          <IconButton label="Menú" className="lg:hidden"><Menu size={22} aria-hidden="true" /></IconButton>
        </div>
      </div>
    </header>
  );
}

function IconButton({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} className={cn("relative grid size-11 place-items-center text-[var(--a-ink)] hover:text-[var(--a-volt)] focus-visible:outline-2 focus-visible:outline-[var(--a-volt)]", className)}>
      {children}
    </button>
  );
}
