"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/cn";
import { ADMIN_NAV, isActive } from "./nav";
import { useNavCounts } from "./useNavCounts";

/**
 * Pestañas inferiores del panel en celulares y tablets (como una app): las 4 secciones de uso diario + "Más". Cápsula flotante:
 * Safari 26 de iPhone no dibuja nada fijo detrás de su barra, así que no se intenta llegar al borde.
 */
export function AdminTabBar({ onMore, moreOpen }: { onMore: () => void; moreOpen: boolean }) {
  const pathname = usePathname();
  const counts = useNavCounts();
  const tabs = ADMIN_NAV.filter((n) => n.tab);
  const inTabs = tabs.some((t) => isActive(pathname, t.href));
  const item = "relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors";
  return (
    <nav aria-label="Accesos rápidos del panel" className="fixed inset-x-3 bottom-[calc(0.625rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-lg overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-night/95 shadow-[0_18px_40px_-14px_rgb(0_0_0/0.6)] backdrop-blur-xl desk:hidden">
      <ul className="flex h-16 px-2">
        {tabs.map((t) => {
          const active = isActive(pathname, t.href);
          const Icon = t.icon;
          const count = t.badge ? counts[t.badge] : 0;
          return (
            <li key={t.href} className="flex flex-1">
              <Link href={t.href} aria-current={active ? "page" : undefined} className={cn(item, active ? "text-brass" : "text-[#9d9583]")}>
                {active && <motion.span layoutId="admin-tab" aria-hidden="true" className="absolute top-0 h-[3px] w-8 rounded-b-full bg-brass" />}
                <span className="relative">
                  <Icon size={21} aria-hidden="true" />
                  {count > 0 && t.badge === "payments" && <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brass px-1 text-[10px] font-extrabold text-night">{count}</span>}
                </span>
                {t.short}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button type="button" onClick={onMore} aria-label="Más secciones del panel" aria-expanded={moreOpen} className={cn(item, !inTabs ? "text-brass" : "text-[#9d9583]")}>
            {!inTabs && <span aria-hidden="true" className="absolute top-0 h-[3px] w-8 rounded-b-full bg-brass" />}
            <LayoutGrid size={21} aria-hidden="true" />Más
          </button>
        </li>
      </ul>
    </nav>
  );
}
