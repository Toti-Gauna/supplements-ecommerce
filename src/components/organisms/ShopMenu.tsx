"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { categoryHref, productsInCategory, visibleCategories } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { useDemoVersion } from "@/stores/admin";

/** Menú desplegable de la tienda (escritorio): categorías ilustradas + acceso al personalizador. */
export function ShopMenu({ active }: { active: boolean }) {
  useDemoVersion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open]);
  const cats = visibleCategories();
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} aria-controls="shop-menu" onClick={() => setOpen((v) => !v)}
        className={cn("flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors hover:text-primary", active || open ? "text-primary" : "text-ink/80")}>
        Tienda <ChevronDown size={16} aria-hidden="true" className={cn("transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div id="shop-menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
            className="absolute left-0 top-full z-50 pt-3">
            <div className="grid w-[720px] grid-cols-[1fr_220px] gap-4 rounded-[1.75rem] border border-line bg-surface p-4 shadow-[var(--shadow-lift)]">
              <ul className="grid grid-cols-2 gap-1">
                {cats.map((c) => (
                  <li key={c.slug}>
                    <Link href={categoryHref(c.slug)} onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-2xl p-2 hover:bg-accent/50">
                      <ProductArt art={c.art} label="" showBadge={false} className="h-12 w-12 shrink-0 rounded-xl" />
                      <span className="flex-1"><span className="block font-bold">{c.name}</span><span className="text-xs text-muted">{productsInCategory(c.slug).length} productos</span></span>
                      <ArrowRight size={16} aria-hidden="true" className="-translate-x-1 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/crear/" onClick={() => setOpen(false)} className="flex flex-col justify-between rounded-2xl bg-night p-4 text-[#f6f1e8]">
                <span className="eyebrow text-brass">Personalizador</span>
                <span className="font-display text-2xl leading-tight">Mirá tu pieza antes de pagar</span>
                <span className="flex items-center gap-1 text-sm font-bold">Crear la mía <ArrowRight size={16} aria-hidden="true" /></span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
