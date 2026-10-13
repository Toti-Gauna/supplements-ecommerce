"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { categoryHref, productsInCategory, visibleCategories } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/plural";
import { useDemoVersion } from "@/stores/admin";

/** Menú desplegable de la tienda (escritorio): categorías ilustradas + acceso por objetivo. */
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
    <div ref={ref} className="relative flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} aria-controls="shop-menu" onClick={() => setOpen((v) => !v)}
        className={cn("flex h-14 items-center gap-1 whitespace-nowrap border-b-2 px-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] transition-colors xl:px-4 xl:tracking-[0.12em]", active || open ? "border-volt-ink text-ink" : "border-transparent text-muted hover:text-ink")}>
        Tienda <ChevronDown size={16} aria-hidden="true" className={cn("transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div id="shop-menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
            className="absolute left-0 top-full z-50 pt-px">
            <div className="grid w-[720px] grid-cols-[1fr_220px] gap-4 rounded-sm border border-line bg-surface p-4 [box-shadow:inset_0_2px_0_var(--season-accent),var(--shadow-lift)]">
              <ul className="grid grid-cols-2 gap-1">
                {cats.map((c) => (
                  <li key={c.slug}>
                    <Link href={categoryHref(c.slug)} onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-sm p-2 hover:bg-accent">
                      <ProductArt art={c.art} label="" showBadge={false} className="h-12 w-12 shrink-0 rounded-sm" />
                      <span className="flex-1"><span className="block font-bold">{c.name}</span><span className="font-mono text-[11px] text-muted">{plural(productsInCategory(c.slug).length, "producto", "productos")}</span></span>
                      <ArrowRight size={16} aria-hidden="true" className="-translate-x-1 text-volt-ink opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/crear/" onClick={() => setOpen(false)} className="flex flex-col justify-between rounded-sm bg-night p-4 text-on-night ring-1 ring-volt/20">
                <span className="eyebrow text-volt">Por objetivo</span>
                <span className="font-display text-2xl leading-tight">Encontrá lo tuyo según tu objetivo</span>
                <span className="flex items-center gap-1 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-volt">Ver objetivos <ArrowRight size={16} aria-hidden="true" /></span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
