"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, Search, UserRound, type LucideIcon } from "lucide-react";
import { TabIndicator } from "@/components/atoms/TabIndicator";
import { cn } from "@/lib/cn";
import { useUi } from "@/stores/ui";
import { bottomBarFor, DOCK } from "./bottomBars";
import { playSound } from "@/lib/sound";

type Tab = { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean };

const LEFT: Tab[] = [
  { href: "/", label: "Inicio", icon: Home, match: (p) => p === "/" },
  { href: "/categorias/", label: "Tienda", icon: LayoutGrid, match: (p) => p.startsWith("/categorias") || p.startsWith("/c/") },
];
const RIGHT: Tab[] = [
  { href: "/favoritos/", label: "Mi rack", icon: Heart, match: (p) => p.startsWith("/favoritos") },
  { href: "/cuenta/", label: "Mi cuenta", icon: UserRound, match: (p) => p.startsWith("/cuenta") },
];
const SLOTS = [...LEFT, null, ...RIGHT];
const ITEM = "relative flex flex-1 flex-col items-center justify-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors";

function TabLink({ tab, pathname }: { tab: Tab; pathname: string }) {
  const active = tab.match(pathname);
  const Icon = tab.icon;
  return (
    <li className="flex flex-1">
      <Link href={tab.href} aria-current={active ? "page" : undefined} onClick={() => { if (!active) playSound("nav"); }} className={cn(ITEM, active ? "text-ink" : "text-muted")}>
        <Icon size={20} aria-hidden="true" strokeWidth={active ? 2.4 : 2} />
        <span>{tab.label}</span>
      </Link>
    </li>
  );
}

/**
 * Dock de la tienda en el celular: placa recta con Buscar al centro (la tecla encendida). Flota apenas separada del
 * borde (Safari de iPhone no dibuja nada fijo detrás de su barra) y el pie le deja su lugar (`DOCK`). No aparece donde
 * hay una barra de compra propia.
 */
export function ShopBottomNav() {
  const pathname = usePathname();
  const setSearch = useUi((s) => s.setSearch);
  if (bottomBarFor(pathname) !== "nav") return null;
  const current = SLOTS.findIndex((t) => t?.match(pathname));
  return (
    <nav aria-label="Navegación inferior" data-shop-bottomnav className={cn(DOCK, "z-40 lg:hidden")}>
      <TabIndicator index={current} count={SLOTS.length} className="inset-x-1">
        <span className="absolute inset-x-3 top-0 h-[3px] bg-volt-ink" />
      </TabIndicator>
      <ul className="flex h-16 px-1">
        {LEFT.map((t) => <TabLink key={t.href} tab={t} pathname={pathname} />)}
        <li className="flex flex-1 items-center justify-center">
          <button type="button" onClick={() => setSearch(true)} className={cn(ITEM, "text-ink")}>
            <span aria-hidden="true" className="grid h-9 w-11 place-items-center rounded-xs bg-primary text-on-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-3px_0_rgb(0_0_0/0.28)]">
              <Search size={19} strokeWidth={2.4} />
            </span>
            <span>Buscar</span>
          </button>
        </li>
        {RIGHT.map((t) => <TabLink key={t.href} tab={t} pathname={pathname} />)}
      </ul>
    </nav>
  );
}
