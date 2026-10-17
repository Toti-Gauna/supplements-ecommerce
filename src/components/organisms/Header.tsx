"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/stores/hydration";
import { useUi } from "@/stores/ui";
import { Logo } from "@/components/atoms/Logo";
import { SoundToggle } from "@/components/atoms/SoundToggle";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { CompareNavLink } from "@/features/compare/CompareNavLink";
import { MobileMenu } from "./MobileMenu";
import { ShopMenu } from "./ShopMenu";
import { brand } from "@/config/brand";
import { useBagJiggle } from "./useBagJiggle";
import { useSearchShortcut } from "./useSearchShortcut";

export const NAV = [
  { href: "/categorias/", label: "Tienda" },
  { href: "/packs/", label: "Packs" },
  { href: "/crear/", label: "Armá tu stack" },
  { href: "/club/", label: brand.club },
  { href: "/club/juego/", label: "Shaker Rush" },
  { href: "/preguntas/", label: "Ayuda" },
];

const ICON = "grid h-10 w-10 place-items-center rounded-sm text-ink transition-colors hover:bg-accent";
const TAB = "flex h-14 items-center whitespace-nowrap border-b-2 px-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] transition-colors xl:px-4 xl:tracking-[0.12em]";

/**
 * Header de una línea: marca, carriles de navegación, el buscador a la vista (abre el buscador superpuesto; "/" desde
 * el teclado) y la bolsa con su contador. Sticky; la cinta de avisos va arriba y se va con el scroll.
 */
export function Header() {
  const pathname = usePathname();
  // El link más específico que coincide es el actual (en /club/juego/ es Shaker Rush, no el club).
  const current = NAV.filter((n) => pathname.startsWith(n.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const hydrated = useHydrated();
  const units = useCart((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const { openCart, setMenu, setSearch, cartOpen } = useUi();
  const [stuck, setStuck] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useSearchShortcut(() => setSearch(true));
  useEffect(() => {
    let frame = 0;
    // Pegado arriba: recién ahí su fondo se extiende hacia la franja de la hora (antes taparía la cinta de avisos).
    const measure = () => { frame = 0; const el = ref.current; if (el) setStuck(el.getBoundingClientRect().top <= parseFloat(getComputedStyle(el).top) + 0.5); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); };
  }, []);
  const count = hydrated ? units : 0;
  const jiggle = useBagJiggle(count, hydrated, cartOpen);
  return (
    <header ref={ref} data-shop-header className={cn(stuck && "max-lg:bleed-top", "sticky top-[env(safe-area-inset-top)] z-40 border-b border-line bg-bg")}>
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-3 sm:gap-2 sm:px-6">
        <button type="button" onClick={() => setMenu(true)} aria-label="Abrir menú" className={cn(ICON, "lg:hidden")}><Menu size={22} aria-hidden="true" /></button>
        <Link href="/" aria-label={`${brand.name}, ir al inicio`} className="shrink-0"><Logo /></Link>
        <nav aria-label="Principal" className="ml-3 hidden self-stretch lg:flex xl:ml-8">
          {NAV.map((n) => n.href === "/categorias/" ? <ShopMenu key={n.href} active={/^\/(c|p|categorias)\//.test(pathname)} /> : (
            <Link key={n.href} href={n.href} aria-current={current === n.href ? "page" : undefined}
              className={cn(TAB, current === n.href ? "border-volt-ink text-ink" : "border-transparent text-muted hover:text-ink")}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={() => setSearch(true)} aria-label="Buscar productos" aria-keyshortcuts="/"
          className="ml-auto hidden h-10 min-w-0 items-center gap-2 rounded-sm border border-line bg-surface px-3 text-left text-muted shadow-[inset_0_2px_0_rgb(0_0_0/0.12)] transition-colors hover:border-ink/40 sm:flex sm:w-[min(340px,34vw)] lg:w-32 xl:w-[min(300px,22vw)]">
          <Search size={16} aria-hidden="true" className="shrink-0 text-ink" />
          <span className="truncate font-mono text-[12px] lg:max-xl:hidden">Whey, creatina, sin TACC…</span>
          <span className="hidden font-mono text-[12px] uppercase tracking-[0.08em] lg:max-xl:inline">Buscar</span>
          <kbd className="ml-auto border border-line px-1.5 font-mono text-[10px] text-muted lg:max-xl:hidden">/</kbd>
        </button>
        <div className="ml-auto flex items-center gap-0.5 sm:ml-1">
          <button type="button" onClick={() => setSearch(true)} aria-label="Buscar productos" className={cn(ICON, "sm:hidden")}><Search size={20} aria-hidden="true" /></button>
          <SoundToggle className={ICON} />
          <ThemeToggle className={cn(ICON, "max-sm:hidden")} />
          <CompareNavLink variant="icon" className={cn(ICON, "max-sm:hidden")} />
          <Link href="/favoritos/" aria-label="Mi rack" className={cn(ICON, "max-lg:hidden")}><Heart size={20} aria-hidden="true" /></Link>
          <Link href="/cuenta/" aria-label="Mi cuenta" className={cn(ICON, "max-sm:hidden")}><UserRound size={20} aria-hidden="true" /></Link>
          <button type="button" onClick={() => openCart()} aria-label={`Carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
            className="bevel ml-1 flex h-10 items-center gap-2 rounded-sm bg-accent px-2.5 text-ink transition-colors hover:bg-accent/70">
            <ShoppingBag key={`bag-${jiggle}`} size={19} aria-hidden="true" className={jiggle ? "animate-bag" : undefined} />
            <span key={`badge-${jiggle}`} aria-hidden="true" className={cn("font-mono text-[13px] font-bold tabular-nums", count > 0 ? "animate-pop text-volt-ink" : "text-muted")}>{String(count).padStart(2, "0")}</span>
          </button>
        </div>
      </div>
      <MobileMenu />
    </header>
  );
}
