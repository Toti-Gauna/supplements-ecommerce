"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Heart, Home, LayoutGrid, TicketPercent, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { bottomBarFor } from "./bottomBars";
import { playSound } from "@/lib/sound";

const TABS = [
  { href: "/", label: "Inicio", icon: Home, match: (p: string) => p === "/" },
  { href: "/categorias/", label: "Categorías", icon: LayoutGrid, match: (p: string) => p.startsWith("/categorias") || p.startsWith("/c/") },
  { href: "/favoritos/", label: "Favoritos", icon: Heart, match: (p: string) => p.startsWith("/favoritos") },
  { href: "/cupones/", label: "Cupones", icon: TicketPercent, match: (p: string) => p.startsWith("/cupones") },
  { href: "/cuenta/", label: "Mi cuenta", icon: UserRound, match: (p: string) => p.startsWith("/cuenta") },
];

/** Barra inferior de la tienda en el celular: cápsula flotante de vidrio (pedido de Ignacio). No aparece donde hay una barra de compra propia. */
export function ShopBottomNav() {
  const pathname = usePathname();
  if (bottomBarFor(pathname) !== "nav") return null;
  return (
    <nav aria-label="Navegación inferior" data-shop-bottomnav
      className="fixed inset-x-3 bottom-[calc(0.625rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-[1.75rem] border border-white/25 bg-surface/70 shadow-[0_18px_40px_-14px_rgb(28_32_22/0.45),inset_0_1px_0_rgb(255_255_255/0.45)] ring-1 ring-ink/[0.06] backdrop-blur-xl backdrop-saturate-150 lg:hidden">
      <ul className="flex h-16 px-1.5">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex flex-1">
              <Link href={href} aria-current={active ? "page" : undefined} onClick={() => { if (!active) playSound("nav"); }}
                className={cn("relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[1.4rem] text-[11px] font-bold transition-colors", active ? "text-primary" : "text-muted")}>
                {active && <motion.span layoutId="shop-tab" aria-hidden="true" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-x-0.5 inset-y-1.5 rounded-[1.25rem] bg-primary/[0.12]" />}
                <Icon size={21} aria-hidden="true" strokeWidth={active ? 2.4 : 2} className={cn("relative", active && "animate-pop")} />
                <span className="relative">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
