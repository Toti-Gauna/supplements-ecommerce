import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { LogoMark } from "@/components/atoms/Logo";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { storeTerms } from "./data";
import s from "./lab.module.css";

const NAV = ["Tienda", "Objetivos", "Armá tu stack", "Club", "Ayuda"];

/** Ticker de una línea (fijo, sin rotar): aviso de demo, cadete y condiciones. Se puede ocultar. */
function Ticker({ dispatch }: { dispatch: string }) {
  const items = [
    { k: "Demo", v: "precios y stock de muestra" },
    { k: "Cadete MdP", v: `sale ${dispatch}` },
    { k: "Transferencia", v: `−${storeTerms.transferPct} %`, wide: true },
    { k: "Envío gratis", v: `desde ${formatARS(storeTerms.freeShippingFrom)}`, wide: true },
  ];
  return (
    <div className={cn(s.night, "flex h-9 items-center gap-4 px-4 sm:px-8")}>
      <ul className={cn(s.mono, "flex min-w-0 flex-1 items-center gap-5 overflow-hidden text-[11.5px]")}>
        {items.map((i) => (
          <li key={i.k} className={cn("shrink-0 items-center gap-2", i.wide ? "hidden md:flex" : "flex")}>
            <span className="h-1.5 w-1.5 bg-(--volt)" aria-hidden="true" />
            <span className="font-bold uppercase tracking-[0.1em] text-(--volt)">{i.k}</span>
            <span className={cn("text-(--on-night)", i.k === "Demo" && "hidden sm:inline")}>{i.v}</span>
          </li>
        ))}
      </ul>
      <button type="button" aria-label="Ocultar avisos" className="grid h-7 w-7 shrink-0 place-items-center text-(--night-muted) hover:text-(--on-night)">
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Header de una línea: marca como rótulo, navegación, búsqueda protagonista y la bolsa con su total. */
export function LabHeader({ dispatch }: { dispatch: string }) {
  return (
    <header>
      <Ticker dispatch={dispatch} />
      <div className="flex h-16 items-center gap-3 border-b border-(--ink) bg-(--paper) px-4 sm:gap-6 sm:px-8">
        <button type="button" aria-label="Menú" className="-ml-1 grid h-10 w-10 place-items-center lg:hidden"><Menu size={20} aria-hidden="true" /></button>
        <a href="#b-inicio" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center bg-(--ink)"><LogoMark className="h-6 w-6 text-(--paper)" /></span>
          <span className="flex flex-col leading-none">
            <span className="text-[19px] font-bold uppercase tracking-[0.08em]">{brand.name}</span>
            <span className={cn(s.tag, "mt-1 hidden text-[8.5px] text-(--ink-2) sm:block")}>Nutrición · {brand.city}</span>
          </span>
        </a>
        <nav aria-label="Principal" className="ml-4 hidden lg:block">
          <ul className="flex gap-6 text-[14.5px] font-medium">
            {NAV.map((n) => <li key={n}><a href="#b-inicio" className="underline-offset-[6px] hover:underline">{n}</a></li>)}
          </ul>
        </nav>
        <button type="button" className="ml-auto hidden h-10 w-full max-w-[340px] items-center gap-2.5 border border-(--ink) bg-(--card) px-3 text-left md:flex">
          <Search size={16} aria-hidden="true" />
          <span className={cn(s.mono, "flex-1 truncate text-[12.5px] text-(--ink-2)")}>whey, creatina, sin TACC…</span>
          <kbd className={cn(s.mono, "border border-(--rule-2) px-1.5 text-[11px] text-(--ink-2)")}>/</kbd>
          <span className="sr-only">Buscar productos</span>
        </button>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button type="button" aria-label="Buscar" className="grid h-10 w-10 place-items-center md:hidden"><Search size={19} aria-hidden="true" /></button>
          <button type="button" aria-label="Mi cuenta" className="hidden h-10 w-10 place-items-center sm:grid"><User size={19} aria-hidden="true" /></button>
          <button type="button" aria-label="Bolsa: vacía" className="flex h-10 items-center gap-2 border border-(--ink) px-2.5">
            <ShoppingBag size={17} aria-hidden="true" />
            <span className={cn(s.mono, "text-[12.5px] font-semibold")}>0</span>
          </button>
        </div>
      </div>
    </header>
  );
}
